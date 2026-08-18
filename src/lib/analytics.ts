import 'server-only';

import { randomBytes } from 'node:crypto';
import type { AnalyticsEventName } from '@prisma/client';

import { prisma, reportDatabaseFailure } from './db';
import { analyticsEnabled } from './env';
import type { AnalyticsEventInput } from './validation';
import {
  classifyChannel,
  geoFromHeaders,
  hostOf,
  isLikelyBot,
  parseUserAgent,
  visitorHash,
} from './request';

/**
 * Analytics ingestion.
 *
 * Real events only - nothing here generates, estimates or backfills traffic.
 * If no events have been collected yet the dashboard shows zeros and an empty
 * state, which is the honest answer.
 *
 * Privacy: no cookies, no cross-site identifiers, no raw IP addresses. A
 * session key lives in sessionStorage on the client, and the server stores only
 * a daily-rotating salted hash for unique-visitor counting.
 */

const SESSION_IDLE_MS = 30 * 60 * 1000;

export function newSessionKey(): string {
  return randomBytes(16).toString('base64url');
}

export type IngestResult = { accepted: boolean; sessionKey?: string; reason?: string };

export async function ingestEvent(
  input: AnalyticsEventInput,
  headers: Headers,
): Promise<IngestResult> {
  if (!analyticsEnabled) return { accepted: false, reason: 'disabled' };

  const userAgent = headers.get('user-agent');
  // Bots inflate every metric they touch, so they are dropped at the door.
  if (isLikelyBot(userAgent)) return { accepted: false, reason: 'bot' };

  try {
    return await writeEvent(input, headers);
  } catch (error) {
    // Measurement is not worth an error response. A visitor's page must not be
    // affected because the analytics table was briefly unwritable, so the event
    // is dropped and the outage is logged once rather than per request.
    reportDatabaseFailure(error);
    return { accepted: false, reason: 'unavailable' };
  }
}

async function writeEvent(
  input: AnalyticsEventInput,
  headers: Headers,
): Promise<IngestResult> {
  const userAgent = headers.get('user-agent');
  const sessionKey = input.sessionKey || newSessionKey();
  const hash = visitorHash(headers);
  const now = new Date();
  const path = normalisePath(input.path);

  const { device, browser, os } = parseUserAgent(userAgent);
  const geo = geoFromHeaders(headers);
  const selfHost = hostOf(headers.get('origin') ?? headers.get('referer'));
  const channel = classifyChannel({
    referrer: input.referrer,
    utmSource: input.utm?.source,
    utmMedium: input.utm?.medium,
    selfHost,
  });

  const existing = await prisma.analyticsSession.findUnique({ where: { sessionKey } });

  // A session that has been idle for longer than the window is a new session.
  const stale = existing && now.getTime() - existing.lastSeenAt.getTime() > SESSION_IDLE_MS;
  if (!existing || stale) {
    const key = stale ? newSessionKey() : sessionKey;
    await prisma.analyticsSession.create({
      data: {
        sessionKey: key,
        visitorHash: hash,
        entryPath: path,
        exitPath: path,
        pageViews: input.name === 'page_view' ? 1 : 0,
        isBounce: true,
        device,
        browser,
        os,
        channel,
        referrerHost: hostOf(input.referrer),
        countryCode: geo.countryCode,
        region: geo.region,
        city: geo.city,
        utmSource: input.utm?.source ?? null,
        utmMedium: input.utm?.medium ?? null,
        utmCampaign: input.utm?.campaign ?? null,
        utmTerm: input.utm?.term ?? null,
        utmContent: input.utm?.content ?? null,
        converted: input.name === 'contact_form_submit',
        events: {
          create: {
            name: input.name as AnalyticsEventName,
            path,
            referrer: input.referrer?.slice(0, 600) ?? null,
            metadata: input.metadata ?? undefined,
            occurredAt: now,
          },
        },
      },
    });
    return { accepted: true, sessionKey: key };
  }

  const pageViews = existing.pageViews + (input.name === 'page_view' ? 1 : 0);
  const durationSec = Math.max(
    existing.durationSec,
    Math.min(Math.round((now.getTime() - existing.startedAt.getTime()) / 1000), 4 * 60 * 60),
    input.durationSec ?? 0,
  );

  await prisma.analyticsSession.update({
    where: { id: existing.id },
    data: {
      lastSeenAt: now,
      exitPath: path,
      pageViews,
      durationSec,
      // A bounce is a single-pageview visit with no meaningful interaction.
      isBounce: pageViews <= 1 && !INTERACTION_EVENTS.has(input.name),
      converted: existing.converted || input.name === 'contact_form_submit',
      countryCode: existing.countryCode ?? geo.countryCode,
      region: existing.region ?? geo.region,
      city: existing.city ?? geo.city,
      events: {
        create: {
          name: input.name as AnalyticsEventName,
          path,
          referrer: input.referrer?.slice(0, 600) ?? null,
          metadata: input.metadata ?? undefined,
          occurredAt: now,
        },
      },
    },
  });

  return { accepted: true, sessionKey: existing.sessionKey };
}

const INTERACTION_EVENTS = new Set<AnalyticsEventInput['name']>([
  'contact_form_start',
  'contact_form_submit',
  'external_link_click',
  'media_open',
  'red_ball_link_click',
  'business_link_click',
]);

/** Query strings and fragments are dropped so paths aggregate cleanly. */
function normalisePath(path: string): string {
  const trimmed = path.split('?')[0]!.split('#')[0]!.trim();
  if (!trimmed.startsWith('/')) return '/';
  if (trimmed.length > 1 && trimmed.endsWith('/')) return trimmed.slice(0, -1);
  return trimmed.slice(0, 300);
}

/** Marks the session that produced an inquiry as converted. */
export async function markSessionConverted(sessionKey: string | null | undefined): Promise<void> {
  if (!sessionKey) return;
  await prisma.analyticsSession
    .updateMany({ where: { sessionKey }, data: { converted: true } })
    .catch(() => undefined);
}
