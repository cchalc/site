# AGENTS.md

Entry point for AI agents working in this repository. Read this first, then the
behavior specs under [`.agents/behaviors/`](./.agents/behaviors/).

## What this is

A personal static site/blog built with Astro. Content is Markdown; output is a
static site deployed on Cloudflare Pages.

## Commands

This project uses **pnpm** (via corepack; run `corepack enable` once).

```sh
pnpm install        # install dependencies
pnpm dev            # local dev server (http://localhost:4321); shows drafts
pnpm build          # production build to dist/ (drafts excluded); MUST pass before pushing
pnpm blyg:sync      # record new blyg versions after published content changes
pnpm preview        # serve the production build locally
```

There is no separate test suite — **`pnpm build` is the gate**. A green build
means the content schema validated and all routes rendered.

## Where things live

- `src/content/articles/` — posts, one Markdown file per article (filename = slug).
- `src/content.config.ts` — frontmatter schema (edit with care; it's the contract).
- `src/pages/` — routes (home, `/articles`, `/tags`, `/about`, `/rss.xml`).
- `src/layouts/`, `src/components/` — presentation.
- `src/styles/tokens.css` — design tokens (colors, type, spacing), ported from
  [xess](https://design.within.website/) (CC0). Change the look here, not with
  ad-hoc inline styles. Fonts are self-hosted in `public/fonts/` (OFL).
- `src/components/Admonition.astro`, `Badge.astro`, `Figure.astro` — xess
  components for MDX posts; the draft `design-system-reference.mdx` shows them all.
- `src/blyg/` + `src/pages/blyg/` — the [Blygger](https://blygger.org/spec/0.3/)
  blyg at `/blyg/`. `ledger.json` is the committed version history; never
  hand-edit it.
- `src/consts.ts` — site title, description, navigation.

## Conventions

- Authoring a post: follow [`CONTRIBUTING.md`](./CONTRIBUTING.md) exactly.
- Keep changes minimal and match the surrounding style.
- Don't add dependencies or a CSS framework without being asked — the design is
  intentionally hand-written.
- Run `pnpm build` and confirm it passes before considering work done.

## Behaviors

Expected conduct for recurring tasks is documented as behavior specs:

- [`author-post-from-notes`](./.agents/behaviors/author-post-from-notes/BEHAVIOR.md)
  — turning working notes into a publishable article.
- [`publishing-changes`](./.agents/behaviors/publishing-changes/BEHAVIOR.md)
  — building, committing, and deploying.
