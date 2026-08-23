import Image from 'next/image';

import { Counter } from '@/components/ui/Counter';
import { MediaPlaceholder, VerificationBadge } from '@/components/ui/Primitives';
import { Reveal } from '@/components/ui/Reveal';
import type { PlayerView, StatView } from '@/lib/content';

/**
 * Player development and associations.
 *
 * Deliberate wording: players are described as *associated with the facility*.
 * The site does not claim that Sonu Malik trained, coached, discovered, managed
 * or mentored them, because that relationship has not been established.
 */
export function PlayerImpact({
  players,
  playersStat,
}: {
  players: PlayerView[];
  playersStat?: StatView;
}) {
  return (
    <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <div className="rounded-xl2 border border-ink-700/70 bg-gradient-to-b from-ink-900/90 to-ink-950 p-8">
          <p className="font-serif text-[clamp(3.5rem,9vw,5.5rem)] leading-none text-brass-200 tabular-nums">
            <Counter value={playersStat?.value ?? '50+'} />
          </p>
          <p className="mt-4 text-lg font-semibold text-bone-50">
            {playersStat?.label ?? 'Players Progressed to Higher Levels'}
          </p>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-bone-400">
            {playersStat?.description ??
              'Players who trained or played at the facility and went on to higher levels of competitive cricket.'}
          </p>
          <div className="mt-6">
            <VerificationBadge status="pending" />
          </div>
        </div>

        <p className="prose-editorial mt-8">
          The facility has become a platform for players aspiring to progress toward higher levels of
          competitive cricket. The ground also hosts domestic, Ranji and IPL-level players.
        </p>
      </div>

      <div className="lg:col-span-7">
        <h3 className="text-sm font-sans font-semibold uppercase tracking-[0.14em] text-bone-100">
          Players associated with the facility
        </h3>

        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5">
          {players.map((player, index) => (
            <Reveal as="li" key={player.id} delay={index * 70}>
              <article className="flex h-full flex-col overflow-hidden rounded-xl2 border border-ink-700/70 bg-ink-900/60">
                {/*
                  Supplied photographs vary in shape - a squared-off cutout on
                  a transparent ground, a wide broadcast still - so the frame
                  is fixed and the image covers it, anchored to the top so a
                  head is never the part that gets cropped.
                */}
                {player.photoUrl ? (
                  <div className="relative aspect-[3/2] w-full border-b border-ink-700 bg-ink-950">
                    <Image
                      src={player.photoUrl}
                      alt={player.photoAlt ?? player.name}
                      fill
                      // Two columns inside a 7-of-12 span: ~418px at a full
                      // shell, ~29vw between lg and there, ~45vw below it.
                      sizes="(min-width: 1600px) 418px, (min-width: 1024px) 29vw, 45vw"
                      quality={90}
                      className="object-cover object-top"
                    />
                  </div>
                ) : (
                  <MediaPlaceholder
                    label={`${player.name} photograph`}
                    aspect="aspect-[3/2]"
                    className="rounded-none border-0 border-b border-dashed border-ink-700"
                  />
                )}
                <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                  <h4 className="break-words font-serif text-lg text-bone-50 sm:text-xl">{player.name}</h4>
                  {player.teamContext ? (
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-brass-300">
                      {player.teamContext}
                    </p>
                  ) : null}
                  <p className="mt-2.5 line-clamp-3 flex-1 text-[0.875rem] leading-relaxed text-bone-400 sm:line-clamp-none sm:text-[0.9375rem]">
                    {player.associationNote}
                  </p>
                  <div className="mt-4">
                    <VerificationBadge
                      status={player.verifiedCount > 0 ? 'verified' : 'pending'}
                    />
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>

        <div className="mt-8 rounded-xl2 border border-dashed border-ink-600 bg-ink-900/40 p-6">
          <h4 className="text-sm font-sans font-semibold text-bone-100">Testimonials and references</h4>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-bone-400">
            Player testimonials, photographs and official references are added from the admin portal
            once they have been supplied and verified. Nothing is published here on the strength of
            an assumption.
          </p>
        </div>
      </div>
    </div>
  );
}
