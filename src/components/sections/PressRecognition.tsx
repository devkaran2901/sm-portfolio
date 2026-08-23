'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

import { ExternalTrackedLink } from '@/components/site/ExternalTrackedLink';
import { EmptyState } from '@/components/ui/Primitives';
import { Reveal } from '@/components/ui/Reveal';
import type { MediaView } from '@/lib/content';
import { cn } from '@/lib/utils';

/**
 * Press, on the one light ground on the site.
 *
 * The colour reversal is the point. Everything above and below this is navy, so
 * a paper-white band reads the way a cutting does against a dark page - and
 * mastheads, which are almost always black on white, stop having to be knocked
 * out to sit on the page.
 *
 * There is no invented content here. The site publishes an article only once a
 * source has been attached in the admin portal, so an empty archive says so
 * rather than filling the row with plausible-looking headlines.
 */

/** Cards per page. Three is what the row holds at the widest breakpoint. */
const PAGE_SIZE = 3;

function formatDate(value: Date | null): string | null {
  if (!value) return null;
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(value);
}

export function PressRecognition({ articles }: { articles: MediaView[] }) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(articles.length / PAGE_SIZE));
  const visible = articles.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  if (articles.length === 0) {
    return (
      <EmptyState
        tone="light"
        title="The archive opens with its first source"
        description="Coverage is published here once the clipping, the link or the recording behind it has been attached in the admin portal. Nothing is listed on the strength of a recollection."
        action={
          <Link
            href="/media"
            className="cta-link"
          >
            View the media archive
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
        {visible.map((article, index) => {
          const published = formatDate(article.publishedOn);

          return (
            <Reveal as="li" key={article.id} delay={index * 90} className="block">
              <article className="group flex h-full flex-col">
                {/*
                  The masthead, boxed on paper-white rather than bled to the
                  card edge. A publication logo is artwork with its own margins,
                  and cropping it to fill a frame is the one thing that makes a
                  real cutting look fabricated.
                */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-card border border-paper-200 bg-paper-50">
                  {article.thumbnailUrl ? (
                    <Image
                      src={article.thumbnailUrl}
                      alt={article.thumbnailAlt ?? article.publication ?? article.title}
                      fill
                      sizes="(min-width: 1024px) 31vw, (min-width: 640px) 47vw, 92vw"
                      className="object-contain p-8 transition-transform duration-500 ease-editorial group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="grid h-full place-items-center px-6">
                      <p className="text-center font-serif text-2xl leading-tight text-paper-900">
                        {article.publication ?? 'Publication'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-1 flex-col">
                  <p className="font-sans text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-brass-400">
                    {[article.publication, published].filter(Boolean).join(' · ')}
                  </p>

                  <h3 className="mt-4 font-serif text-xl leading-snug text-paper-900">
                    {article.title}
                  </h3>

                  {article.description ? (
                    <p className="mt-3 line-clamp-3 flex-1 text-[0.9375rem] leading-relaxed text-paper-600">
                      {article.description}
                    </p>
                  ) : (
                    <div className="flex-1" />
                  )}

                  <div className="mt-6">
                    {article.externalUrl ? (
                      <ExternalTrackedLink
                        href={article.externalUrl}
                        event="external_link_click"
                        metadata={{ article: article.slug }}
                        className="cta-link"
                      >
                        Read Article
                        <ArrowRight size={14} aria-hidden="true" />
                      </ExternalTrackedLink>
                    ) : (
                      <Link href={`/media#${article.slug}`} className="cta-link">
                        Read Article
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </ul>

      {/*
        Pagination is drawn only when there is a second page. A pair of arrows
        that can never do anything is worse than no arrows: it reads as a
        broken control rather than as the end of the list.
      */}
      {pageCount > 1 ? (
        <div className="mt-12 flex items-center gap-4 border-t border-paper-200 pt-8">
          {[
            { label: 'Previous articles', delta: -1, Icon: ChevronLeft },
            { label: 'Next articles', delta: 1, Icon: ChevronRight },
          ].map(({ label, delta, Icon }) => {
            const target = page + delta;
            const disabled = target < 0 || target >= pageCount;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setPage(target)}
                disabled={disabled}
                aria-label={label}
                className={cn(
                  'grid h-11 w-11 place-items-center rounded-full border transition-colors duration-300',
                  disabled
                    ? 'cursor-not-allowed border-paper-200 text-paper-300'
                    : 'border-paper-300 text-paper-900 hover:border-paper-900 hover:bg-paper-900 hover:text-paper',
                )}
              >
                <Icon size={17} aria-hidden="true" />
              </button>
            );
          })}

          <p className="ml-2 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.18em] tabular-nums text-paper-600">
            {String(page + 1).padStart(2, '0')} / {String(pageCount).padStart(2, '0')}
          </p>
        </div>
      ) : null}
    </div>
  );
}
