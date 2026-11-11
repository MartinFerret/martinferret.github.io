// Run after a build: `npm test` (builds, then runs this file against dist/).
// Guards the bug where Home and the Timeline showed different numbers, plus the content and data rules.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// The meetup was renamed; the old name is built from parts so this file doesn't contain it either.
const oldMeetup = new RegExp(['Rendez', 'vous TypeScript'].join('-'), 'i');
const dist = new URL(`../${process.env.DIST ?? 'dist'}/`, import.meta.url).pathname;
const read = (p) => readFileSync(join(dist, p), 'utf8');
const metricsIn = (html) =>
  Object.fromEntries([...html.matchAll(/data-metric="([a-z-]+)"[^>]*>(\d+)</g)].map(([, k, v]) => [k, Number(v)]));
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

const json = JSON.parse(read('timeline.json'));
const rows = json.rows;
const msPrs = rows.filter((r) => r.kind === 'pr' && r.project.startsWith('microsoft/'));
const expected = {
  'ms-prs': msPrs.length,
  'ms-merged': msPrs.filter((r) => r.status === 'merged').length,
  merged: rows.filter((r) => r.kind === 'pr' && r.status === 'merged').length,
  'in-review': rows.filter((r) => r.kind === 'pr' && r.status === 'open').length,
  'ts-projects': new Set(rows.filter((r) => r.source === 'contribution' && r.ecosystem === 'TypeScript' && r.project !== 'Stack Overflow').map((r) => r.project)).size,
  lab: rows.filter((r) => r.kind === 'lab').length,
};

test('home proof numbers equal the ledger and the timeline', () => {
  const home = metricsIn(read('index.html'));
  const record = metricsIn(read('timeline/index.html'));
  for (const k of ['ms-merged', 'in-review', 'ts-projects']) {
    assert.ok(k in home, `home is missing metric ${k}`);
    assert.equal(home[k], expected[k], `home ${k}`);
    assert.equal(home[k], record[k], `metric ${k}: home ${home[k]} vs timeline ${record[k]}`);
  }
});

test('metrics equal the counts recomputed from the exported ledger', () => {
  const record = metricsIn(read('timeline/index.html'));
  for (const [k, v] of Object.entries(expected)) if (k in record) assert.equal(record[k], v, `metric ${k}`);
  for (const m of json.metrics) assert.equal(m.value, expected[m.key], `json metric ${m.key}`);
});

test('work page summary states the same numbers', () => {
  const work = metricsIn(read('work/index.html'));
  for (const k of ['ms-prs', 'ms-merged', 'in-review']) assert.equal(work[k], expected[k], `work ${k}`);
});

