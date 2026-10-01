// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Cloudflare Pages URL. Change to your custom domain when you add one.
// Used for canonical URLs, sitemap, and RSS.
const SITE_URL = 'https://site-66t.pages.dev';

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
