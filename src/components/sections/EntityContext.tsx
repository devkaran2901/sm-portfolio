import Link from 'next/link';

import type { FaqView, ProfileView } from '@/lib/content';

/**
 * Generative Engine Optimisation surfaces.
 *
 * Two ideas, both plain HTML:
 *
 *  1. `AnswerBlocks` states the core facts as short, self-contained
 *     question/answer pairs. Generative engines quote passages, not pages, so a
 *     passage that answers one question completely is far more citable than the
 *     same fact buried in prose.
 *  2. `EntityWeb` links the named entities to the pages that discuss them, so
 *     the relationships between Sonu Malik, Rohtak, Red Ball and the ventures
 *     are explicit in the link graph rather than only implied by the copy.
 *
 * Neither invents content to chase a query. Every line is drawn from the same
 * verified facts the rest of the site uses.
 */

export function AnswerBlocks({ faqs, limit = 5 }: { faqs: FaqView[]; limit?: number }) {
  const items = faqs.slice(0, limit);

  return (
    <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
      {items.map((faq) => (
        <div key={faq.slug} className="border-l-2 border-turf-700/60 pl-5">
          <dt className="font-display text-lg text-bone-50">{faq.question}</dt>
          <dd className="mt-2 text-[0.9375rem] leading-relaxed text-bone-300">{faq.answer}</dd>
        </div>
      ))}
    </dl>
  );
}

type EntityGroup = { heading: string; items: Array<{ label: string; href?: string; note?: string }> };

export function EntityWeb({ profile }: { profile: ProfileView }) {
  const groups: EntityGroup[] = [
    {
      heading: 'Places',
      items: [
        { label: profile.birthPlace ?? 'Mokhra, Rohtak, Haryana', note: 'Birthplace' },
        { label: 'Rohtak, Haryana', note: 'Current base' },
        { label: 'India', note: 'Country' },
      ],
    },
    {
      heading: 'Education',
      items: [
        { label: profile.educationBody ?? 'Kalinga University', note: profile.education ?? 'LLM' },
        { label: 'Vaish College', note: 'Collegiate cricket', href: '/cricket' },
      ],
    },
    {
      heading: 'Cricket',
      items: [
        { label: 'South Africa — Dolphin Club', href: '/cricket#country-za' },
        { label: 'Nepal — club cricket', href: '/cricket#country-np' },
        { label: 'Norway — Norwegian Cup', href: '/cricket#country-no' },
      ],
    },
    {
      heading: 'Sports infrastructure',
      items: [
        { label: 'Red Ball Cricket Ground', href: '/red-ball' },
        { label: 'Cricket academies & grounds', href: '/red-ball#facilities' },
        { label: 'Players & impact', href: '/players' },
      ],
    },
    {
      heading: 'Ventures',
      items: [
        { label: 'The Page', href: '/ventures#the-page' },
        { label: 'Hotel The Prada', href: '/ventures#hotel-the-prada' },
      ],
    },
  ];

  return (
    <nav aria-label="Related topics" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
      {groups.map((group) => (
        <div key={group.heading}>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-300">
            {group.heading}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {group.items.map((item) => (
              <li key={item.label} className="text-sm leading-snug">
                {item.href ? (
                  <Link href={item.href} className="text-bone-200 transition-colors hover:text-brass-200">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-bone-200">{item.label}</span>
                )}
                {item.note ? (
                  <span className="mt-0.5 block text-xs text-bone-500">{item.note}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
