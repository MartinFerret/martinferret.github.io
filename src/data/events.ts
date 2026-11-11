// Talks, workshops, podcasts and milestones.
// `date` is optional for upcoming items that are not scheduled yet: they show as "Coming soon".
// An item is upcoming when status is 'upcoming'. Never mark an item delivered without a date.

import type { MvpCategory } from './contributions';

export type EventKind = 'Talk' | 'Workshop' | 'Podcast' | 'Community' | 'Milestone';

export interface SiteEvent {
  kind: EventKind;
  status: 'delivered' | 'upcoming' | 'milestone';
  date?: string; // ISO date
  month?: string; // "YYYY-MM" when only the month is known; shown as "December 2026"
  role?: 'Host' | 'Guest' | 'Speaker';
  title: string;
  where: string; // event, show or project, in text (no logos)
  format?: 'Online' | 'In person';
  time?: string; // human time with time zone, e.g. "7 pm Paris time (CET, UTC+1)"
  language?: string;
  topics?: string[]; // talk or workshop topics, as listed by the event. Leave empty rather than guess.
  compensation?: 'unpaid' | 'paid';
  url?: string;
  abstract?: string;
  mvp?: MvpCategory;
}

export const events: SiteEvent[] = [
  {
    kind: 'Community',
    status: 'upcoming',
    date: '2027-01-07',
    time: '7 pm Paris time (CET, UTC+1)',
    role: 'Host',
    title: 'What\'s up TypeScript France #1',
    where: 'What\'s up TypeScript France',
    format: 'Online',
    language: 'French',
    url: 'https://github.com/MartinFerret/rendez-vous-typescript',
    abstract: 'Two 20-minute talks, live questions and the TypeScript news of the moment. Free, streamed live on YouTube with a replay.',
  },
  {
    kind: 'Podcast',
    status: 'upcoming',
    title: 'What TypeScript 7 Really Changes for Angular Teams',
    where: 'Angular Master Podcast',
    role: 'Guest',
    // Recording planned for December 2026, exact date to be confirmed.
    month: '2026-12',
    mvp: 'Podcast',
  },
  {
    kind: 'Workshop',
    status: 'delivered',
    date: '2026-10-20',
    role: 'Speaker',
    title: 'Pizzeria del Compilator: Building a Type-Safe Configurator with TypeScript',
    where: 'Frontend Nation 2026, TypeScript Day',
    format: 'Online',
    compensation: 'unpaid',
    topics: [], // TODO(Martin): the workshop's topics as listed by Frontend Nation.
    mvp: 'Speaker/Presenter at Third-party event',
  },
  {
    kind: 'Milestone',
    status: 'milestone',
    date: '2026-11-03',
    title: 'Performance Lab: first experiments published',
    where: 'TypeScript Performance Lab',
    abstract: 'Typed events (#001, confirmed) and TypeScript 6 vs 7 on type-fest (#002, open), with raw results and machine context.',
  },
  {
    kind: 'Milestone',
    status: 'milestone',
    date: '2026-11-03',
    title: 'First merged pull request in TypeScript’s DOM types',
    where: 'microsoft/TypeScript-DOM-lib-generator',
    url: 'https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/2578',
  },
];
