import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/writing';
import { site } from '../data/site';
export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: `${site.name}: writing`,
    description: site.bio,
    site: context.site!,
    items: posts.map((p) => ({ title: p.data.title, description: p.data.description, pubDate: p.data.date, link: `/writing/${p.id}/` })),
  });
}
