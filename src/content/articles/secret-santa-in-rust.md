---
title: "I let an agent rewrite Secret Santa, then made it prove it"
description: "Our Secret Santa went from two small Python scripts to a Rust CLI written mostly by a coding agent. A brute-force oracle, property tests and planted bugs are why I trust it with the family list."
pubDate: 2026-11-25
tags: [rust, testing, agents]
draft: false
blygId: 5b899v0wtmmaq8hd2r4gx229gz
---

Our Secret Santa script had a bug that only shows up at Christmas. It shuffled everyone, checked the rules, and tried again, up to 1,000 times. Then it wrote the last shuffle to `pairs.csv` whether it passed or not.

For most lists that's harmless, because a valid shuffle turns up fast. One of our lists has households of two, one and two people, and under our rules it has exactly zero valid pairings. The script would grind through its thousand tries and quietly hand back a broken one. (The comments still say "Secret Valentine", which tells you how carefully it was adapted for December.)

So this year it got replaced. The new version is [santa](https://github.com/cchalc/secretsanta), a Rust CLI, and a coding agent wrote most of it in a day. The Python was two scripts, 137 lines between them. The Rust is 5,964 lines of source and 1,768 of tests. Nobody reads 7,700 lines of generated code before the holidays, so the question was how I'd know it's right.

## What it does now

The rules haven't changed. Nobody draws themselves. Nobody draws someone from their own household. If A gives to B, B doesn't give back to A. And two people from one household never both give into the same other household.

Everything around the rules is new.

![The santa pipeline from roster to send, with the three pairing steps and the four sending rungs](/images/secret-santa-in-rust/santa-pipeline.svg)

Pairing tries the cheap thing first: shuffle, and keep the first draw that passes every rule. Throwing away the bad shuffles leaves a uniform draw over the good ones, which matters once people start comparing notes over dinner. If 200,000 shuffles all fail, a backtracking search finds a pairing, proves there isn't one, or runs out of budget and says so. A pairing from the search is valid but not guaranteed uniform, and santa tells you which method it used.

When there isn't, santa says why without naming anyone, then bends the fewest rules it can, in a fixed order. Nobody-draws-themselves never bends. For the two-one-two list the answer is exactly one exception to the last rule: two people from one household get to give into the same other household, once. Everything else stays strict.

The result is sealed: receiver indices, a fingerprint of the roster and the policy it was drawn under, in an owner-only file. As the organizer I never see who has whom unless I run `santa reveal`. History blocks last year's pairings, and it's backed up to git encrypted with [age](https://age-encryption.org). And if a pairing ever has to be redone, the correction email swaps the Christmas trees for this guy, so nobody mistakes it for the first one:

![A sheepish yeti at a keyboard, name slips floating around it and a hat knocked over nearby](/images/secret-santa-in-rust/santa-yeti.png)

## Functional core, thin-ish shell

The design is a [functional core inside an imperative shell](https://www.destroyallsoftware.com/talks/boundaries). Core functions take data and return a `Result`. Randomness and email delivery are passed in, so a test can hand the core a seeded RNG and a fake mailer and get the same answer every time.

![santa's modules. The shell holds main, cli, files and mailer. The core holds domain, roster, rules, solver, accommodate, seal, history, send, template, message, html and backup.](/images/secret-santa-in-rust/santa-modules.svg)

Delivery is a two-method trait in `src/mailer.rs`:

```rust
pub trait Mailer {
    /// Check connectivity/credentials before anything is sent.
    fn preflight(&self) -> Result<(), MailError> {
        Ok(())
    }
    fn deliver(&self, letter: &Letter) -> Result<(), MailError>;
}
```

The other habit is [parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/). An `Assignment` can only be built as a real permutation, so nothing downstream has to check. `Assignment::from_receivers` in `src/domain.rs` is the only way in:

```rust
// ...after checking the length...
receivers
    .iter()
    .try_fold(vec![false; expected_len], |mut seen, &r| {
        match seen.get(r).copied() {
            None => Err(AssignmentError::OutOfRange(r)),
            Some(true) => Err(AssignmentError::DuplicateReceiver(r)),
            Some(false) => {
                seen[r] = true;
                Ok(seen)
            }
        }
    })
    .map(|_| Assignment(receivers))
```

The shell is only thin-ish, though. `cli.rs` is 1,520 lines, the biggest file in the project, and some real logic lives there, like the look-ahead that stops a correction from painting next year into a corner. That's the next thing I'd move into the core.

## Tests that don't trust the code

All 121 tests run in about two seconds. These are the ones I care about.

The oracle in `tests/oracle.rs` brute-forces every permutation and checks the rules with its own code. The checker shares nothing with `santa::rules`, on purpose: if the solver and its checker used the same helper, a bug in the helper would pass both.

```rust
fn oracle_valid(h: &[usize], p: &[usize]) -> bool {
    let n = p.len();
    let pairwise = (0..n).all(|i| {
        p[i] != i && p[p[i]] != i && h[i] != h[p[i]]
    });
    let spread = (0..n).all(|i| {
        (0..n).all(|j| i == j || h[i] != h[j] || h[p[i]] != h[p[j]])
    });
    pairwise && spread
}
```

`h[i]` is person `i`'s household and `p[i]` is who they give to. [proptest](https://github.com/proptest-rs/proptest) generates random households and checks that the solver's count of valid pairings matches the oracle's, and that `solve` finds a pairing exactly when one exists.

Uniformity gets a chi-square test: a six-person roster with 32 valid pairings, 64,000 draws, and the statistic has to stay under 61.10, the p = 0.001 cutoff for 31 degrees of freedom. The seed is fixed, so it can't flake. This is the geophysicist in me talking: if the noise isn't flat, something upstream is lying.

Then the privacy checks. The pairing and verify output, the simulation report, the inbox preview line and the encrypted backup all have tests asserting no names show up where they shouldn't. The backup check looks for email addresses too:

```rust
fn assert_no_people(text: &str) {
    for name in NAMES {
        assert!(!text.contains(name), "leaks {name}:\n{text}");
        assert!(
            !text.contains(&address(name)),
            "leaks {name}'s email:\n{text}"
        );
    }
}
```

Email gets a fake SMTP server inside the test process. It records every envelope and can reject the k-th recipient on purpose, so one test kills a send halfway and checks that the resume sends nobody a second email.

## Planting bugs

A green suite only means something if it goes red when the code is wrong. So I planted three bugs, each in a throwaway copy, and ran everything:

| Planted bug | Tests that failed |
|---|---|
| Nobody-draws-themselves becomes relaxable | 3 |
| The one-household-into-another rule lets one repeat through | 9 |
| The backtracking search forgets the reciprocal rule | 17 |

The first one is humbling. Only the three unit tests aimed at it noticed. The oracle didn't, and I think that's because the accommodation never reaches for that rule, so the pairings that come out don't change. The third was the one I worried about, since sampling stays correct and only paths that reach the search see the bug. Seventeen tests did.

## Fast enough

None of this needed to be fast. Here it is anyway, from `just bench` (criterion) on an M4 Pro:

| Case | Time |
|---|---|
| 6 people, 3 households | 2.2 µs |
| Sampling, 50 / 200 / 1,000 people | 92 µs / 224 µs / 1.1 ms |
| Exhaustive search, 50 people | 0.51 ms |
| Prove the two-one-two list has no strict pairing | 4.8 µs |
| Count every valid pairing for a family of 10 | 33 ms |

The old script spent a thousand shuffles failing to notice that list was impossible. The new one proves it in under five microseconds.

## Before it emails my family

The last safeguard isn't code. Sending is a ladder:

1. A dry run that prints every email with the receiver redacted.
2. A full rehearsal into a local [Mailpit](https://mailpit.axllent.org) inbox.
3. One real `[TEST]` email to myself through Gmail.
4. The real `santa send`, which lists the recipients and waits until I type `send N`, where N is how many emails are pending. Anything else aborts.

If the send dies partway, a ledger means the rerun skips everyone who already has their email.

The agent wrote the code that sends. I'm the one who types the number.

## Sources

1. [santa on GitHub](https://github.com/cchalc/secretsanta): README, source and tests; the Python original is on the `python-legacy` branch
2. [proptest](https://github.com/proptest-rs/proptest), property testing for Rust
3. [Criterion.rs](https://github.com/bheisler/criterion.rs), the benchmark harness
4. [Mailpit](https://mailpit.axllent.org), the local test inbox
5. [age](https://age-encryption.org), which encrypts the pairing history backup
6. Gary Bernhardt, [Boundaries](https://www.destroyallsoftware.com/talks/boundaries), on functional core, imperative shell
7. Alexis King, [Parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)
