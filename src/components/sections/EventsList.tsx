import { EVENT_CATEGORY_LABELS } from '@/content/defaults';
import { VerificationBadge } from '@/components/ui/Primitives';
import { Reveal } from '@/components/ui/Reveal';
import type { EventView } from '@/lib/content';

/**
 * Events hosted at the facility.
 *
 * Categories only. Tournament names, dates, results, standings and certificates
 * are not listed because none were supplied - each entry is instead structured
 * so an admin can attach the organiser, year, clipping and official reference
 * later, and the badge shows whether that has happened.
 */
export function EventsList({ events }: { events: EventView[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
      {events.map((event, index) => (
        <Reveal as="li" key={event.id} delay={Math.min(index * 60, 260)}>
          <article className="flex h-full min-w-0 flex-col rounded-xl2 border border-ink-700/70 bg-ink-900/60 p-4 transition-colors duration-300 hover:border-turf-500/40 sm:p-6">
            <p className="eyebrow">
              {EVENT_CATEGORY_LABELS[event.category as keyof typeof EVENT_CATEGORY_LABELS] ??
                event.category}
            </p>

            <h3 className="mt-3 break-words font-serif text-lg text-bone-50 sm:text-xl">{event.name}</h3>

            <p className="mt-2.5 line-clamp-3 flex-1 text-[0.875rem] leading-relaxed text-bone-400 sm:line-clamp-none sm:text-[0.9375rem]">{event.summary}</p>

            <dl className="mt-5 space-y-1.5 border-t border-ink-800 pt-4 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-bone-500">Year</dt>
                <dd className="text-bone-300">{event.yearLabel ?? 'To be confirmed'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-bone-500">Organiser</dt>
                <dd className="text-bone-300">{event.organizer ?? 'To be confirmed'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-bone-500">Venue</dt>
                <dd className="text-bone-300">{event.venue ?? 'Red Ball Cricket Ground'}</dd>
              </div>
            </dl>

            <div className="mt-4">
              <VerificationBadge status={event.verifiedCount > 0 ? 'verified' : 'pending'} />
            </div>
          </article>
        </Reveal>
      ))}
    </ul>
  );
}
