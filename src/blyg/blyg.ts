// Publishes the articles as a static Blygger blyg (https://blygger.org/spec/0.3/)
// mounted at /blyg/. Each published Markdown article is a "thread" item.
//
// Versions are recorded in src/blyg/ledger.json, which is committed. A normal
// build only reads the ledger and fails if it is out of date; `pnpm blyg:sync`
// (BLYG_SYNC=1) records new versions, withdrawals, and missing blygIds instead.
import { getCollection } from 'astro:content';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SITE } from '../consts';
import type { Article } from '../utils';
import { newBlygId } from './id.mjs';
import pkg from '../../package.json';

export const BLYG_VERSION = '0.3';
// L2 by emitting `page` (§5.8) and nothing cross-origin (§3: "fully
// conformant at L2 by doing nothing new").
export const BLYG_LEVEL = 2;
export const GENERATOR = `cchalc-site/${pkg.version}`;
export const GENERATOR_URL = 'https://github.com/cchalc/site';
/** Feed window, per spec §7 recommendation. */
const FEED_WINDOW = 50;

const SITE_URL = import.meta.env.SITE;
/** The blyg origin: every protocol path is relative to this. */
export const ORIGIN = new URL('/blyg/', SITE_URL).href;
export const AUTHOR = { name: SITE.author, url: new URL('/', SITE_URL).href };

const LEDGER_PATH = join(process.cwd(), 'src', 'blyg', 'ledger.json');
const SYNC = process.env.BLYG_SYNC === '1';

interface VersionEntry {
  version: number;
  at: string;
  /** content_hash of this version; absent on withdrawal endcaps. */
  hash?: string;
  withdrawn?: true;
}
interface LedgerItem {
  slug: string;
  versions: VersionEntry[];
}
interface Ledger {
  items: Record<string, LedgerItem>;
}

export interface BlygItem {
  id: string;
  kind: 'thread' | 'withdrawn';
  /** Article title, used only to derive feed <title> (items are titleless). */
  title: string;
  page: string;
  created: string;
  updated: string;
  version: number;
  content_md: string;
  content_html: string;
  content_hash: string;
  versions: VersionEntry[];
}

export interface Blyg {
  items: BlygItem[];
  updated?: string;
}

const iso = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, 'Z');
const sha256 = (s: string) =>
  'sha256:' + createHash('sha256').update(s, 'utf8').digest('hex');
const articlePage = (slug: string) =>
  new URL(`/articles/${slug}/`, SITE_URL).href;

export const escapeXml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Items are titleless (§5.3), so the title travels as a leading heading. */
function contentMd(a: Article): string {
  return `# ${a.data.title}\n\n${(a.body ?? '').trim()}\n`;
}

/** content_html must be self-contained: every href/src absolute (§5.2). */
function contentHtml(a: Article, page: string): string {
  const absolute = (url: string) => {
    try {
      return new URL(url, page).href;
    } catch {
      return url;
    }
  };
  const body = (a.rendered?.html ?? '')
    .replace(/\s(href|src)="([^"]*)"/g, (_, attr, url) => ` ${attr}="${absolute(url)}"`)
    .replace(/\ssrcset="([^"]*)"/g, (_, set: string) => {
      const parts = set.split(',').map((p) => {
        const [url, ...rest] = p.trim().split(/\s+/);
        return [absolute(url), ...rest].join(' ');
      });
      return ` srcset="${parts.join(', ')}"`;
    });
  return `<h1>${escapeXml(a.data.title)}</h1>\n${body}`;
}

async function readLedger(): Promise<Ledger> {
  try {
    return JSON.parse(await readFile(LEDGER_PATH, 'utf8')) as Ledger;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return { items: {} };
    throw err;
  }
}

async function writeLedger(ledger: Ledger) {
  const items = Object.fromEntries(
    Object.entries(ledger.items).sort(([a], [b]) => a.localeCompare(b)),
  );
  await writeFile(LEDGER_PATH, JSON.stringify({ items }, null, 2) + '\n', 'utf8');
}

/** Add `blygId: …` as the last frontmatter line of the article's source file. */
async function assignBlygId(a: Article): Promise<string> {
  if (!a.filePath) throw new Error(`Article ${a.id} has no source file path`);
  const path = join(process.cwd(), a.filePath);
  const src = await readFile(path, 'utf8');
  const id = newBlygId();
  const out = src.replace(/^(---\r?\n[\s\S]*?)(\r?\n---)/, `$1\nblygId: ${id}$2`);
  if (out === src) throw new Error(`Could not find frontmatter in ${a.filePath}`);
  await writeFile(path, out, 'utf8');
  return id;
}

