import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { ExternalTrackedLink } from '@/components/site/ExternalTrackedLink';
import { buttonClass } from '@/components/ui/Button';
import { SITE } from '@/content/defaults';
import { cn } from '@/lib/utils';

export function RedBallCta({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        // The eyebrow override goes on the block: `.eyebrow` is brass-300, the
        // red tuned for white, and it needs the brighter brass-600 over navy.
        'grain relative overflow-hidden rounded-xl2 border border-navy-700 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 p-8 sm:p-12',
        '[&_.eyebrow]:text-brass-600',
        className,
      )}
    >
      <div className="relative max-w-2xl">
        <p className="eyebrow">Red Ball Sports Arena</p>
        <h2 className="mt-4 text-display-sm text-navy-200">
          A multi-sports ecosystem built in Rohtak
        </h2>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-navy-300">
          Cricket grounds and academies, box cricket, racquet sports, fitness and hospitality on one
          site. Visit the arena website for facility details and bookings.
        </p>
        <div className="mt-8">
          <ExternalTrackedLink
            href={SITE.redBallUrl}
            event="red_ball_link_click"
            className={cn(buttonClass('accent', 'md'), 'group')}
          >
            Explore Red Ball Sports Arena
            <ArrowUpRight
              size={16}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </ExternalTrackedLink>
        </div>
      </div>
    </div>
  );
}

export function ContactCta() {
  return (
    <div className="shell">
      <div className="flex flex-col items-start justify-between gap-8 rounded-xl2 border border-navy-700 bg-navy-900 p-8 sm:p-12 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          <h2 className="text-display-sm text-navy-200">Start a conversation</h2>
          <p className="mt-3 text-[1.0625rem] leading-relaxed text-navy-300">
            Facility bookings, cricket, business, partnerships, media or events &mdash; send a
            message and it goes straight to the inbox that is actually monitored.
          </p>
        </div>
        <Link href="/contact" className={buttonClass('accent', 'lg')}>
          Get in Touch
        </Link>
      </div>
    </div>
  );
}
