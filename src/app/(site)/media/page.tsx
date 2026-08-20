import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, FileText } from 'lucide-react';

import { PageHeader } from '@/components/site/PageHeader';
import { ExternalTrackedLink } from '@/components/site/ExternalTrackedLink';
import { ContactCta } from '@/components/sections/CallToAction';
import { JsonLd } from '@/components/ui/JsonLd';
import { Badge, EmptyState, MediaPlaceholder, Section, SectionHeading } from '@/components/ui/Primitives';
import { Reveal } from '@/components/ui/Reveal';
import { MEDIA_CATEGORY_LABELS, MEDIA_TYPE_LABELS } from '@/content/defaults';
import { getEvidenceSummary, getMedia, getVerifiedReferences } from '@/lib/content';
import { articleSchema, breadcrumbSchema } from '@/lib/schema-org';
import { breadcrumbsFor, buildMetadata } from '@/lib/seo';
import { cn, formatDate } from '@/lib/utils';

export const metadata: Metadata = buildMetadata({
  title: 'Media, Press & Verified References | Sonu Malik',
  description:
    'Press coverage, interviews and verified public references relating to Sonu Malik and Red Ball Cricket Ground in Rohtak, Haryana.',
  path: '/media',
});

// Press items change whenever an admin publishes one, so this page is dynamic.
export const dynamic = 'force-dynamic';

