import 'server-only';

import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { percentChange } from './utils';
import { RANGE_PRESETS, type RangeKey } from './analytics-shared';

/**
 * Analytics aggregation for the admin dashboard.
 *
 * All figures come from rows actually collected in AnalyticsSession /
 * AnalyticsEvent. Nothing is sampled, extrapolated or seeded. An empty database
 * produces zeros, and the dashboard renders an explicit empty state for that.
 *
 * Buckets are computed in Asia/Kolkata because that is where the audience and
 * the site owner are; UTC buckets would split an Indian evening across two days.
 */

const TZ = 'Asia/Kolkata';

// Presets live in a client-safe module so the dashboard UI can import them too.
export { RANGE_PRESETS, type RangeKey } from './analytics-shared';

export type DateRange = {
  key: RangeKey;
  label: string;
  from: Date;
  to: Date;
  /** Immediately preceding window of equal length, for comparisons. */
  previousFrom: Date;
  previousTo: Date;
  days: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDayIst(date: Date): Date {
  // IST is UTC+5:30 with no daylight saving, so a fixed offset is exact.
  const shifted = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - 5.5 * 60 * 60 * 1000);
}

export function resolveRange(
  key: string | undefined,
  fromParam?: string,
  toParam?: string,
): DateRange {
  const now = new Date();
  const todayStart = startOfDayIst(now);
  const preset = (RANGE_PRESETS.find((item) => item.key === key)?.key ?? '30d') as RangeKey;

  let from: Date;
  let to: Date;

  switch (preset) {
    case 'today':
      from = todayStart;
      to = now;
      break;
    case 'yesterday':
      from = new Date(todayStart.getTime() - DAY_MS);
      to = todayStart;
      break;
    case '7d':
      from = new Date(todayStart.getTime() - 6 * DAY_MS);
      to = now;
      break;
    case '90d':
      from = new Date(todayStart.getTime() - 89 * DAY_MS);
      to = now;
      break;
    case 'custom': {
      const parsedFrom = fromParam ? new Date(fromParam) : null;
      const parsedTo = toParam ? new Date(toParam) : null;
      from =
        parsedFrom && !Number.isNaN(parsedFrom.getTime())
          ? startOfDayIst(parsedFrom)
          : new Date(todayStart.getTime() - 29 * DAY_MS);
      to =
        parsedTo && !Number.isNaN(parsedTo.getTime())
          ? new Date(startOfDayIst(parsedTo).getTime() + DAY_MS)
          : now;
      if (to <= from) to = new Date(from.getTime() + DAY_MS);
      break;
    }
    case '30d':
    default:
      from = new Date(todayStart.getTime() - 29 * DAY_MS);
      to = now;
      break;
  }

  const span = to.getTime() - from.getTime();
  return {
    key: preset,
    label: RANGE_PRESETS.find((item) => item.key === preset)!.label,
    from,
    to,
    previousFrom: new Date(from.getTime() - span),
    previousTo: from,
    days: inclusiveDayCount(from, to),
  };
}

