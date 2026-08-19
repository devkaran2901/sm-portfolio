import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';

import { buttonClass } from '@/components/ui/Button';
import { MediaPlaceholder } from '@/components/ui/Primitives';
import type { ProfileView, StatView } from '@/lib/content';
import { cn } from '@/lib/utils';

/**
 * Cinematic opening.
 *
 * Renders server-side with no entry animation on the headline: this is the LCP
 * element, so it paints immediately rather than fading in.
 */
export function Hero({ profile, stats }: { profile: ProfileView; stats: StatView[] }) {
  const location = [profile.currentCity, profile.region].filter(Boolean).join(', ');
  const positioning = profile.positioning.split('·').map((part) => part.trim()).filter(Boolean);
  const heroStats = stats.slice(0, 3);

  return (
    <section className="grain relative overflow-hidden border-b border-ink-800">
      {/* Neutral light wash and a faint vertical rule: depth without colour. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_75%_-10%,rgba(255,255,255,0.55),transparent_58%),radial-gradient(90%_60%_at_10%_110%,rgba(10,10,11,0.06),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-gradient-to-b from-transparent via-ink-700 to-transparent lg:block"
      />

      <div className="shell relative grid items-center gap-14 py-20 lg:grid-cols-12 lg:gap-12 lg:py-28">
        <div className="lg:col-span-7">
          <p className="eyebrow flex items-center gap-2">
            <MapPin size={13} aria-hidden="true" />
            {location || 'Rohtak, Haryana'}, India
          </p>

          <h1 className="mt-6 text-display-xl text-bone-50">{profile.headline}</h1>

          <ul className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2">
            {positioning.map((item, index) => (
              <li key={item} className="flex items-center gap-3">
                {index > 0 ? (
                  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-brass-400" />
                ) : null}
                <span className="text-base font-medium uppercase tracking-[0.14em] text-bone-300">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-8 max-w-xl text-xl leading-relaxed text-bone-300">{profile.shortBio}</p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/cricket" className={buttonClass('primary', 'lg')}>
              Explore Journey
            </Link>
            <Link href="/contact" className={buttonClass('secondary', 'lg')}>
              Contact Sonu
            </Link>
          </div>

          {heroStats.length > 0 ? (
            <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-ink-800 pt-8">
              {heroStats.map((stat) => (
                <div key={stat.key}>
                  <dt className="text-sm uppercase tracking-[0.12em] text-bone-500">{stat.label}</dt>
                  <dd className="mt-2 font-display text-4xl text-brass-200 tabular-nums">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <div className="lg:col-span-5">
          <figure className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-[1.6rem] border border-ink-700/60"
            />
            {profile.portraitUrl ? (
              <Image
                src={profile.portraitUrl}
                alt={profile.portraitAlt ?? `Portrait of ${profile.fullName}`}
                width={720}
                height={900}
                priority
                sizes="(max-width: 1024px) 92vw, 34vw"
                className="relative aspect-[4/5] w-full rounded-xl2 object-cover"
              />
            ) : (
              <MediaPlaceholder
                label="Portrait photograph to be added"
                aspect="aspect-[4/5]"
                className={cn('relative w-full')}
              />
            )}
            {/*
              With a real photograph in place the caption carries the name only.
              Pairing a portrait with a birthplace would read as a location
              caption for the image, which is a claim the photo does not make.
            */}
            <figcaption className="mt-4 text-sm uppercase tracking-[0.14em] text-bone-500">
              {profile.portraitUrl
                ? profile.fullName
                : `${profile.fullName} — ${profile.birthPlace ?? 'Rohtak, Haryana'}`}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
