// RSS 2.0 feed with the blyg: namespace (spec §7). Hand-written because each
// entry needs per-version GUIDs and blyg:* elements.
import type { APIRoute } from 'astro';
import { SITE } from '../../consts';
import { AUTHOR, BLYG_LEVEL, ORIGIN, escapeXml, feedEvents, getBlyg } from '../../blyg/blyg';

const rfc822 = (isoDate: string) => new Date(isoDate).toUTCString();
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;

export const GET: APIRoute = async () => {
  const blyg = await getBlyg();
  const entries = feedEvents(blyg).map(({ item, version, at, withdrawn }) => {
    const gone = withdrawn || item.kind === 'withdrawn';
    return `    <item>
      <guid isPermaLink="false">blyg:${item.id}:v${version}</guid>
      <link>${escapeXml(item.page)}</link>
      <title>${escapeXml(gone ? 'withdrawn' : item.title)}</title>
      <description>${gone ? '' : cdata(item.content_html)}</description>
      <pubDate>${rfc822(at)}</pubDate>
      <dc:creator>${escapeXml(AUTHOR.name)}</dc:creator>
      <blyg:id>${item.id}</blyg:id>
      <blyg:kind>${gone ? 'withdrawn' : 'thread'}</blyg:kind>
      <blyg:version>${version}</blyg:version>
      <blyg:created>${item.created}</blyg:created>
      <blyg:item>${ORIGIN}items/${item.id}.json</blyg:item>
    </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:blyg="https://blygger.org/ns/0.1" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE.title)}</title>
    <link>${ORIGIN}</link>
    <description>${escapeXml(SITE.description)}</description>
${blyg.updated ? `    <lastBuildDate>${rfc822(blyg.updated)}</lastBuildDate>\n` : ''}    <blyg:level>${BLYG_LEVEL}</blyg:level>
    <blyg:manifest>${ORIGIN}blyg.json</blyg:manifest>
${entries.join('\n')}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
