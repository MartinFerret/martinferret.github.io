import raw from '../data/lab.json';

// Lab data comes straight from typescript-performance-lab/docs/data.json.
// Refresh it with: cp ../typescript-performance-lab/docs/data.json src/data/lab.json

interface Run {
  files: number;
  types: number;
  instantiations: number;
  memoryUsedKB: number | null;
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
  status: 'confirmed' | 'rejected' | 'open';
  verdict: string;
  takeaway: string;
  reproduce: string;
  target?: { name: string; repository: string; commit: string };
  notes?: string[];
  sessions: Session[];
}

export const labGeneratedAt: string = raw.generatedAt;
export const experiments = (raw.experiments as unknown as Experiment[]).slice().sort((a, b) => b.id.localeCompare(a.id));

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
