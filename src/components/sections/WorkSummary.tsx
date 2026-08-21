import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { buttonClass } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import type { BusinessView, FacilityView } from '@/lib/content';
import { cn } from '@/lib/utils';

/**
 * Short summary of what Sonu Malik runs, with a direct route into each.
 *
 * One card per thing: the arena, then a card for every venture, each linking to
 * its own page rather than to a shared list. Counts are read from the live
 * content instead of being written into the copy, so they cannot drift out of
 * step with the facility and venture records.
 *
 * Copy is kept short on purpose. `flex-1` makes every card in a row match the
 * tallest one, so a long paragraph in a single card inflates all of them - the
 * cards summarise, and the detail lives on the page behind the link.
 */
export function WorkSummary({
  facilities,
  businesses,
}: {
  facilities: FacilityView[];
  businesses: BusinessView[];
}) {
  const sportsCount = facilities.filter((facility) => facility.group !== 'HOSPITALITY').length;

  // The arena has no card image of its own, so it borrows the first facility
  // photograph there is - in practice the cricket ground.
  const arenaImage = facilities.find((facility) => facility.imageUrl);

  const cards = [
    {
      key: 'red-ball',
      eyebrow: 'Sports Infrastructure',
      title: 'Red Ball Sports Arena',
      body: `A multi-sport arena in Rohtak founded and run by Sonu Malik, spanning ${sportsCount} sports facilities across cricket, racquet sports, outdoor games and fitness.`,
      href: '/red-ball',
      cta: 'Explore the arena',
      imageUrl: arenaImage?.imageUrl ?? null,
      imageAlt: arenaImage?.imageAlt ?? null,
      // Full width on its own row on a phone, then a third of the row from lg.
      wide: true,
    },
    ...businesses.map((business) => ({
      key: business.slug,
      eyebrow: business.category ?? business.role,
      title: business.name,
      // First sentence only: enough to place the venture, short enough that a
      // row of cards stays a modest, even height.
      body: `${business.description.split('. ')[0]!.replace(/\.$/, '')}.`,
      href: `/ventures/${business.slug}`,
      cta: 'View details',
      imageUrl: business.images[0]?.url ?? null,
      imageAlt: business.images[0]?.alt ?? null,
      wide: false,
    })),
  ];

  return (
    /*
      Two columns on a phone, three from lg. The arena spans both phone columns
      so it gets a row to itself and the two ventures pair up underneath -
      three cards abreast on a 375px screen left each one about 165px wide,
      which is roughly 26 characters a line.
    */
    <ul className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
      {cards.map((card, index) => (
        <Reveal
          as="li"
          key={card.key}
          delay={index * 80}
          className={cn('block', card.wide && 'col-span-2 lg:col-span-1')}
        >
          <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl2 border border-ink-700 bg-ink-900 transition-[border-color,transform] duration-300 ease-editorial hover:-translate-y-1 hover:border-ink-600">
            {card.imageUrl ? (
              <div className="relative aspect-[16/10] w-full border-b border-ink-700 bg-ink-950">
                <Image
                  src={card.imageUrl}
                  alt={card.imageAlt ?? card.title}
                  fill
                  sizes={
                    card.wide
                      ? '(min-width: 1600px) 485px, (min-width: 1024px) 31vw, 94vw'
                      : '(min-width: 1600px) 485px, (min-width: 1024px) 31vw, 47vw'
                  }
                  quality={90}
                  className="object-cover transition-transform duration-500 ease-editorial group-hover:scale-[1.03]"
                />
              </div>
            ) : null}

            <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-7">
              <p className="eyebrow break-words">{card.eyebrow}</p>

              <h3 className="mt-3 break-words font-display text-lg text-bone-50 sm:text-2xl">
                {card.title}
              </h3>

              <p className="mt-2.5 line-clamp-4 flex-1 text-[0.875rem] leading-relaxed text-bone-400 sm:mt-4 sm:line-clamp-3 sm:text-[0.9375rem]">
                {card.body}
              </p>

              <div className="mt-5 sm:mt-6">
                <Link href={card.href} className={buttonClass('secondary', 'sm', 'w-fit max-w-full')}>
                  <span className="truncate">{card.cta}</span>
                  <ArrowRight size={15} aria-hidden="true" className="shrink-0" />
                </Link>
              </div>
            </div>
          </article>
        </Reveal>
      ))}
    </ul>
  );
}
