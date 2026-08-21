import type { Metadata, Viewport } from 'next';
import { Anton, Inter } from 'next/font/google';

import { SITE } from '@/content/defaults';
import { siteUrl } from '@/lib/env';
import './globals.css';

/**
 * Fonts are self-hosted by next/font at build time: no runtime request to a
 * third party, no layout shift from a late swap, and no cookie set by a font CDN.
 */
// Anton ships a single heavy weight by design. `font-semibold` and friends are
// not no-ops on it: with no 600 to resolve to, the browser synthesises one by
// widening the strokes, which on a condensed face closes up the counters and
// the word gaps. Display text should carry no weight utility at all.
const display = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: SITE.defaultTitle,
    template: '%s | Sonu Malik',
  },
  description: SITE.defaultDescription,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  formatDetection: { telephone: false, email: false, address: false },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#D9DADC',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-ink-950 text-bone-200">{children}</body>
    </html>
  );
}
