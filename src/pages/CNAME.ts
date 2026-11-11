// GitHub Pages custom domain file, generated from the site URL (astro.config.mjs) so the domain has one source.
import type { APIRoute } from 'astro';
export const GET: APIRoute = ({ site }) => new Response(`${new URL(site!).host}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
