'use client';

import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';

import {
  DonutChart,
  Funnel,
  HorizontalBars,
  InquiryTrendChart,
  TrafficChart,
  type BreakdownDatum,
  type FunnelDatum,
  type TrafficPoint,
} from '@/components/admin/Charts';
import { AdminEmpty, AdminError, KpiCard, Panel, StatusPill } from '@/components/admin/Ui';
import { useAdminResource } from '@/components/admin/useAdminResource';
import { Button } from '@/components/ui/Button';
import { INQUIRY_TYPE_LABELS } from '@/content/defaults';
import { RANGE_PRESETS } from '@/lib/analytics-shared';
import { cn, formatNumber, formatPercent, humanizeEnum } from '@/lib/utils';

type GeoNode = { name: string; sessions: number; children?: GeoNode[] };

type Payload = {
  hasData: boolean;
  range: { key: string; label: string; from: string; to: string; days: number };
  kpis: Array<{
    key: string;
    label: string;
    value: number;
    previous: number;
    change: number | null;
    format: 'number' | 'percent' | 'duration';
    hint?: string;
  }>;
  comparisons: Array<{
    key: string;
    label: string;
    sessions: number;
    previousSessions: number;
    change: number | null;
    submissions: number;
  }>;
  timeseries: TrafficPoint[];
  devices: BreakdownDatum[];
  channels: BreakdownDatum[];
  geo: GeoNode[];
  pages: Array<{ path: string; views: number; share: number }>;
  funnel: FunnelDatum[];
  inquiries: {
    total: number;
    new: number;
    inProgress: number;
    resolved: number;
    spam: number;
    byStatus: Record<string, number>;
    byType: Array<{ key: string; value: number }>;
    mostCommonType: string | null;
    bySource: Array<{ key: string; value: number }>;
    conversionRate: number;
    trend: Array<{ date: string; total: number }>;
  };
};

/**
 * Analytics dashboard.
 *
 * Data is fetched client-side so the range filter can change without a full
 * navigation. Every number rendered here comes from the API, which computes it
 * from collected rows - there is no placeholder or sample data anywhere in this
 * component, and an empty database renders the empty state instead of a chart.
 */
