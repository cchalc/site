import type { APIRoute } from 'astro';
import { SITE } from '../consts';
import { ORIGIN as BLYG_ORIGIN } from '../blyg/blyg';
import { getPublishedArticles } from '../utils';

// llms.txt (https://llmstxt.org/): a Markdown index of the site for AI agents.
export const GET: APIRoute = async ({ site }) => {
  const url = (path: string) => new URL(path, site).href;
  const articles = await getPublishedArticles();
  const lines = [
    `# ${SITE.title}`,
    '',
    `> ${SITE.description} By ${SITE.author}.`,
    '',
    SITE.bio,
    '',
    '## Articles',
    '',
    ...articles.map((a) => `- [${a.data.title}](${url(`/articles/${a.id}/`)}): ${a.data.description}`),
    '',
    '## About',
    '',
    `- [About](${url('/about/')}): who writes this site`,
    `- [RSS feed](${url('/rss.xml')}): every article`,
    `- [Blyg](${BLYG_ORIGIN}): versioned, machine-readable feed of the articles (Blygger spec)`,
    '',
    '## Optional',
    '',
    `- [Full text](${url('/llms-full.txt')}): every article in one Markdown file`,
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
