import { getCollection } from 'astro:content';
import { getMediumArticles } from './medium';
import { certificatesArticles } from './certificates';

// Drafts are visible in `astro dev` only: they never reach the production build.
export async function getPosts() {
  const posts = await getCollection('writing', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Writing is listed in the navigation only when there is something to read. */
export async function hasWriting() {
  return (await getPosts()).length > 0 || (await getMediumArticles()).length > 0 || certificatesArticles.length > 0;
}
