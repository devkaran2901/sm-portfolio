import { INTERNATIONAL } from '@/content/defaults';
import { Reveal } from '@/components/ui/Reveal';

/**
 * International club cricket.
 *
 * A stylised coordinate grid rather than a detailed world map: it stays light
 * (no large geo paths to download) and the markers are real anchors, so the
 * section is keyboard navigable. The list below carries the same information in
 * plain HTML, which is what crawlers and screen readers read.
 *
 * Wording note: this is club cricket abroad. Nothing here implies national
 * representation.
 */
export function InternationalMap() {
  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-7">
        <div className="relative overflow-hidden rounded-xl2 border border-ink-700/70 bg-ink-900/50 p-4">
          <div className="relative aspect-[2/1] w-full">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(58,60,63,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(58,60,63,0.18) 1px, transparent 1px)',
                backgroundSize: '8.333% 12.5%',
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-brass-500/30"
            />

            {INTERNATIONAL.map((place) => (
              <a
                key={place.code}
                href={`#country-${place.code.toLowerCase()}`}
                className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-offset-4"
                style={{ left: `${place.x}%`, top: `${place.y}%` }}
              >
                <span className="sr-only">
                  {place.country} — {place.detail}
                </span>
                <span
                  aria-hidden="true"
                  className="relative block h-3 w-3 rounded-full bg-turf-300 ring-4 ring-turf-500/25 transition-all duration-300 group-hover:scale-125 group-hover:ring-turf-400/40 group-focus-visible:scale-125"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-ink-600 bg-ink-950/95 px-2.5 py-1 text-[0.6875rem] font-medium tracking-wide text-bone-200 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {place.country}
                </span>
              </a>
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs text-bone-500">
          Marker positions are indicative only and are not drawn to scale.
        </p>
      </div>

      <ul className="lg:col-span-5">
        {INTERNATIONAL.map((place, index) => (
          <Reveal
            as="li"
            key={place.code}
            id={`country-${place.code.toLowerCase()}`}
            delay={index * 80}
            className="scroll-mt-28 border-b border-ink-800 py-6 first:pt-0 last:border-b-0"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-display text-2xl text-bone-50">{place.country}</h3>
              <span className="text-xs uppercase tracking-[0.14em] text-brass-300">
                {place.code}
              </span>
            </div>
            <p className="mt-1.5 text-sm font-medium text-turf-200">{place.detail}</p>
            <p className="mt-2 text-sm leading-relaxed text-bone-400">{place.note}</p>
          </Reveal>
        ))}

        <li className="pt-6">
          <p className="text-xs leading-relaxed text-bone-500">
            These are international <strong className="text-bone-300">club</strong> cricket
            experiences. They do not represent national-team selection or professional BCCI
            competition.
          </p>
        </li>
      </ul>
    </div>
  );
}
