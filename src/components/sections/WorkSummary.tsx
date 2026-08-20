import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { buttonClass } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import type { BusinessView, FacilityView } from '@/lib/content';

/**
 * Short summary of what Sonu Malik runs, with a direct route into each.
 *
 * Two cards, each a few lines and a link: the arena and the businesses. Figures
 * are counted from the live content rather than written into the copy, so the
 * numbers cannot drift out of step with the facility and venture records.
 */
export function WorkSummary({
  facilities,
  businesses,
}: {
  facilities: FacilityView[];
  businesses: BusinessView[];
}) {
  const sportsCount = facilities.filter((facility) => facility.group !== 'HOSPITALITY').length;
  const ventureNames = businesses.map((business) => business.name).join(' and ');

  const cards = [
    {
      key: 'red-ball',
      eyebrow: 'Sports Infrastructure',
      title: 'Red Ball Sports Arena',
      body: `A multi-sport arena in Rohtak, Haryana, founded and run by Sonu Malik for approximately six years. It began as a cricket ground and now spans ${sportsCount} sports facilities — cricket grounds and an academy, racquet sports, outdoor games, fitness and aquatics — alongside an on-site restaurant.`,
      href: '/red-ball',
      cta: 'Explore the arena',
    },
    {
      key: 'ventures',
      eyebrow: 'Business Ventures',
      title: ventureNames || 'Business Ventures',
      body: businesses.length
        ? `Founder and owner of ${ventureNames}, run alongside the sports infrastructure work. Details, imagery and links are published as they are confirmed.`
        : 'Business ventures are published from the admin portal once their details are confirmed.',
      href: '/ventures',
      cta: 'See the ventures',
    },
  ];

  return (
    <ul className="grid grid-cols-2 gap-4 sm:gap-6">
      {cards.map((card, index) => (
        <Reveal as="li" key={card.key} delay={index * 90} className="block">
          <article className="group flex h-full flex-col rounded-xl2 border border-ink-700 bg-ink-900 p-8 transition-[border-color,transform] duration-300 ease-editorial hover:-translate-y-1 hover:border-ink-600 sm:p-10">
            <p className="eyebrow">{card.eyebrow}</p>

            <h3 className="mt-4 font-display text-display-sm text-bone-50">{card.title}</h3>

            <p className="mt-5 flex-1 text-[1.0625rem] leading-relaxed text-bone-400">
              {card.body}
            </p>

            <div className="mt-8">
              <Link href={card.href} className={buttonClass('secondary', 'md', 'w-fit')}>
                {card.cta}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </article>
        </Reveal>
      ))}
    </ul>
  );
}
