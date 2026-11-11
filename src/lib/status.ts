import type { Status } from '../data/contributions';

export type AnyStatus = Status | 'upcoming' | 'confirmed' | 'rejected' | 'open-question' | 'delivered';
export type BadgeVariant = 'merged' | 'review' | 'discussion' | 'closed' | 'upcoming';

const table: Record<AnyStatus, { label: string; variant: BadgeVariant }> = {
  merged: { label: 'Merged', variant: 'merged' },
  open: { label: 'In review', variant: 'review' },
  discussion: { label: 'Discussion', variant: 'discussion' },
  answered: { label: 'Answered', variant: 'discussion' },
  closed: { label: 'Closed', variant: 'closed' },
  confirmed: { label: 'Confirmed', variant: 'merged' },
  rejected: { label: 'Rejected', variant: 'closed' },
  'open-question': { label: 'Open question', variant: 'discussion' },
  upcoming: { label: 'Upcoming', variant: 'upcoming' },
  delivered: { label: 'Delivered', variant: 'merged' },
};

export const statusBadge = (s: AnyStatus) => table[s] ?? { label: s, variant: 'discussion' as const };
