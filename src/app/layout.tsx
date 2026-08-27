import type { Metadata, Viewport } from 'next';
import { Anton, Dancing_Script, Inter, Playfair_Display } from 'next/font/google';

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

/*
 * The display face for the site: a tall, high-contrast serif carrying every
 * section heading. Loaded across 400-700 because the headings sit at 500 and
 * the small serif numerals in the stats bar want the heavier end.
 *
 * Anton stays loaded alongside it: the scroll hero paints the name in it and
 * that sequence is deliberately left untouched by the restyle.
 */
const serif = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

/**
 * A decorative flourish only: rendered once, under the About Me bio, as a
 * signature-styled treatment of the name. It is typography, not a scanned
 * autograph, and nothing on the page presents it as one.
 */
const script = Dancing_Script({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-script',
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
  themeColor: '#0B0A08',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      className={`${display.variable} ${serif.variable} ${sans.variable} ${script.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-ink-950 text-bone-200">{children}</body>
    </html>
  );
}
