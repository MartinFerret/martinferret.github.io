// SEO checks on the built site (dist/). Run with `npm test` (builds first) or `npm run test:only`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = join(process.cwd(), 'dist');
// Same source as astro.config.mjs: SITE_URL, default https://martinferret.dev.
const SITE = (process.env.SITE_URL ?? 'https://martinferret.dev').replace(/\/$/, '');
const HOST = new URL(SITE).host;
const ESC = SITE.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const CUSTOM_DOMAIN = !HOST.endsWith('github.io'); // a github.io build is the interim one, before the domain is live
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const html = walk(dist).filter((f) => f.endsWith('.html'));
const isRedirect = (s) => /http-equiv="refresh"/i.test(s);
const pages = html
  .map((f) => ({ f, path: '/' + relative(dist, f).replace(/index\.html$/, '').replace(/\\/g, '/'), s: readFileSync(f, 'utf8') }))
  .filter((p) => !isRedirect(p.s));
const indexable = pages.filter((p) => !/name="robots" content="noindex"/.test(p.s));
const meta = (s, re) => (s.match(re)?.[1] ?? '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const text = (s) => s.replace(/<[^>]+>/g, '').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

test('every indexable page: one H1, a title under 60 and a description under 155 characters, all unique', () => {
  const titles = new Map(), descs = new Map();
  for (const p of indexable) {
    const title = meta(p.s, /<title>([^<]*)<\/title>/);
    const desc = meta(p.s, /<meta name="description" content="([^"]*)"/);
    assert.equal((p.s.match(/<h1[\s>]/g) ?? []).length, 1, `${p.path}: one H1`);
    assert.ok(title.length > 0 && title.length < 60, `${p.path}: title "${title}" (${title.length})`);
    assert.ok(desc.length > 0 && desc.length < 155, `${p.path}: description (${desc.length})`);
    assert.ok(!titles.has(title), `${p.path}: title also used on ${titles.get(title)}`);
    assert.ok(!descs.has(desc), `${p.path}: description also used on ${descs.get(desc)}`);
    titles.set(title, p.path); descs.set(desc, p.path);
  }
});

test('every indexable page: exactly one canonical, on the site URL, with a trailing slash and no query', () => {
  for (const p of indexable) {
    const all = [...p.s.matchAll(/<link rel="canonical" href="([^"]*)"/g)].map((m) => m[1]);
    assert.equal(all.length, 1, `${p.path}: ${all.length} canonicals`);
    assert.equal(all[0], `${SITE}${p.path}`, `${p.path}: canonical ${all[0]}`);
    assert.ok(all[0].endsWith('/') && !all[0].includes('?'));
    assert.equal(meta(p.s, /<meta property="og:url" content="([^"]*)"/), all[0], `${p.path}: og:url`);
  }
});

test('every indexable page: Open Graph image on the site URL that exists, and a Twitter card', () => {
  const seen = new Map();
  for (const p of indexable) {
    const img = meta(p.s, /<meta property="og:image" content="([^"]*)"/);
    assert.ok(img.startsWith(`${SITE}/og/`), `${p.path}: og:image ${img}`);
    assert.ok(existsSync(join(dist, new URL(img).pathname)), `${p.path}: ${img} is not built`);
    assert.ok(!seen.has(img), `${p.path}: og:image also used on ${seen.get(img)}`);
    seen.set(img, p.path);
    assert.match(p.s, /<meta name="twitter:card" content="summary_large_image"/);
  }
});

