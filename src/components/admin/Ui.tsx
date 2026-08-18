import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';

import { cn, formatDuration, formatNumber, formatPercent } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Page scaffolding
// ---------------------------------------------------------------------------

export function AdminPage({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[92rem]">
      <header className="flex flex-col gap-4 border-b border-ink-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-bone-50 sm:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-bone-400">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </header>

      <div className="pt-7">{children}</div>
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn('rounded-xl2 border border-ink-700/70 bg-ink-900/60', className)}>
      {title ? (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-800 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-bone-100">{title}</h2>
            {description ? <p className="mt-1 text-xs text-bone-500">{description}</p> : null}
          </div>
          {actions}
        </header>
      ) : null}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// KPI cards
// ---------------------------------------------------------------------------

export type KpiCardProps = {
  label: string;
  value: number;
  previous: number;
  change: number | null;
  format: 'number' | 'percent' | 'duration';
  hint?: string;
  /** A rise in bounce rate is bad news, unlike a rise in sessions. */
  invertTrend?: boolean;
};

function formatValue(value: number, format: KpiCardProps['format']) {
  if (format === 'percent') return formatPercent(value);
  if (format === 'duration') return formatDuration(value);
  return formatNumber(value);
}

export function KpiCard({
  label,
  value,
  previous,
  change,
  format,
  hint,
  invertTrend = false,
}: KpiCardProps) {
  const positive = change !== null && change > 0;
  const negative = change !== null && change < 0;
  const good = invertTrend ? negative : positive;
  const bad = invertTrend ? positive : negative;

  const Icon = change === null || change === 0 ? ArrowRight : positive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="rounded-xl2 border border-ink-700/70 bg-ink-900/60 p-5">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-bone-500">{label}</p>
      <p className="mt-3 font-display text-3xl text-bone-50 tabular-nums">
        {formatValue(value, format)}
      </p>

      <div className="mt-3 flex items-center gap-2">
        {change === null ? (
          <span className="text-xs text-bone-600">No prior data</span>
        ) : (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
              good && 'bg-turf-900/60 text-turf-200',
              bad && 'bg-danger-600/15 text-danger-400',
              !good && !bad && 'bg-ink-800 text-bone-400',
            )}
          >
            <Icon size={11} aria-hidden="true" />
            {formatPercent(Math.abs(change))}
          </span>
        )}
        <span className="text-xs text-bone-600">
          vs {formatValue(previous, format)} previous
        </span>
      </div>

      {hint ? <p className="mt-2.5 text-xs leading-relaxed text-bone-600">{hint}</p> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status pills
// ---------------------------------------------------------------------------

const STATUS_TONES: Record<string, string> = {
  NEW: 'bg-info-500/15 text-info-400 border-info-500/40',
  CONTACTED: 'bg-brass-700/20 text-brass-200 border-brass-500/40',
  IN_PROGRESS: 'bg-brass-700/20 text-brass-200 border-brass-500/40',
  RESOLVED: 'bg-turf-900/60 text-turf-200 border-turf-500/40',
  SPAM: 'bg-danger-600/15 text-danger-400 border-danger-500/40',
  ARCHIVED: 'bg-ink-800 text-bone-400 border-ink-600',
  VERIFIED: 'bg-turf-900/60 text-turf-200 border-turf-500/40',
  UNVERIFIED: 'bg-ink-800 text-bone-400 border-ink-600',
  UNDER_REVIEW: 'bg-brass-700/20 text-brass-200 border-brass-500/40',
  REJECTED: 'bg-danger-600/15 text-danger-400 border-danger-500/40',
};

export function StatusPill({ status, label }: { status: string; label?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]',
        STATUS_TONES[status] ?? 'border-ink-600 bg-ink-800 text-bone-400',
      )}
    >
      {label ?? status.replace(/_/g, ' ')}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Tables and states
// ---------------------------------------------------------------------------

export function DataTable({
  headers,
  children,
  caption,
}: {
  headers: string[];
  children: ReactNode;
  caption: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-ink-700">
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="whitespace-nowrap py-3 pr-5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-bone-500"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-800">{children}</tbody>
      </table>
    </div>
  );
}

export function AdminEmpty({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl2 border border-dashed border-ink-600 bg-ink-900/40 p-10 text-center">
      <p className="font-display text-lg text-bone-100">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-bone-500">{description}</p>
    </div>
  );
}

export function AdminError({ title, description }: { title: string; description: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl2 border border-danger-500/40 bg-danger-600/10 p-6 text-sm"
    >
      <p className="font-semibold text-danger-400">{title}</p>
      <p className="mt-1.5 leading-relaxed text-bone-300">{description}</p>
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true">
      <span className="sr-only">Loading</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-11 animate-pulse rounded-lg bg-ink-800/60" />
      ))}
    </div>
  );
}
