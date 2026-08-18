import { createHash } from 'node:crypto';
import type { DeviceType, TrafficChannel } from '@prisma/client';
import { analyticsSalt } from './env';

/**
 * Request-derived signals for analytics and abuse control.
 *
 * Raw IP addresses are never stored or returned. They are hashed with a secret
 * salt plus the current UTC date, so the resulting identifier rotates daily and
 * cannot be correlated across days or reversed into an address.
 */

export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return (
    headers.get('x-real-ip') ??
    headers.get('cf-connecting-ip') ??
    headers.get('x-vercel-forwarded-for') ??
    'unknown'
  );
}

/** Daily-rotating, salted, non-reversible visitor identifier. */
export function visitorHash(headers: Headers, extra = ''): string {
  const day = new Date().toISOString().slice(0, 10);
  const material = [analyticsSalt(), day, clientIp(headers), headers.get('user-agent') ?? '', extra];
  return createHash('sha256').update(material.join('|')).digest('hex').slice(0, 32);
}

/** Stable-per-day hash used for rate-limit buckets and audit entries. */
export function ipHash(headers: Headers): string {
  return createHash('sha256')
    .update(`${analyticsSalt()}|${clientIp(headers)}`)
    .digest('hex')
    .slice(0, 32);
}

// ---------------------------------------------------------------------------
// User agent
// ---------------------------------------------------------------------------

export type UserAgentInfo = { device: DeviceType; browser: string | null; os: string | null };

const BOT_PATTERN =
  /bot|crawler|spider|crawl|slurp|bingpreview|facebookexternalhit|headless|lighthouse|pingdom|monitor|preview|gptbot|claudebot|perplexity/i;

export function isLikelyBot(userAgent: string | null): boolean {
  if (!userAgent) return true;
  return BOT_PATTERN.test(userAgent);
}

export function parseUserAgent(userAgent: string | null): UserAgentInfo {
  if (!userAgent) return { device: 'UNKNOWN', browser: null, os: null };
  const ua = userAgent;

  const isTablet = /ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua);
  const isMobile = !isTablet && /mobile|iphone|ipod|android|blackberry|windows phone|iemobile/i.test(ua);
  const device: DeviceType = isTablet ? 'TABLET' : isMobile ? 'MOBILE' : 'DESKTOP';

  // Order matters: several browsers embed other browsers' tokens.
  const browser =
    /edg\//i.test(ua) ? 'Edge'
    : /opr\/|opera/i.test(ua) ? 'Opera'
    : /samsungbrowser/i.test(ua) ? 'Samsung Internet'
    : /firefox|fxios/i.test(ua) ? 'Firefox'
    : /chrome|crios/i.test(ua) ? 'Chrome'
    : /safari/i.test(ua) ? 'Safari'
    : null;

  const os =
    /windows nt/i.test(ua) ? 'Windows'
    : /iphone|ipad|ipod|ios/i.test(ua) ? 'iOS'
    : /mac os x/i.test(ua) ? 'macOS'
    : /android/i.test(ua) ? 'Android'
    : /linux/i.test(ua) ? 'Linux'
    : null;

  return { device, browser, os };
}

// ---------------------------------------------------------------------------
// Traffic classification
// ---------------------------------------------------------------------------

const SEARCH_HOSTS = /google\.|bing\.|duckduckgo\.|yahoo\.|yandex\.|baidu\.|ecosia\.|brave\.|search\./i;
const SOCIAL_HOSTS =
  /facebook\.|fb\.|instagram\.|twitter\.|x\.com|t\.co|linkedin\.|lnkd\.in|youtube\.|youtu\.be|whatsapp\.|reddit\.|pinterest\.|telegram\.|threads\./i;

export function hostOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function classifyChannel(input: {
  referrer?: string | null;
  utmMedium?: string | null;
  utmSource?: string | null;
  selfHost?: string | null;
}): TrafficChannel {
  if (input.utmMedium || input.utmSource) return 'CAMPAIGN';

  const host = hostOf(input.referrer);
  if (!host) return 'DIRECT';
  if (input.selfHost && host === input.selfHost.replace(/^www\./, '')) return 'INTERNAL';
  if (SEARCH_HOSTS.test(host)) return 'ORGANIC_SEARCH';
  if (SOCIAL_HOSTS.test(host)) return 'SOCIAL';
  return 'REFERRAL';
}

/**
 * Coarse geography from edge/CDN headers only. We never call a geo-IP service
 * and never store anything finer than the city the CDN already reports.
 */
export function geoFromHeaders(headers: Headers): {
  countryCode: string | null;
  region: string | null;
  city: string | null;
} {
  const decode = (value: string | null) => {
    if (!value) return null;
    try {
      return decodeURIComponent(value) || null;
    } catch {
      return value;
    }
  };
  return {
    countryCode: headers.get('x-vercel-ip-country') ?? headers.get('cf-ipcountry') ?? null,
    region: decode(headers.get('x-vercel-ip-country-region') ?? headers.get('cf-region')),
    city: decode(headers.get('x-vercel-ip-city') ?? headers.get('cf-ipcity')),
  };
}
