import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { NAV_LINKS, SITE } from '@/content/defaults';
import type { BusinessView, ProfileView } from '@/lib/content';
import { ExternalTrackedLink } from './ExternalTrackedLink';

const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/cookies', label: 'Cookie & Analytics Policy' },
];

export function SiteFooter({
  profile,
  businesses,
}: {
  profile: ProfileView;
  businesses: BusinessView[];
}) {
  const year = new Date().getFullYear();

  return (
    /*
      Two global classes are tuned for the white ground and have to be
      re-pointed here: `.eyebrow` is brass-300, the red that clears AA on white,
      and `.link-underline` is near-black type. Both are overridden on the
      footer root rather than at each call site.
    */
    <footer className="border-t border-navy-800 bg-navy-950 [&_.eyebrow]:text-brass-600 [&_.link-underline]:text-navy-300 [&_.link-underline:hover]:text-brass-600">
      <div className="shell grid grid-cols-2 gap-8 py-16 lg:grid-cols-12 lg:gap-8">
        <div className="col-span-2 lg:col-span-5">
          {/* Same wordmark as the header, same reasoning: no synthetic bold, and
              enough word spacing that the two names read as two names. */}
          <p className="font-display text-2xl tracking-[0.01em] [word-spacing:0.14em] text-navy-200">
            {profile.fullName}
          </p>
          <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-navy-400">{profile.shortBio}</p>

          {profile.currentCity ? (
            <p className="mt-6 text-sm uppercase tracking-[0.16em] text-navy-500">
              {[profile.currentCity, profile.region, profile.country].filter(Boolean).join(', ')}
            </p>
          ) : null}

          {profile.socialLinks.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {profile.socialLinks.map((link) => (
                <li key={link.url}>
                  <ExternalTrackedLink
                    href={link.url}
                    event="external_link_click"
                    className="link-underline text-sm"
                  >
                    {link.label}
                  </ExternalTrackedLink>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <nav aria-label="Footer" className="col-span-1 lg:col-span-3">
          <h2 className="eyebrow">Navigate</h2>
          <ul className="mt-4 space-y-0.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="flex min-h-[44px] items-center text-[0.9375rem] text-navy-300 transition-colors hover:text-brass-600">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-1 lg:col-span-4">
          <h2 className="eyebrow">Ventures</h2>
          <ul className="mt-4 space-y-0.5">
            <li>
              <ExternalTrackedLink
                href={SITE.redBallUrl}
                event="red_ball_link_click"
                className="group inline-flex min-h-[44px] items-center gap-1.5 text-[0.9375rem] text-navy-300 transition-colors hover:text-brass-600"
              >
                Red Ball Sports Arena
                <ArrowUpRight
                  size={14}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </ExternalTrackedLink>
            </li>
            {businesses.map((business) =>
              business.websiteUrl ? (
                <li key={business.slug}>
                  <ExternalTrackedLink
                    href={business.websiteUrl}
                    event="business_link_click"
                    metadata={{ business: business.slug }}
                    className="group inline-flex min-h-[44px] items-center gap-1.5 text-[0.9375rem] text-navy-300 transition-colors hover:text-brass-600"
                  >
                    {business.name}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </ExternalTrackedLink>
                </li>
              ) : (
                <li key={business.slug}>
                  <Link
                    href={`/ventures#${business.slug}`}
                    className="flex min-h-[44px] items-center text-[0.9375rem] text-navy-300 transition-colors hover:text-brass-600"
                  >
                    {business.name}
                  </Link>
                </li>
              ),
            )}
          </ul>

          <h2 className="eyebrow mt-8">Legal</h2>
          <ul className="mt-4 space-y-0.5">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="flex min-h-[44px] items-center text-[0.9375rem] text-navy-300 transition-colors hover:text-brass-600">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-800/80">
        <div className="shell flex flex-col gap-3 py-6 text-xs text-navy-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {profile.fullName}. All rights reserved.
          </p>
          <p>
            Details marked &ldquo;verification required&rdquo; are published only once a source is
            attached.
          </p>
        </div>
      </div>
    </footer>
  );
}
