import type { APIRoute } from 'astro';
import { site, buildDate } from '../data/site';
import { getRecord, metricsFrom } from '../lib/record';
import { getPosts } from '../lib/writing';
import { getMediumArticles } from '../lib/medium';
export const GET: APIRoute = async ({ site: url }) => {
  const u = (p: string) => new URL(p, url).toString();
  const { rows } = await getRecord();
  const metrics = metricsFrom(rows);
  const posts = await getPosts();
  const medium = await getMediumArticles();
  const txt = `# ${site.name}

> ${site.bio} Based in ${site.location}.

Last updated: ${buildDate.toISOString().slice(0, 10)}. Every claim on this site links to a source.
Contact: ${site.contactEmail}

## Pages
- [Work](${u('/work/')}): pull requests, issue analyses and answers in projects Martin does not own
- [Lab](${u('/lab/')}): reproducible TypeScript type-checking performance experiments
- [Speaking](${u('/speaking/')}): talks, workshops, podcasts
- [Invite me](${u('/speak/')}): bio, talk abstracts, photo and contact for organizers
- [Timeline](${u('/timeline/')}): every contribution, talk and experiment by date; machine-readable at ${u('/timeline.json')}
- [About](${u('/about/')})

## Metrics (as of ${buildDate.toISOString().slice(0, 10)})
${metrics.map((m) => `- ${m.value} ${m.label}`).join('\n')}

## Ledger
${rows.map((r) => `- ${r.date}, ${r.kindLabel}, ${r.status}: ${r.url ? `[${r.title}](${r.url.startsWith('/') ? u(r.url) : r.url})` : r.title}`).join('\n')}
${posts.length || medium.length ? `\n## Writing\n${[...posts.map((p) => `- [${p.data.title}](${u(`/writing/${p.id}/`)})`), ...medium.map((m) => `- [${m.title}](${m.url}) (Medium, ${m.date})`)].join('\n')}\n` : ''}
## Elsewhere
${Object.entries(site.links).map(([, href]) => `- ${href}`).join('\n')}
`;
  return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
