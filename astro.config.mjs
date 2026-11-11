import { defineConfig } from 'astro/config';

// The site URL has one source: this option. Override with SITE_URL (e.g. for a preview); every canonical, Open Graph,
// sitemap and structured data URL is built from it.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://martinferret.dev',
  trailingSlash: 'ignore',
  // Old URLs keep working. Static builds emit a redirect page; public/_redirects gives hosts that read it a real 301.
  redirects: { '/open-source': '/work/', '/track-record': '/timeline/' },
});
