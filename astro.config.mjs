// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// Cloudflare Pages URL. Change to your custom domain when you add one.
// Used for canonical URLs, sitemap, and RSS.
const SITE_URL = 'https://featherandwire.dev';

// Sitemap <lastmod> per article URL: updatedDate, else pubDate. astro:content
// isn't available in the config, so read the dates from the frontmatter.
const ARTICLES_DIR = new URL('./src/content/articles/', import.meta.url);
const lastmod = new Map(
  readdirSync(ARTICLES_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .flatMap((f) => {
      const text = readFileSync(new URL(f, ARTICLES_DIR), 'utf8');
      const field = (name) => text.match(new RegExp(`^${name}:\\s*['"]?([^'"\\s]+)`, 'm'))?.[1];
      const date = field('updatedDate') ?? field('pubDate');
      const slug = f.replace(/\.mdx?$/, '');
      return date ? [[`${SITE_URL}/articles/${slug}/`, new Date(date).toISOString()]] : [];
    }),
);

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [
    mdx(),
    sitemap({
      serialize: (item) => ({ ...item, lastmod: lastmod.get(item.url) ?? item.lastmod }),
    }),
  ],
  markdown: {
    shikiConfig: {
      // xess renders code as a Gruvbox terminal in both color schemes.
      // Shiki renders both; CSS picks one.
      themes: {
        light: 'gruvbox-dark-hard',
        dark: 'gruvbox-dark-medium',
      },
      wrap: true,
    },
  },
});
