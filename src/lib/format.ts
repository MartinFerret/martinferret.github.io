const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const fmtMonth = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
const fmtMonthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export const toDate = (d: string | Date) => (typeof d === 'string' ? new Date(`${d.slice(0, 10)}T00:00:00Z`) : d);
export const formatDate = (d: string | Date) => fmt.format(toDate(d));
export const formatMonth = (d: string | Date) => fmtMonth.format(toDate(d));
export const formatMonthYear = (d: string | Date) => fmtMonthYear.format(toDate(d));
export const isoDay = (d: string | Date) => toDate(d).toISOString().slice(0, 10);

export const seconds = (s: number) => (s < 1 ? `${Math.round(s * 1000)} ms` : `${s.toFixed(2)} s`);
export const megabytes = (kb: number) => `${Math.round(kb / 1024).toLocaleString('en-US')} MB`;
export const percent = (n: number) => `${Math.round(n * 100)}%`;

/** Escapes text and allows line breaks after "." and "/" inside identifiers (MutationObserver.<wbr>observe). */
export const breakable = (t: string) =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([./])(?=[A-Za-z(])/g, '$1<wbr>');
