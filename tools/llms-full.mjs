// After the build: writes dist/llms-full.txt with the full visible text of the key pages listed in dist/llms.txt.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');
const llms = readFileSync(join(dist, 'llms.txt'), 'utf8');
const pages = [...llms.matchAll(/^- \[([^\]]+)\]\((https?:\/\/[^)]+)\)/gm)].map((m) => ({ title: m[1], url: m[2], path: new URL(m[2]).pathname }));
const text = (html) =>
  html
    .replace(/[\s\S]*?<main[^>]*>/, '').replace(/<\/main>[\s\S]*/, '')
    .replace(/<(script|style|svg|button)[\s\S]*?<\/\1>/g, '')
    .replace(/<(h[1-6])[^>]*>/g, '\n\n## ').replace(/<\/(p|li|h[1-6]|dd|dt|tr|blockquote)>/g, '\n').replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter((l, i, a) => l || a[i - 1]).join('\n').replace(/\n{3,}/g, '\n\n').trim();
const head = llms.split('\n## Key pages')[0].trim();
const body = pages
  .map((p) => {
    const file = join(dist, p.path, 'index.html');
    if (!existsSync(file)) throw new Error(`llms-full: ${p.path} is not in the build`);
    return `\n\n---\n\n# ${p.title}\n\nURL: ${p.url}\n\n${text(readFileSync(file, 'utf8'))}`;
  })
  .join('');
writeFileSync(join(dist, 'llms-full.txt'), `${head}${body}\n`);
console.log(`llms-full.txt: ${pages.length} pages`);
