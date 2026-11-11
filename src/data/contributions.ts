// Public contributions to projects Martin does not own: pull requests, issue analyses and answers.
// `status` is the fallback; for GitHub items it is refreshed from the GitHub API at build (src/lib/github.ts).
// Private repositories (certification content) are excluded: they cannot be verified by a reader.

export type Kind = 'pr' | 'issue' | 'answer';
export type Status = 'merged' | 'open' | 'discussion' | 'closed' | 'answered';
export type MvpCategory =
  | 'Open Source'
  | 'Mentorship/coaching'
  | 'Online Support'
  | 'Speaker/Presenter at Third-party event'
  | 'Podcast';

export interface Relation {
  type: 'fixes' | 'part-of';
  ref: string; // "owner/repo#123"
}

export interface Contribution {
  project: string; // "owner/repo" for GitHub, "Stack Overflow" otherwise
  number?: number; // issue or PR number on GitHub
  kind: Kind;
  title: string;
  summary: string;
  url: string; // direct link to the PR, the comment or the answer
  date: string; // ISO date: opened (PR), comment date (issue analysis), answer date
  merged?: string; // ISO date
  status: Status;
  relation?: Relation;
  diff?: { added: number; removed: number };
  mvp: MvpCategory;
  /** Short human title shown first in lists. Falls back to `title`. */
  headline?: string;
  /** Editorial pick for the Home page "Featured" section (one merged PR). */
  featured?: boolean;
  /** A short before/after code example shown as a figure. Lines starting with "!" are the compiler's answer. */
  snippet?: string[];
}

export const kindLabel: Record<Kind, string> = { pr: 'Pull request', issue: 'Issue analysis', answer: 'Answer' };

/** Short, human name for a project, used in lists and filters. */
export const projectLabel = (project: string) =>
  ({
    'microsoft/TypeScript': 'TypeScript',
    'microsoft/TypeScript-DOM-lib-generator': 'TypeScript DOM types',
    'microsoft/TypeScript-Website': 'TypeScript website',
    'sindresorhus/type-fest': 'type-fest',
    'spring-projects/spring-amqp': 'Spring AMQP',
  })[project] ?? project;

export const displayTitle = (c: Pick<Contribution, 'headline' | 'title'>) => c.headline ?? c.title;