export function AnalyticsDashboard({ compact = false }: { compact?: boolean }) {
  const [range, setRange] = useState('30d');
  const [custom, setCustom] = useState({ from: '', to: '' });

  // A custom range with only one date set is not requestable yet, so the URL
  // stays null and the hook holds the previous result instead of erroring.
  const url = useMemo(() => {
    const params = new URLSearchParams({ range });
    if (range === 'custom') {
      if (!custom.from || !custom.to) return null;
      params.set('from', custom.from);
      params.set('to', custom.to);
    }
    return `/api/admin/analytics?${params.toString()}`;
  }, [range, custom.from, custom.to]);

  const { data, status, message, reload } = useAdminResource<Payload>(
    url,
    'Analytics could not be loaded.',
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Date range">
          {RANGE_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => setRange(preset.key)}
              aria-pressed={range === preset.key}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                range === preset.key
                  ? 'border-brass-400/60 bg-brass-700/20 text-brass-100'
                  : 'border-ink-700 text-bone-400 hover:border-ink-500 hover:text-bone-200',
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={reload}
        >
          <RefreshCw
            size={13}
            aria-hidden="true"
            className={status === 'loading' ? 'animate-spin' : undefined}
          />
          Refresh
        </Button>
      </div>

      {range === 'custom' ? (
        <div className="flex flex-wrap items-end gap-3 rounded-xl2 border border-ink-700/70 bg-ink-900/60 p-4">
          {(['from', 'to'] as const).map((key) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label
                htmlFor={`range-${key}`}
                className="text-xs font-semibold uppercase tracking-[0.1em] text-bone-400"
              >
                {key === 'from' ? 'From' : 'To'}
              </label>
              <input
                id={`range-${key}`}
                type="date"
                value={custom[key]}
                onChange={(event) => setCustom((prev) => ({ ...prev, [key]: event.target.value }))}
                className="rounded-lg border border-ink-600 bg-ink-900/70 px-3 py-2 text-sm text-bone-100"
              />
            </div>
          ))}
          <p className="text-xs text-bone-500">Both dates are required.</p>
        </div>
      ) : null}

      {status === 'error' ? (
        <AdminError title="Analytics unavailable" description={message} />
      ) : null}

      {status === 'loading' && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
          {Array.from({ length: compact ? 4 : 8 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-xl2 bg-ink-800/60" />
          ))}
        </div>
      ) : null}

      {data ? (
        <>
          {!data.hasData ? (
            <AdminEmpty
              title="No analytics collected yet"
              description="Nothing has been recorded for this site. Figures will appear here as real visits arrive. No sample or estimated data is ever shown."
            />
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {(compact ? data.kpis.slice(0, 4) : data.kpis).map((kpi) => (
              <KpiCard
                key={kpi.key}
                label={kpi.label}
                value={kpi.value}
                previous={kpi.previous}
                change={kpi.change}
                format={kpi.format}
                hint={compact ? undefined : kpi.hint}
                invertTrend={kpi.key === 'bounceRate'}
              />
            ))}
          </div>

          {!compact ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {data.comparisons.map((comparison) => (
                <div
                  key={comparison.key}
                  className="rounded-xl2 border border-ink-700/70 bg-ink-900/60 p-5"
                >
                  <p className="text-xs uppercase tracking-[0.1em] text-bone-500">
                    {comparison.label}
                  </p>
                  <p className="mt-3 font-display text-2xl text-bone-50 tabular-nums">
                    {formatNumber(comparison.sessions)}
                    <span className="ml-2 text-sm font-normal text-bone-500">
                      vs {formatNumber(comparison.previousSessions)}
                    </span>
                  </p>
                  <p className="mt-2 text-xs text-bone-500">
                    {comparison.change === null
                      ? 'No prior data'
                      : `${comparison.change >= 0 ? '+' : ''}${formatPercent(comparison.change)} sessions`}
                    {' · '}
                    {formatNumber(comparison.submissions)} inquiries
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          <Panel title="Traffic over time" description={`${data.range.label} · sessions and page views`}>
            <TrafficChart data={data.timeseries} />
          </Panel>

          {!compact ? (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Visitors by device">
                  <DonutChart data={data.devices} />
                  <ul className="mt-4 space-y-2">
                    {data.devices.map((device) => (
                      <li key={device.key} className="flex justify-between text-sm">
                        <span className="text-bone-300">{device.label}</span>
                        <span className="tabular-nums text-bone-400">
                          {formatNumber(device.value)}{' '}
                          <span className="text-bone-600">({formatPercent(device.share, 0)})</span>
                        </span>
                      </li>
                    ))}
                    {data.devices.length === 0 ? (
                      <li className="text-sm text-bone-600">No sessions in this range.</li>
                    ) : null}
                  </ul>
                </Panel>

                <Panel title="Traffic sources">
                  <HorizontalBars data={data.channels} />
                  {data.channels.length === 0 ? (
                    <p className="text-sm text-bone-600">No sessions in this range.</p>
                  ) : null}
                </Panel>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Most visited pages">
                  {data.pages.length === 0 ? (
                    <p className="text-sm text-bone-600">No page views in this range.</p>
                  ) : (
                    <ol className="space-y-3">
                      {data.pages.map((page) => (
                        <li key={page.path}>
                          <div className="flex items-baseline justify-between gap-4 text-sm">
                            <span className="truncate font-mono text-xs text-bone-200">
                              {page.path}
                            </span>
                            <span className="shrink-0 tabular-nums text-bone-400">
                              {formatNumber(page.views)}
                            </span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-800">
                            <div
                              className="h-full rounded-full bg-turf-500"
                              style={{ width: `${Math.max(page.share, 2)}%` }}
                            />
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </Panel>

                <Panel
                  title="Conversion funnel"
                  description="Each step counts distinct sessions that reached it"
                >
                  <Funnel steps={data.funnel} />
                </Panel>
              </div>

              <Panel
                title="Geographic distribution"
                description="Country, region and city. Cities with fewer than three sessions are grouped so no individual visit is identifiable."
              >
                {data.geo.length === 0 ? (
                  <p className="text-sm text-bone-600">No location data in this range.</p>
                ) : (
                  <ul className="space-y-3">
                    {data.geo.map((country) => (
                      <li key={country.name}>
                        <details className="group rounded-lg border border-ink-800 bg-ink-950/40">
                          <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm">
                            <span className="font-medium text-bone-100">{country.name}</span>
                            <span className="tabular-nums text-bone-400">
                              {formatNumber(country.sessions)}
                            </span>
                          </summary>
                          <div className="border-t border-ink-800 px-4 py-3">
                            {country.children?.map((region) => (
                              <div key={region.name} className="mb-3 last:mb-0">
                                <div className="flex justify-between text-sm text-bone-300">
                                  <span>{region.name}</span>
                                  <span className="tabular-nums">
                                    {formatNumber(region.sessions)}
                                  </span>
                                </div>
                                <ul className="mt-1.5 space-y-1 pl-4">
                                  {region.children?.map((city) => (
                                    <li
                                      key={city.name}
                                      className="flex justify-between text-xs text-bone-500"
                                    >
                                      <span>{city.name}</span>
                                      <span className="tabular-nums">
                                        {formatNumber(city.sessions)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </details>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Inquiry trend">
                  {data.inquiries.trend.length === 0 ? (
                    <p className="text-sm text-bone-600">No inquiries in this range.</p>
                  ) : (
                    <InquiryTrendChart data={data.inquiries.trend} />
                  )}
                </Panel>

                <Panel title="Inquiry breakdown">
                  <dl className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Total', value: formatNumber(data.inquiries.total) },
                      { label: 'New', value: formatNumber(data.inquiries.new) },
                      { label: 'In progress', value: formatNumber(data.inquiries.inProgress) },
                      { label: 'Resolved', value: formatNumber(data.inquiries.resolved) },
                      {
                        label: 'Conversion rate',
                        value: formatPercent(data.inquiries.conversionRate, 2),
                      },
                      {
                        label: 'Most common type',
                        value: data.inquiries.mostCommonType
                          ? (INQUIRY_TYPE_LABELS[
                              data.inquiries.mostCommonType as keyof typeof INQUIRY_TYPE_LABELS
                            ] ?? humanizeEnum(data.inquiries.mostCommonType))
                          : '—',
                      },
                    ].map((item) => (
                      <div key={item.label}>
                        <dt className="text-xs uppercase tracking-[0.1em] text-bone-500">
                          {item.label}
                        </dt>
                        <dd className="mt-1.5 font-display text-xl text-bone-50">{item.value}</dd>
                      </div>
                    ))}
                  </dl>

                  {data.inquiries.byType.length > 0 ? (
                    <ul className="mt-6 space-y-2 border-t border-ink-800 pt-4">
                      {data.inquiries.byType.map((row) => (
                        <li key={row.key} className="flex items-center justify-between text-sm">
                          <StatusPill
                            status="ARCHIVED"
                            label={
                              INQUIRY_TYPE_LABELS[row.key as keyof typeof INQUIRY_TYPE_LABELS] ??
                              humanizeEnum(row.key)
                            }
                          />
                          <span className="tabular-nums text-bone-400">
                            {formatNumber(row.value)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </Panel>
              </div>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
