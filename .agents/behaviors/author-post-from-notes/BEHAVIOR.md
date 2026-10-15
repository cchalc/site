---
name: author-post-from-notes
description: Turn the author's rough working notes into a publishable article that matches the site's structure and voice, publishing only after review.
---

# Author a post from notes

How an agent should turn messy working notes into a finished article in this
repository.

## Intent

Produce a well-structured, voice-consistent article from source notes, written
to `src/content/articles/<slug>.md`, that builds cleanly and reads as the
author would write it. Preserve the author's ideas and claims; improve clarity
and structure, don't invent content.

## Evidence

Before writing, gather:

- The source notes (the task input).
- [`CONTRIBUTING.md`](../../../CONTRIBUTING.md) for the frontmatter contract and
  style conventions.
- [`writing-style`](../writing-style/BEHAVIOR.md) for the voice. Don't copy
  tone from existing posts: early posts were agent-drafted, so the behavior and
  its references are the source of truth.
- The current tag set (`src/content/articles/*` frontmatter, or `/tags/`) so new
  posts reuse existing tags rather than minting near-duplicates.
- The "Writing in Blygger Studio" section of `CONTRIBUTING.md`, to decide
  whether the piece is a repo article or a Studio fragment/thread.

## Decision

- **Pick the venue first.** Long-form, polished pieces are repo articles.
  Short notes, quotes and responses belong in Studio (Fragments). For a Studio
  piece, draft the text with Studio syntax and hand it to the author: agents
  can't publish there.
- **Never put Studio syntax in a repo article.** `![[id]]`, `[[id]]` and
  `[TK]…[/TK]` only work in Studio; Astro would print them literally.
- Choose a lowercase kebab-case slug from the title; that filename is the URL.
- Pick `tags` from the existing set where they fit; only add a new tag when none
  applies.
- Default `draft: true` unless the author explicitly says to publish. A new post
  is a draft until the author approves it.
- Do **not** fabricate facts, quotes, data, or links. If the notes are thin or a
  claim is unverifiable, leave a clearly marked `TODO:` and surface it to the
  author rather than inventing.
- Write in the [`writing-style`](../writing-style/BEHAVIOR.md) voice: don't
  over-formalize, don't pad, don't add a conclusion that restates the intro.

## Execution

Every draft goes through the same pipeline before the author sees it:

1. **Draft** in the `writing-style` voice. For a repo article, write the
   Markdown file with complete, schema-valid frontmatter (`title`,
   `description`, `pubDate`, `tags`, `draft: true`); no top-level `#`
   heading; `##`/`###` for structure; fenced code blocks with language tags.
2. **Simplify** with [`simplify-draft`](../simplify-draft/BEHAVIOR.md): cut,
   never add, and keep the list of cuts.
3. **Review** with [`draft-review`](../draft-review/BEHAVIOR.md), on the
   simplified text. The reviewer only reports findings.
4. **Fix** the findings, keeping the author's takes and jokes intact.
5. **Review again** in a fresh pass. A draft only counts as ready when a
   review pass that made no edits says "ready for the author".
6. For a repo article, run `pnpm build` and confirm it passes.
7. **Report to the author:**
   - the file path (or the Studio text)
   - a one-line summary
   - the simplifier's cuts, so they can restore any
   - the final review verdict and any open findings
   - any `TODO:` markers
   - that it's a draft awaiting their review

## Recovery

- **Build fails on schema:** read the error, fix the offending frontmatter
  field, rebuild. Don't delete fields to silence errors.
- **Notes too sparse to write honestly:** stop and ask the author for the
  missing specifics instead of padding with generic filler.
- **Unsure about voice or framing:** produce the draft, flag the specific
  uncertainty, and let the author decide — never guess silently and publish.
- Never flip `draft` to `false` or push without explicit author approval (see
  [`publishing-changes`](../publishing-changes/BEHAVIOR.md)).
