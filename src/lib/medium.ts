import { site } from '../data/site';
import { featuredMedium } from '../data/writing';
import { readingMinutes } from './reading';

// Martin's Medium articles, read from the public RSS feed at build time.
// If the feed is unreachable the list is empty, and the Writing page relies on local posts only.

export interface MediumArticle {
  title: string;
  url: string;
  date: string; // ISO date
  summary: string;
  minutes: number | null;
}

const decode = (s: string) =>
  s
    .replace(/^<!\[CDATA\[|\]\]>$/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, '’')
    // House style: no em or en dashes anywhere on the site.
    .replace(/\s*[—–]\s*/g, ': ')
    .trim();

let cache: Promise<MediumArticle[]> | undefined;

/** Only the Medium articles Martin listed in src/data/writing.ts (none by default). */
export function getMediumArticles(): Promise<MediumArticle[]> {
  cache ??= (async () => {
    if (process.env.OFFLINE || featuredMedium.length === 0) return [];
    try {
      const res = await fetch(site.mediumFeed, { headers: { 'User-Agent': 'martin-ferret-site-build' }, signal: AbortSignal.timeout(8000) });
      if (!res.ok) return [];
      const xml = await res.text();
      const tag = (item: string, t: string) => item.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`))?.[1] ?? '';
      return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
        .map(([, item]) => {
          const html = tag(item, 'content:encoded').replace(/^<!\[CDATA\[|\]\]>$/g, '');
          const text = html.replace(/<[^>]+>/g, ' ');
          const firstP = html.match(/<p>([\s\S]*?)<\/p>/)?.[1]?.replace(/<[^>]+>/g, '') ?? '';
          return {
            title: decode(tag(item, 'title')),
            url: decode(tag(item, 'link')).split('?')[0],
            date: new Date(tag(item, 'pubDate')).toISOString().slice(0, 10),
            summary: decode(firstP).slice(0, 180),
            minutes: text.trim() ? readingMinutes(text) : null,
          };
        })
        .filter((a) => a.title && featuredMedium.some((u) => u.split('?')[0] === a.url))
        .sort((a, b) => featuredMedium.indexOf(a.url) - featuredMedium.indexOf(b.url));
    } catch {
      return [];
    }
  })();
  return cache;
}
