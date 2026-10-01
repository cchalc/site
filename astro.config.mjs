// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// NOTE: update `site` to your real Cloudflare Pages URL (e.g. https://<project>.pages.dev)
// or custom domain once deployed. It is used for canonical URLs, sitemap, and RSS.
const SITE_URL = 'https://site.pages.dev';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      // Warm, legible themes for light/dark. Shiki renders both; CSS picks one.
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true,
    },
  },
});
