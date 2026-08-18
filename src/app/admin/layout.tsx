import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Admin Portal', template: '%s | Admin' },
  // Belt and braces alongside the middleware header and next.config rule.
  robots: { index: false, follow: false, nocache: true },
};

// Everything under /admin depends on session state, so nothing here is cached.
export const dynamic = 'force-dynamic';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-ink-950 text-bone-200">{children}</div>;
}
