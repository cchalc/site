// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Cloudflare Pages URL. Change to your custom domain when you add one.
// Used for canonical URLs, sitemap, and RSS.
const SITE_URL = 'https://featherandwire.dev';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [mdx(), sitemap()],
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
