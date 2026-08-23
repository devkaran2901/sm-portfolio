'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

import { buttonClass } from '@/components/ui/Button';
import { MediaPlaceholder } from '@/components/ui/Primitives';
import type { FacilityView } from '@/lib/content';
import { cn } from '@/lib/utils';

/**
 * Red Ball, given the room the other two ventures do not get.
 *
 * Two columns: the argument on the left, the evidence on the right. The right
 * column is a carousel over the facility photographs rather than a grid of
 * them, because the grid already exists on the arena page and repeating it here
 * would make this section a table of contents for that one.
 *
 * The filmstrip under the main frame is the control as well as the preview - a
 * reader who wants a specific facility clicks it directly, and the arrows are
 * for the reader who is just looking.
 */

/** How many thumbnails the strip shows. Beyond this it becomes a scroller. */
const STRIP_LENGTH = 5;

/**
 * The four claims made beside the photographs.
 *
 * Built from the facility records rather than written out, so the counts and
 * the names cannot drift from what the arena page lists. The first two are the
 * facilities that carry a quantity; the last two are the groups, named.
 */
function buildFacts(facilities: FacilityView[]) {
  const counted = facilities
    .filter((facility) => facility.quantity && facility.quantity > 0)
    .slice(0, 2)
    .map((facility) => ({
      key: facility.slug,
      value: String(facility.quantity),
      label: facility.unitLabel ?? facility.name,
    }));

  const named = (groups: Array<FacilityView['group']>, label: string) => {
    const names = facilities
      .filter((facility) => groups.includes(facility.group))
      .map((facility) => facility.name);
    return names.length > 0 ? [{ key: label, value: names.join(', '), label }] : [];
  };

  return [
    ...counted,
    ...named(['RACQUET'], 'Racquet Sports'),
    ...named(['FITNESS', 'HOSPITALITY'], 'Fitness & Hospitality'),
  ];
}

export function FeaturedVenture({
  facilities,
  description,
}: {
  facilities: FacilityView[];
  description: string;
}) {
  const shots = facilities.filter(
    (facility): facility is FacilityView & { imageUrl: string } => Boolean(facility.imageUrl),
  );
  const [active, setActive] = useState(0);

  const facts = buildFacts(facilities);
  const current = shots[active];

  const step = (delta: number) =>
    setActive((index) => (index + delta + shots.length) % shots.length);

  /*
   * The window the strip shows.
   *
   * It follows the active frame rather than paging: the active thumbnail is
   * kept inside the five on screen, and the window slides only when the
   * selection would otherwise leave it. Paging would move four thumbnails the
   * reader was not looking at every time they pressed an arrow once.
   */
  const stripStart = Math.max(0, Math.min(active - 2, shots.length - STRIP_LENGTH));
  const strip = shots.slice(stripStart, stripStart + STRIP_LENGTH);

  return (
    <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-5">
        <p className="eyebrow">Featured Venture</p>
        <h2 className="mt-5 font-serif text-[clamp(2rem,4.4vw,3.25rem)] font-semibold uppercase leading-[1.08] tracking-[0.02em] text-bone-50">
          Red Ball Sports Arena
        </h2>
        <p className="mt-6 max-w-xl text-[1.0625rem] leading-[1.7] text-bone-300">{description}</p>

        {facts.length > 0 ? (
          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-white/10 pt-10">
            {facts.map((fact) => (
              <div key={fact.key}>
                <dd
                  className={cn(
                    'font-serif text-bone-50',
                    // A count and a list are the same field at two very
                    // different lengths. The count gets the poster size; the
                    // list would be unreadable at it.
                    /^\d+$/.test(fact.value)
                      ? 'text-[2.5rem] font-medium leading-none tabular-nums'
                      : 'text-[1.0625rem] font-medium leading-[1.45]',
                  )}
                >
                  {fact.value}
                </dd>
                <dt className="mt-3 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-bone-400">
                  {fact.label}
                </dt>
              </div>
            ))}
          </dl>
        ) : null}

        <Link href="/red-ball" className={cn(buttonClass('outline', 'md'), 'mt-10')}>
          Explore Red Ball
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <div className="lg:col-span-7">
        {current ? (
          <figure>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-card border border-white/10 bg-ink-900">
              <Image
                key={current.slug}
                src={current.imageUrl}
                alt={current.imageAlt ?? current.name}
                fill
                sizes="(min-width: 1024px) 58vw, 92vw"
                quality={90}
                priority={active === 0}
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-950/85 to-transparent"
              />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
                <span className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-bone-100">
                  {current.name}
                </span>
                <span className="font-sans text-[0.6875rem] tabular-nums tracking-[0.16em] text-bone-400">
                  {String(active + 1).padStart(2, '0')} / {String(shots.length).padStart(2, '0')}
                </span>
              </figcaption>
            </div>

            {shots.length > 1 ? (
              <div className="mt-5 flex items-center gap-4">
                <ul className="flex min-w-0 flex-1 gap-3">
                  {strip.map((shot, position) => {
                    const index = shots.indexOf(shot);
                    const isActive = index === active;
                    return (
                      <li
                        key={shot.slug}
                        className={cn(
                          'min-w-0 flex-1',
                          /*
                            Five thumbnails share about 260px on a phone, which
                            leaves each one a 48x36 target - too small to hit and
                            too small to recognise. The strip drops to three
                            there, and the window always keeps the active frame
                            inside the first three, so nothing selectable is
                            hidden.
                          */
                          position > 2 && 'hidden sm:block',
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => setActive(index)}
                          aria-current={isActive ? 'true' : undefined}
                          aria-label={`Show ${shot.name}`}
                          className={cn(
                            'relative block aspect-[4/3] w-full overflow-hidden rounded-[0.375rem] border transition-[border-color,opacity] duration-300',
                            isActive
                              ? 'border-brass-400 opacity-100'
                              : 'border-white/10 opacity-55 hover:opacity-90',
                          )}
                        >
                          <Image
                            src={shot.imageUrl}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 11vw, 18vw"
                            className="object-cover"
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className="flex shrink-0 gap-2">
                  {[
                    { label: 'Previous facility', delta: -1, Icon: ChevronLeft },
                    { label: 'Next facility', delta: 1, Icon: ChevronRight },
                  ].map(({ label, delta, Icon }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => step(delta)}
                      aria-label={label}
                      className="grid h-11 w-11 place-items-center rounded-full border border-white/25 text-bone-100 transition-colors duration-300 hover:border-bone-50 hover:bg-bone-50 hover:text-ink-950"
                    >
                      <Icon size={17} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </figure>
        ) : (
          <MediaPlaceholder
            label="Arena photographs will be added here"
            aspect="aspect-[16/10]"
          />
        )}
      </div>
    </div>
  );
}
