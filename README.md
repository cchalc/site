# site

My personal site and blog. Built with [Astro](https://astro.build), written in
Markdown, deployed on Cloudflare Pages.

## Quick start

This project uses [pnpm](https://pnpm.io). It ships with Node via corepack —
enable it once with `corepack enable` (no separate install needed).

```sh
pnpm install
pnpm dev       # local dev server at http://localhost:4321
pnpm build     # static build to dist/
pnpm preview   # serve the built site locally
```

## Writing

Articles are Markdown files in `src/content/articles/`. See
[`CONTRIBUTING.md`](./CONTRIBUTING.md) for the full guide (frontmatter fields,
drafts, images, tags).

## For agents

Start with [`AGENTS.md`](./AGENTS.md). Expected conduct for common tasks
(authoring posts, publishing) is documented under
[`.agents/behaviors/`](./.agents/behaviors/).

## Structure

```
src/
├── content/articles/   # posts (one .md/.mdx per article)
├── content.config.ts   # collection schema (frontmatter validation)
├── pages/              # routes: home, articles, tags, about, rss
├── layouts/            # BaseLayout, ArticleLayout
├── components/         # Header, Footer, ThemeToggle, ArticleCard, ...
├── styles/             # tokens.css (design tokens) + global.css
├── consts.ts           # site title/description/nav
└── utils.ts            # article querying helpers
```

The previous Hakyll/Nix site is preserved in `_archive-hakyll/` for reference.

## Creating a post

```sh
pnpm new "My Post Title"   # scaffolds src/content/articles/my-post-title.md as a draft
```

Then edit the file, set `draft: false` when ready, and `pnpm build`.

## License

The site **code** (templates, components, styles, config) is licensed under the
[MIT License](./LICENSE). The **prose/content** under `src/content/` is
© Christopher Chalcraft, all rights reserved, unless noted otherwise in a post.
