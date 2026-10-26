import type { APIRoute } from 'astro';

// AI crawlers named explicitly so the welcome isn't left to the wildcard.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
];

export const GET: APIRoute = ({ site }) => {
  const url = (path: string) => new URL(path, site).href;
  // Content-Signal: https://contentsignals.org/ (search, AI answers, AI training).
  const lines = [
    'User-agent: *',
    'Content-Signal: search=yes, ai-input=yes, ai-train=yes',
    'Allow: /',
    '',
    ...AI_CRAWLERS.flatMap((ua) => [`User-agent: ${ua}`, 'Allow: /', '']),
    `# Site index for AI agents: ${url('/llms.txt')}`,
    `# Full text for AI agents: ${url('/llms-full.txt')}`,
    '',
    `Sitemap: ${url('/sitemap-index.xml')}`,
    '',
  ];
  return new Response(lines.join('\n'));
};
