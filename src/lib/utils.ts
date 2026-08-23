import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * The display steps, declared to tailwind-merge as font sizes.
 *
 * Without this it has no way to know what `text-display-md` is. Its fallback
 * for an unrecognised `text-*` is to treat it as a colour, which puts it in the
 * same conflict group as `text-paper-900` - so `cn('text-display-md',
 * 'text-paper-900')` silently dropped the size and left a section heading
 * rendering at body size. Every step in `theme.fontSize` has to be listed here.
 */
const DISPLAY_SIZES = ['display-xl', 'display-lg', 'display-md', 'display-sm', 'eyebrow'];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: DISPLAY_SIZES }],
    },
  },
});

/** Tailwind-aware class merge. Safe to use on both server and client. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

// ---------------------------------------------------------------------------
// Formatting - fixed locale so server and client render identically
// ---------------------------------------------------------------------------

const NUMBER_FORMAT = new Intl.NumberFormat('en-IN');

export function formatNumber(value: number): string {
  return NUMBER_FORMAT.format(Math.round(value));
}

export function formatPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return '0%';
  return `${value.toFixed(digits)}%`;
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0s';
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  if (minutes === 0) return `${remainder}s`;
  return `${minutes}m ${String(remainder).padStart(2, '0')}s`;
}

export function formatDate(value: Date | string | null | undefined, withTime = false): string {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}),
    timeZone: 'Asia/Kolkata',
  }).format(date);
}

export function relativeTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['second', 60],
    ['minute', 60],
    ['hour', 24],
    ['day', 7],
    ['week', 4.348],
    ['month', 12],
    ['year', Number.POSITIVE_INFINITY],
  ];

  let value_ = diffSeconds;
  for (const [unit, size] of units) {
    if (Math.abs(value_) < size) {
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(Math.round(value_), unit);
    }
    value_ /= size;
  }
  return formatDate(date);
}

/** Percentage change with an explicit "no prior data" signal. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export function safeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

/** Title-cases an enum value: RED_BALL_GROUND -> Red Ball Ground. */
export function humanizeEnum(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
