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
  // One group for every agent: a crawler that matches a named group ignores
  // the `*` group, so separate groups would hide Content-Signal from the AI
  // crawlers it's meant for. Content-Signal: https://contentsignals.org/
  const lines = [
    'User-agent: *',
    ...AI_CRAWLERS.map((ua) => `User-agent: ${ua}`),
    'Content-Signal: search=yes, ai-input=yes, ai-train=yes',
    'Allow: /',
    '',
    `# Site index for AI agents: ${url('/llms.txt')}`,
    `# Full text for AI agents: ${url('/llms-full.txt')}`,
    '',
    `Sitemap: ${url('/sitemap-index.xml')}`,
    '',
  ];
  return new Response(lines.join('\n'));
};
