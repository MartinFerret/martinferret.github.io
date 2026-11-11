// THE single source for every number on the site.
// The ledger (Timeline page), the JSON feed, the dev-only CSV, the metrics, the activity strip,
// the home page and the Open source page all derive from getRecord(). Nothing counts on its own.

import { buildDate, site } from '../data/site';
import { events, type SiteEvent } from '../data/events';
import { kindLabel, displayTitle, projectLabel, type Kind, type MvpCategory } from '../data/contributions';
import { getContributions, type LiveContribution } from './github';
import { experiments, compilers, lastSession } from './lab';
import { isoDay } from './format';

export type RowSource = 'contribution' | 'lab' | 'event';

export interface LedgerRow {
  source: RowSource;
  kind: Kind | 'lab' | 'talk';
  kindLabel: string;
  date: string; // ISO date the row counts on
  title: string; // full, sourced title (export)
  headline: string; // human title shown first on pages
  ref: string; // "repo#123", event or lab name, shown second

  project: string;
  status: string;
  url: string | null;
  description: string;
  mvpCategory: MvpCategory;
  ecosystem: 'TypeScript' | 'Java' | 'Other';
  statusCheckedAt: string | null;
}

export interface Metric {
  key: 'merged' | 'in-review' | 'ts-projects' | 'lab' | 'ms-prs' | 'ms-merged';
  value: number;
  label: string;
  asOf: string;
  href: string;
}

export interface MonthCell {
  key: string; // YYYY-MM
  date: string;
  count: number;
  current: boolean;
  items: string[];
}

const ecosystemOf = (project: string): LedgerRow['ecosystem'] =>
  project.startsWith('spring-projects/') ? 'Java' : project === 'Stack Overflow' || project.startsWith('microsoft/') || project.startsWith('sindresorhus/') ? 'TypeScript' : 'Other';

const contributionRow = (c: LiveContribution): LedgerRow => ({
  source: 'contribution',
  kind: c.kind,
  kindLabel: kindLabel[c.kind],
  date: c.merged ?? c.date,
  title: c.number ? `${c.project}#${c.number}: ${c.title}` : `${c.project}: ${c.title}`,
  headline: displayTitle(c),
  ref: c.number ? `${projectLabel(c.project)} #${c.number}` : projectLabel(c.project),
  project: c.project,
  status: c.status,
  url: c.url,
  description: c.summary,
  mvpCategory: c.mvp,
  ecosystem: ecosystemOf(c.project),
  statusCheckedAt: c.checkedAt ?? null,
});

const eventRow = (e: SiteEvent & { date: string }): LedgerRow => ({
  source: 'event',
  kind: 'talk',
  kindLabel: e.kind,
  date: e.date,
  title: `${e.title} (${e.where})`,
  headline: e.title,
  ref: e.where,
  project: e.where,
  status: 'delivered',
  url: e.url ?? null,
  description: [e.kind, e.format, e.compensation].filter(Boolean).join(', '),
  mvpCategory: e.mvp ?? 'Speaker/Presenter at Third-party event',
  ecosystem: 'TypeScript',
  statusCheckedAt: null,
});

let cache: Promise<{ person: string; generatedAt: string; rows: LedgerRow[] }> | undefined;

