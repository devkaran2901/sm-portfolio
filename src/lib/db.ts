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
 * Runs a database read that the public site can survive without.
 *
 * The public pages must still render (from `src/content/defaults.ts`) when the
 * database is unreachable - during a cold deploy, a failover, or a local build
 * with no DATABASE_URL. Write paths never use this: they must fail loudly.
 */
export async function safeQuery<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  if (!process.env.DATABASE_URL) return fallback;
  try {
    return await query();
  } catch (error) {
    reportDatabaseFailure(error);
    return fallback;
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
  const unreachable = /reach database server|ECONNREFUSED|P1001/i.test(message);

  if (unreachable) {
    console.warn(
      '[db] database unreachable - public pages are serving fallback content from src/content/defaults.ts. ' +
        'Further occurrences are suppressed for 60s.',
    );
    return;
  }

  console.error('[db] read failed, serving fallback content:', message.split('\n')[0]);
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
