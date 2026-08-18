'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';

/**
 * Admin error boundary.
 *
 * Never renders a stack trace, a query or an internal message. Administrators
 * get the digest, which is enough to find the matching server log entry.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin] unhandled error:', error.message, error.digest);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="font-display text-2xl text-bone-50">This screen could not load</h1>
      <p className="mt-3 text-sm leading-relaxed text-bone-400">
        An unexpected error occurred. It has been logged. If it persists, check that the database is
        reachable from this deployment.
      </p>

      <div className="mt-7 flex justify-center gap-3">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Link
          href="/admin"
          className="inline-flex h-11 items-center rounded-full border border-ink-600 px-5 text-sm font-semibold text-bone-100 transition-colors hover:border-brass-400/60"
        >
          Back to dashboard
        </Link>
      </div>

      {error.digest ? (
        <p className="mt-8 font-mono text-xs text-bone-600">Reference: {error.digest}</p>
      ) : null}
    </div>
  );
}
