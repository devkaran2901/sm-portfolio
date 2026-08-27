import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';

import { NAV_LINKS, SITE } from '@/content/defaults';
import type { BusinessView, ProfileView } from '@/lib/content';
import { buttonClass } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { ExternalTrackedLink } from './ExternalTrackedLink';
import { SocialMark } from './SocialMark';

const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms' },
  { href: '/cookies', label: 'Cookies' },
];

/**
 * The closing band, and the micro-footer under it.
 *
 * The headline is the largest type on any page below the hero, set over two
 * lines with the break written into the markup rather than left to the wrap.
 * "THE NEXT CHAPTER" and "IS ALREADY IN MOTION" are two halves of a sentence
 * and the line ending is the pause between them; a soft wrap would put the
 * break wherever the viewport happened to fall.
 */
export function SiteFooter({
  profile,
  businesses,
}: {
  profile: ProfileView;
  businesses: BusinessView[];
}) {
  const year = new Date().getFullYear();
  const location = [profile.currentCity, profile.region, profile.country].filter(Boolean).join(', ');

  const contacts = [
    location ? { key: 'location', Icon: MapPin, label: location, href: null } : null,
    profile.email
      ? { key: 'email', Icon: Mail, label: profile.email, href: `mailto:${profile.email}` }
      : null,
    profile.phone
      ? { key: 'phone', Icon: Phone, label: profile.phone, href: `tel:${profile.phone}` }
      : null,
  ].flatMap((entry) => (entry ? [entry] : []));

  const ventureLinks = [
    { key: 'red-ball', label: 'Red Ball Sports Arena', href: SITE.redBallUrl, external: true },
    ...businesses.map((business) => ({
      key: business.slug,
      label: business.name,
      href: business.websiteUrl ?? `/ventures/${business.slug}`,
      external: Boolean(business.websiteUrl),
    })),
  ];

  return (
    <footer className="bg-navy-950">
      {/*
        The closing band, now a photograph rather than flat navy: a real
        facility shot (the cricket ground, the one photograph on the site that
        was actually taken there, not stock) knocked well back behind a dark
        wash so the type over it stays at full contrast.
      */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div aria-hidden="true" className="absolute inset-0">
          <Image
            src="/images/facilities/cricket-grounds.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-navy-950/88" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/50" />
        </div>

        <div className="shell relative py-band">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <p className="eyebrow">What&rsquo;s Next</p>
            <h2 className="mt-7 font-serif text-[clamp(2.25rem,5.6vw,4.75rem)] font-medium uppercase leading-[1.03] tracking-[0.01em] text-bone-50">
              The Next Chapter
              <br />
              Is Already In Motion.
            </h2>
          </div>

          <div className="lg:col-span-3">
            <p className="max-w-xs text-[1.0625rem] leading-[1.7] text-bone-300">
              {profile.shortBio}
            </p>
            <Link href="/contact" className={cn(buttonClass('accent', 'md'), 'mt-8')}>
              Let&rsquo;s Talk
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <div className="lg:col-span-3">
            <h3 className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-bone-500">
              Get in touch
            </h3>

            <ul className="mt-6 space-y-4">
              {contacts.map(({ key, Icon, label, href }) => (
                <li key={key} className="flex items-start gap-3 text-[0.9375rem] text-bone-300">
                  <Icon size={15} aria-hidden="true" className="mt-1 shrink-0 text-brass-200" />
                  {href ? (
                    <a href={href} className="transition-colors hover:text-bone-50">
                      {label}
                    </a>
                  ) : (
                    <span>{label}</span>
                  )}
                </li>
              ))}
            </ul>

            {/*
              No published email or phone is the normal state for this record,
              so the column says where the reliable route is instead of leaving
              a heading over a single line of address.
            */}
            {!profile.email && !profile.phone ? (
              <p className="mt-4 max-w-xs text-[0.8125rem] leading-relaxed text-bone-500">
                No public email or phone is published. The contact form is the monitored route.
              </p>
            ) : null}

            {profile.socialLinks.length > 0 ? (
              <ul className="mt-8 flex flex-wrap gap-3">
                {profile.socialLinks.map((link) => (
                  <li key={link.url}>
                    <ExternalTrackedLink
                      href={link.url}
                      event="external_link_click"
                      aria-label={link.label}
                      className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-bone-200 transition-colors duration-300 hover:border-bone-50 hover:bg-bone-50 hover:text-ink-950"
                    >
                      <SocialMark label={link.label} />
                    </ExternalTrackedLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        {/*
          The route list, kept as one hairline-separated strip rather than the
          three stacked columns it used to be. The closing band above is the
          part of the footer that is doing work; this is the index, and it
          should read as one.
        */}
        <nav
          aria-label="Footer"
          className="mt-20 grid gap-10 border-t border-white/10 pt-10 sm:grid-cols-3"
        >
          <div>
            <span
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-full border border-brass-400/60 font-serif text-[0.75rem] font-semibold text-brass-300"
            >
              SM
            </span>
            <p aria-hidden="true" className="mt-4 font-script text-3xl text-brass-100">
              {profile.fullName}
            </p>
            <p className="mt-2 max-w-[20ch] text-[0.8125rem] leading-relaxed text-bone-500">
              {profile.positioning}
            </p>
          </div>

          <div>
            <h3 className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-bone-500">
              Navigate
            </h3>
            <ul className="mt-5 flex flex-wrap gap-x-7 gap-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-[36px] items-center text-[0.9375rem] text-bone-300 transition-colors hover:text-bone-50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-bone-500">
              Ventures
            </h3>
            <ul className="mt-5 flex flex-wrap gap-x-7 gap-y-2">
              {ventureLinks.map((venture) => (
                <li key={venture.key}>
                  {venture.external ? (
                    <ExternalTrackedLink
                      href={venture.href}
                      event="external_link_click"
                      metadata={{ venture: venture.key }}
                      className="group inline-flex min-h-[36px] items-center gap-1.5 text-[0.9375rem] text-bone-300 transition-colors hover:text-bone-50"
                    >
                      {venture.label}
                      <ArrowUpRight
                        size={13}
                        aria-hidden="true"
                        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </ExternalTrackedLink>
                  ) : (
                    <Link
                      href={venture.href}
                      className="inline-flex min-h-[36px] items-center text-[0.9375rem] text-bone-300 transition-colors hover:text-bone-50"
                    >
                      {venture.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/*
          The disclosure the site has always carried. It reads as small print
          and it is small print, but it is the sentence that makes every
          unsourced claim on the page honest, so it stays above the fold of the
          micro-footer rather than in it.
        */}
        <p className="mt-10 max-w-2xl text-[0.8125rem] leading-relaxed text-bone-500">
          Details marked &ldquo;verification required&rdquo; are published only once a source is
          attached.
        </p>
        </div>
      </div>

      {/*
        The micro-footer: three groups on one hairline, all of it small caps.
        The centre line is the only piece of copy on the site with no
        informational job at all, which is exactly why it belongs down here.
      */}
      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-4 py-7 font-sans text-[0.6875rem] uppercase tracking-[0.16em] text-bone-500 md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {year} {profile.fullName}
          </p>

          <p className="text-bone-400">Built with Passion. Driven by Purpose.</p>

          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-bone-200">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
