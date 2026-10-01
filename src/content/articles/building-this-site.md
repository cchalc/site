---
title: How this site is built
description: A tour of the stack — Astro content collections, hand-written CSS, and Cloudflare Pages — and why I chose it.
pubDate: 2026-09-30
updatedDate: 2026-09-30
tags: [meta, astro, web]
draft: false
---

I rebuilt this site from scratch with three goals: it should be **simple**,
**fast**, and **easy to maintain** — including by AI agents working from my
notes. Here's the shape of it.

## Content is just Markdown

Every article is a single Markdown file in `src/content/articles/`. The
filename is the URL slug, and a small block of frontmatter carries the
metadata:

```yaml
---
title: How this site is built
description: A short summary used in listings and meta tags.
pubDate: 2026-09-30
tags: [meta, astro, web]
draft: false
---
```

[Astro content collections](https://docs.astro.build/en/guides/content-collections/)
validate that frontmatter against a schema at build time, so a typo in a date
or a missing field fails loudly instead of shipping broken.

## No CSS framework

The styling is hand-written CSS with a small set of design tokens — colors, a
type scale, spacing — defined once as custom properties. Light and dark themes
are the same tokens with different values. There's no build step to understand
and nothing to purge.

## Deployed on Cloudflare Pages

`astro build` emits a fully static site to `dist/`, which Cloudflare Pages
serves from its edge for free. A push to the main branch triggers a rebuild.

## Built to be extended by agents

Adding a post is: drop a Markdown file in one folder, fill in the frontmatter,
done. That's deliberate — I keep working notes elsewhere and let an agent turn
them into drafts here, following the conventions documented in
`CONTRIBUTING.md` and the behaviors under `.agents/`.