export const contributions: Contribution[] = [
  // microsoft/TypeScript
  {
    project: 'microsoft/TypeScript',
    number: 61460,
    kind: 'issue',
    headline: 'Error subtypes and InstanceType: a compatibility risk, reproduced',
    title: 'InstanceType and constructor return type inference for built-in Error subtypes',
    summary:
      'Offered to implement the proposed ErrorConstructorStatics split and flagged a compatibility risk first: @types/node statics such as captureStackTrace would stop reaching TypeError, reproduced as TS2339.',
    url: 'https://github.com/microsoft/TypeScript/issues/61460#issuecomment-6683539096',
    date: '2026-11-06',
    status: 'discussion',
    mvp: 'Open Source',
  },

  // microsoft/TypeScript-DOM-lib-generator
  {
    project: 'microsoft/TypeScript-DOM-lib-generator',
    number: 2592,
    kind: 'pr',
    headline: 'Shared WebAssembly memories get the right buffer type',
    title: 'Type WebAssembly.Memory buffers as ArrayBufferLike for shared memories',
    summary:
      'A memory created with shared: true exposes a SharedArrayBuffer, but lib.dom said ArrayBuffer, so instanceof SharedArrayBuffer checks narrowed to never. Memory is now generic over its buffer type, and existing code keeps working.',
    url: 'https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/2592',
    date: '2026-11-09',
    status: 'open',
    relation: { type: 'fixes', ref: 'microsoft/TypeScript-DOM-lib-generator#2447' },
    diff: { added: 224, removed: 100 },
    mvp: 'Open Source',
  },
  {
    project: 'microsoft/TypeScript-DOM-lib-generator',
    number: 2583,
    kind: 'pr',
    headline: 'Scheduler.postTask keeps the type of your callback’s result',
    title: 'Make Scheduler.postTask generic over the callback result',
    summary:
      'postTask() returned Promise<any>, so the type of the callback’s result was lost. It is now generic, and an async callback resolves to the awaited value.',
    url: 'https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/2583',
    date: '2026-11-07',
    merged: '2026-11-08',
    status: 'merged',
    relation: { type: 'fixes', ref: 'microsoft/TypeScript-DOM-lib-generator#2084' },
    diff: { added: 112, removed: 48 },
    mvp: 'Open Source',
  },
  {
    project: 'microsoft/TypeScript-DOM-lib-generator',
    number: 2582,
    kind: 'pr',
    headline: 'createElementNS returns the exact element type for XHTML',
    title: 'Add a generic createElementNS overload for the XHTML namespace',
    summary:
      'createElementNS with the XHTML namespace returns the specific element type, like HTMLDivElement for "div", as SVG and MathML already do.',
    url: 'https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/2582',
    date: '2026-11-05',
    merged: '2026-11-06',
    status: 'merged',
    relation: { type: 'fixes', ref: 'microsoft/TypeScript#63556' },
    diff: { added: 12, removed: 0 },
    mvp: 'Open Source',
  },
  {
    project: 'microsoft/TypeScript-DOM-lib-generator',
    number: 2566,
    kind: 'issue',
    headline: 'What remains after making MutationObserver options required',
    title: 'MutationObserver.observe options should not be optional (follow-up)',
    summary:
      'Reported that #2578 now makes observe(target) without options a compile-time error, and laid out what remains: options like {} still need a union type that would break existing code.',
    url: 'https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/2566#issuecomment-6664861293',
    date: '2026-11-05',
    status: 'discussion',
    mvp: 'Open Source',
  },
  {
    project: 'microsoft/TypeScript-DOM-lib-generator',
    number: 2578,
    kind: 'pr',
    headline: 'MutationObserver.observe() without options is now a compile error',
    title: 'Make options required in MutationObserver.observe()',
    summary:
      'Calling observe(target) without options always throws at runtime. The DOM types now flag it at compile time.',
    url: 'https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/2578',
    date: '2026-11-01',
    merged: '2026-11-03',
    status: 'merged',
    relation: { type: 'part-of', ref: 'microsoft/TypeScript-DOM-lib-generator#2566' },
    diff: { added: 24, removed: 4 },
    mvp: 'Open Source',
    featured: true,
    snippet: ['const mo = new MutationObserver(cb);', 'mo.observe(target);', '! Expected 2 arguments, but got 1.', 'mo.observe(target, { childList: true });'],
  },
  {
    project: 'microsoft/TypeScript-DOM-lib-generator',
    number: 2439,
    kind: 'issue',
    headline: 'Byte stream types for WebTransport',
    title: 'Missing bounds in WebTransportReceiveStream and WebTransportSendStream parent types',
    summary:
      'Proposed typing the receive side as ReadableStream<Uint8Array<ArrayBuffer>> and the send side as WritableStream<BufferSource>, matching how other byte streams are typed and what WPT covers.',
    url: 'https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/2439#issuecomment-6614518879',
    date: '2026-11-03',
    status: 'discussion',
    mvp: 'Open Source',
  },
  {
    project: 'microsoft/TypeScript-DOM-lib-generator',
    number: 2574,
    kind: 'issue',
    headline: 'Helping a first-time contributor fix AbortSignal.any',
    title: 'AbortSignal.any should accept an Iterable<AbortSignal>',
    summary:
      'Helped the reporter toward a fix: traced why static methods are excluded from the Iterable overloads (the generator filters them since #1839) and compared two approaches for TypeScript 6+.',
    url: 'https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/2574#issuecomment-6561832671',
    date: '2026-11-01',
    status: 'discussion',
    mvp: 'Mentorship/coaching',
  },

  // microsoft/TypeScript-Website
  {
    project: 'microsoft/TypeScript-Website',
    number: 3694,
    kind: 'pr',
    headline: 'Docs: fixing the TS2882 error on CSS imports',
    title: 'Document noUncheckedSideEffectImports fixes for CSS packages',
    summary:
      'Explains the TS2882 error on CSS imports since TypeScript 6.0, with fixes for library authors and for users.',
    url: 'https://github.com/microsoft/TypeScript-Website/pull/3694',
    date: '2026-11-06',
    status: 'open',
    relation: { type: 'fixes', ref: 'microsoft/TypeScript-Website#3607' },
    diff: { added: 56, removed: 2 },
    mvp: 'Open Source',
  },

  // sindresorhus/type-fest
  {
    project: 'sindresorhus/type-fest',
    number: 1285,
    kind: 'issue',
    headline: 'A Nullish type that works with exactOptionalPropertyTypes',
    title: 'Nullish / Nilable type',
    summary:
      'Showed that the proposed definition rejects an explicit undefined under exactOptionalPropertyTypes, which type-fest itself enables, and suggested adding undefined with a type test for both settings.',
    url: 'https://github.com/sindresorhus/type-fest/issues/1285#issuecomment-6617554050',
    date: '2026-11-03',
    status: 'closed',
    mvp: 'Open Source',
  },
  {
    project: 'sindresorhus/type-fest',
    number: 1315,
    kind: 'issue',
    headline: 'DeepValuesOf is already expressible with Paths and Get',
    title: 'DeepValuesOf',
    summary:
      'Showed the request can already be expressed with Paths (leavesOnly) and Get, and listed the questions a dedicated type would need to answer: leaves only, arrays and tuples, recursion depth.',
    url: 'https://github.com/sindresorhus/type-fest/issues/1315#issuecomment-6617486103',
    date: '2026-11-03',
    status: 'closed', // closed as completed by the maintainer on 2026-11-06
    mvp: 'Open Source',
  },

  // Other open source. Author (MartinFerret) and merge verified through the GitHub API on 2026-11-06.
  {
    project: 'spring-projects/spring-amqp',
    number: 3549,
    kind: 'pr',
    headline: 'Per-listener batch size and timeout in Spring AMQP',
    title: 'Add batchSize and batchReceiveTimeout to @RabbitListener',
    summary: 'Batch size and receive timeout can be set per listener, with SpEL and property placeholders.',
    url: 'https://github.com/spring-projects/spring-amqp/pull/3549',
    date: '2026-08-04',
    merged: '2026-08-06',
    status: 'merged',
    relation: { type: 'fixes', ref: 'spring-projects/spring-amqp#1545' },
    diff: { added: 411, removed: 8 },
    mvp: 'Open Source',
  },
  {
    project: 'spring-projects/spring-amqp',
    number: 3528,
    kind: 'pr',
    headline: 'Docs: how channel pools are sized in Spring AMQP',
    title: 'Document PooledChannelConnectionFactory sizing',
    summary:
      'Documents that channel pools are bounded and block when exhausted, and that the factory is not meant for consumers.',
    url: 'https://github.com/spring-projects/spring-amqp/pull/3528',
    date: '2026-07-21',
    merged: '2026-07-28',
    status: 'merged',
    relation: { type: 'fixes', ref: 'spring-projects/spring-amqp#1557' },
    diff: { added: 14, removed: 0 },
    mvp: 'Open Source',
  },

  // Stack Overflow
  {
    project: 'Stack Overflow',
    kind: 'answer',
    headline: 'Why TypeScript picks the second overload',
    title: 'Why is the 2nd overload picked up?',
    summary:
      'Explained that overload choice depends on the order of the checker passes, not the order of the overloads: resolveCall tries every overload with the subtype relation before falling back to assignability.',
    url: 'https://stackoverflow.com/questions/80014081/why-is-the-2nd-overload-picked-up/80014150#80014150',
    date: '2026-11-01',
    status: 'answered',
    mvp: 'Online Support',
  },
];

export const refUrl = (ref: string) => {
  const [repo, n] = ref.split('#');
  return `https://github.com/${repo}/issues/${n}`;
};

export const relationLabel = (r: Relation) => `${r.type === 'fixes' ? 'Fixes' : 'Part of'} ${r.ref}`;

/** Stable anchor for a contribution on /work/, e.g. "typescript-dom-lib-generator-2582". */
export const contributionId = (c: Pick<Contribution, 'project' | 'number' | 'url'>) =>
  (c.number ? `${c.project.split('/').pop()}-${c.number}` : `${c.project}-${c.url.match(/(\d+)(?!.*\d)/)?.[1] ?? ''}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
