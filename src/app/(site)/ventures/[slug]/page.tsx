import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';

import { PageHeader } from '@/components/site/PageHeader';
import { ExternalTrackedLink } from '@/components/site/ExternalTrackedLink';
import { ContactCta } from '@/components/sections/CallToAction';
import { JsonLd } from '@/components/ui/JsonLd';
import { MediaPlaceholder, Section } from '@/components/ui/Primitives';
import { buttonClass } from '@/components/ui/Button';
import { getBusiness, getBusinesses } from '@/lib/content';
import { breadcrumbSchema, organisationSchema } from '@/lib/schema-org';
import { buildMetadata } from '@/lib/seo';
import { safeExternalUrl } from '@/lib/utils';

/**
 * One page per venture.
 *
 * Everything shown is drawn from the business record. Where a field has not
 * been supplied the page says so plainly rather than filling the space - a
 * venture page that invents an address or a phone number is exactly the failure
 * this project is built to avoid.
 */

export async function generateStaticParams() {
  const businesses = await getBusinesses();
  return businesses.map((business) => ({ slug: business.slug }));
}

/*
 * Only the slugs above exist; anything else is a hard 404.
 *
 * Left on the default, an unknown slug renders on demand, `notFound()` fires,
 * and the result is prerendered and cached as a 200 - a soft 404 that search
 * engines will index. Calling notFound() from generateMetadata does not stop
 * that either.
 *
 * The cost is that a venture added in the admin portal needs a redeploy before
 * its page exists, which is already true of generateStaticParams and of the
 * sitemap entries built alongside it.
 */
export const dynamicParams = false;

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusiness(slug);

  // Bail out here, not just in the component. Returning metadata for an unknown
  // slug lets the render succeed, and the result gets prerendered and cached as
  // a 200 - a soft 404 that search engines will happily index.
  if (!business) notFound();

  return buildMetadata({
    title: `${business.name} | ${business.role}, Sonu Malik`,
    description: business.description.slice(0, 300),
    path: `/ventures/${business.slug}`,
    keywords: [business.name, `${business.name} Rohtak`, 'Sonu Malik business'],
  });
}

export default async function VenturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [business, all] = await Promise.all([getBusiness(slug), getBusinesses()]);

  if (!business) notFound();

  const others = all.filter((item) => item.slug !== business.slug);
  const website = safeExternalUrl(business.websiteUrl);
  const booking = safeExternalUrl(business.bookingUrl);

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Ventures', path: '/ventures' },
    { name: business.name, path: `/ventures/${business.slug}` },
  ];

  const details = [
    business.location ? { icon: MapPin, label: 'Location', value: business.location } : null,
    business.contactEmail ? { icon: Mail, label: 'Email', value: business.contactEmail } : null,
    business.contactPhone ? { icon: Phone, label: 'Phone', value: business.contactPhone } : null,
  ].filter(Boolean) as Array<{ icon: typeof MapPin; label: string; value: string }>;

  return (
    <>
      <PageHeader
        eyebrow={business.role}
        title={business.name}
        lead={business.category ? `${business.category} venture in Rohtak, Haryana.` : undefined}
        breadcrumbs={breadcrumbs}
      />

      <Section>
        <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            {business.images?.length ? (
              <Image
                src={business.images[0]!.url}
                alt={business.images[0]!.alt}
                width={1200}
                height={675}
                className="aspect-[16/9] w-full rounded-xl2 object-cover"
              />
            ) : (
              <MediaPlaceholder
                label={`${business.name} photography`}
                aspect="aspect-[16/9]"
              />
            )}

            <div className="prose-editorial mt-8">
              <p>{business.description}</p>
            </div>

            {(website || booking) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {website ? (
                  <ExternalTrackedLink
                    href={website}
                    event="business_link_click"
                    metadata={{ business: business.slug, target: 'website' }}
                    className={buttonClass('primary', 'md')}
                  >
                    Visit website
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </ExternalTrackedLink>
                ) : null}
                {booking ? (
                  <ExternalTrackedLink
                    href={booking}
                    event="business_link_click"
                    metadata={{ business: business.slug, target: 'booking' }}
                    className={buttonClass('secondary', 'md')}
                  >
                    Book
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </ExternalTrackedLink>
                ) : null}
              </div>
            )}
          </div>

          <aside className="lg:col-span-5">
            <div className="surface p-6 sm:p-7">
              <h2 className="font-serif text-xl text-bone-50">Details</h2>

              {details.length > 0 ? (
                <ul className="mt-5 space-y-4">
                  {details.map((detail) => (
                    <li key={detail.label} className="flex items-start gap-3">
                      <detail.icon
                        size={15}
                        aria-hidden="true"
                        className="mt-1 shrink-0 text-brass-300"
                      />
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.12em] text-bone-500">
                          {detail.label}
                        </p>
                        <p className="mt-0.5 break-words text-[0.9375rem] text-bone-200">
                          {detail.value}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-bone-500">
                  Location, contact details and booking links have not been published yet. They are
                  added from the admin portal once confirmed, rather than estimated here.
                </p>
              )}

              {business.socialLinks.length > 0 ? (
                <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-ink-800 pt-5">
                  {business.socialLinks.map((link) => (
                    <li key={link.url}>
                      <ExternalTrackedLink
                        href={link.url}
                        event="business_link_click"
                        metadata={{ business: business.slug }}
                        className="text-sm text-brass-200 hover:text-brass-100"
                      >
                        {link.label}
                      </ExternalTrackedLink>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {others.length > 0 ? (
              <div className="surface mt-6 p-6 sm:p-7">
                <h2 className="font-serif text-xl text-bone-50">Other ventures</h2>
                <ul className="mt-4 space-y-1">
                  {others.map((other) => (
                    <li key={other.slug}>
                      <Link
                        href={`/ventures/${other.slug}`}
                        className="flex min-h-[44px] items-center justify-between gap-3 text-[0.9375rem] text-bone-300 transition-colors hover:text-brass-200"
                      >
                        <span className="min-w-0 break-words">{other.name}</span>
                        <ArrowUpRight size={14} aria-hidden="true" className="shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </Section>

      <Section>
        <ContactCta />
      </Section>

      <JsonLd data={[organisationSchema(business), breadcrumbSchema(breadcrumbs)]} />
    </>
  );
}
