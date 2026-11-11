import type { APIRoute } from 'astro';
import { getRecord, metricsFrom } from '../lib/record';
// Machine-readable timeline (linked from llms.txt). Internal classification fields are left out.
export const GET: APIRoute = async () => {
  const record = await getRecord();
  const rows = record.rows.map(({ mvpCategory: _internal, ...r }) => r);
  const body = { person: record.person, generatedAt: record.generatedAt, rows, metrics: metricsFrom(record.rows) };
  return new Response(JSON.stringify(body, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