async function build(): Promise<Blyg> {
  const ledger = await readLedger();
  const now = iso(new Date());
  const problems: string[] = [];
  let changed = false;

  const published = (
    await getCollection('articles', ({ data }) => data.draft !== true)
  ).filter((a) => {
    // MDX bodies are JSX, not portable Markdown; keep them off the blyg.
    if (a.filePath?.endsWith('.mdx')) {
      console.warn(`[blyg] skipping MDX article ${a.id} (only .md is published)`);
      return false;
    }
    return true;
  });

  const live = new Map<string, Article>();
  for (const a of published) {
    let id = a.data.blygId;
    if (!id) {
      if (!SYNC) {
        problems.push(`${a.id}: missing blygId`);
        continue;
      }
      id = await assignBlygId(a);
      console.log(`[blyg] assigned blygId ${id} to ${a.id}`);
    }
    if (live.has(id)) throw new Error(`[blyg] duplicate blygId ${id} (${a.id}, ${live.get(id)!.id})`);
    live.set(id, a);
  }

  // Reconcile live articles against the ledger.
  for (const [id, a] of live) {
    const hash = sha256(contentMd(a));
    const entry = ledger.items[id];
    const last = entry?.versions.at(-1);
    if (!entry) {
      problems.push(`${a.id}: new item ${id}`);
      if (SYNC) {
        const at = iso(a.data.pubDate);
        ledger.items[id] = { slug: a.id, versions: [{ version: 1, at: at < now ? at : now, hash }] };
        changed = true;
      }
      continue;
    }
    if (entry.slug !== a.id) {
      problems.push(`${a.id}: page moved from /articles/${entry.slug}/ (add a redirect)`);
      if (SYNC) {
        entry.slug = a.id;
        changed = true;
      }
    }
    if (last!.withdrawn || last!.hash !== hash) {
      problems.push(`${a.id}: content changed (v${last!.version + 1})`);
      if (SYNC) {
        entry.versions.push({ version: last!.version + 1, at: now, hash });
        changed = true;
      }
    }
  }

  // Anything in the ledger that is no longer published gets a withdrawal endcap.
  for (const [id, entry] of Object.entries(ledger.items)) {
    const last = entry.versions.at(-1)!;
    if (live.has(id) || last.withdrawn) continue;
    problems.push(`${entry.slug}: no longer published, withdraw ${id}`);
    if (SYNC) {
      entry.versions.push({ version: last.version + 1, at: now, withdrawn: true });
      changed = true;
    }
  }

  if (SYNC) {
    if (changed) await writeLedger(ledger);
    console.log(
      problems.length
        ? `[blyg] ledger updated:\n  - ${problems.join('\n  - ')}`
        : '[blyg] ledger already up to date',
    );
  } else if (problems.length) {
    throw new Error(
      `[blyg] src/blyg/ledger.json is out of date:\n  - ${problems.join('\n  - ')}\n` +
        'Run `pnpm blyg:sync` and commit the result.',
    );
  }

  const items: BlygItem[] = Object.entries(ledger.items).map(([id, entry]) => {
    const last = entry.versions.at(-1)!;
    const a = live.get(id);
    const common = {
      id,
      page: articlePage(entry.slug),
      created: entry.versions[0].at,
      updated: last.at,
      version: last.version,
      versions: entry.versions,
    };
    if (last.withdrawn || !a) {
      return { ...common, kind: 'withdrawn', title: 'withdrawn', content_md: '', content_html: '', content_hash: sha256('') };
    }
    return {
      ...common,
      kind: 'thread',
      title: a.data.title,
      content_md: contentMd(a),
      content_html: contentHtml(a, common.page),
      content_hash: last.hash!,
    };
  });
  items.sort((x, y) => y.updated.localeCompare(x.updated) || x.id.localeCompare(y.id));

  return { items, updated: items[0]?.updated };
}

let cached: Promise<Blyg> | undefined;
/** The reconciled blyg, computed once per build. */
export function getBlyg(): Promise<Blyg> {
  return (cached ??= build());
}

/** items/{id}.json (§5). */
export function itemDocument(item: BlygItem) {
  return {
    blyg: BLYG_VERSION,
    id: item.id,
    kind: item.kind,
    origin: ORIGIN,
    page: item.page,
    author: AUTHOR,
    created: item.created,
    updated: item.updated,
    version: item.version,
    content_md: item.content_md,
    content_html: item.content_html,
    content_hash: item.content_hash,
    media: [],
    // Threads carry transclusions (§10.3); endcaps empty them (§9).
    transclusions: [],
    changelog: item.versions.map(({ version, at }) => ({ version, at, note: null })),
  };
}

/** One feed entry per publish event, newest first; withdrawn items keep only their endcap (§7). */
export function feedEvents(blyg: Blyg) {
  return blyg.items
    .flatMap((item) =>
      (item.kind === 'withdrawn' ? item.versions.slice(-1) : item.versions).map((v) => ({ item, ...v })),
    )
    .sort((x, y) => y.at.localeCompare(x.at) || y.version - x.version)
    .slice(0, FEED_WINDOW);
}

export const json = (body: unknown) =>
  new Response(JSON.stringify(body, null, 2) + '\n', {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
