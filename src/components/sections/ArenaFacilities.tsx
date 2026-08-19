'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';

import { buttonClass } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { FACILITY_GROUP_LABELS } from '@/content/defaults';
import type { FacilityView } from '@/lib/content';
import { cn } from '@/lib/utils';

/**
 * Red Ball Sports Arena - sports facilities.
 *
 * Scope is deliberately narrow: facilities and their descriptions only. No
 * biography, ventures, players, press, events or statistics appear here.
 *
 * Layout is an asymmetric editorial grid rather than a uniform card wall.
 * Featured facilities span two columns and use a wider crop, which gives the
 * section a rhythm without needing more content than actually exists.
 *
 * Photography: a facility renders its first real image when one has been
 * uploaded, and a clearly labelled empty frame when it has not. Nothing stands
 * in for a photograph that does not exist.
 */

type Props = { facilities: FacilityView[] };

export function ArenaFacilities({ facilities }: Props) {
  const [active, setActive] = useState<FacilityView | null>(null);

  // Sport only. Hospitality is real, but it is not a sports facility.
  const sports = facilities.filter((facility) => facility.group !== 'HOSPITALITY');
  const featured = sports.find((facility) => facility.isFeatured) ?? sports[0];
  const rest = sports.filter((facility) => facility.id !== featured?.id);

  if (!featured) return null;

  return (
    <section aria-labelledby="arena-facilities" className="py-section">
      <div className="shell">
        <header className="max-w-3xl">
          <p className="eyebrow">Facilities</p>
          <h2 id="arena-facilities" className="mt-4 text-display-lg text-bone-50">
            Red Ball Sports Arena
          </h2>
          <p className="mt-5 text-xl leading-relaxed text-bone-200">
            A Multi-Sport Destination for Training, Fitness &amp; Recreation
          </p>
          <p className="mt-5 text-[1.0625rem] leading-relaxed text-bone-400">
            Red Ball Sports Arena brings together cricket, fitness, racquet sports, outdoor games
            and recreational facilities within a single sports destination.
          </p>
        </header>

        <Reveal className="mt-16">
          <FacilityCard facility={featured} size="hero" onOpen={setActive} />
        </Reveal>

        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
          {rest.map((facility, index) => (
            <Reveal
              as="li"
              key={facility.id}
              delay={Math.min(index * 55, 320)}
              className={cn(
                'block',
                // Featured items take a double-width cell on large screens.
                facility.isFeatured ? 'lg:col-span-4' : 'lg:col-span-2',
              )}
            >
              <FacilityCard
                facility={facility}
                size={facility.isFeatured ? 'wide' : 'standard'}
                onOpen={setActive}
              />
            </Reveal>
          ))}
        </ul>
      </div>

      {active ? <FacilityDialog facility={active} onClose={() => setActive(null)} /> : null}
    </section>
  );
}

// ---------------------------------------------------------------------------

/** Alt text names the facility and the arena, per the image system spec. */
function altFor(facility: FacilityView): string {
  return (
    facility.imageAlt ?? `${facility.name} at Red Ball Sports Arena in Rohtak, Haryana`
  );
}

const ASPECTS = {
  hero: 'aspect-[16/7]',
  wide: 'aspect-[16/9]',
  standard: 'aspect-[4/3]',
} as const;

