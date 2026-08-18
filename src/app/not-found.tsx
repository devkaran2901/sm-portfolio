import Link from 'next/link';
import type { Metadata } from 'next';

import { NAV_LINKS } from '@/content/defaults';
import { buttonClass } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 py-24">
      <div className="w-full max-w-xl text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-5 text-display-lg text-bone-50">This page does not exist.</h1>
        <p className="mx-auto mt-5 max-w-md text-[0.9375rem] leading-relaxed text-bone-400">
          The link may be out of date, or the page may have moved. Everything on the site is
          reachable from the sections below.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonClass('primary', 'md')}>
            Back to home
          </Link>
          <Link href="/contact" className={buttonClass('secondary', 'md')}>
            Contact
          </Link>
        </div>

        <nav aria-label="Site sections" className="mt-14 border-t border-ink-800 pt-8">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-bone-400 transition-colors hover:text-brass-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
