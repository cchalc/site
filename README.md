# site

My personal site and blog. Built with [Astro](https://astro.build), written in
Markdown, deployed on Cloudflare Pages.

## Quick start

```sh
npm install
npm run dev       # local dev server at http://localhost:4321
npm run build     # static build to dist/
npm run preview   # serve the built site locally
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