/** The ledger. Dated, sourced rows only: upcoming items without a date are not counted. */
export function getRecord() {
  cache ??= (async () => {
    const list = await getContributions();
    const rows: LedgerRow[] = [
      ...list.map(contributionRow),
      ...experiments.map((e) => ({
        source: 'lab' as const,
        kind: 'lab' as const,
        kindLabel: 'Lab experiment',
        date: isoDay(e.sessions.map((s) => s.date).sort()[0]),
        title: `TypeScript Performance Lab #${e.id}: ${e.title}`,
        headline: e.title,
        ref: `Performance Lab #${e.id}`,
        project: 'TypeScript Performance Lab',
        status: e.status === 'open' ? 'open-question' : e.status,
        url: site.labRepo ? `${site.labRepo}/tree/main/experiments/${e.folder}` : `/lab/${e.folder}/`,
        description: `${e.verdict.replace(/`/g, '')} Verified on ${compilers(e).join(' and ')}.`,
        mvpCategory: 'Open Source' as const,
        ecosystem: 'TypeScript' as const,
        statusCheckedAt: null,
      })),
      ...events
        .filter((e): e is SiteEvent & { date: string } => e.status !== 'milestone' && !!e.date && e.date < isoDay(buildDate))
        .map(eventRow),
    ].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
    return { person: site.name, generatedAt: buildDate.toISOString(), rows };
  })();
  return cache;
}

/** Metrics are pure functions of the ledger rows. */
export function metricsFrom(rows: LedgerRow[]): Metric[] {
  const asOf = isoDay(buildDate);
  const prs = rows.filter((r) => r.kind === 'pr');
  const ms = prs.filter((r) => r.project.startsWith('microsoft/'));
  const tsProjects = new Set(rows.filter((r) => r.source === 'contribution' && r.ecosystem === 'TypeScript' && r.project !== 'Stack Overflow').map((r) => r.project));
  return [
    { key: 'ms-merged', value: ms.filter((r) => r.status === 'merged').length, label: 'pull requests merged into Microsoft’s TypeScript repositories', asOf, href: '/work/' },
    { key: 'ms-prs', value: ms.length, label: 'pull requests opened at Microsoft', asOf, href: '/work/' },
    { key: 'merged', value: prs.filter((r) => r.status === 'merged').length, label: 'pull requests merged in projects I don’t own', asOf, href: '/work/' },
    { key: 'in-review', value: prs.filter((r) => r.status === 'open').length, label: 'pull requests in review right now', asOf, href: '/work/' },
    { key: 'ts-projects', value: tsProjects.size, label: 'TypeScript projects contributed to', asOf, href: '/work/' },
    { key: 'lab', value: rows.filter((r) => r.kind === 'lab').length, label: 'Lab experiments published with raw results', asOf, href: '/lab/' },
  ];
}

export function monthsFrom(rows: LedgerRow[], n = 12): MonthCell[] {
  const cells: MonthCell[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(buildDate.getUTCFullYear(), buildDate.getUTCMonth() - i, 1));
    const key = d.toISOString().slice(0, 7);
    const items = rows.filter((r) => r.date.startsWith(key)).map((r) => `${r.headline} (${r.ref})`);
    cells.push({ key, date: d.toISOString().slice(0, 10), count: items.length, current: i === 0, items });
  }
  return cells;
}

export async function getMetrics() {
  return metricsFrom((await getRecord()).rows);
}

export async function getMonths() {
  return monthsFrom((await getRecord()).rows);
}

/** Last day an event can still be upcoming: its date, or the end of its month when only the month is known. */
const lastDay = (e: SiteEvent) =>
  e.date ?? (e.month ? isoDay(new Date(Date.UTC(Number(e.month.slice(0, 4)), Number(e.month.slice(5, 7)), 0))) : null);

/** Upcoming: dated today or later, or not scheduled yet. Items move to the past on their own once their date passes. */
export const upcoming = () =>
  events
    .filter((e) => e.status !== 'milestone' && (lastDay(e) === null || lastDay(e)! >= isoDay(buildDate)))
    .sort((a, b) => (lastDay(a) ?? '9999').localeCompare(lastDay(b) ?? '9999'));

/** Past talks, workshops, podcasts and milestones, newest first. */
export const pastEvents = () =>
  events
    .filter((e): e is SiteEvent & { date: string } => !!e.date && (e.status === 'milestone' || e.date < isoDay(buildDate)))
    .sort((a, b) => b.date.localeCompare(a.date));

/** "January 7, 2027", "December 2026" or "Date to be announced". */
export const eventWhen = (e: SiteEvent) =>
  e.date
    ? new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${e.date}T00:00:00Z`))
    : e.month
      ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${e.month}-01T00:00:00Z`))
      : 'Date to be announced';

export const latestDelivered = () => pastEvents().find((e) => e.status !== 'milestone');

export async function latestProof(): Promise<{ text: string; href: string; date: string } | null> {
  const list = await getContributions();
  const m = list.find((c) => c.kind === 'pr' && c.status === 'merged' && c.merged);
  return m ? { text: `PR merged in ${m.project}`, href: m.url, date: m.merged! } : null;
}

/** Metric value by key. Throws if the key is unknown, so a typo can never render a wrong number. */
export function metric(metrics: Metric[], key: Metric['key']) {
  const m = metrics.find((x) => x.key === key);
  if (!m) throw new Error(`Unknown metric ${key}`);
  return m;
}

const esc = (v: unknown) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function getCsv() {
  const { rows } = await getRecord();
  const abs = (u: string | null) => (u && u.startsWith('/') ? new URL(u, import.meta.env.SITE).toString() : u);
  const cols = ['date', 'mvpCategory', 'kindLabel', 'title', 'status', 'url', 'description'] as const;
  return [cols.join(','), ...rows.map((r) => cols.map((k) => esc(k === 'url' ? abs(r.url) : r[k])).join(','))].join('\n') + '\n';
}

export { lastSession };

/** Stable anchor for an event on /speaking/. */
export const eventId = (e: Pick<SiteEvent, 'title'>) => e.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