test('work page lists every contribution once, in its group', () => {
  const html = read('work/index.html');
  const contributions = rows.filter((r) => r.source === 'contribution');
  assert.equal([...html.matchAll(/data-item data-kind=/g)].length, contributions.length);
  for (const r of contributions.filter((r) => r.kind === 'pr' && r.status === 'merged')) {
    const n = r.title.match(/#(\d+)/)[1];
    assert.match(html.split('data-group="merged"')[1].split('data-group=')[0], new RegExp(`#${n}`), `merged PR #${n} in Merged fixes`);
  }
});

test('main navigation: at most six items, Work first, Work with me last; Invite me reachable from the footer', () => {
  const html = read('index.html');
  const nav = html.match(/<ul class="nav">([\s\S]*?)<\/ul>/)[1];
  const items = [...nav.matchAll(/<a href="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(items.length <= 6, `nav has ${items.length} items`);
  assert.equal(items[0], '/work/');
  assert.equal(items[items.length - 1], '/hire/');
  assert.ok(html.match(/<footer[\s\S]*?<\/footer>/)[0].includes('href="/speak/"'), 'footer links to /speak/');
});

test('search index covers contributions by number', () => {
  const idx = JSON.parse(read('search.json'));
  for (const r of rows.filter((r) => r.source === 'contribution' && /#\d+/.test(r.title))) {
    const n = r.title.match(/#(\d+)/)[1];
    assert.ok(idx.some((i) => i.k.includes(n) || i.s.includes(n)), `#${n} searchable`);
  }
});

test('timeline page and JSON have the same rows; the CSV is never built', () => {
  const page = read('timeline/index.html');
  assert.equal([...page.matchAll(/data-row-kind=/g)].length, rows.length);
  assert.equal(metricsIn(page)['ledger-rows'], rows.length);
  assert.ok(!walk(dist).some((f) => f.endsWith('.csv')), 'a CSV file is in the production build');
  assert.ok(rows.every((r) => !('mvpCategory' in r)), 'internal category leaked into timeline.json');
});

test('activity strip total equals dated ledger rows in the last 12 months', () => {
  const page = read('timeline/index.html');
  const cells = [...page.matchAll(/data-month="(\d{4}-\d{2})" data-count-month="(\d+)"/g)];
  assert.equal(cells.length, 12);
  const months = new Set(cells.map(([, m]) => m));
  const inWindow = rows.filter((r) => months.has(r.date.slice(0, 7))).length;
  assert.equal(cells.reduce((n, [, , c]) => n + Number(c), 0), inWindow);
  const oct = cells.find(([, m]) => m === '2026-10');
  if (oct) assert.ok(Number(oct[2]) >= 1, 'October 2026 includes the Frontend Nation workshop');
});

test('workshop is in the ledger on its date', () => {
  const w = rows.find((r) => r.title.startsWith('Pizzeria del Compilator'));
  assert.ok(w, 'workshop row missing');
  assert.equal(w.date, '2026-10-20');
});

test('no award program, export or draft wording in the production build', () => {
  for (const f of walk(dist).filter((f) => /\.(html|txt|json|xml)$/.test(f))) {
    const s = readFileSync(f, 'utf8');
    for (const word of ['MVP', 'CSV', 'Track record', 'Draft, dev only']) assert.ok(!s.includes(word), `"${word}" in ${f}`);
  }
});

test('old URLs redirect', () => {
  assert.match(read('track-record/index.html'), /\/timeline\//);
  assert.match(read('open-source/index.html'), /\/work\//);
  assert.match(readFileSync(join(dist, '_redirects'), 'utf8'), /\/track-record\s+\/timeline\/\s+301/);
});

test('every page has a title, a description and a 1200x630 Open Graph image that exists', () => {
  for (const f of walk(dist).filter((f) => f.endsWith('.html') && !/http-equiv="refresh"/.test(readFileSync(f, 'utf8')))) {
    const html = readFileSync(f, 'utf8');
    assert.match(html, /<title>[^<]+<\/title>/, `title in ${f}`);
    assert.match(html, /<meta name="description" content="[^"]+"/, `description in ${f}`);
    const og = html.match(/<meta property="og:image" content="https?:\/\/[^/]+(\/og\/[^"]+\.png)"/);
    assert.ok(og, `og:image in ${f}`);
    const png = readFileSync(join(dist, og[1]));
    assert.equal(png.readUInt32BE(16), 1200, `width of ${og[1]}`);
    assert.equal(png.readUInt32BE(20), 630, `height of ${og[1]}`);
  }
});

test('PR #2578 is "Part of" #2566, never "Fixes"', () => {
  const html = read('work/index.html');
  assert.match(html, /Part of microsoft\/TypeScript-DOM-lib-generator#2566/);
});

test('built output: Paris only as a time zone, no old meetup name, no placeholder, no wrong relation, no em or en dashes', () => {
  const files = walk(dist).filter((f) => /\.(html|txt|json|csv|xml)$/.test(f));
  for (const f of files) {
    const s = readFileSync(f, 'utf8');
    assert.ok(!s.replace(/Paris time/g, '').includes('Paris'), `"Paris" outside "Paris time" in ${f}`);
    assert.ok(!oldMeetup.test(s), `old meetup name in ${f}`);
    assert.ok(!/placeholder photo|unsplash/i.test(s), `placeholder photo in ${f}`);
    assert.ok(!s.includes('Fixes microsoft/TypeScript-DOM-lib-generator#2566'), `wrong relation in ${f}`);
    assert.ok(!/[–—]/.test(s), `em or en dash in ${f}`);
  }
});

test('no placeholder writing copy', () => {
  for (const f of walk(dist).filter((f) => f.endsWith('.html'))) assert.ok(!readFileSync(f, 'utf8').includes('First article coming soon'), f);
});
