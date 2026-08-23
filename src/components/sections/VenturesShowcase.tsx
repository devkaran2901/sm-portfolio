import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { MediaPlaceholder } from '@/components/ui/Primitives';
import { Reveal } from '@/components/ui/Reveal';
import type { BusinessView, FacilityView } from '@/lib/content';

/**
 * The three things he runs, as three numbered plates.
 *
 * Each card is a photograph first: the image fills the frame, a gradient is
 * laid over its lower half, and the title sits in that gradient rather than in
 * a panel beneath it. That is the whole difference between this and a normal
 * content card - there is no body copy, because a venture summarised in forty
 * words reads worse than a venture shown.
 *
 * The numerals are the editorial device. 01/02/03 in the display serif in the
 * top corner turn three separate businesses into one sequence, and the reader
 * gets a count for free.
 */
export function VenturesShowcase({
  facilities,
  businesses,
}: {
  facilities: FacilityView[];
  businesses: BusinessView[];
}) {
  // The arena has no card image of its own, so it borrows the first facility
  // photograph there is - in practice the cricket ground.
  const arenaImage = facilities.find((facility) => facility.imageUrl);
  const sportsCount = facilities.filter((facility) => facility.group !== 'HOSPITALITY').length;

  const cards = [
    {
      key: 'red-ball',
      title: 'Red Ball Sports Arena',
      category: `Sports Infrastructure · ${sportsCount} facilities`,
      href: '/red-ball',
      imageUrl: arenaImage?.imageUrl ?? null,
      imageAlt: arenaImage?.imageAlt ?? null,
    },
    ...businesses.map((business) => ({
      key: business.slug,
      title: business.name,
      category: business.category ?? business.role,
      href: `/ventures/${business.slug}`,
      imageUrl: business.images[0]?.url ?? null,
      imageAlt: business.images[0]?.alt ?? null,
    })),
  ];

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {cards.map((card, index) => (
        <Reveal as="li" key={card.key} delay={index * 90} className="block">
          <Link
            href={card.href}
            className="group relative block h-full overflow-hidden rounded-card border border-white/10 bg-ink-900 transition-[transform,border-color,box-shadow] duration-500 ease-editorial hover:-translate-y-1.5 hover:border-white/25 hover:shadow-lift"
          >
            <div className="relative aspect-[3/4] w-full sm:aspect-[4/5]">
              {card.imageUrl ? (
                <Image
                  src={card.imageUrl}
                  alt={card.imageAlt ?? card.title}
                  fill
                  sizes="(min-width: 1600px) 500px, (min-width: 1024px) 31vw, (min-width: 640px) 47vw, 92vw"
                  quality={90}
                  className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.06]"
                />
              ) : (
                <MediaPlaceholder
                  label={`${card.title} photograph`}
                  aspect="h-full w-full"
                  className="rounded-none border-0"
                />
              )}

              {/*
                Two overlays doing two jobs. The first is a flat wash that keeps
                the numeral legible over a bright sky; the second is the bottom
                gradient the title sits in, opaque enough at the foot to carry
                white type over any photograph and gone by the halfway line so
                the picture is still a picture.
              */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-ink-950/25 transition-opacity duration-500 group-hover:bg-ink-950/10"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink-950 via-ink-950/80 to-transparent"
              />
            </div>

            <span
              aria-hidden="true"
              className="absolute left-6 top-6 font-serif text-[1.75rem] font-medium leading-none text-bone-50/85 transition-colors duration-500 group-hover:text-bone-50"
            >
              {String(index + 1).padStart(2, '0')}
            </span>

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-7">
              <div className="min-w-0">
                {/*
                  Caps rather than title case, and the serif rather than the
                  sans. At this size the two words of a venture name are the
                  loudest thing on the card and they should read as a plate on a
                  building, not as a link.
                */}
                <h3 className="break-words font-serif text-[1.375rem] font-semibold uppercase leading-[1.15] tracking-[0.04em] text-bone-50 sm:text-2xl">
                  {card.title}
                </h3>
                <p className="mt-2.5 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-bone-400">
                  {card.category}
                </p>
              </div>

              <span
                aria-hidden="true"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/30 text-bone-50 transition-[background-color,color,border-color] duration-300 group-hover:border-brass-400 group-hover:bg-brass-400 group-hover:text-bone-50"
              >
                <ArrowUpRight size={17} />
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}