test('structured data parses, uses known types, and has breadcrumbs everywhere except home', () => {
  const known = new Set(['Person', 'WebSite', 'BreadcrumbList', 'ListItem', 'ProfessionalService', 'Event', 'PodcastSeries', 'PodcastEpisode', 'Article', 'OfferCatalog', 'Offer', 'Service', 'VirtualLocation', 'PostalAddress']);
  for (const p of indexable) {
    const blocks = [...p.s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    const types = [];
    const visit = (o) => { if (Array.isArray(o)) o.forEach(visit); else if (o && typeof o === 'object') { if (o['@type']) types.push(o['@type']); Object.values(o).forEach(visit); } };
    blocks.forEach(visit);
    for (const t of types) assert.ok(known.has(t), `${p.path}: unexpected type ${t}`);
    if (p.path !== '/') assert.ok(types.includes('BreadcrumbList'), `${p.path}: no BreadcrumbList`);
    const json = JSON.stringify(blocks);
    if (CUSTOM_DOMAIN) assert.ok(!json.includes('github.io'), `${p.path}: github.io in structured data`);
  }
  const typeOf = (path) => readFileSync(join(dist, path, 'index.html'), 'utf8');
  for (const [path, type] of [['', 'WebSite'], ['', 'Person'], ['about', 'Person'], ['hire', 'ProfessionalService'], ['meetup', 'Event'], ['podcasts/devpreneur', 'PodcastSeries']]) {
    assert.ok(typeOf(path).includes(`"@type":"${type}"`), `/${path}: ${type}`);
  }
});

test('robots.txt allows every crawler, AI crawlers included, and declares the sitemap index', () => {
  const r = readFileSync(join(dist, 'robots.txt'), 'utf8');
  for (const bot of ['*', 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended']) assert.match(r, new RegExp(`User-agent: ${bot.replace('*', '\\*')}\\nAllow: /`));
  assert.ok(!/Disallow: \S/.test(r));
  assert.match(r, new RegExp(`Sitemap: ${ESC}/sitemap-index\\.xml`));
});

test('sitemaps: every URL on the site URL, built, not a redirect, not filtered, with a lastmod', () => {
  const index = readFileSync(join(dist, 'sitemap-index.xml'), 'utf8');
  assert.match(index, new RegExp(`<loc>${ESC}/sitemap-site\\.xml</loc>`));
  assert.match(index, new RegExp(`<loc>${ESC}/typescript-performance-lab/sitemap\\.xml</loc>`));
  const xml = readFileSync(join(dist, 'sitemap-site.xml'), 'utf8');
  const entries = [...xml.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod><\/url>/g)];
  assert.ok(entries.length >= 15, `${entries.length} URLs`);
  for (const [, loc] of entries) {
    assert.ok(loc.startsWith(`${SITE}/`) && !loc.includes('?'), loc);
    const file = join(dist, new URL(loc).pathname, 'index.html');
    assert.ok(existsSync(file), `${loc} is not built`);
    assert.ok(!isRedirect(readFileSync(file, 'utf8')), `${loc} is a redirect`);
  }
  const listed = new Set(entries.map((e) => new URL(e[1]).pathname));
  for (const p of indexable) assert.ok(listed.has(p.path), `${p.path} missing from the sitemap`);
});

test('CNAME, llms.txt and llms-full.txt are on the site URL; no github.io anywhere in a custom-domain build', () => {
  // On the interim github.io build, CNAME is removed at publish time (see DOMAIN-SETUP.md).
  if (CUSTOM_DOMAIN) assert.equal(readFileSync(join(dist, 'CNAME'), 'utf8').trim(), HOST);
  const llms = readFileSync(join(dist, 'llms.txt'), 'utf8');
  assert.ok(llms.includes("Martin Ferret is a French TypeScript expert focused on type-checking performance"));
  for (const p of ['/hire/', '/speak/', '/lab/', '/work/', '/meetup/', '/about/', '/podcasts/devpreneur/', '/writing/']) assert.ok(llms.includes(`${SITE}${p}`), `llms.txt: ${p}`);
  assert.ok(readFileSync(join(dist, 'llms-full.txt'), 'utf8').includes('TypeScript performance expert for engineering teams'));
  if (CUSTOM_DOMAIN) for (const f of walk(dist).filter((f) => /\.(html|txt|json|xml)$/.test(f))) assert.ok(!readFileSync(f, 'utf8').includes('martinferret.github.io'), `github.io in ${f}`);
});

test('/hire, /about and /meetup start with the exact copy', () => {
  const first = (path) => text(readFileSync(join(dist, path, 'index.html'), 'utf8'));
  assert.ok(first('hire').includes('I help engineering teams make TypeScript fast again: slow type-checking, CI jobs that run out of memory, and the move to TypeScript 7. I measure what your types really cost, fix it without weakening type safety, and leave your team the tools to keep it fast.'));
  assert.ok(first('about').includes("Martin Ferret is a French TypeScript expert focused on type-checking performance, a contributor to Microsoft's TypeScript DOM types, and Lead Content Owner for the JavaScript and TypeScript certifications at Certificates.dev."));
  assert.ok(first('meetup').includes('A free, online TypeScript meetup in French, open to everyone: two 20-minute talks, live questions and the TypeScript news of the moment.'));
});
