import Link from 'next/link';
import { MapPin } from 'lucide-react';

import { buttonClass } from '@/components/ui/Button';
import type { ProfileView, StatView } from '@/lib/content';
import { cn } from '@/lib/utils';

/**
 * Opening statement.
 *
 * Text only. The portrait that used to sit alongside has been removed - the
 * scroll sequence above already carries the imagery, and repeating a photograph
 * of the same person immediately underneath weakened both.
 *
 * `profile.portraitUrl` is deliberately still read elsewhere: it backs the
 * sequence's no-frames fallback and the Person structured data.
 */
export function Hero({
  profile,
  stats,
  showHeadline = true,
}: {
  profile: ProfileView;
  stats: StatView[];
  /**
   * Off when the scroll sequence above already carries the name as the page
   * h1 - two giant identical headings would be a duplicate h1 and read as a
   * mistake.
   */
  showHeadline?: boolean;
}) {
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

      <div className="shell relative py-20 lg:py-28">
        <p className="eyebrow flex items-center gap-2">
          <MapPin size={13} aria-hidden="true" />
          {location || 'Rohtak, Haryana'}, India
        </p>

        {showHeadline ? (
          <h1 className="mt-6 text-display-xl text-bone-50">{profile.headline}</h1>
        ) : null}

        <ul
          className={cn(
            'flex flex-wrap items-center gap-x-3 gap-y-2',
            showHeadline ? 'mt-7' : 'mt-6',
          )}
        >
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

        <p className="mt-8 max-w-2xl text-xl leading-relaxed text-bone-300">{profile.shortBio}</p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link href="/about" className={buttonClass('primary', 'lg')}>
            Explore Journey
          </Link>
          <Link href="/contact" className={buttonClass('secondary', 'lg')}>
            Contact Sonu
          </Link>
        </div>

        {heroStats.length > 0 ? (
          <dl className="mt-14 grid max-w-3xl grid-cols-3 gap-4 border-t border-ink-800 pt-8 sm:gap-8">
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
    </section>
  );
}
