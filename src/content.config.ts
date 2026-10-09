import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { BLYG_ID_PATTERN } from './blyg/id.mjs';

// The `articles` collection: one markdown/MDX file per post in
// src/content/articles/. The filename (minus extension) is the URL slug.
const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      // Optional hero/OG image. Use a path under src/ for optimization,
      // or an absolute URL string.
      image: z.union([image(), z.string()]).optional(),
      // Permanent Blygger item id (src/blyg/). Assigned by `pnpm new` or
      // `pnpm blyg:sync`; never change it once the article is published.
      blygId: z
        .string()
        .regex(BLYG_ID_PATTERN, 'blygId must be 26 chars of lowercase Crockford base32')
        .optional(),
    }),
});

export const collections = { articles };
