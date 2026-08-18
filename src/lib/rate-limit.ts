import 'server-only';

import { prisma } from './db';

/**
 * Two-tier rate limiting.
 *
 * Tier 1 is an in-process counter: instant, free, and enough to stop a single
 * runaway client on one instance. Tier 2 records hits in Postgres so the limit
 * also holds across serverless instances, where memory is not shared.
 *
 * If the database write fails the in-memory verdict still applies - the limiter
 * degrades, it never opens wide.
 */

type Bucket = { count: number; resetAt: number };
const memory = new Map<string, Bucket>();

function sweepMemory(now: number) {
  if (memory.size < 5_000) return;
  for (const [key, bucket] of memory) {
    if (bucket.resetAt <= now) memory.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export type RateLimitOptions = {
  /** Bucket identity, e.g. `contact:<ipHash>`. */
  key: string;
  limit: number;
  windowSeconds: number;
  /** Also persist hits so the limit survives across instances. */
  durable?: boolean;
};

export async function rateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { key, limit, windowSeconds, durable = false } = options;
  const now = Date.now();
  sweepMemory(now);

  const bucket = memory.get(key);
  if (!bucket || bucket.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
  } else {
    bucket.count += 1;
    if (bucket.count > limit) {
      return {
        ok: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      };
    }
  }

  const local = memory.get(key)!;
  if (!durable || !process.env.DATABASE_URL) {
    return { ok: true, remaining: Math.max(0, limit - local.count), retryAfterSeconds: 0 };
  }

  try {
    const expiresAt = new Date(now + windowSeconds * 1000);
    const windowStart = new Date(now - windowSeconds * 1000);

    const hits = await prisma.rateLimitHit.count({
      where: { bucket: key, createdAt: { gte: windowStart } },
    });

    if (hits >= limit) {
      return { ok: false, remaining: 0, retryAfterSeconds: windowSeconds };
    }

    await prisma.rateLimitHit.create({ data: { bucket: key, expiresAt } });

    // Opportunistic cleanup so the table cannot grow without bound.
    if (Math.random() < 0.02) {
      await prisma.rateLimitHit
        .deleteMany({ where: { expiresAt: { lt: new Date(now) } } })
        .catch(() => undefined);
    }

    return { ok: true, remaining: Math.max(0, limit - hits - 1), retryAfterSeconds: 0 };
  } catch (error) {
    console.error('[rate-limit] durable tier unavailable:', (error as Error).message);
    return { ok: true, remaining: Math.max(0, limit - local.count), retryAfterSeconds: 0 };
  }
}

export function tooManyRequests(retryAfterSeconds: number): Response {
  return Response.json(
    { error: 'Too many requests. Please try again shortly.' },
    { status: 429, headers: { 'Retry-After': String(Math.max(1, retryAfterSeconds)) } },
  );
}
