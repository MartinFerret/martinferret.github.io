import type { APIRoute } from 'astro';
import { ogFile, ogPages, renderOg, type OgPage } from '../../lib/og';

export async function getStaticPaths() {
  return (await ogPages()).map((p) => ({ params: { name: ogFile(p.slug) }, props: { p } }));
}

export const GET: APIRoute = async ({ props }) =>
  new Response(new Uint8Array(await renderOg((props as { p: OgPage }).p)), { headers: { 'Content-Type': 'image/png' } });
