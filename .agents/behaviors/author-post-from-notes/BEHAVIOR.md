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
- A few existing posts in `src/content/articles/` to match tone, length, and
  heading style.
- The current tag set (`src/content/articles/*` frontmatter, or `/tags/`) so new
  posts reuse existing tags rather than minting near-duplicates.

## Decision

- Choose a lowercase kebab-case slug from the title; that filename is the URL.
- Pick `tags` from the existing set where they fit; only add a new tag when none
  applies.
- Default `draft: true` unless the author explicitly says to publish. A new post
  is a draft until the author approves it.
- Do **not** fabricate facts, quotes, data, or links. If the notes are thin or a
  claim is unverifiable, leave a clearly marked `TODO:` and surface it to the
  author rather than inventing.
- Keep the author's voice: don't over-formalize, don't pad, don't add a
  conclusion that restates the intro.

## Execution

1. Draft the Markdown file with complete, schema-valid frontmatter
   (`title`, `description`, `pubDate`, `tags`, `draft`).
2. Write the body: no top-level `#` heading (the title comes from frontmatter);
   use `##`/`###` for structure; fenced code blocks with language tags.
3. Run `pnpm build` and confirm it passes (schema valid, route renders).
4. Report to the author: the new file path, a one-line summary, any `TODO:`
   markers, and that it's a draft awaiting review.

## Recovery

- **Build fails on schema:** read the error, fix the offending frontmatter
  field, rebuild. Don't delete fields to silence errors.
- **Notes too sparse to write honestly:** stop and ask the author for the
  missing specifics instead of padding with generic filler.
- **Unsure about voice or framing:** produce the draft, flag the specific
  uncertainty, and let the author decide — never guess silently and publish.
- Never flip `draft` to `false` or push without explicit author approval (see
  [`publishing-changes`](../publishing-changes/BEHAVIOR.md)).
