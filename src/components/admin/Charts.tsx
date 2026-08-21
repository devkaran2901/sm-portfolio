'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatNumber, formatPercent } from '@/lib/utils';

/**
 * Dashboard charts.
 *
 * A shared, colour-blind-safe sequence is used across every chart so a series
 * keeps its identity between views. Each chart is paired with a table or list
 * elsewhere on the page, because a canvas alone is not accessible.
 */

const SERIES = ['#202124', '#4E5053', '#7A7C7F', '#9EA0A3', '#B4B6B9', '#C9CBCD'];

const AXIS = { stroke: '#7A7C7F', fontSize: 12 };
const GRID = '#C9CBCD';

const tooltipStyle = {
  contentStyle: {
    background: '#FFFFFF',
    border: '1px solid #C9CBCD',
    borderRadius: 10,
    fontSize: 12,
    color: '#0A0A0B',
  },
  labelStyle: { color: '#4E5053', marginBottom: 4 },
  itemStyle: { color: '#202124' },
};

function shortDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(date);
}

export type TrafficPoint = { date: string; sessions: number; visitors: number; pageViews: number };

export function TrafficChart({ data }: { data: TrafficPoint[] }) {
  return (
    <div className="h-[19rem] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="sessionsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIES[0]} stopOpacity={0.35} />
              <stop offset="100%" stopColor={SERIES[0]} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIES[1]} stopOpacity={0.25} />
              <stop offset="100%" stopColor={SERIES[1]} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="date" tickFormatter={shortDate} tickLine={false} axisLine={false} {...AXIS} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={46} {...AXIS} />
          <Tooltip {...tooltipStyle} labelFormatter={(label) => shortDate(String(label))} />
          <Legend
            verticalAlign="top"
            height={30}
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: 12, color: '#93AECB' }}
          />

          <Area
            type="monotone"
            dataKey="pageViews"
            name="Page views"
            stroke={SERIES[1]}
            strokeWidth={1.5}
            fill="url(#viewsFill)"
          />
          <Area
            type="monotone"
            dataKey="sessions"
            name="Sessions"
            stroke={SERIES[0]}
            strokeWidth={2}
            fill="url(#sessionsFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export type BreakdownDatum = { key: string; label: string; value: number; share: number };

export function DonutChart({ data }: { data: BreakdownDatum[] }) {
  if (data.length === 0) return null;

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="58%"
            outerRadius="86%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={entry.key} fill={SERIES[index % SERIES.length]} />
            ))}
          </Pie>
          <Tooltip
            {...tooltipStyle}
            formatter={(value, name) => [formatNumber(Number(value ?? 0)), String(name ?? '')]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HorizontalBars({ data }: { data: BreakdownDatum[] }) {
  if (data.length === 0) return null;

  return (
    <div style={{ height: `${Math.max(160, data.length * 42)}px` }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
          <CartesianGrid stroke={GRID} horizontal={false} />
          <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} {...AXIS} />
          <YAxis
            type="category"
            dataKey="label"
            width={128}
            tickLine={false}
            axisLine={false}
            {...AXIS}
          />
          <Tooltip {...tooltipStyle} cursor={{ fill: '#E8E9EA' }} />
          <Bar dataKey="value" name="Sessions" radius={[0, 5, 5, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.key} fill={SERIES[index % SERIES.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export type FunnelDatum = { key: string; label: string; value: number; conversionFromTop: number };

/**
 * Conversion funnel as proportional bars.
 *
 * Plain divs rather than a chart library: the widths are a direct percentage of
 * the top step, which is easier to read and stays legible when every value is 0.
 */
export function Funnel({ steps }: { steps: FunnelDatum[] }) {
  const top = steps[0]?.value ?? 0;

  return (
    <ol className="space-y-3">
      {steps.map((step, index) => {
        const width = top > 0 ? Math.max((step.value / top) * 100, step.value > 0 ? 4 : 0) : 0;
        const previous = steps[index - 1];
        const stepRate =
          previous && previous.value > 0 ? (step.value / previous.value) * 100 : null;

        return (
          <li key={step.key}>
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="font-medium text-bone-200">{step.label}</span>
              <span className="tabular-nums text-bone-400">
                {formatNumber(step.value)}
                {stepRate !== null ? (
                  <span className="ml-2 text-xs text-bone-600">
                    {formatPercent(stepRate, 0)} of previous
                  </span>
                ) : null}
              </span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-ink-800">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-editorial"
                style={{ width: `${width}%`, background: SERIES[index % SERIES.length] }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function InquiryTrendChart({ data }: { data: Array<{ date: string; total: number }> }) {
  if (data.length === 0) return null;

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="date" tickFormatter={shortDate} tickLine={false} axisLine={false} {...AXIS} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} {...AXIS} />
          <Tooltip
            {...tooltipStyle}
            cursor={{ fill: '#E8E9EA' }}
            labelFormatter={(label) => shortDate(String(label))}
          />
          <Bar dataKey="total" name="Inquiries" fill={SERIES[1]} radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export const CHART_SERIES = SERIES;
