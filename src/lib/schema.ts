// Structured data (schema.org JSON-LD). URLs are built from Astro's `site` option, the single source of the domain.
import { site, socialLinks } from '../data/site';
import { podcasts } from '../data/podcasts';

export const siteUrl = () => new URL(import.meta.env.SITE ?? 'https://martinferret.dev');
export const abs = (path: string) => new URL(path, siteUrl()).toString();
export const personId = () => abs('/#person');

/** The Person, referenced by @id from every other block. */
export function person() {
  return {
    '@type': 'Person',
    '@id': personId(),
    name: site.name,
    jobTitle: 'TypeScript performance expert',
    description: site.bio,
    image: abs(site.photo.src),
    url: abs('/'),
    email: `mailto:${site.contactEmail}`,
    knowsAbout: ['TypeScript', 'TypeScript performance', 'Angular', 'Node.js'],
    address: { '@type': 'PostalAddress', addressCountry: site.country },
    sameAs: [site.links.linkedin, site.links.github, site.links.x, site.links.sessionize, site.links.medium, ...podcasts.map((p) => p.url)],
  };
}

export const personRef = () => ({ '@id': personId() });

export function website() {
  return { '@type': 'WebSite', '@id': abs('/#website'), name: site.name, url: abs('/'), inLanguage: 'en', publisher: personRef() };
}

/** Breadcrumbs from the site root to the current page. Each crumb: [name, path]. */
export function breadcrumbs(crumbs: [string, string][]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [['Home', '/'] as [string, string], ...crumbs].map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
  };
}

/** Wraps blocks in one @graph document. */
export const graph = (blocks: object[]) => ({ '@context': 'https://schema.org', '@graph': blocks });

export const socialProfiles = socialLinks;