const CATEGORIES = ['ALL', ...Object.keys(MEDIA_CATEGORY_LABELS)] as const;

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const active = CATEGORIES.includes((params.category ?? 'ALL') as never)
    ? (params.category ?? 'ALL')
    : 'ALL';

  const [items, references, summary] = await Promise.all([
    getMedia(active),
    getVerifiedReferences(),
    getEvidenceSummary(),
  ]);

  const breadcrumbs = breadcrumbsFor('/media', 'Media');

  return (
    <>
      <PageHeader
        eyebrow="Media & Press"
        title="Coverage, references and the evidence behind them."
        lead="This archive publishes genuine material only. Nothing here is reconstructed, illustrated or approximated."
        breadcrumbs={breadcrumbs}
      />

      {/* The honest state of the archive, up front. */}
      <Section className="py-12">
        <div className="shell">
          <div className="grid grid-cols-3 gap-4 rounded-xl2 border border-ink-700/70 bg-ink-900/50 p-6 sm:gap-6 sm:p-8">
            {[
              { label: 'Verified references', value: summary.verified },
              { label: 'Under review', value: summary.underReview },
              { label: 'Claims awaiting a source', value: summary.open },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-3xl text-brass-200 tabular-nums">{stat.value}</p>
                <p className="mt-1.5 text-xs uppercase tracking-[0.12em] text-bone-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="coverage" className="pt-0">
        <div className="shell">
          <SectionHeading
            eyebrow="Press Archive"
            title="Articles, clippings and interviews"
            lead="Filter by subject. Each item carries its publication, date and source link where one exists."
          />

          <nav aria-label="Filter media by category" className="mt-10 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const label =
                category === 'ALL'
                  ? 'All'
                  : MEDIA_CATEGORY_LABELS[category as keyof typeof MEDIA_CATEGORY_LABELS];
              const isActive = category === active;
              return (
                <Link
                  key={category}
                  href={category === 'ALL' ? '/media' : `/media?category=${category}`}
                  aria-current={isActive ? 'true' : undefined}
                  scroll={false}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                    isActive
                      ? 'border-brass-400/60 bg-brass-700/20 text-brass-100'
                      : 'border-ink-700 text-bone-400 hover:border-ink-500 hover:text-bone-200',
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-10">
            {items.length === 0 ? (
              <EmptyState
                title="No published coverage yet"
                description="Genuine articles, clippings, interviews and videos appear here once they have been uploaded and reviewed in the admin portal. This space is deliberately left empty rather than filled with placeholder coverage."
              />
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
                {items.map((item, index) => (
                  <Reveal as="li" key={item.id} delay={Math.min(index * 55, 260)}>
                    <article className="flex h-full flex-col overflow-hidden rounded-xl2 border border-ink-700/70 bg-ink-900/60 transition-colors hover:border-brass-500/40">
                      {item.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- uploaded assets are arbitrary external URLs
                        <img
                          src={item.thumbnailUrl}
                          alt={item.thumbnailAlt ?? item.title}
                          loading="lazy"
                          className="aspect-[16/10] w-full object-cover"
                        />
                      ) : (
                        <MediaPlaceholder
                          label="Clipping to be attached"
                          aspect="aspect-[16/10]"
                          className="rounded-none border-0 border-b border-dashed border-ink-700"
                        />
                      )}

                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone="neutral">
                            {MEDIA_TYPE_LABELS[item.mediaType as keyof typeof MEDIA_TYPE_LABELS] ??
                              item.mediaType}
                          </Badge>
                          {item.status === 'VERIFIED' ? <Badge tone="turf">Verified</Badge> : null}
                        </div>

                        <h3 className="mt-3.5 font-display text-base leading-snug text-bone-50">
                          {item.title}
                        </h3>

                        <p className="mt-2 text-xs text-bone-500">
                          {[item.publication, item.publishedOn ? formatDate(item.publishedOn) : null]
                            .filter(Boolean)
                            .join(' · ') || 'Publication details pending'}
                        </p>

                        {item.description ? (
                          <p className="mt-3 flex-1 text-sm leading-relaxed text-bone-400">
                            {item.description}
                          </p>
                        ) : (
                          <div className="flex-1" />
                        )}

                        <div className="mt-4 flex items-center justify-between gap-3">
                          {item.externalUrl ? (
                            <ExternalTrackedLink
                              href={item.externalUrl}
                              event="media_open"
                              metadata={{ media: item.slug }}
                              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brass-200 hover:text-brass-100"
                            >
                              Read source
                              <ArrowUpRight size={14} aria-hidden="true" />
                            </ExternalTrackedLink>
                          ) : (
                            <span className="text-xs text-bone-500">Source link pending</span>
                          )}

                          {item.evidenceCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs text-bone-500">
                              <FileText size={12} aria-hidden="true" />
                              {item.evidenceCount}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Section>

      <Section id="references" tone="raised">
        <div className="shell">
          <SectionHeading
            eyebrow="Verified Public References"
            title="Claims with a source attached"
            lead="Each entry pairs a specific public claim with the publication, date and link that supports it. Claims without a source are not listed here as verified."
          />

          <div className="mt-10">
            {references.length === 0 ? (
              <EmptyState
                title="No verified references published yet"
                description="Sources are being collected. When a claim has a publication, date and retrievable reference attached, it is marked verified in the admin portal and appears here automatically."
              />
            ) : (
              <ul className="divide-y divide-ink-800 border-y border-ink-800">
                {references.map((reference) => (
                  <li key={reference.id} className="flex flex-col gap-2 py-5 sm:flex-row sm:gap-8">
                    <div className="sm:w-2/3">
                      <p className="text-[0.9375rem] leading-relaxed text-bone-100">
                        {reference.claim}
                      </p>
                    </div>
                    <div className="sm:w-1/3 sm:text-right">
                      <p className="text-sm text-bone-300">{reference.publication ?? 'Source on file'}</p>
                      <p className="mt-1 text-xs text-bone-500">
                        {reference.publishedOn ? formatDate(reference.publishedOn) : 'Date pending'}
                      </p>
                      {reference.sourceUrl ? (
                        <ExternalTrackedLink
                          href={reference.sourceUrl}
                          event="external_link_click"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brass-200 hover:text-brass-100"
                        >
                          View source
                          <ArrowUpRight size={12} aria-hidden="true" />
                        </ExternalTrackedLink>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-12 rounded-xl2 border border-dashed border-ink-600 bg-ink-900/40 p-6 sm:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-bone-100">
              About this archive
            </h3>
            <div className="prose-editorial mt-4 max-w-3xl text-sm">
              <p>
                This section exists to collect verifiable public references in a structured way:
                claim, publication, date, URL and uploaded clipping, each with a review status.
              </p>
              <p>
                No newspaper coverage, interview, quotation, certificate, award or statistic is
                published here unless it genuinely exists and has been supplied. Nothing on this
                site asserts Wikipedia notability or the existence of a Wikipedia article.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <ContactCta />
      </Section>

      <JsonLd
        data={[
          breadcrumbSchema(breadcrumbs),
          ...items.filter((item) => item.status === 'VERIFIED').map((item) => articleSchema(item)),
        ]}
      />
    </>
  );
}
