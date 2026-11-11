import type { APIRoute } from 'astro';
import { getCsv } from '../../lib/record';

// Local developer tool: the ledger as CSV, at /dev/timeline.csv while `npm run dev` runs.
// getStaticPaths returns nothing in production, so the file is never built and never linked.
export function getStaticPaths() {
  return import.meta.env.DEV ? [{ params: { file: 'timeline.csv' } }] : [];
}

export const GET: APIRoute = async () =>
  new Response(await getCsv(), { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
