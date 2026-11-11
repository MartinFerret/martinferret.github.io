// Every public page, with the files its content comes from. Used by the sitemap (lastmod) and llms.txt.
// lastmod = the latest real modification of those files: the git commit date, or the file's own date when it has
// uncommitted changes. The shared layout is left out on purpose, so a design change does not touch every date.
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { join } from 'node:path';
import { experiments } from './lab';
import { talkPages } from './talks';
import { podcasts } from '../data/podcasts';
import { getPosts } from './writing';

export interface Route { path: string; sources: string[]; date?: string }

const root = process.cwd();
const cache = new Map<string, number>();
function modified(file: string): number {
  if (cache.has(file)) return cache.get(file)!;
  let t = 0;
  try {
    const dirty = execFileSync('git', ['status', '--porcelain', '--', file], { cwd: root, encoding: 'utf8' }).trim();
    const committed = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], { cwd: root, encoding: 'utf8' }).trim();
    t = dirty || !committed ? statSync(join(root, file)).mtimeMs : Date.parse(committed);
  } catch {
    t = statSync(join(root, file)).mtimeMs;
  }
  cache.set(file, t);
  return t;
}

export function lastmod(r: Route) {
  const times = r.sources.map(modified);
  if (r.date) times.push(Date.parse(r.date));
  return new Date(Math.max(...times)).toISOString().slice(0, 10);
}

const D = 'src/data/';
export async function publicRoutes(): Promise<Route[]> {
  const posts = await getPosts();
  return [
    { path: '/', sources: ['src/pages/index.astro', `${D}contributions.ts`, `${D}events.ts`, `${D}lab.json`] },
    { path: '/hire/', sources: ['src/pages/hire.astro', `${D}contributions.ts`, `${D}lab.json`, `${D}certificates-articles.json`] },
    { path: '/work/', sources: ['src/pages/work.astro', `${D}contributions.ts`] },
    { path: '/lab/', sources: ['src/pages/lab/index.astro', `${D}lab.json`] },
    ...experiments.map((e) => ({ path: `/lab/${e.folder}/`, sources: ['src/pages/lab/[folder].astro', `${D}lab.json`], date: e.sessions.map((s) => s.date).sort().pop() })),
    { path: '/speaking/', sources: ['src/pages/speaking.astro', `${D}events.ts`, `${D}talks.ts`, `${D}podcasts.ts`] },
    { path: '/speak/', sources: ['src/pages/speak.astro', `${D}talks.ts`] },
    ...talkPages().map((t) => ({ path: `/talks/${t.slug}/`, sources: ['src/pages/talks/[slug].astro', `${D}talks.ts`, `${D}events.ts`] })),
    ...podcasts.map((p) => ({ path: `/podcasts/${p.slug}/`, sources: ['src/pages/podcasts/[slug].astro', `${D}podcasts.ts`] })),
    { path: '/meetup/', sources: ['src/pages/meetup.astro', `${D}events.ts`, `${D}site.ts`] },
    { path: '/writing/', sources: ['src/pages/writing/index.astro', `${D}certificates-articles.json`] },
    ...posts.map((p) => ({ path: `/writing/${p.id}/`, sources: [`src/content/writing/${p.id}.md`] })),
    { path: '/about/', sources: ['src/pages/about.astro'] },
    { path: '/timeline/', sources: ['src/pages/timeline.astro', `${D}contributions.ts`, `${D}events.ts`] },
  ];
}