/** IST calendar-day key for a UTC instant, e.g. 2026-08-18. */
function istDayKey(date: Date): string {
  return new Date(date.getTime() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * Number of IST calendar days a range touches, counting both ends.
 *
 * Dividing the raw span by 24h is wrong here: `to` is usually "now" rather than
 * end of day, so "last 7 days" measured that way rounds to 6 and silently drops
 * today - the one day anyone looking at the dashboard cares most about.
 */
function inclusiveDayCount(from: Date, to: Date): number {
  const first = startOfDayIst(from);
  // `to` is an exclusive bound, so step back an instant before taking its day.
  const last = startOfDayIst(new Date(Math.max(from.getTime(), to.getTime() - 1)));
  return Math.max(1, Math.round((last.getTime() - first.getTime()) / DAY_MS) + 1);
}

// ---------------------------------------------------------------------------
// KPIs
// ---------------------------------------------------------------------------

export type KpiValue = {
  key: string;
  label: string;
  value: number;
  previous: number;
  /** null when there is no prior data to compare against. */
  change: number | null;
  format: 'number' | 'percent' | 'duration';
  hint?: string;
};

async function windowTotals(from: Date, to: Date) {
  const where = { startedAt: { gte: from, lt: to } };

  const [sessionAgg, uniqueVisitors, pageViews, bounces, submissions] = await Promise.all([
    prisma.analyticsSession.aggregate({
      where,
      _count: { _all: true },
      _sum: { pageViews: true, durationSec: true },
    }),
    prisma.analyticsSession.findMany({
      where,
      select: { visitorHash: true },
      distinct: ['visitorHash'],
    }),
    prisma.analyticsEvent.count({ where: { name: 'page_view', occurredAt: { gte: from, lt: to } } }),
    prisma.analyticsSession.count({ where: { ...where, isBounce: true } }),
    prisma.contactInquiry.count({ where: { createdAt: { gte: from, lt: to } } }),
  ]);

  const sessions = sessionAgg._count._all;
  const durationTotal = sessionAgg._sum.durationSec ?? 0;

  return {
    sessions,
    visitors: uniqueVisitors.length,
    pageViews: pageViews || (sessionAgg._sum.pageViews ?? 0),
    avgDuration: sessions ? durationTotal / sessions : 0,
    bounceRate: sessions ? (bounces / sessions) * 100 : 0,
    submissions,
    conversionRate: sessions ? (submissions / sessions) * 100 : 0,
  };
}

export async function getKpis(range: DateRange): Promise<KpiValue[]> {
  const [current, previous] = await Promise.all([
    windowTotals(range.from, range.to),
    windowTotals(range.previousFrom, range.previousTo),
  ]);

  const build = (
    key: string,
    label: string,
    value: number,
    prev: number,
    format: KpiValue['format'],
    hint?: string,
  ): KpiValue => ({
    key,
    label,
    value,
    previous: prev,
    change: percentChange(value, prev),
    format,
    hint,
  });

  return [
    build('sessions', 'Sessions', current.sessions, previous.sessions, 'number'),
    build(
      'visitors',
      'Unique Visitors',
      current.visitors,
      previous.visitors,
      'number',
      'Distinct daily-rotating visitor hashes.',
    ),
    build('pageViews', 'Page Views', current.pageViews, previous.pageViews, 'number'),
    build(
      'avgDuration',
      'Avg. Session Duration',
      current.avgDuration,
      previous.avgDuration,
      'duration',
    ),
    build('bounceRate', 'Bounce Rate', current.bounceRate, previous.bounceRate, 'percent'),
    build(
      'submissions',
      'Form Submissions',
      current.submissions,
      previous.submissions,
      'number',
    ),
    build(
      'conversionRate',
      'Conversion Rate',
      current.conversionRate,
      previous.conversionRate,
      'percent',
      'Inquiries divided by sessions.',
    ),
  ];
}

/** Fixed comparison cards: today, this week and this month against the prior period. */
export async function getComparisonSummary() {
  const now = new Date();
  const todayStart = startOfDayIst(now);
  const weekStart = new Date(todayStart.getTime() - 6 * DAY_MS);
  const monthStart = new Date(todayStart.getTime() - 29 * DAY_MS);

  const spans: Array<{ key: string; label: string; from: Date; to: Date }> = [
    { key: 'today', label: 'Today vs Yesterday', from: todayStart, to: now },
    { key: 'week', label: 'This Week vs Previous', from: weekStart, to: now },
    { key: 'month', label: 'This Month vs Previous', from: monthStart, to: now },
  ];

  return Promise.all(
    spans.map(async (span) => {
      const length = span.to.getTime() - span.from.getTime();
      const [current, previous] = await Promise.all([
        windowTotals(span.from, span.to),
        windowTotals(new Date(span.from.getTime() - length), span.from),
      ]);
      return {
        key: span.key,
        label: span.label,
        sessions: current.sessions,
        previousSessions: previous.sessions,
        change: percentChange(current.sessions, previous.sessions),
        submissions: current.submissions,
        previousSubmissions: previous.submissions,
      };
    }),
  );
}

// ---------------------------------------------------------------------------
// Series and breakdowns
// ---------------------------------------------------------------------------

export type TimeseriesPoint = { date: string; sessions: number; visitors: number; pageViews: number };

export async function getTrafficOverTime(range: DateRange): Promise<TimeseriesPoint[]> {
  const rows = await prisma.$queryRaw<
    Array<{ bucket: Date; sessions: bigint; visitors: bigint; pageviews: bigint }>
  >(Prisma.sql`
    SELECT
      date_trunc('day', "startedAt" AT TIME ZONE 'UTC' AT TIME ZONE ${TZ}) AS bucket,
      COUNT(*)::bigint                       AS sessions,
      COUNT(DISTINCT "visitorHash")::bigint  AS visitors,
      COALESCE(SUM("pageViews"), 0)::bigint  AS pageviews
    FROM "AnalyticsSession"
    WHERE "startedAt" >= ${range.from} AND "startedAt" < ${range.to}
    GROUP BY 1
    ORDER BY 1 ASC
  `);

  const byDate = new Map(
    rows.map((row) => [
      new Date(row.bucket).toISOString().slice(0, 10),
      {
        sessions: Number(row.sessions),
        visitors: Number(row.visitors),
        pageViews: Number(row.pageviews),
      },
    ]),
  );

  // Fill gaps so a quiet day reads as zero rather than disappearing from the chart.
  const series: TimeseriesPoint[] = [];
  const cursor = startOfDayIst(range.from);
  const buckets = Math.min(range.days, 180);
  for (let index = 0; index < buckets; index += 1) {
    const day = new Date(cursor.getTime() + index * DAY_MS);
    const key = istDayKey(day);
    const found = byDate.get(key);
    series.push({
      date: key,
      sessions: found?.sessions ?? 0,
      visitors: found?.visitors ?? 0,
      pageViews: found?.pageViews ?? 0,
    });
  }
  return series;
}

export type BreakdownRow = { key: string; label: string; value: number; share: number };

function toBreakdown(
  rows: Array<{ key: string | null; count: number }>,
  labeller: (key: string) => string,
): BreakdownRow[] {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  return rows
    .map((row) => {
      const key = row.key ?? 'UNKNOWN';
      return {
        key,
        label: labeller(key),
        value: row.count,
        share: total ? (row.count / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.value - a.value);
}

export async function getDeviceBreakdown(range: DateRange): Promise<BreakdownRow[]> {
  const rows = await prisma.analyticsSession.groupBy({
    by: ['device'],
    where: { startedAt: { gte: range.from, lt: range.to } },
    _count: { _all: true },
  });
  return toBreakdown(
    rows.map((row) => ({ key: row.device, count: row._count._all })),
    (key) => ({ DESKTOP: 'Desktop', MOBILE: 'Mobile', TABLET: 'Tablet', UNKNOWN: 'Unknown' })[key] ?? key,
  );
}

export async function getChannelBreakdown(range: DateRange): Promise<BreakdownRow[]> {
  const rows = await prisma.analyticsSession.groupBy({
    by: ['channel'],
    where: { startedAt: { gte: range.from, lt: range.to } },
    _count: { _all: true },
  });
  return toBreakdown(
    rows.map((row) => ({ key: row.channel, count: row._count._all })),
    (key) =>
      ({
        DIRECT: 'Direct',
        ORGANIC_SEARCH: 'Organic Search',
        SOCIAL: 'Social',
        REFERRAL: 'Referral',
        CAMPAIGN: 'Campaign',
        INTERNAL: 'Internal',
      })[key] ?? key,
  );
}

export type GeoNode = { name: string; sessions: number; children?: GeoNode[] };

/**
 * Country -> region -> city, aggregated. Buckets smaller than the threshold are
 * folded into "Other" so a single visitor is never singled out by location.
 */
export async function getGeoDistribution(range: DateRange, minBucket = 3): Promise<GeoNode[]> {
  const rows = await prisma.analyticsSession.groupBy({
    by: ['countryCode', 'region', 'city'],
    where: { startedAt: { gte: range.from, lt: range.to } },
    _count: { _all: true },
  });

  const countries = new Map<string, Map<string, Map<string, number>>>();
  for (const row of rows) {
    const country = row.countryCode ?? 'Unknown';
    const region = row.region ?? 'Unknown';
    const city = row.city ?? 'Unknown';
    if (!countries.has(country)) countries.set(country, new Map());
    const regions = countries.get(country)!;
    if (!regions.has(region)) regions.set(region, new Map());
    const cities = regions.get(region)!;
    cities.set(city, (cities.get(city) ?? 0) + row._count._all);
  }

  const nodes: GeoNode[] = [];
  for (const [country, regions] of countries) {
    const regionNodes: GeoNode[] = [];
    let countryTotal = 0;

    for (const [region, cities] of regions) {
      let regionTotal = 0;
      let suppressed = 0;
      const cityNodes: GeoNode[] = [];

      for (const [city, count] of cities) {
        regionTotal += count;
        if (count < minBucket) suppressed += count;
        else cityNodes.push({ name: city, sessions: count });
      }
      if (suppressed > 0) cityNodes.push({ name: 'Other (aggregated)', sessions: suppressed });

      countryTotal += regionTotal;
      regionNodes.push({
        name: region,
        sessions: regionTotal,
        children: cityNodes.sort((a, b) => b.sessions - a.sessions),
      });
    }

    nodes.push({
      name: country,
      sessions: countryTotal,
      children: regionNodes.sort((a, b) => b.sessions - a.sessions),
    });
  }

  return nodes.sort((a, b) => b.sessions - a.sessions);
}

export type PageRow = { path: string; views: number; share: number };

export async function getTopPages(range: DateRange, limit = 10): Promise<PageRow[]> {
  const rows = await prisma.analyticsEvent.groupBy({
    by: ['path'],
    where: { name: 'page_view', occurredAt: { gte: range.from, lt: range.to } },
    _count: { _all: true },
    orderBy: { _count: { path: 'desc' } },
    take: limit,
  });

  const total = rows.reduce((sum, row) => sum + row._count._all, 0);
  return rows.map((row) => ({
    path: row.path,
    views: row._count._all,
    share: total ? (row._count._all / total) * 100 : 0,
  }));
}

export type FunnelStep = { key: string; label: string; value: number; conversionFromTop: number };

export async function getConversionFunnel(range: DateRange): Promise<FunnelStep[]> {
  const window = { occurredAt: { gte: range.from, lt: range.to } };

  const [sessions, portfolioViews, contactViews, started, submitted] = await Promise.all([
    prisma.analyticsSession.count({ where: { startedAt: { gte: range.from, lt: range.to } } }),
    prisma.analyticsEvent
      .findMany({
        where: { ...window, name: 'page_view' },
        select: { sessionId: true },
        distinct: ['sessionId'],
      })
      .then((rows) => rows.length),
    prisma.analyticsEvent
      .findMany({
        where: { ...window, name: 'contact_form_view' },
        select: { sessionId: true },
        distinct: ['sessionId'],
      })
      .then((rows) => rows.length),
    prisma.analyticsEvent
      .findMany({
        where: { ...window, name: 'contact_form_start' },
        select: { sessionId: true },
        distinct: ['sessionId'],
      })
      .then((rows) => rows.length),
    prisma.analyticsEvent
      .findMany({
        where: { ...window, name: 'contact_form_submit' },
        select: { sessionId: true },
        distinct: ['sessionId'],
      })
      .then((rows) => rows.length),
  ]);

  const steps = [
    { key: 'visitors', label: 'Visitors', value: sessions },
    { key: 'portfolio', label: 'Portfolio Views', value: portfolioViews },
    { key: 'contact', label: 'Contact Page Views', value: contactViews },
    { key: 'started', label: 'Form Started', value: started },
    { key: 'submitted', label: 'Form Submitted', value: submitted },
  ];

  const top = steps[0]!.value;
  return steps.map((step) => ({
    ...step,
    conversionFromTop: top ? (step.value / top) * 100 : 0,
  }));
}

// ---------------------------------------------------------------------------
// Inquiry analytics
// ---------------------------------------------------------------------------

export async function getInquiryAnalytics(range: DateRange) {
  const where = { createdAt: { gte: range.from, lt: range.to } };

  const [total, byStatus, byType, bySource, sessions, trendRows] = await Promise.all([
    prisma.contactInquiry.count({ where }),
    prisma.contactInquiry.groupBy({ by: ['status'], where, _count: { _all: true } }),
    prisma.contactInquiry.groupBy({ by: ['inquiryType'], where, _count: { _all: true } }),
    prisma.contactInquiry.groupBy({ by: ['utmSource'], where, _count: { _all: true } }),
    prisma.analyticsSession.count({ where: { startedAt: { gte: range.from, lt: range.to } } }),
    prisma.$queryRaw<Array<{ bucket: Date; total: bigint }>>(Prisma.sql`
      SELECT date_trunc('day', "createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${TZ}) AS bucket,
             COUNT(*)::bigint AS total
      FROM "ContactInquiry"
      WHERE "createdAt" >= ${range.from} AND "createdAt" < ${range.to}
      GROUP BY 1 ORDER BY 1 ASC
    `),
  ]);

  const statusCounts = Object.fromEntries(byStatus.map((row) => [row.status, row._count._all]));
  const typeRows = byType
    .map((row) => ({ key: row.inquiryType, value: row._count._all }))
    .sort((a, b) => b.value - a.value);

  return {
    total,
    new: statusCounts.NEW ?? 0,
    inProgress: (statusCounts.IN_PROGRESS ?? 0) + (statusCounts.CONTACTED ?? 0),
    resolved: statusCounts.RESOLVED ?? 0,
    spam: statusCounts.SPAM ?? 0,
    byStatus: statusCounts,
    byType: typeRows,
    mostCommonType: typeRows[0]?.key ?? null,
    bySource: bySource
      .map((row) => ({ key: row.utmSource ?? 'direct', value: row._count._all }))
      .sort((a, b) => b.value - a.value),
    conversionRate: sessions ? (total / sessions) * 100 : 0,
    trend: trendRows.map((row) => ({
      date: istDayKey(new Date(row.bucket)),
      total: Number(row.total),
    })),
  };
}

/** True when no analytics rows exist at all, so the UI can explain the emptiness. */
export async function hasAnyAnalytics(): Promise<boolean> {
  const count = await prisma.analyticsSession.count().catch(() => 0);
  return count > 0;
}
