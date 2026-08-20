import {
  Circle,
  Dumbbell,
  GraduationCap,
  Package,
  Target,
  UtensilsCrossed,
  Waves,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { MediaPlaceholder } from '@/components/ui/Primitives';
import { Reveal } from '@/components/ui/Reveal';
import { FACILITY_GROUP_LABELS } from '@/content/defaults';
import type { FacilityView } from '@/lib/content';

const ICONS: Record<string, LucideIcon> = {
  target: Target,
  graduation: GraduationCap,
  box: Package,
  racquet: Zap,
  dumbbell: Dumbbell,
  waves: Waves,
  utensils: UtensilsCrossed,
  dot: Circle,
};

const GROUP_ORDER: Array<FacilityView['group']> = ['CRICKET', 'RACQUET', 'FITNESS', 'HOSPITALITY'];

/**
 * Photography-led facility grid.
 *
 * Real images are rendered when a facility has them; otherwise a clearly
 * labelled placeholder appears. No stock or generated photography stands in for
 * a facility that has not been photographed yet.
 */
export function FacilityShowcase({ facilities }: { facilities: FacilityView[] }) {
  const grouped = GROUP_ORDER.map((group) => ({
    group,
    label: FACILITY_GROUP_LABELS[group],
    items: facilities.filter((facility) => facility.group === group),
  })).filter((section) => section.items.length > 0);

  return (
    <div className="space-y-16">
      {grouped.map((section) => (
        <div key={section.group}>
          <div className="flex items-baseline gap-4">
            <h3 className="font-display text-2xl text-bone-50">{section.label}</h3>
            <span aria-hidden="true" className="rule flex-1" />
            <span className="text-xs uppercase tracking-[0.14em] text-bone-500">
              {section.items.length} {section.items.length === 1 ? 'facility' : 'facilities'}
            </span>
          </div>

          <ul className="mt-7 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {section.items.map((facility, index) => {
              const Icon = ICONS[facility.iconKey] ?? Circle;
              return (
                <Reveal as="li" key={facility.id} delay={Math.min(index * 60, 240)}>
                  <article className="group h-full overflow-hidden rounded-xl2 border border-ink-700/70 bg-ink-900/60 transition-all duration-300 ease-editorial hover:-translate-y-1 hover:border-brass-500/40 hover:shadow-lift">
                    <MediaPlaceholder
                      label={`${facility.name} photograph`}
                      aspect="aspect-[16/10]"
                      className="rounded-none border-0 border-b border-dashed border-ink-700"
                    />

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-display text-xl text-bone-50">{facility.name}</h4>
                          {facility.quantity ? (
                            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-brass-300">
                              {facility.quantity} {facility.unitLabel ?? ''}
                            </p>
                          ) : null}
                        </div>
                        <span
                          aria-hidden="true"
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink-600 text-turf-300 transition-colors group-hover:border-turf-500/60"
                        >
                          <Icon size={17} />
                        </span>
                      </div>

                      <p className="mt-4 text-[0.9375rem] leading-relaxed text-bone-400">
                        {facility.description}
                      </p>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
