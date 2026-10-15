---
name: simplify-draft
description: Tighten a draft by cutting, never adding. Remove filler, repetition and sprawl while keeping the author's voice, jokes, takes and every fact, and report every cut so the author can veto it.
---

# Simplify a draft

How an agent tightens a draft (a repo article or a Studio piece) before it
goes to `draft-review` and then to the author.

## Intent

Most drafts are too long in the same places: a warm-up paragraph, a point made
twice, a sentence that wanders before it lands. This pass makes the draft
shorter and clearer without changing what it says or how it sounds. It is a
pair of scissors, not a pen.

## Evidence

- The draft.
- [`writing-style`](../writing-style/BEHAVIOR.md), so cuts don't sand off the
  house voice (asides, jokes, contractions and first person are features, not
  filler).
- [`references/ai-tells.md`](../writing-style/references/ai-tells.md) for
  phrases that are almost always safe to cut.

## Decision

Cut or tighten:

- Throat-clearing openers, recap closers, and inspirational sign-offs (see
  "Openings and closings" in `ai-tells.md`).
- A point made twice; keep the better one.
- Filler phrases ("it's worth noting that", "in order to", "the fact that",
  "basically", "really" when it adds nothing).
- Sentences that sprawl: split them, or drop the clause that isn't pulling its
  weight.
- Jargon where a plain word works for the intended reader.
- Sections or bullet lists that say the same thing; merge them.

Never:

- Add a claim, example, joke, link, number, heading, or section. If the draft
  needs one, note it in the report instead.
- Change a take, soften an opinion, or remove the author's uncertainty where
  it's honest ("I'm not sure yet" stays).
- Cut the humor or the parenthetical asides because they aren't "necessary".
  They're the voice.
- Change code, output, commands, numbers, names, or quoted material.
- Touch frontmatter (`title`, `description`, `blygId`, dates).

## Execution

1. Read the whole draft once before cutting anything.
2. Edit in place: the draft file, or the text you were given.
3. Report back with:
   - the word count before and after
   - a short list of what was cut or merged, one line each, quoting the first
     few words of the removed passage so the author can find and restore it
   - anything that looks missing (a claim with no source, a step skipped),
     flagged, not filled in

## Recovery

- **Unsure whether something is voice or filler:** keep it and mention it in
  the report.
- **A cut would change meaning:** don't make it.
- **The draft is already tight:** say so and change nothing. A small diff is a
  valid result.

## Failure modes

- Rewriting instead of cutting, so the result is in the simplifier's voice.
- Flattening the jokes and asides into neutral prose.
- Silently dropping a fact, caveat, or link.
- Adding transitions or summaries to "smooth" the cuts.
