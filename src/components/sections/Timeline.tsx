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
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-[7px] top-2 w-px bg-gradient-to-b from-ink-600 via-ink-700 to-transparent sm:left-[calc(9rem+7px)]"
      />

      {events.map((event, index) => (
        <Reveal as="li" key={event.id} delay={Math.min(index * 55, 300)} className="relative block">
          <div className="flex flex-col gap-x-8 gap-y-3 pb-12 sm:flex-row">
            <div className="order-2 shrink-0 sm:order-1 sm:w-36 sm:pt-0.5 sm:text-right">
              <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brass-300">
                {event.yearLabel}
              </span>
            </div>

            <div className="order-1 flex shrink-0 items-start sm:order-2">
              <span
                aria-hidden="true"
                className={cn(
                  'mt-1.5 block h-[15px] w-[15px] rounded-full border-4 border-ink-950',
                  CATEGORY_ACCENTS[event.category] ?? 'bg-bone-400',
                )}
              />
            </div>

            <div className="order-3 min-w-0 flex-1 sm:pl-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h3 className="text-2xl font-semibold text-bone-50">{event.title}</h3>
                <span className="text-[0.6875rem] uppercase tracking-[0.12em] text-bone-500">
                  {CATEGORY_LABELS[event.category] ?? event.category}
                </span>
              </div>

              <p className="mt-2.5 max-w-2xl text-[1.0625rem] leading-relaxed text-bone-300">
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
