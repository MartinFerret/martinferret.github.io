// Open Graph images (1200x630), generated at build with the site's own type and colors. No stock imagery.
import satori from 'satori';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { experiments, headline } from './lab';
import { getPosts } from './writing';

export interface OgPage { slug: string; title: string; kicker: string; stat?: { value: string; label: string } }

/** Every page that gets a sharing image. The slug maps to the page path: "index" is "/", "lab/001-x" is "/lab/001-x/". */
export async function ogPages(): Promise<OgPage[]> {
  const posts = await getPosts();
  return [
    { slug: 'index', title: 'Faster TypeScript for the age of AI.', kicker: 'TypeScript performance' },
    { slug: 'work', title: 'Open source work in TypeScript’s own repositories', kicker: 'Work' },
    { slug: 'lab', title: 'TypeScript Performance Lab', kicker: 'Lab' },
    ...experiments.map((e) => {
      const h = headline(e);
      return { slug: `lab/${e.folder}`, title: e.title, kicker: `Performance Lab #${e.id}`, stat: h ? { value: h.value, label: h.label } : undefined };
    }),
    { slug: 'speaking', title: 'Talks, workshops, podcasts and meetups', kicker: 'Speaking' },
    { slug: 'speak', title: 'Invite me to speak', kicker: 'For organizers' },
    { slug: 'writing', title: 'Writing on TypeScript and type-checking performance', kicker: 'Writing' },
    ...posts.map((p) => ({ slug: `writing/${p.id}`, title: p.data.title, kicker: 'Article' })),
    { slug: 'about', title: 'About Martin', kicker: 'About' },
    { slug: 'timeline', title: 'Contributions, talks and experiments, by date', kicker: 'Timeline' },
  ];
}

/** Flat file name for a slug: "index" becomes "home", "lab/001-x" becomes "lab--001-x". */
export const ogFile = (slug: string) => (slug === 'index' ? 'home' : slug.replace(/\//g, '--'));

/** Path of the image for a page path. Unknown pages fall back to the home image. */
export async function ogPathFor(pathname: string) {
  const slug = pathname.replace(/^\/|\/$/g, '') || 'index';
  return (await ogPages()).some((p) => p.slug === slug) ? `/og/${ogFile(slug)}.png` : '/og/home.png';
}

// Paths from the project root: the build runs from it, and bundling moves this module.
const font = (p: string) => readFile(join(process.cwd(), 'node_modules/@fontsource', p));
let assets: Promise<{ fonts: Parameters<typeof satori>[1]['fonts']; photo: string }> | undefined;
const load = () =>
  (assets ??= (async () => {
    const [display, ui, uiBold, photoBuf] = await Promise.all([
      font('funnel-display/files/funnel-display-latin-500-normal.woff'),
      font('geist/files/geist-latin-500-normal.woff'),
      font('geist/files/geist-latin-600-normal.woff'),
      readFile(join(process.cwd(), 'public/martin-ferret.webp')),
    ]);
    const png = await sharp(photoBuf).resize(220, 220).png().toBuffer();
    return {
      fonts: [
        { name: 'Display', data: display, weight: 500 as const, style: 'normal' as const },
        { name: 'UI', data: ui, weight: 500 as const, style: 'normal' as const },
        { name: 'UI', data: uiBold, weight: 600 as const, style: 'normal' as const },
      ],
      photo: `data:image/png;base64,${png.toString('base64')}`,
    };
  })());

type Node = { type: string; props: Record<string, unknown> & { children?: unknown } };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({ type, props: { style, children, ...extra } });

export async function renderOg(p: OgPage) {
  const { fonts, photo } = await load();
  const size = p.title.length > 60 ? 54 : p.title.length > 38 ? 64 : 76;
  const tree = h('div', {
    width: 1200, height: 630, display: 'flex', flexDirection: 'column', padding: '48px 72px 56px',
    backgroundImage: 'linear-gradient(135deg, #2366c2 0%, #1d5fb8 45%, #174d96 100%)', color: '#ffffff', fontFamily: 'UI', position: 'relative',
  }, [
    h('div', { position: 'absolute', right: -120, top: -120, width: 520, height: 520, borderRadius: 520, backgroundColor: 'rgba(255,255,255,0.07)' }),
    h('div', { display: 'flex', alignItems: 'center', height: 56, flexShrink: 0 }, [
      h('div', { display: 'flex', padding: '10px 20px', borderRadius: 999, backgroundColor: '#ffd166', color: '#0e1726', fontSize: 26, fontWeight: 600 }, p.kicker),
    ]),
    h('div', { display: 'flex', height: 390, flexShrink: 0, width: 1056, alignItems: 'center', justifyContent: 'space-between', gap: 40 }, [
      h('div', { display: 'flex', fontFamily: 'Display', fontSize: size, lineHeight: 1.06, letterSpacing: -2, width: p.stat ? 680 : 780 }, p.title),
      p.stat
        ? h('div', { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: 330 }, [
            h('div', { display: 'flex', fontFamily: 'Display', fontSize: 112, lineHeight: 1, color: '#ffd166', letterSpacing: -4 }, p.stat.value),
            h('div', { display: 'flex', fontSize: 24, color: '#e3ecf9', textAlign: 'right', marginTop: 8 }, p.stat.label),
          ])
        : h('img', { width: 200, height: 200, borderRadius: 200, border: '8px solid #ffffff' }, undefined, { src: photo, width: 200, height: 200 }),
    ]),
    h('div', { display: 'flex', width: 1056, height: 80, flexShrink: 0, alignItems: 'flex-end', justifyContent: 'space-between', borderTop: '2px solid rgba(255,255,255,0.25)', paddingBottom: 4 }, [
      h('div', { display: 'flex', alignItems: 'center', gap: 16 }, [
        h('div', { display: 'flex', width: 16, height: 16, borderRadius: 16, backgroundColor: '#ffd166' }),
        h('div', { display: 'flex', fontFamily: 'Display', fontSize: 34 }, 'Martin Ferret'),
      ]),
      h('div', { display: 'flex', fontSize: 26, color: '#e3ecf9' }, 'TypeScript expert'),
    ]),
  ]);
  const svg = await satori(tree as never, { width: 1200, height: 630, fonts });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
