// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';

// Cloudflare Pages URL. Change to your custom domain when you add one.
// Used for canonical URLs, sitemap, and RSS.
const SITE_URL = 'https://featherandwire.dev';

// Sitemap <lastmod>: the sitemap is written after the pages, so read back the
// article:* dates each page already publishes. astro:content isn't available
// in the config, and this keeps the content collection the only date source.
const OUT_DIR = new URL('./dist/', import.meta.url);
function lastmod(url) {
  const path = new URL(url).pathname;
  let html;
  try {
    html = readFileSync(new URL(`.${decodeURI(path)}index.html`, OUT_DIR), 'utf8');
  } catch {
    return undefined; // not an HTML page (or not built as one)
  }
  const meta = (p) => html.match(new RegExp(`<meta property="article:${p}" content="([^"]+)"`))?.[1];
  return meta('modified_time') ?? meta('published_time');
}

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [
    mdx(),
    sitemap({
      serialize: (item) => ({ ...item, lastmod: lastmod(item.url) ?? item.lastmod }),
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
