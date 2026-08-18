'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { buttonClass } from '@/components/ui/Button';

/**
 * Root error boundary.
 *
 * Shows a calm, branded message. The stack trace is never rendered - it goes to
 * the server log, and the visitor sees the digest only, which is enough to
 * correlate a report with a log entry.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app] unhandled error:', error.message, error.digest);
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center px-6 py-24">
      <div className="w-full max-w-xl text-center">
        <p className="eyebrow">Error 500</p>
        <h1 className="mt-5 text-display-lg text-bone-50">Something went wrong.</h1>
        <p className="mx-auto mt-5 max-w-md text-[0.9375rem] leading-relaxed text-bone-400">
          An unexpected error interrupted this page. It has been logged. Trying again often
          resolves it.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className={buttonClass('primary', 'md')}>
            Try again
          </button>
          <Link href="/" className={buttonClass('secondary', 'md')}>
            Back to home
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-10 font-mono text-xs text-bone-600">Reference: {error.digest}</p>
        ) : null}
      </div>
    </main>
  );
}
