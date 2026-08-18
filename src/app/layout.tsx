import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';

import { SITE } from '@/content/defaults';
import { siteUrl } from '@/lib/env';
import './globals.css';

/**
 * Fonts are self-hosted by next/font at build time: no runtime request to a
 * third party, no layout shift from a late swap, and no cookie set by a font CDN.
 */
// Variable font: the full weight range ships in one file, so no `weight` list.
const display = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
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
  themeColor: '#08090A',
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
