// All crawlers are welcome, AI crawlers included. Nothing public is disallowed.
import type { APIRoute } from 'astro';

const ai = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended'];
export const GET: APIRoute = ({ site }) =>
  new Response(
    `User-agent: *\nAllow: /\n\n${ai.map((a) => `User-agent: ${a}\nAllow: /`).join('\n\n')}\n\nSitemap: ${new URL('/sitemap-index.xml', site)}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
