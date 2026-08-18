/**
 * Analytics constants shared by server aggregation and client UI.
 *
 * Kept separate from `analytics-query.ts` because that module is `server-only`
 * and importing it from a client component would break the build.
 */

export const RANGE_PRESETS = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
  { key: '90d', label: 'Last 90 Days' },
  { key: 'custom', label: 'Custom Range' },
] as const;

export type RangeKey = (typeof RANGE_PRESETS)[number]['key'];
