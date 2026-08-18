import { handle, json, noStore } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import {
  getChannelBreakdown,
  getComparisonSummary,
  getConversionFunnel,
  getDeviceBreakdown,
  getGeoDistribution,
  getInquiryAnalytics,
  getKpis,
  getTopPages,
  getTrafficOverTime,
  hasAnyAnalytics,
  resolveRange,
} from '@/lib/analytics-query';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Aggregated analytics for the dashboard.
 *
 * Every number is computed from collected rows. When nothing has been collected
 * the response is all zeros with `hasData: false`, and the UI says so plainly
 * rather than showing a plausible-looking chart.
 */
export async function GET(request: Request) {
  return handle(async () => {
    await requirePermission('analytics:read');

    const url = new URL(request.url);
    const range = resolveRange(
      url.searchParams.get('range') ?? undefined,
      url.searchParams.get('from') ?? undefined,
      url.searchParams.get('to') ?? undefined,
    );

    const [
      hasData,
      kpis,
      comparisons,
      timeseries,
      devices,
      channels,
      geo,
      pages,
      funnel,
      inquiries,
    ] = await Promise.all([
      hasAnyAnalytics(),
      getKpis(range),
      getComparisonSummary(),
      getTrafficOverTime(range),
      getDeviceBreakdown(range),
      getChannelBreakdown(range),
      getGeoDistribution(range),
      getTopPages(range),
      getConversionFunnel(range),
      getInquiryAnalytics(range),
    ]);

    return noStore(
      json({
        hasData,
        range: {
          key: range.key,
          label: range.label,
          from: range.from.toISOString(),
          to: range.to.toISOString(),
          days: range.days,
        },
        kpis,
        comparisons,
        timeseries,
        devices,
        channels,
        geo,
        pages,
        funnel,
        inquiries,
      }),
    );
  });
}
