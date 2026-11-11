import { contributions, type Contribution, type Status } from '../data/contributions';

// Refreshes GitHub statuses at build time. Set GITHUB_TOKEN to avoid the unauthenticated
// rate limit, OFFLINE=1 to skip. When the API is unreachable, the stored status is kept.

export type LiveContribution = Contribution & { checkedAt?: string };

async function refresh(c: Contribution): Promise<LiveContribution> {
  if (process.env.OFFLINE || c.project === 'Stack Overflow' || !c.number) return c;
  const path = c.kind === 'pr' ? 'pulls' : 'issues';
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'martin-ferret-site-build' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const res = await fetch(`https://api.github.com/repos/${c.project}/${path}/${c.number}`, { headers, signal: AbortSignal.timeout(6000) });
    if (!res.ok) return c;
    const j = (await res.json()) as { state: string; merged_at?: string | null };
    const checkedAt = new Date().toISOString();
    let status: Status;
    if (c.kind === 'pr') status = j.merged_at ? 'merged' : j.state === 'closed' ? 'closed' : 'open';
    else status = j.state === 'closed' ? 'closed' : 'discussion';
    return { ...c, status, merged: j.merged_at ? j.merged_at.slice(0, 10) : c.merged, checkedAt };
  } catch {
    return c;
  }
}

let cache: Promise<LiveContribution[]> | undefined;

/** All contributions with live statuses, newest first. */
export function getContributions(): Promise<LiveContribution[]> {
  cache ??= Promise.all(contributions.map(refresh)).then((list) =>
    list.sort((a, b) => (b.merged ?? b.date).localeCompare(a.merged ?? a.date)),
  );
  return cache;
}
