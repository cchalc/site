import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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
    }),
});

export const collections = { articles };
