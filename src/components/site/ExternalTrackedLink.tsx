'use client';

import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { track, type TrackName } from '@/lib/analytics-client';

/**
 * External link that records an outbound click.
 *
 * Always carries rel="noopener noreferrer" so the destination cannot reach back
 * through window.opener, and the tracking call never delays the navigation.
 */
export function ExternalTrackedLink({
  href,
  event = 'external_link_click',
  metadata,
  children,
  ...props
}: {
  href: string;
  event?: TrackName;
  metadata?: Record<string, string | number | boolean>;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return (
    <a
      {...props}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track(event, { metadata: { href, ...metadata } })}
    >
      {children}
    </a>
  );
}
