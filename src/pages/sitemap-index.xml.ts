// Sitemap index: this site's sitemap and the Lab's, which is a separate GitHub Pages project under the same domain.
import type { APIRoute } from 'astro';
import { publicRoutes, lastmod } from '../lib/routes';

export const GET: APIRoute = async ({ site }) => {
  const latest = (await publicRoutes()).map(lastmod).sort().pop();
  const maps = [
    `  <sitemap><loc>${new URL('/sitemap-site.xml', site)}</loc>${latest ? `<lastmod>${latest}</lastmod>` : ''}</sitemap>`,
    `  <sitemap><loc>${new URL('/typescript-performance-lab/sitemap.xml', site)}</loc></sitemap>`,
  ].join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${maps}\n</sitemapindex>\n`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
