import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';

import { Counter } from '@/components/ui/Counter';
import { MediaPlaceholder } from '@/components/ui/Primitives';
import { Reveal } from '@/components/ui/Reveal';
import type { PlayerView, StatView } from '@/lib/content';

/**
 * The players, on the one section that drops below the page ground.
 *
 * Near black rather than the panel navy, because this is the only block on the
 * page made of photographs of people and the darker ground is what lets the
 * kit colours carry it. The figure holds the left column at poster size and the
 * faces run along the right.
 *
 * The wording is unchanged from the vertical version and is deliberate: players
 * are described as *associated with the facility*. Nothing here claims that
 * Sonu Malik trained, coached, discovered, managed or mentored them, because
 * that relationship has not been established.
 */
export function PlayersShowcase({
  players,
  playersStat,
}: {
  players: PlayerView[];
  playersStat?: StatView;
}) {
  return (
    <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-4">
        <p className="eyebrow">Player Development</p>

        <p className="mt-8 font-serif text-[clamp(4rem,10vw,7rem)] font-medium leading-[0.85] tabular-nums text-bone-50">
          <Counter value={playersStat?.value ?? '50+'} />
        </p>

        <h2 className="mt-6 font-serif text-display-sm text-bone-50">Players Who Went Further</h2>

        <p className="mt-5 max-w-md text-[1.0625rem] leading-[1.7] text-bone-300">
          {playersStat?.description ??
            'Players who trained or played at the facility and went on to higher levels of competitive cricket.'}
        </p>

        <Link href="/players" className="cta-link mt-9">
          View All Players
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className="lg:col-span-8">
        <h3 className="sr-only">Players associated with the facility</h3>

        {/*
          The cards run in a row that wraps, with the "and many more" plate
          always last. Two named players is not many, so the row is sized to
          look deliberate at three items rather than stretched to fill a grid
          built for six.
        */}
        <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6">
          {players.map((player, index) => (
            <Reveal as="li" key={player.id} delay={index * 90} className="block">
              <article className="group h-full overflow-hidden rounded-card border border-white/10 bg-navy-900">
                {/*
                  Supplied photographs vary in shape - a squared-off cutout on a
                  transparent ground, a wide broadcast still - so the frame is
                  fixed and the image covers it, anchored to the top so a head is
                  never the part that gets cropped.
                */}
                {player.photoUrl ? (
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink-950">
                    <Image
                      src={player.photoUrl}
                      alt={player.photoAlt ?? player.name}
                      fill
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                      quality={90}
                      className="object-cover object-top transition-transform duration-700 ease-editorial group-hover:scale-[1.05]"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy-900 via-navy-900/45 to-transparent"
                    />
                  </div>
                ) : (
                  <MediaPlaceholder
                    label={`${player.name} photograph`}
                    aspect="aspect-[3/4]"
                    className="rounded-none border-0"
                  />
                )}

                <div className="p-5">
                  <h4 className="break-words font-serif text-lg text-bone-50">{player.name}</h4>
                  {player.teamContext ? (
                    <p className="mt-2 font-sans text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-brass-200">
                      {player.teamContext}
                    </p>
                  ) : null}
                </div>
              </article>
            </Reveal>
          ))}

          {/*
            The plate that stands in for everyone not named.

            More than fifty players are claimed and two are named, so the row
            has to acknowledge the gap rather than let three cards imply three
            players. It is a silhouette, not a photograph: no face is invented
            for a player who has not supplied one.
          */}
          <Reveal as="li" delay={players.length * 90} className="block">
            <div className="flex h-full flex-col items-center justify-center rounded-card border border-dashed border-white/15 bg-navy-900/50 p-6 text-center">
              <span
                aria-hidden="true"
                className="grid h-14 w-14 place-items-center rounded-full border border-white/15 text-bone-400"
              >
                <Users size={22} />
              </span>
              <p className="mt-5 font-serif text-lg leading-snug text-bone-100">
                And Many More Champions&hellip;
              </p>
              <p className="mt-3 font-sans text-[0.625rem] font-semibold uppercase leading-[1.7] tracking-[0.16em] text-bone-500">
                Domestic, Ranji and IPL-level players
              </p>
            </div>
          </Reveal>
        </ul>
      </div>
    </div>
  );
}