function FacilityCard({
  facility,
  size,
  onOpen,
}: {
  facility: FacilityView;
  size: keyof typeof ASPECTS;
  onOpen: (facility: FacilityView) => void;
}) {
  const label = FACILITY_GROUP_LABELS[facility.group as keyof typeof FACILITY_GROUP_LABELS];

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl2 border border-ink-700',
        'bg-ink-900 transition-[border-color,transform] duration-500 ease-editorial',
        'hover:-translate-y-1 hover:border-ink-600',
      )}
    >
      <div className={cn('relative w-full overflow-hidden bg-ink-800', ASPECTS[size])}>
        {facility.imageUrl ? (
          <Image
            src={facility.imageUrl}
            alt={altFor(facility)}
            fill
            loading="lazy"
            sizes={
              size === 'hero'
                ? '(max-width: 1024px) 100vw, 1600px'
                : size === 'wide'
                  ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 66vw'
                  : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            }
            // Soft zoom on hover, and nothing at all under reduced motion.
            className="object-cover transition-transform duration-[900ms] ease-editorial motion-safe:group-hover:scale-[1.04]"
          />
        ) : (
          <ImageSlot label={facility.name} size={size} />
        )}
      </div>

      <div className={cn('flex flex-1 flex-col', size === 'hero' ? 'p-8 sm:p-10' : 'p-6')}>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h3
            className={cn(
              'font-display text-bone-50',
              size === 'hero' ? 'text-display-sm' : 'text-2xl',
            )}
          >
            {facility.name}
          </h3>
          {facility.quantity ? (
            <span className="text-sm uppercase tracking-[0.12em] text-bone-500">
              {facility.quantity} {facility.unitLabel ?? ''}
            </span>
          ) : null}
        </div>

        <p className="mt-1.5 text-sm uppercase tracking-[0.14em] text-bone-600">{label}</p>

        <p
          className={cn(
            'mt-4 flex-1 leading-relaxed text-bone-400',
            size === 'hero' ? 'max-w-2xl text-[1.0625rem]' : 'text-[0.9375rem]',
          )}
        >
          {facility.description}
        </p>

        <button
          type="button"
          onClick={() => onOpen(facility)}
          className={buttonClass('secondary', size === 'hero' ? 'md' : 'sm', 'mt-7 w-fit')}
        >
          View facility
          <ArrowUpRight size={16} aria-hidden="true" />
          <span className="sr-only">: {facility.name}</span>
        </button>
      </div>
    </article>
  );
}

/**
 * Labelled empty frame for a facility awaiting photography.
 *
 * Announced as an image with a description so the gap is legible to screen
 * readers rather than being a silent blank.
 */
function ImageSlot({ label, size }: { label: string; size: keyof typeof ASPECTS }) {
  return (
    <div
      role="img"
      aria-label={`Photograph of ${label} at Red Ball Sports Arena to be added`}
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 border-b border-dashed border-ink-700 bg-ink-800"
    >
      <span
        aria-hidden="true"
        className="h-10 w-10 rounded-full border border-dashed border-ink-600"
      />
      <p
        className={cn(
          'px-6 text-center font-medium uppercase tracking-[0.16em] text-bone-600',
          size === 'hero' ? 'text-sm' : 'text-xs',
        )}
      >
        {label} photograph
      </p>
    </div>
  );
}

/**
 * Facility detail dialog.
 *
 * Focus moves in on open and returns to the page on close, Escape dismisses,
 * background scroll is locked, and Tab is trapped inside. It adds an enlarged
 * image and the full description; it never introduces content the card lacks.
 */
function FacilityDialog({
  facility,
  onClose,
}: {
  facility: FacilityView;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href]',
      );
      if (!focusables?.length) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-bone-50/70 backdrop-blur-sm" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="facility-dialog-title"
        className="relative max-h-full w-full max-w-3xl overflow-y-auto rounded-xl2 border border-ink-700 bg-ink-900 shadow-lift"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink-800">
          {facility.imageUrl ? (
            <Image
              src={facility.imageUrl}
              alt={altFor(facility)}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          ) : (
            <ImageSlot label={facility.name} size="wide" />
          )}
        </div>

        <div className="p-7 sm:p-9">
          <p className="text-sm uppercase tracking-[0.14em] text-bone-600">
            {FACILITY_GROUP_LABELS[facility.group as keyof typeof FACILITY_GROUP_LABELS]}
          </p>
          <h3 id="facility-dialog-title" className="mt-3 font-display text-display-sm text-bone-50">
            {facility.name}
          </h3>
          {facility.quantity ? (
            <p className="mt-2 text-sm uppercase tracking-[0.12em] text-bone-500">
              {facility.quantity} {facility.unitLabel ?? ''}
            </p>
          ) : null}
          <p className="mt-5 text-[1.0625rem] leading-relaxed text-bone-300">
            {facility.description}
          </p>
        </div>

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-ink-600 bg-ink-900/90 text-bone-100 transition-colors hover:border-bone-50 hover:bg-bone-50 hover:text-ink-900"
        >
          <X size={17} aria-hidden="true" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
}
