import {
  Building2,
  GraduationCap,
  Globe2,
  MapPin,
  Trophy,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';

import { Reveal } from '@/components/ui/Reveal';
import type { TimelineView } from '@/lib/content';
import { cn } from '@/lib/utils';

/**
 * The journey, read left to right instead of top to bottom.
 *
 * The vertical timeline still exists and is still the right shape for the about
 * page, where every milestone carries a paragraph. Here there is room for a
 * year and a place and nothing else, and at that density a horizontal run is
 * the honest form: six nodes on one dotted line, which the eye takes in as a
 * single span of time rather than as six separate entries.
 *
 * Below `lg` it becomes a vertical rail again. A horizontal timeline on a phone
 * is either a scroller nobody scrolls or six columns of two-character text, and
 * both are worse than the rail.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  ORIGIN: MapPin,
  CRICKET: Trophy,
  INTERNATIONAL: Globe2,
  INFRASTRUCTURE: Building2,
  BUSINESS: Briefcase,
  EDUCATION: GraduationCap,
};

/**
 * The milestone the strip is built around.
 *
 * Three of the six nodes are the same spell abroad, and the design calls that
 * out with a label floated above the line rather than repeating "international
 * club cricket" underneath three consecutive nodes. It is drawn once, over the
 * first node of the run.
 */
const CALLOUT_CATEGORY = 'INTERNATIONAL';

/** Node diameter is 2.75rem, so its centre - and the line - sits at half that. */
const NODE_CENTRE = '1.375rem';

export function JourneyStrip({ events }: { events: TimelineView[] }) {
  if (events.length === 0) return null;

  const calloutIndex = events.findIndex((event) => event.category === CALLOUT_CATEGORY);

  return (
    // The top padding is the room the callout hangs in. Without it the label
    // would be clipped by whatever sits above the strip.
    <div className="relative lg:pt-20">
      {/*
        The connecting line, dotted rather than solid: the gaps between these
        milestones are years wide and mostly undocumented, and a solid rule
        claims a continuity the content does not have.

        Inset by half a column at each end so it starts and stops under the
        outer nodes instead of running off into the gutter. The inset is an
        inline style because it depends on how many milestones there are.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 hidden h-px bg-[length:14px_1px] bg-repeat-x bg-[linear-gradient(to_right,rgba(255,255,255,0.3)_0_6px,transparent_6px)] lg:block"
        style={{
          top: `calc(5rem + ${NODE_CENTRE})`,
          marginLeft: `calc(100% / ${events.length * 2})`,
          marginRight: `calc(100% / ${events.length * 2})`,
        }}
      />
      {/* The same rule turned upright, for the stacked layout. */}
      <div
        aria-hidden="true"
        className="absolute bottom-8 top-8 w-px bg-[length:1px_14px] bg-repeat-y bg-[linear-gradient(to_bottom,rgba(255,255,255,0.3)_0_6px,transparent_6px)] lg:hidden"
        style={{ left: NODE_CENTRE }}
      />

      <ol
        className="relative grid gap-y-10 lg:gap-x-4 lg:gap-y-0"
        style={{ gridTemplateColumns: `repeat(${events.length}, minmax(0, 1fr))` }}
      >
        {events.map((event, index) => {
          const Icon = CATEGORY_ICONS[event.category] ?? MapPin;
          const isCallout = index === calloutIndex;
          const isAbroad = event.category === CALLOUT_CATEGORY;

          /*
           * The three trips abroad all carry the same `yearLabel` - "International
           * club cricket" - because no dates were supplied for them. Printed
           * verbatim under a callout that already says exactly that, the strip
           * ends with the same phrase four times over and reads as a bug.
           *
           * So for those nodes the country takes the headline slot and the title
           * drops below it, with the country stripped off the front where the
           * title repeats it ("South Africa - Dolphin Club" becomes "Dolphin
           * Club"). Both fields are real content; only which one leads changes.
           */
          const lead = isAbroad && event.country ? event.country : event.yearLabel;
          const detail = event.title.replace(
            new RegExp(`^\\s*${lead.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[-–—]\\s*`, 'i'),
            '',
          );

          return (
            <Reveal
              as="li"
              key={event.id}
              delay={Math.min(index * 90, 450)}
              className="relative col-span-full flex items-start gap-5 lg:col-span-1 lg:block lg:text-center"
            >
              {/*
                The callout, floated over the line above the first node of the
                run abroad. Absolutely positioned against its own node so it
                cannot push that node out of line with the five beside it - the
                row has to stay level whatever hangs above it.
              */}
              {isCallout ? (
                <span className="pointer-events-none absolute left-1/2 top-0 hidden -translate-x-1/2 -translate-y-full flex-col items-center whitespace-nowrap lg:flex">
                  <span className="rounded-full border border-brass-400/50 bg-brass-700/70 px-4 py-1.5 font-sans text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-brass-200">
                    International Club Cricket
                  </span>
                  <span aria-hidden="true" className="h-5 w-px bg-brass-400/50" />
                </span>
              ) : null}

              <span
                aria-hidden="true"
                className={cn(
                  'relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border bg-ink-950 transition-colors duration-300 lg:mx-auto',
                  isCallout ? 'border-brass-400 text-brass-200' : 'border-white/20 text-bone-300',
                )}
              >
                <Icon size={17} />
              </span>

              <div className="min-w-0 lg:mt-6">
                <p className="font-serif text-lg font-medium leading-none text-bone-50 lg:text-xl">
                  {lead}
                </p>
                <p className="mt-2.5 font-sans text-[0.6875rem] font-semibold uppercase leading-[1.7] tracking-[0.16em] text-bone-400 lg:mx-auto lg:max-w-[18ch]">
                  {detail}
                </p>
              </div>
            </Reveal>
          );
        })}
      </ol>
    </div>
  );
}
