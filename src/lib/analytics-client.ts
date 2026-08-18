'use client';

import type { AnalyticsEventInput } from './validation';

/**
 * Client-side analytics transport.
 *
 * Design constraints:
 *  - No cookies. The session key lives in sessionStorage and dies with the tab.
 *  - No cross-site identifiers, no fingerprinting, no third-party requests.
 *  - Honours Do Not Track and a persistent local opt-out.
 *  - Never blocks navigation: uses sendBeacon where available, otherwise a
 *    keepalive fetch, and silently gives up on failure.
 */

const SESSION_STORAGE_KEY = 'sm_analytics_session';
const OPT_OUT_KEY = 'sm_analytics_opt_out';
const ENDPOINT = '/api/analytics/collect';

export type TrackName = AnalyticsEventInput['name'];

export function analyticsOptedOut(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    if (window.localStorage.getItem(OPT_OUT_KEY) === '1') return true;
  } catch {
    // Storage can be blocked entirely; treat that as "do not track".
    return true;
  }
  const dnt =
    window.navigator.doNotTrack ??
    (window as unknown as { doNotTrack?: string }).doNotTrack;
  return dnt === '1' || dnt === 'yes';
}

export function setAnalyticsOptOut(optedOut: boolean): void {
  try {
    if (optedOut) window.localStorage.setItem(OPT_OUT_KEY, '1');
    else window.localStorage.removeItem(OPT_OUT_KEY);
  } catch {
    // Nothing to do: without storage the default is already "do not track".
  }
}

function readSessionKey(): string | undefined {
  try {
    return window.sessionStorage.getItem(SESSION_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function writeSessionKey(key: string): void {
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, key);
  } catch {
    // Non-fatal: the server will simply start a new session next time.
  }
}

export type TrackOptions = {
  path?: string;
  metadata?: Record<string, string | number | boolean>;
  durationSec?: number;
};

export function track(name: TrackName, options: TrackOptions = {}): void {
  if (typeof window === 'undefined' || analyticsOptedOut()) return;

  const payload = {
    name,
    path: options.path ?? window.location.pathname,
    referrer: document.referrer || undefined,
    sessionKey: readSessionKey(),
    metadata: options.metadata,
    durationSec: options.durationSec,
    utm: readUtm(),
  };

  const body = JSON.stringify(payload);

  // sendBeacon survives page unload; fetch is the fallback for older browsers.
  if (navigator.sendBeacon) {
    const queued = navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
    if (queued) {
      // The beacon response is not readable, so ensure a key exists locally.
      if (!readSessionKey()) void primeSessionKey(body);
      return;
    }
  }

  void fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  })
    .then(async (response) => {
      if (!response.ok) return;
      const data = (await response.json()) as { sessionKey?: string };
      if (data.sessionKey) writeSessionKey(data.sessionKey);
    })
    .catch(() => undefined);
}

/** Fetches a session key once so subsequent beacons join the same session. */
async function primeSessionKey(body: string): Promise<void> {
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (!response.ok) return;
    const data = (await response.json()) as { sessionKey?: string };
    if (data.sessionKey) writeSessionKey(data.sessionKey);
  } catch {
    // Ignored by design.
  }
}

function readUtm(): AnalyticsEventInput['utm'] {
  const params = new URLSearchParams(window.location.search);
  const utm = {
    source: params.get('utm_source') ?? undefined,
    medium: params.get('utm_medium') ?? undefined,
    campaign: params.get('utm_campaign') ?? undefined,
    term: params.get('utm_term') ?? undefined,
    content: params.get('utm_content') ?? undefined,
  };
  return Object.values(utm).some(Boolean) ? utm : undefined;
}

/** Reads campaign parameters for attaching to a contact submission. */
export function currentUtm(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const value = params.get(key);
    if (value) out[key] = value.slice(0, 160);
  }
  return out;
}
