#!/usr/bin/env node
// Scaffold a new article draft: `pnpm new "My Post Title"`.
import { writeFile, mkdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import { newBlygId } from '../src/blyg/id.mjs';

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('Usage: pnpm new "My Post Title"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/[^\w\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

const dir = join('src', 'content', 'articles');
const file = join(dir, `${slug}.md`);
const today = new Date().toISOString().slice(0, 10);

await mkdir(dir, { recursive: true });
try {
  await access(file);
  console.error(`Refusing to overwrite existing file: ${file}`);
  process.exit(1);
} catch {
  // file does not exist — good
}

const frontmatter = `---
title: ${title}
description: TODO one or two sentences for listings and meta tags.
pubDate: ${today}
tags: []
draft: true
blygId: ${newBlygId()}
---

Write here.
`;

await writeFile(file, frontmatter, 'utf8');
console.log(`Created ${file}`);
console.log('Edit it, set draft: false when ready, then run: pnpm blyg:sync && pnpm build');
