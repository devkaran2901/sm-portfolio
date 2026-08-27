import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Globe2, GraduationCap, Timer, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { buttonClass } from '@/components/ui/Button';
import { MediaPlaceholder } from '@/components/ui/Primitives';
import { Reveal } from '@/components/ui/Reveal';
import type { ProfileView, StatView } from '@/lib/content';

/**
 * The one light band that isn't Press & Recognition: a reading-room pause
 * between the cinematic hero and the dark ventures block that follows.
 *
 * Three columns on a wide screen - the argument, the portrait, the figures -
 * collapsing to one stacked column below `lg`. The four stats are the same
 * four real numbers `StatsBar` already carries (years operating, players
 * progressed, academies, international destinations); repeating them here in
 * a card grid rather than a strip is deliberate emphasis, not new content.
 */
const STAT_ICONS: Record<string, LucideIcon> = {
  'years-operating': Timer,
  'players-progressed': Users,
  'cricket-academies': GraduationCap,
  international: Globe2,
};

export function AboutIntro({
  profile,
  bioParagraphs,
  stats,
  internationalCount,
}: {
  profile: ProfileView;
  bioParagraphs: string[];
  stats: StatView[];
  internationalCount: number;
}) {
  const byKey = new Map(stats.map((stat) => [stat.key, stat]));
  const grid = [
    byKey.get('years-operating'),
    byKey.get('players-progressed'),
    byKey.get('cricket-academies'),
    internationalCount > 0
      ? {
          key: 'international',
          value: String(internationalCount),
          label: 'International Experiences',
          description: null,
        }
      : null,
  ].filter((stat): stat is StatView => Boolean(stat));

  return (
    <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
      <Reveal className="lg:col-span-5">
        <p className="eyebrow">About Me</p>
        <h2 className="mt-5 text-display-md">Cricket, then infrastructure.</h2>

        {bioParagraphs.map((paragraph, index) => (
          <p
            key={paragraph.slice(0, 40)}
            className={index === 0 ? 'prose-editorial mt-6' : 'prose-editorial mt-5'}
          >
            {paragraph}
          </p>
        ))}

        {/*
          The signature: a script-face rendering of the name, not a scanned
          autograph. It is a typographic flourish and is presented as one.
        */}
        <p
          aria-hidden="true"
          className="mt-8 font-script text-4xl text-brass-100"
        >
          {profile.fullName}
        </p>

        <Link href="/about" className={`${buttonClass('outline', 'md')} mt-8`}>
          Read the full profile
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </Reveal>

      <Reveal delay={90} className="lg:col-span-3 lg:justify-self-center">
        <div className="relative mx-auto aspect-[3/4] w-full max-w-[19rem] overflow-hidden rounded-t-[9rem] rounded-b-card border border-paper-200 bg-paper-50 shadow-card">
          {profile.portraitUrl ? (
            <Image
              src={profile.portraitUrl}
              alt={profile.portraitAlt ?? profile.fullName}
              fill
              sizes="(min-width: 1024px) 22vw, 76vw"
              className="object-cover"
            />
          ) : (
            <MediaPlaceholder
              label={`${profile.fullName} portrait`}
              aspect="h-full w-full"
              tone="light"
              className="rounded-none border-0"
            />
          )}
        </div>
      </Reveal>

      {grid.length > 0 ? (
        <Reveal delay={160} className="lg:col-span-4">
          <dl className="grid grid-cols-2 gap-4">
            {grid.map((stat) => {
              const Icon = STAT_ICONS[stat.key] ?? Timer;
              return (
                <div
                  key={stat.key}
                  className="rounded-card border border-paper-200 bg-paper-50 p-5 transition-[border-color,box-shadow] duration-300 hover:border-brass-400/50 hover:shadow-card"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-brass-400/50 text-brass-100">
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <dd className="mt-4 font-serif text-3xl font-medium leading-none text-paper-900">
                    {stat.value}
                  </dd>
                  <dt className="mt-2 text-[0.8125rem] leading-snug text-paper-600">
                    {stat.label}
                  </dt>
                </div>
              );
            })}
          </dl>
        </Reveal>
      ) : null}
    </div>
  );
}
