import type { APIRoute } from 'astro';
import { site, buildDate } from '../data/site';
import { aboutFirst, services, keyPages } from '../lib/llms';

export const GET: APIRoute = ({ site: url }) => {
  const u = (p: string) => new URL(p, url).toString();
  const txt = `# ${site.name}

> ${aboutFirst}

Contact: ${site.contactEmail}. Last updated ${buildDate.toISOString().slice(0, 10)}. Full text of the key pages: ${u('/llms-full.txt')}

## Services
${services.map(([t, d]) => `- ${t}: ${d}`).join('\n')}

## Key pages
${keyPages().map(([t, p, d]) => `- [${t}](${u(p)}): ${d}`).join('\n')}

## Elsewhere
${Object.values(site.links).map((href) => `- ${href}`).join('\n')}
`;
  return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
