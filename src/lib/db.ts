import { PrismaClient } from '@prisma/client';
import { isProduction } from './env';

/**
 * Prisma singleton. Next.js hot-reloads modules in development, so the client
 * is cached on globalThis to avoid exhausting the connection pool.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProduction ? ['error'] : ['error', 'warn'],
  });

if (!isProduction) globalForPrisma.prisma = prisma;

/**
 * Connection errors worth retrying rather than falling back on.
 *
 * Serverless Postgres (Neon) autosuspends when idle. The first query after an
 * idle period wakes it, and the connection is frequently reset mid-wake -
 * Prisma surfaces this as "Server has closed the connection" or a raw
 * ECONNRESET (Windows OS code 10054). A fresh connection a moment later reaches
 * the now-waking database and succeeds, so these are transient, not outages.
 */
const TRANSIENT_CONNECTION_ERROR =
  /Server has closed the connection|Connection reset|ECONNRESET|connection closed|Timed out fetching a new connection|Can't reach database server|10054/i;

const RETRY_BACKOFF_MS = [200, 500, 1200];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs a database read that the public site can survive without.
 *
 * The public pages must still render (from `src/content/defaults.ts`) when the
 * database is unreachable - during a cold deploy, a failover, or a local build
 * with no DATABASE_URL. Write paths never use this: they must fail loudly.
 *
 * Transient connection resets (a serverless database waking from idle) are
 * retried with a short backoff before giving up, so a cold start shows the real
 * content on first paint rather than the static fallback.
 */
export async function safeQuery<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  if (!process.env.DATABASE_URL) return fallback;

  for (let attempt = 0; ; attempt += 1) {
    try {
      return await query();
    } catch (error) {
      const message = (error as Error)?.message ?? String(error);
      const canRetry = attempt < RETRY_BACKOFF_MS.length && TRANSIENT_CONNECTION_ERROR.test(message);
      if (canRetry) {
        await sleep(RETRY_BACKOFF_MS[attempt]);
        continue;
      }
      reportDatabaseFailure(error);
      return fallback;
    }
  }
}

/**
 * Logs a database outage once per minute instead of once per query.
 *
 * A single page render fans out to eight or more reads, so an unreachable
 * database produced a screenful of identical multi-line Prisma dumps per
 * request - enough noise to bury anything else in the log. One concise line is
 * all that is needed to diagnose it.
 */
let lastFailureLoggedAt = 0;
const FAILURE_LOG_INTERVAL_MS = 60_000;

export function reportDatabaseFailure(error: unknown): void {
  const now = Date.now();
  if (now - lastFailureLoggedAt < FAILURE_LOG_INTERVAL_MS) return;
  lastFailureLoggedAt = now;

  const message = (error as Error)?.message ?? String(error);
  const unreachable =
    /reach database server|ECONNREFUSED|P1001/i.test(message) ||
    TRANSIENT_CONNECTION_ERROR.test(message);

  if (unreachable) {
    console.warn(
      '[db] database unreachable after retries - public pages are serving fallback content from ' +
        'src/content/defaults.ts. Further occurrences are suppressed for 60s.',
    );
    return;
  }

  // Prisma error messages often begin with a blank line, so take the first line
  // that actually carries text rather than a bare `split('\n')[0]`.
  const firstMeaningfulLine =
    message
      .split('\n')
      .map((line) => line.trim())
      .find(Boolean) ?? 'unknown error';
  console.error('[db] read failed, serving fallback content:', firstMeaningfulLine);
}

/** True when the database is reachable. Used by health checks and admin guards. */
export async function databaseAvailable(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
