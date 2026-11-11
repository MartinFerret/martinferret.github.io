import raw from '../data/lab.json';

// Lab data comes straight from typescript-performance-lab/docs/data.json.
// Refresh it with: cp ../typescript-performance-lab/docs/data.json src/data/lab.json

interface Run {
  files: number;
  types: number;
  instantiations: number;
  memoryUsedKB: number | null;
  /** Peak RSS from /usr/bin/time, MiB. */
  maxRssMB?: number | null;
  checkTime: number;
  totalTime: number;
}
interface Condition {
  key: string;
  label: string;
  compiler: string;
  scope: string;
  status: string;
  runs?: Run[];
  median?: Run;
}
interface Session {
  date: string;
  environment: { cpu: string; cores: number; memoryGB: number; platform: string; node: string };
  runsPerCondition: number;
  safetyCheck?: string;
  conditions: Condition[];
}
export interface Experiment {
  folder: string;
  id: string;
  title: string;
  question: string;
  /** When the experiment was opened: "YYYY-MM" or "YYYY-MM-DD". Not a measurement date. */
  opened?: string;
  status: 'confirmed' | 'rejected' | 'open';
  verdict: string;
  takeaway: string;
  reproduce: string;
  target?: { name: string; repository: string; commit: string };
  notes?: string[];
  sessions: Session[];
}

export const labGeneratedAt: string = raw.generatedAt;
// Merged protocol sessions carry raw runs only: medians are always recomputed from the runs (true median).
const trueMedian = (v: number[]) => { const s = [...v].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
function withMedians(e: Experiment): Experiment {
  for (const s of e.sessions) for (const c of s.conditions) {
    if (c.status !== 'ok' || !c.runs?.length) { delete c.median; continue; }
    const keys = Object.keys(c.runs[0]).filter((k) => typeof (c.runs![0] as any)[k] === 'number');
    c.median = Object.fromEntries(keys.map((k) => [k, trueMedian(c.runs!.map((r) => (r as any)[k]).filter((x: unknown) => typeof x === 'number'))])) as unknown as Run;
  }
  return e;
}
export const experiments = (raw.experiments as unknown as Experiment[]).map(withMedians).sort((a, b) => b.id.localeCompare(a.id));

/** Why a condition failed, from what the run recorded (never the machine's RAM). */
export function failLabel(c: Condition & { failure?: { cause?: string }; env?: Record<string, string> }, s: Session & { protocol?: { heapLimitBytes?: number } }) {
  if (c.status !== 'out-of-memory') return 'Did not finish';
  if (c.failure?.cause === 'v8-heap-limit') {
    const custom = c.env?.NODE_OPTIONS?.match(/--max-old-space-size=(\d+)/)?.[1];
    const lim = custom ? `${Number(custom) / 1024} GiB` : s.protocol?.heapLimitBytes ? `${(s.protocol.heapLimitBytes / 2 ** 30).toFixed(1)} GiB` : null;
    return `Out of memory at Node.js's ${custom ? '' : 'default '}heap limit${lim ? ` (${lim})` : ''}`;
  }
  return 'Out of memory (cause not recorded)';
}

export const compilers = (e: Experiment) =>
  [...new Set(e.sessions.flatMap((s) => s.conditions.map((c) => c.compiler)))].sort();

export const machine = (s: Session) =>
  `${s.environment.cpu}, ${s.environment.cores} ${s.environment.cores === 1 ? 'core' : 'cores'}, ${s.environment.memoryGB} GB, Node.js ${s.environment.node.replace(/^v/, '')}`;

export const lastSession = (e: Experiment) =>
  e.sessions.slice().sort((a, b) => b.date.localeCompare(a.date))[0];

export const range = (c: Condition) => {
  const t = (c.runs ?? []).map((r) => r.checkTime);
  return t.length ? { min: Math.min(...t), max: Math.max(...t) } : null;
};

/** Headline result for an experiment, computed from the raw medians, never typed by hand. */
export function headline(e: Experiment): { value: string; label: string } | null {
  const s = lastSession(e);
  const get = (k: string) => s.conditions.find((c) => c.key === k)?.median?.checkTime;
  if (e.id === '001') {
    const b = get('before-ts7');
    const a = get('after-ts7');
    if (b && a) return { value: `−${Math.round((1 - a / b) * 100)}%`, label: 'check time with TypeScript 7 after the fix' };
  }
  if (e.id === '002') {
    const six = get('src-ts6');
    const seven = get('src-ts7');
    if (six && seven) return { value: `${(six / seven).toFixed(1)}×`, label: 'faster check of type-fest sources, TypeScript 7 vs 6' };
  }
  return null;
}

export interface ChartGroup { label: string; bars: { label: string; value: number; tone: 'before' | 'after' }[] }

/** Bar-chart groups for an experiment, from raw medians. Before/after experiments compare per compiler;
 *  compiler-vs-compiler experiments compare per machine. Returns [] when the data has neither shape. */
export function chartGroups(e: Experiment): { groups: ChartGroup[]; delta: 'percent' | 'times' } {
  const med = (s: Session, key: string) => s.conditions.find((c) => c.key === key)?.median?.checkTime;
  const s = lastSession(e);
  const versions = [...new Set(s.conditions.map((c) => c.key.match(/^(?:before|after)-ts(\d+)$/)?.[1]).filter(Boolean))] as string[];
  if (versions.length) {
    const groups = versions.map((v) => ({ label: `TypeScript ${v}`, bars: [
      { label: 'Before the fix', value: med(s, `before-ts${v}`)!, tone: 'before' as const },
      { label: 'After the fix', value: med(s, `after-ts${v}`)!, tone: 'after' as const },
    ] })).filter((g) => g.bars.every((b) => b.value));
    return { groups, delta: 'percent' };
  }
  const groups = e.sessions.map((x) => ({ label: x.environment.cpu.replace(/\(R\)|Processor.*$|@.*$/g, '').replace(/\s+/g, ' ').trim(), bars: [
    { label: 'TypeScript 6', value: med(x, 'src-ts6')!, tone: 'before' as const },
    { label: 'TypeScript 7', value: med(x, 'src-ts7')!, tone: 'after' as const },
  ] })).filter((g) => g.bars.every((b) => b.value));
  return { groups, delta: 'times' };
}

/** "2026-10" -> "October 2026", "2026-10-02" -> "October 2, 2026". */
export const openedText = (o: string) => {
  const [y, m, d] = o.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d || 1, 12));
  return dt.toLocaleDateString('en-US', d ? { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' } : { month: 'long', year: 'numeric', timeZone: 'UTC' });
};
