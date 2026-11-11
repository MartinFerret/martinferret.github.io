import { defineConfig } from 'astro/config';

// Served by GitHub Pages from the martinferret.github.io repository.
export default defineConfig({
  site: 'https://martinferret.github.io',
  trailingSlash: 'ignore',
  // Old URLs keep working. Static builds emit a redirect page; public/_redirects gives hosts that read it a real 301.
  redirects: { '/open-source': '/work/', '/track-record': '/timeline/' },
});
