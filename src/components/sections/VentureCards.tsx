import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';

import { ExternalTrackedLink } from '@/components/site/ExternalTrackedLink';
import { buttonClass } from '@/components/ui/Button';
import { MediaPlaceholder } from '@/components/ui/Primitives';
import { Reveal } from '@/components/ui/Reveal';
import type { BusinessView } from '@/lib/content';
import { safeExternalUrl } from '@/lib/utils';

/**
 * Business venture cards.
 *
 * Contact details, locations, booking links and imagery are rendered only when
 * they exist. Missing fields show as an explicit "to be added" line rather than
 * a plausible-looking invention.
 */
export function VentureCards({ businesses }: { businesses: BusinessView[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:gap-8">
      {businesses.map((business, index) => {
        const website = safeExternalUrl(business.websiteUrl);
        const booking = safeExternalUrl(business.bookingUrl);
        const details = [
          business.location ? { icon: MapPin, label: business.location } : null,
          business.contactEmail ? { icon: Mail, label: business.contactEmail } : null,
          business.contactPhone ? { icon: Phone, label: business.contactPhone } : null,
        ].filter(Boolean) as Array<{ icon: typeof MapPin; label: string }>;

        return (
          <Reveal as="li" key={business.id} delay={index * 90}>
            <article
              id={business.slug}
              className="flex h-full scroll-mt-28 flex-col overflow-hidden rounded-xl2 border border-ink-700/70 bg-ink-900/60 transition-all duration-300 ease-editorial hover:border-brass-500/40 hover:shadow-lift"
            >
              <MediaPlaceholder
                label={`${business.name} photography`}
                aspect="aspect-[16/9]"
                className="rounded-none border-0 border-b border-dashed border-ink-700"
              />

              <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">{business.role}</p>
                    <h3 className="mt-3 break-words font-display text-xl text-bone-50 sm:text-2xl">{business.name}</h3>
                    {business.category ? (
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-bone-500">
                        {business.category}
                      </p>
                    ) : null}
                  </div>

                  {business.logoUrl ? (
                    <Image
                      src={business.logoUrl}
                      alt={`${business.name} logo`}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-lg object-contain"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-dashed border-ink-600 text-[0.625rem] uppercase tracking-wider text-bone-500"
                    >
                      Logo
                    </span>
                  )}
                </div>

                <p className="mt-3 line-clamp-4 flex-1 text-[0.875rem] leading-relaxed text-bone-400 sm:mt-4 sm:line-clamp-none sm:text-[0.9375rem]">
                  {business.description}
                </p>

                {details.length > 0 ? (
                  <ul className="mt-6 space-y-2.5">
                    {details.map((detail) => (
                      <li key={detail.label} className="flex items-center gap-2.5 text-sm text-bone-300">
                        <detail.icon size={14} aria-hidden="true" className="shrink-0 text-brass-300" />
                        {detail.label}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-6 text-xs uppercase tracking-[0.12em] text-bone-500">
                    Location and contact details to be added
                  </p>
                )}

                <div className="mt-6">
                  <Link
                    href={`/ventures/${business.slug}`}
                    className={buttonClass('secondary', 'sm', 'w-fit')}
                  >
                    View details
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                </div>

                {(website || booking) && (
                  <div className="mt-7 flex flex-wrap gap-4">
                    {website ? (
                      <ExternalTrackedLink
                        href={website}
                        event="business_link_click"
                        metadata={{ business: business.slug, target: 'website' }}
                        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brass-200 transition-colors hover:text-brass-100"
                      >
                        Visit website
                        <ArrowUpRight
                          size={15}
                          aria-hidden="true"
                          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </ExternalTrackedLink>
                    ) : null}
                    {booking ? (
                      <ExternalTrackedLink
                        href={booking}
                        event="business_link_click"
                        metadata={{ business: business.slug, target: 'booking' }}
                        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-bone-200 transition-colors hover:text-bone-50"
                      >
                        Booking
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </ExternalTrackedLink>
                    ) : null}
                  </div>
                )}
              </div>
            </article>
          </Reveal>
        );
      })}
    </ul>
  );
}
