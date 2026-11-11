import type { APIRoute } from 'astro';
import { getContributions } from '../lib/github';
import { contributionId, displayTitle, kindLabel, projectLabel } from '../data/contributions';
import { experiments } from '../lib/lab';
import { events } from '../data/events';
import { getPosts } from '../lib/writing';
import { getMediumArticles } from '../lib/medium';
import { statusBadge } from '../lib/status';
import { formatDate } from '../lib/format';
import { eventId, eventWhen, upcoming } from '../lib/record';

// One flat index for the Cmd+K search. `k` holds extra searchable text that is not displayed.
export interface SearchItem { t: string; s: string; u: string; g: string; k: string; b?: { label: string; variant: string }; ext?: boolean }

export const GET: APIRoute = async () => {
  const items: SearchItem[] = [];
  for (const c of await getContributions()) {
    items.push({
      g: 'Work',
      t: displayTitle(c),
      s: `${projectLabel(c.project)}${c.number ? ` #${c.number}` : ''}, ${kindLabel[c.kind].toLowerCase()}, ${formatDate(c.merged ?? c.date)}`,
      u: `/work/#${contributionId(c)}`,
      b: statusBadge(c.status),
      k: [c.title, c.project, c.number && `#${c.number} ${c.number}`, c.summary, c.relation?.ref].filter(Boolean).join(' '),
    });
  }
  for (const e of experiments) {
    items.push({ g: 'Lab', t: e.title, s: `Performance Lab #${e.id}`, u: `/lab/${e.folder}/`, b: statusBadge(e.status === 'open' ? 'open-question' : e.status), k: `${e.question} ${e.verdict} lab #${e.id}` });
  }
  for (const e of events.filter((e) => e.kind !== 'Milestone')) {
    items.push({ g: 'Speaking', t: e.title, s: `${e.kind}, ${e.where}, ${eventWhen(e)}`, u: e.kind === 'Community' ? '/speaking/#community' : `/speaking/#${eventId(e)}`, b: upcoming().includes(e) ? statusBadge('upcoming') : undefined, k: `${e.kind} ${e.where} ${e.abstract ?? ''} ${(e.topics ?? []).join(' ')}` });
  }
  for (const p of await getPosts()) items.push({ g: 'Writing', t: p.data.title, s: `Article, ${formatDate(p.data.date)}`, u: `/writing/${p.id}/`, k: p.data.description });
  for (const a of await getMediumArticles()) items.push({ g: 'Writing', t: a.title, s: `Medium, ${formatDate(a.date)}`, u: a.url, ext: true, k: 'medium article' });
  for (const [t, u, k] of [
    ['Work', '/work/', 'open source contributions pull requests issues'],
    ['Performance Lab', '/lab/', 'experiments benchmarks measurements'],
    ['Speaking', '/speaking/', 'talks workshops podcast community meetup upcoming past'],
    ['About', '/about/', 'bio contact certificates.dev'],
    ['Invite me to speak', '/speak/', 'speaker talks abstracts bio photo contact organizers conference'],
    ['Timeline', '/timeline/', 'history dates contributions talks experiments metrics'],
  ]) items.push({ g: 'Pages', t, s: 'Page', u, k });
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
