// One page per talk (/talks/<slug>/): the talks Martin offers, plus every talk, workshop and guest podcast in events.ts.
// Only fields present in the data are shown; nothing is filled in.
import { bookableTalks } from '../data/talks';
import { events, type SiteEvent } from '../data/events';

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').replace(/-+/g, '-');

export interface TalkPage {
  slug: string;
  title: string;
  kind: 'Talk' | 'Workshop' | 'Podcast';
  bookable: boolean;
  abstract?: string;
  level?: string;
  format?: string;
  appearance?: SiteEvent; // where and when it was (or will be) given
}

/** Short slug for an appearance: the part of the title before a colon, e.g. "Pizzeria del Compilator". */
const eventSlug = (e: SiteEvent) => slugify(e.title.split(':')[0]);

export function talkPages(): TalkPage[] {
  const appearances = events.filter((e) => e.kind === 'Talk' || e.kind === 'Workshop' || (e.kind === 'Podcast' && e.role === 'Guest'));
  return [
    ...bookableTalks.map((t) => ({ slug: t.slug, title: t.title, kind: 'Talk' as const, bookable: true, abstract: t.abstract, level: t.level, format: t.format })),
    ...appearances.map((e) => ({
      slug: eventSlug(e),
      title: e.title,
      kind: e.kind as TalkPage['kind'],
      bookable: false,
      abstract: e.abstract,
      format: e.format,
      appearance: e,
    })),
  ];
}

export const talkHref = (t: { slug: string }) => `/talks/${t.slug}/`;

/** Talk page for an event from events.ts, if it has one. */
export const talkFor = (e: SiteEvent) => talkPages().find((t) => t.appearance === e);
