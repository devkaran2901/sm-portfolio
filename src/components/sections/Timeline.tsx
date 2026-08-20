import { Reveal } from '@/components/ui/Reveal';
import { VerificationBadge } from '@/components/ui/Primitives';
import type { TimelineView } from '@/lib/content';
import { cn } from '@/lib/utils';

const CATEGORY_LABELS: Record<string, string> = {
  ORIGIN: 'Origin',
  CRICKET: 'Cricket',
  INTERNATIONAL: 'International',
  INFRASTRUCTURE: 'Infrastructure',
  BUSINESS: 'Business',
  EDUCATION: 'Education',
};

const CATEGORY_ACCENTS: Record<string, string> = {
  ORIGIN: 'bg-bone-400',
  CRICKET: 'bg-turf-400',
  INTERNATIONAL: 'bg-brass-300',
  INFRASTRUCTURE: 'bg-turf-300',
  BUSINESS: 'bg-brass-400',
  EDUCATION: 'bg-info-400',
};

/**
 * Chronological journey.
 *
 * `yearLabel` is free text ("Early years", "College years") because exact dates
 * were not supplied for most entries and inventing them is not an option.
 * Entries still awaiting a source carry a visible marker.
 */
export function Timeline({ events }: { events: TimelineView[] }) {
  return (
    <ol className="relative">
      {/*
        The rail has to land on the centre of the dots, which sit 15px wide, so
        their centre is 7px in from wherever the dot column starts.

        On desktop that column starts after the year label (9rem) AND the flex
        gap (2rem) - the gap was previously left out, which put the rail 2rem to
        the left of every dot, running through empty space.
      */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-[7px] top-2 w-px bg-gradient-to-b from-ink-600 via-ink-700 to-transparent sm:left-[calc(11rem+7px)]"
      />

      {events.map((event, index) => (
        <Reveal as="li" key={event.id} delay={Math.min(index * 55, 300)} className="relative block">
          {/*
            Mobile is a single indented column with the dot pinned to the rail;
            stacking the three flex children instead put full-width text on top
            of the rail. From `sm` up it becomes the three-column arrangement.
          */}
          <div className="relative flex flex-col gap-y-1.5 pb-10 pl-9 sm:flex-row sm:gap-x-8 sm:gap-y-3 sm:pb-12 sm:pl-0">
            <span
              aria-hidden="true"
              className={cn(
                'absolute left-0 top-[0.4rem] h-[15px] w-[15px] shrink-0 rounded-full border-4 border-ink-950',
                'sm:static sm:order-2 sm:mt-1.5',
                CATEGORY_ACCENTS[event.category] ?? 'bg-bone-400',
              )}
            />

            <div className="sm:order-1 sm:w-36 sm:shrink-0 sm:pt-0.5 sm:text-right">
              <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brass-300">
                {event.yearLabel}
              </span>
            </div>

            <div className="min-w-0 flex-1 sm:order-3 sm:pl-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-xl font-semibold text-bone-50 sm:text-2xl">{event.title}</h3>
                <span className="text-[0.6875rem] uppercase tracking-[0.12em] text-bone-500">
                  {CATEGORY_LABELS[event.category] ?? event.category}
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-[1rem] leading-relaxed text-bone-300 sm:mt-2.5 sm:text-[1.0625rem]">
                {event.summary}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {event.location ? (
                  <span className="text-sm text-bone-500">{event.location}</span>
                ) : null}
                {event.needsSource && !event.isVerified ? (
                  <VerificationBadge status="pending" />
                ) : null}
                {event.isVerified ? <VerificationBadge status="verified" /> : null}
              </div>
            </div>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}
