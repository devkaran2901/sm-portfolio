'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { track } from '@/lib/analytics-client';

/**
 * Fires a page_view on first paint and on every client-side route change, plus
 * a duration update when the tab is hidden or closed.
 *
 * Mounted once in the public layout. It renders nothing.
 */
export function AnalyticsProvider({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  // Stamped on mount rather than during render: reading the clock while
  // rendering is impure and would differ between server and client.
  const startedAt = useRef(0);
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || lastPath.current === pathname) return;
    lastPath.current = pathname;
    track('page_view', { path: pathname });
  }, [enabled, pathname]);

  useEffect(() => {
    if (!enabled) return;
    startedAt.current = Date.now();

    const reportDuration = () => {
      if (document.visibilityState !== 'hidden') return;
      track('page_view', {
        path: window.location.pathname,
        durationSec: Math.round((Date.now() - startedAt.current) / 1000),
      });
    };

    // visibilitychange is the reliable signal; unload is not fired on mobile.
    document.addEventListener('visibilitychange', reportDuration);
    return () => document.removeEventListener('visibilitychange', reportDuration);
  }, [enabled]);

  return null;
}
