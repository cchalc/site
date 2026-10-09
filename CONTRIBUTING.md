# Contributing / Authoring guide

This guide is for anyone — human or agent — adding or editing content.

## Add an article

1. Create a Markdown file in `src/content/articles/`. The **filename is the URL
   slug**, so use lowercase kebab-case: `my-new-post.md` → `/articles/my-new-post/`.
   Use `.mdx` instead of `.md` only if you need components in the content.
2. Add frontmatter (see fields below).
3. Write the body in Markdown.
4. Preview with `pnpm dev` and visit the page.

### Frontmatter

```yaml
---
title: Human-readable title
description: One or two sentences. Shown in listings, meta tags, and RSS.
pubDate: 2026-09-30            # YYYY-MM-DD
updatedDate: 2026-10-02        # optional
tags: [astro, web]             # optional; lowercase, kebab-case
draft: false                   # true = hidden in production builds
image: ./hero.png              # optional; path under the post, or an absolute URL
blygId: 0zz6hm48t2ctcetsgya5g098bh  # permanent Blygger id; added by `pnpm new` / `pnpm blyg:sync`
---
```

The schema is enforced at build time in `src/content.config.ts` — a missing or
mistyped field fails the build rather than shipping broken.

| Field         | Required | Notes |
|---------------|----------|-------|
| `title`       | yes      | |
| `description` | yes      | Keep it tight; it's the listing + meta text. |
| `pubDate`     | yes      | `YYYY-MM-DD`. |
| `updatedDate` | no       | Show a "last updated" date. |
| `tags`        | no       | Array of lowercase kebab-case strings. New tags get their own `/tags/<tag>/` page automatically. |
| `draft`       | no       | Defaults to `false`. `true` keeps it out of production (still visible in `pnpm dev`). |
| `image`       | no       | Hero / Open Graph image. |
| `blygId`      | no       | Permanent [Blygger](https://blygger.org/) item id. Generated for you; never change or reuse it. |

## Drafts

Set `draft: true` to work on a post without publishing it. Drafts render in
`pnpm dev` but are excluded from `pnpm build` (production). Flip to
`false` to publish.

## Images

Put per-post images next to the post or in `public/` for static assets.
Reference them with a relative path (`./diagram.png`) to get Astro's image
optimization, or an absolute URL for externally hosted images.

## Style conventions

- Prefer `##`/`###` headings within the body (the title is rendered from
  frontmatter — don't repeat it as an `#` heading).
- Fenced code blocks with a language tag get syntax highlighting.
- Keep descriptions factual and specific.

## The blyg (`/blyg/`)

Published `.md` articles are also served as a [Blygger](https://blygger.org/spec/0.3/)
blyg at `/blyg/`: a manifest, a feed, and one JSON document per article. MDX
articles are left off it.

Each article's version history lives in `src/blyg/ledger.json`, which is
committed. After publishing, editing, unpublishing, or deleting a published
article, record the change:

```sh
pnpm blyg:sync
```

That bumps the version of changed articles, adds a withdrawal for removed
ones, and writes a `blygId` into any published article missing one. Versions
are visible to subscribers, so sync once when a change is ready rather than
after every edit. `pnpm build` fails if you forget.

## Before you commit

Always confirm the site still builds:

```sh
pnpm blyg:sync   # only if published content changed
pnpm build
```

If it fails, fix the error before committing — the deploy runs the same command.
