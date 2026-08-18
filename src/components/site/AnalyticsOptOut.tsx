'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { analyticsOptedOut, setAnalyticsOptOut } from '@/lib/analytics-client';

/**
 * Analytics opt-out control.
 *
 * The site sets no tracking cookies, so there is no consent banner to dismiss.
 * Instead the choice lives here, permanently reachable from the cookie policy.
 * Do Not Track is honoured automatically and is reported as such.
 */
export function AnalyticsOptOut() {
  const [optedOut, setOptedOut] = useState<boolean | null>(null);
  const [dnt, setDnt] = useState(false);

  useEffect(() => {
    // Browser state is only readable after mount, and the read is deferred a
    // frame so it does not cascade a render from inside the effect body.
    const frame = requestAnimationFrame(() => {
      setDnt(window.navigator.doNotTrack === '1' || window.navigator.doNotTrack === 'yes');
      setOptedOut(analyticsOptedOut());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  if (optedOut === null) {
    return (
      <div className="h-[4.5rem] animate-pulse rounded-xl2 border border-ink-700/70 bg-ink-900/50" />
    );
  }

  return (
    <div className="rounded-xl2 border border-ink-700/70 bg-ink-900/50 p-6">
      <p className="text-sm text-bone-200">
        {dnt
          ? 'Your browser sends a Do Not Track signal, so measurement is already switched off for you.'
          : optedOut
            ? 'Measurement is switched off in this browser.'
            : 'Measurement is on: anonymous page views only, no cookies, no cross-site tracking.'}
      </p>

      {!dnt ? (
        <div className="mt-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              const next = !optedOut;
              setAnalyticsOptOut(next);
              setOptedOut(next);
            }}
          >
            {optedOut ? 'Turn measurement back on' : 'Opt out of measurement'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
