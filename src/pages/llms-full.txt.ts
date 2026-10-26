import type { APIRoute } from 'astro';
import { SITE } from '../consts';
import { getPublishedArticles } from '../utils';

// The companion to llms.txt: every published article's Markdown in one file.
export const GET: APIRoute = async ({ site }) => {
  const articles = await getPublishedArticles();
  const day = (d: Date) => d.toISOString().slice(0, 10);
  const sections = articles.map((a) => {
    const { title, description, pubDate, updatedDate, tags } = a.data;
    return [
      `# ${title}`,
      '',
      `URL: ${new URL(`/articles/${a.id}/`, site).href}`,
      `Published: ${day(pubDate)}${updatedDate ? ` (updated ${day(updatedDate)})` : ''}`,
      ...(tags.length > 0 ? [`Tags: ${tags.join(', ')}`] : []),
      '',
      `> ${description}`,
      '',
      (a.body ?? '').trim(),
    ].join('\n');
  });
  const header = `# ${SITE.title}\n\n> ${SITE.description} By ${SITE.author}.\n`;
  return new Response([header, ...sections].join('\n\n---\n\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
