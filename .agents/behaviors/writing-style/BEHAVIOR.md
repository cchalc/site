---
name: writing-style
description: The Feather & Wire house voice for drafting repo articles and Blygger Studio pieces. Playful, curious practitioner who shares what they learned and gives takes; clean language; specific, sourced, never stuffy, elitist, or AI-sounding. Includes the rules for Databricks content.
---

# Feather & Wire writing style

How an agent writes anything that will be published under the author's name:
repo articles in `src/content/articles/` and short pieces for Blygger Studio.

## Intent

The author is playful and humorous, and wants posts that **share information
and give takes**. A reader should finish a post feeling like a friend who
knows the subject just walked them through it, with a few jokes on the way.
Not a lecture, not a vendor page, and not something that reads as
machine-written.

The voice comes from three blogs the author likes, analyzed in
[`references/style-analysis.md`](references/style-analysis.md):

- Thorsten Ball's curiosity and honesty about what he's unsure of
- Xe Iaso's deadpan commitment to a bit while the engineering stays serious
- Databricksters' problem-first precision and allergy to hype

## Evidence

Before drafting, read:

- The author's notes or brief (the task input), plus any research or sources
  they supplied.
- [`references/style-analysis.md`](references/style-analysis.md) for what the
  voice borrows, with real examples.
- [`references/ai-tells.md`](references/ai-tells.md) for patterns to avoid.
- `CONTRIBUTING.md` for mechanics: frontmatter, the repo vs Studio venue
  table, and Studio syntax.
- The About page (`src/pages/about.astro`) for who the author is.

## Decision: the voice

**Openings.** Start in the middle: the moment something broke, the problem,
or a flat statement of fact. Never a paragraph of background, never "Have you
ever wondered".

**Person and stance.** First person, peer to peer. "I tried X and it did Y."
Talk to the reader as a fellow practitioner who's smart and busy. Never talk
down, never show off.

**Takes.** Say what you think, plainly, then show why. When the author is
genuinely unsure, say so in plain words ("I'm not sure yet", "I don't fully
get this part") rather than hedging every sentence. Pick a side when there is
one.

**Humor.** Encouraged. It works best as:

- deadpan understatement
- a parenthetical aside
- self-correction mid-thought
- taking a silly premise seriously
- a precise number that reveals how absurd something is

Joke about systems, situations, and the author. Never about readers,
colleagues, users, or other people's work.

**Language.** Clean, always: no swearing, mild or otherwise. Contractions,
plain words, and the occasional slang are fine.

**Rhythm.** Mix long explanatory sentences with very short ones. A
one-sentence paragraph is allowed when it earns it.

**Specifics.** Real commands, real config, real output, real numbers, real
tool names. Explain jargon in passing, only where the intended reader would
stumble. Every number is either the author's own measurement or linked to its
source.

**Personal texture.** The author's world is a source of examples and
metaphors: geophysics (signal and noise), Nix and Neovim, Elixir and
local-first sync, duplicate bridge, motorcycles, film photography. Use one
when it genuinely fits the point. Don't force one into every post.

**Structure.**

- Essays and takes: few or no headings, mostly prose.
- How-to posts: headings that name what each section does, plus code blocks.
  Avoid generic headings ("Introduction", "Conclusion", "Key Takeaways").
- Lists only when the content really is a list.
- Repo articles: no `#` heading in the body (the title comes from frontmatter).

**Endings.** Stop when the point is made. End on a next step, a callback, a
genuine open question, or the last useful line. No recap, no "Happy coding!".

**Length.**

- Repo articles: as long as the idea needs, usually 600–1,500 words.
- Studio fragments: under about 1,000 characters (Studio's cap).
- Threads: whatever the response needs.

## Decision: Databricks content

The author works at Databricks and writes a lot about it.

- **Public information only.** Every product claim comes from public
  Databricks docs, public release notes, public blog posts, or research the
  author supplies. Nothing internal: no roadmaps, unreleased features,
  customer names that aren't public, internal tools, or internal numbers.
- **Link the source** for every product claim.
- **Practitioner, not marketing.** Introduce a feature as the fix for a pain
  the reader already has, the way Databricksters does. Say what it doesn't do,
  and mention Preview status or other caveats. No "unlock", "empower",
  "seamless", or "game-changer".
- **Takes are fine.** "I'd use X here, not Y, because…" is the author's
  opinion and should read as one.

## Execution

1. Decide the venue (repo article, Studio fragment, or Studio thread) using
   the table in `CONTRIBUTING.md`.
2. Find the one thing the post is about, in one sentence. If you can't, ask
   the author before drafting.
3. Draft in this voice. Put sources inline as you go.
4. Re-read once against `ai-tells.md` and fix what you find.
5. Hand off to [`simplify-draft`](../simplify-draft/BEHAVIOR.md), then
   [`draft-review`](../draft-review/BEHAVIOR.md), as described in
   [`author-post-from-notes`](../author-post-from-notes/BEHAVIOR.md).

## Recovery

- **The notes are thin:** ask for specifics, or leave a clearly marked
  `TODO:`. Never fill gaps with invented anecdotes, numbers, or quotes.
- **A Databricks claim has no public source:** leave it out, or mark it
  `TODO: source` for the author.
- **Unsure whether a joke lands:** keep it and flag it for the author. They
  can cut a joke faster than an agent can invent a good one.

## Failure modes

- A post that reads as a template: throat-clearing intro, generic headings,
  recap ending.
- Corporate voice or vendor voice, especially in Databricks posts.
- Elitism: assuming the reader is foolish, or showing off.
- Invented specifics: fake numbers, quotes, anecdotes, or benchmarks.
- Imitating a reference blog's signature devices (Xe's characters, Thorsten's
  newsletter format) instead of borrowing the habits behind them.
- Swearing.
