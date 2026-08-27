import { GraduationCap, Target, Timer, Trophy, Globe2, type LucideIcon } from 'lucide-react';

import { Counter } from '@/components/ui/Counter';
import type { StatView } from '@/lib/content';

const ICONS: Record<string, LucideIcon> = {
  'years-operating': Timer,
  'players-progressed': Trophy,
  'cricket-grounds': Target,
  'cricket-academies': GraduationCap,
  'international-destinations': Globe2,
};

/**
 * The figures, in one strip directly under the scroll sequence.
 *
 * This is the first thing on the page after the name, so it has to answer "how
 * much of this is there" before the reader has been told anything else. Five
 * numbers, no prose, no cards - a row of serif figures over their captions,
 * separated by hairlines rather than boxed.
 *
 * The order is fixed here rather than taken from the sort order in the
 * database: the two spans lead, because they mean something without context,
 * and the counts follow them.
 */
const ORDER = [
  'years-operating',
  'players-progressed',
  'cricket-grounds',
  'cricket-academies',
] as const;

/**
 * The hairline between figures.
 *
 * One rule to the left of every figure but the first. The row is five across at
 * every width, so this no longer has to survive a wrapped grid - at two columns
 * it used to leave a stray rule down the left edge of the second row, which is
 * why the rule was decided per index rather than with `divide-x`. Keeping the
 * per-index form anyway: it is still the thing that suppresses the leading rule.
 */
function dividerClass(index: number): string {
  return index === 0 ? '' : 'border-l border-white/10 pl-2 sm:pl-5 lg:pl-8';
}

/**
 * A break point inside the long words in the captions.
 *
 * Five figures across a 390px phone leaves each caption about 58px, and
 * "INTERNATIONAL" needs 59px of it. One pixel over is enough for
 * `overflow-wrap` to step in and split the word wherever the line happens to
 * run out - the caption rendered as "INTERNATIONA" above a lone "L".
 *
 * A soft hyphen is the fix: invisible until the line actually breaks, and a
 * hyphen rather than a raw split when it does. `hyphens: auto` was the first
 * attempt and is not dependable - it needs a hyphenation dictionary for the
 * document language, and this document is `en-IN`, which Chrome did not
 * hyphenate. Marking the point here does not depend on one being installed.
 *
 * The midpoint is not where a dictionary would break these words, but it is
 * close enough to read as deliberate ("INTERNA-TIONAL"), and it needs no
 * per-word table for captions that come out of the database.
 *
 * The threshold is twelve characters rather than ten because a soft hyphen is
 * an invitation, not a fallback: the line breaker fills greedily and will take
 * any break it is offered, even where the whole word would have fitted on the
 * next line. At ten, "Progressed" carried a hint it never needed, and on a
 * tablet - where its column is twice as wide as a phone's - the caption set as
 * "PLAYERS PROGR-ESSED TO HIGHER LEVELS". Only the words too long for the
 * narrowest column get one.
 */
const SOFT_HYPHEN = '­';
const LONGEST_WORD_THAT_FITS = 12;

function withBreakHints(label: string): string {
  return label
    .split(' ')
    .map((word) => {
      if (word.length < LONGEST_WORD_THAT_FITS) return word;
      const at = Math.ceil(word.length / 2);
      return word.slice(0, at) + SOFT_HYPHEN + word.slice(at);
    })
    .join(' ');
}

export function StatsBar({
  stats,
  internationalCount,
}: {
  stats: StatView[];
  /**
   * Destinations where he played club cricket. A real figure that belongs in
   * this row, but not a `Stat` record - it is the length of the international
   * list - so it is passed in rather than looked up by key.
   */
  internationalCount: number;
}) {
  const byKey = new Map(stats.map((stat) => [stat.key, stat]));

  const items = [
    ...ORDER.flatMap((key) => {
      const stat = byKey.get(key);
      return stat ? [{ key: key as string, value: stat.value, label: stat.label }] : [];
    }),
    ...(internationalCount > 0
      ? [
          {
            key: 'international-destinations',
            value: String(internationalCount),
            label: 'International Destinations',
          },
        ]
      : []),
  ];

  if (items.length === 0) return null;

  return (
    <section aria-label="Key figures" className="border-y border-white/10 bg-navy-900">
      <div className="shell">
        {/*
          Five across on a phone as well as a desktop. A 390px screen leaves
          about 350px inside the gutter, so each figure gets roughly 63px - the
          figures and captions below are sized to that, not to the desktop,
          because this is the width they have to survive.
        */}
        <dl className="grid grid-cols-5 gap-x-2 py-12 sm:gap-x-5 sm:py-16 lg:gap-x-8 lg:py-20">
          {items.map((item, index) => {
            const Icon = ICONS[item.key];
            return (
              /*
                Term before definition in the markup, so a screen reader reads
                "Cricket Grounds, 2" rather than the other way round, and the
                column reversed in the layout so the eye still meets the figure
                first. The two orders want to be different here.

                `justify-end` is what puts the figures on one line. In a reversed
                column the main axis runs upward, so the end of it is the top -
                without this the cells pack from the bottom and the caption that
                wraps deepest pushes its figure above all the others. The icon is
                the last DOM child so it lands at the very top of the reversed
                column, above the figure.
              */
              <div
                key={item.key}
                className={`flex flex-col-reverse items-center justify-end text-center sm:items-start sm:text-left ${dividerClass(index)}`}
              >
                {/*
                  The captions are the constraint here, not the figures. "Players
                  Progressed to Higher Levels" is 35 characters in a 66px column,
                  so on a phone the tracking comes almost all the way off - the
                  0.18em the label carries on a desktop is 1.4px per letter, and
                  across thirteen letters that alone is a quarter of the column.

                  `break-words` stays as the last resort behind the soft hyphens,
                  for a caption longer than anything currently in the database:
                  an ugly break is still better than text crossing the rule into
                  the next figure.
                */}
                <dt className="mt-2.5 break-words font-sans text-[0.5rem] font-semibold uppercase leading-[1.55] tracking-[0.03em] text-bone-400 sm:mt-3.5 sm:text-[0.5625rem] sm:tracking-[0.1em] lg:mt-4 lg:max-w-[16ch] lg:text-[0.6875rem] lg:leading-[1.7] lg:tracking-[0.18em]">
                  {withBreakHints(item.label)}
                </dt>
                <dd className="font-serif text-[clamp(1.75rem,0.73rem+4.2vw,4.5rem)] font-medium leading-[0.95] tabular-nums text-bone-50">
                  <Counter value={item.value} />
                </dd>
                {Icon ? (
                  <span
                    aria-hidden="true"
                    className="mb-3 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-brass-400/50 text-brass-300 sm:mb-4 sm:h-9 sm:w-9"
                  >
                    <Icon size={15} aria-hidden="true" />
                  </span>
                ) : null}
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
