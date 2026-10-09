# featherandwire.dev

Christopher Chalcraft's personal site and blog: Astro, Markdown, xess design, and a Blygger blyg.

Live at **<https://featherandwire.dev>**. Articles are Markdown files in this
repo; the site is a fully static Astro build deployed on Cloudflare Pages. The
same articles are also published as a [Blygger](https://blygger.org/) blyg at
[`/blyg/`](https://featherandwire.dev/blyg/blyg.json), and short-form posts live
on a separate [Blygger Studio](https://github.com/blygger/blygger-studio)
instance at <https://blyg.featherandwire.dev>.

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Background

- **Design:** a port of [xess](https://design.within.website/), Xe Iaso's design
  system (CC0): Gruvbox palette, Podkova headings, Schibsted Grotesk body,
  Iosevka code. Tokens live in `src/styles/tokens.css`; fonts are self-hosted in
  `public/fonts/` (SIL OFL 1.1).
- **Blyg:** `src/blyg/` and `src/pages/blyg/` emit a static
  [Blygger 0.3](https://blygger.org/spec/0.3/) surface: `blyg.json`,
  `feed.xml`, `items/index.json`, one `items/{id}.json` per article, and
  `blogroll.opml`. Version history is kept in the committed
  `src/blyg/ledger.json`.
- **Studio:** the reference Blygger client, run as its own Cloudflare Worker
  (D1 + R2). It is deployed separately and is not part of this repo.

```
src/
├── blyg/               # Blygger publishing: ids, ledger, document builders
├── components/         # Header, Footer, ArticleCard, Admonition, Badge, Figure, ...
├── content/articles/   # posts (one .md/.mdx per article)
├── content.config.ts   # collection schema (frontmatter validation)
├── layouts/            # BaseLayout, ArticleLayout
├── pages/              # routes: home, articles, tags, about, rss, blyg/
├── styles/             # tokens.css (design tokens) + global.css
├── consts.ts           # site title/description/nav
└── utils.ts            # article querying helpers
```

## Install

Requires Node 22.12+ and [pnpm](https://pnpm.io) via corepack:

```sh
corepack enable
pnpm install
```

## Usage

```sh
pnpm dev                  # dev server at http://localhost:4321 (drafts visible)
pnpm new "My Post Title"  # scaffold a draft in src/content/articles/
pnpm blyg:sync            # record blyg versions after published content changes
pnpm build                # production build to dist/; the only gate
pnpm preview              # serve the production build locally
```

To publish a post: set `draft: false`, run `pnpm blyg:sync`, then `pnpm build`.
The build fails if the blyg ledger is out of date, so a stale version can't
ship. Drafts are excluded from production and from the blyg.

The draft post `src/content/articles/design-system-reference.mdx` renders every
styled element and MDX component; check it under `pnpm dev` after design
changes.

## Deployment

Pushing to `main` deploys: `.github/workflows/deploy.yml` builds with pnpm 9 on
Node 22 and runs `wrangler pages deploy` to the Cloudflare Pages project
`site`. Pull requests run the same build as a check
(`.github/workflows/ci.yml`) without deploying.

Repository secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (used by
the deploy), plus `PORKBUN_API_KEY` and `PORKBUN_SECRET_API_KEY` for the
`featherandwire.dev` registrar. The domain's DNS is hosted on Cloudflare. For
local secrets, copy `.env.example` to `.env` and `.envrc.example` to `.envrc`
(both gitignored), then run `direnv allow`; direnv loads `.env` and puts
`node_modules/.bin` on `PATH`.

## Contributing

This is a personal site, so outside contributions aren't expected. Authoring
conventions (frontmatter, drafts, images, the blyg) are in
[`CONTRIBUTING.md`](./CONTRIBUTING.md). Agents start with
[`AGENTS.md`](./AGENTS.md) and the behavior specs under
[`.agents/behaviors/`](./.agents/behaviors/). Notable changes are recorded in
[`CHANGELOG.md`](./CHANGELOG.md).

## License

Code (templates, components, styles, config): [MIT](./LICENSE) ©
Christopher Chalcraft. Prose under `src/content/` is © Christopher Chalcraft,
all rights reserved, unless a post says otherwise. Fonts in `public/fonts/` are
under the [SIL OFL 1.1](./public/fonts/LICENSE.md); the xess design is CC0.
