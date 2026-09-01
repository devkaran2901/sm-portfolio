'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

import { MediaPlaceholder } from '@/components/ui/Primitives';
import { Reveal } from '@/components/ui/Reveal';
import type { BusinessView, FacilityView } from '@/lib/content';

export function VenturesShowcase({
  facilities,
  businesses,
}: {
  facilities: FacilityView[];
  businesses: BusinessView[];
}) {
  const arenaImage = facilities.find((facility) => facility.imageUrl);
  const sportsCount = facilities.filter((facility) => facility.group !== 'HOSPITALITY').length;

  const cards = [
    {
      key: 'red-ball',
      title: 'Red Ball Sports Arena',
      category: `Sports Infrastructure · ${sportsCount} facilities`,
      href: '/red-ball',
      imageUrl: arenaImage?.imageUrl ?? null,
      imageAlt: arenaImage?.imageAlt ?? null,
    },
    ...businesses.map((business) => ({
      key: business.slug,
      title: business.name,
      category: business.category ?? business.role,
      href: `/ventures/${business.slug}`,
      imageUrl: business.images[0]?.url ?? null,
      imageAlt: business.images[0]?.alt ?? null,
    })),
  ];

  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsReduced(reducedMotion);

    let rafId = 0;

    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollable = rect.height - windowHeight;
      if (scrollable <= 0) return;

      const raw = -rect.top / scrollable;
      const progress = Math.min(1, Math.max(0, raw));
      setScrollProgress(progress);

      const idx = Math.min(cards.length - 1, Math.round(progress * (cards.length - 1)));
      setActiveIndex(idx);
    };

    const loop = () => {
      handleScroll();
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [cards.length]);

  const slideSpacingVw = 56;
  const maxShiftVw = (cards.length - 1) * slideSpacingVw;
  const trackShiftVw = scrollProgress * maxShiftVw;

  return (
    <div className="w-full">
      {/* ========================================================================= */}
      {/* DESKTOP & LAPTOP HORIZONTAL SCROLL GALLERY (>= 1024px)                     */}
      {/* ========================================================================= */}
      <div
        ref={sectionRef}
        className="hidden lg:block relative -mx-[var(--shell-gutter)] px-[var(--shell-gutter)]"
        style={{ height: isReduced ? 'auto' : `${cards.length * 85 + 20}vh` }}
      >
        <div className="sticky top-0 flex h-screen w-full flex-col justify-between py-8 overflow-hidden select-none">
          {/* Header & Controls bar */}
          <div className="flex items-end justify-between gap-6 pb-2">
            <div className="flex items-baseline gap-4">
              <span className="font-serif text-2xl font-semibold text-brass-300">
                {String(activeIndex + 1).padStart(2, '0')}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                / {String(cards.length).padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden xl:flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
                <span>Scroll to explore</span>
                <ArrowRight size={14} className="animate-pulse text-brass-400" />
              </div>
              <Link
                href="/ventures"
                className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brass-300 hover:text-brass-200 transition-colors"
              >
                <span>View All Ventures</span>
                <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>

          {/* Horizontal Project Track */}
          <div className="relative w-full flex-1 flex items-center my-auto overflow-visible">
            <div
              className="flex items-center gap-[4vw] transition-transform duration-75 ease-out will-change-transform"
              style={{
                transform: isReduced ? 'none' : `translate3d(-${trackShiftVw.toFixed(2)}vw, 0, 0)`,
              }}
            >
              {cards.map((card, index) => {
                const distance = Math.abs(scrollProgress * (cards.length - 1) - index);
                const isActive = index === activeIndex;
                const cardScale = isReduced ? 1 : Math.max(0.93, 1 - distance * 0.07);
                const cardOpacity = isReduced ? 1 : Math.max(0.5, 1 - distance * 0.45);
                const parallaxX = isReduced ? 0 : (scrollProgress * (cards.length - 1) - index) * 60;

                return (
                  <div
                    key={card.key}
                    className="shrink-0 transition-all duration-500 ease-editorial"
                    style={{
                      width: '52vw',
                      maxWidth: '680px',
                      transform: `scale(${cardScale.toFixed(3)})`,
                      opacity: cardOpacity.toFixed(2),
                    }}
                  >
                    <Link
                      href={card.href}
                      className="group relative block w-full overflow-hidden rounded-card border border-white/15 bg-ink-900 shadow-2xl transition-all duration-500 hover:border-brass-400/50"
                    >
                      {/* Image Frame */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden">
                        {card.imageUrl ? (
                          <div
                            className="absolute inset-0 h-full w-full transition-transform duration-75 ease-out"
                            style={{
                              transform: `translate3d(${parallaxX.toFixed(1)}px, 0, 0) scale(1.08)`,
                            }}
                          >
                            <Image
                              src={card.imageUrl}
                              alt={card.imageAlt ?? card.title}
                              fill
                              sizes="55vw"
                              quality={92}
                              className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <MediaPlaceholder
                            label={`${card.title} photograph`}
                            aspect="h-full w-full"
                            className="rounded-none border-0"
                          />
                        )}

                        {/* Editorial Overlays */}
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-ink-950/20 transition-opacity duration-500 group-hover:bg-ink-950/0"
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink-950 via-ink-950/80 to-transparent"
                        />

                        {/* Top Number Plate */}
                        <span
                          aria-hidden="true"
                          className="absolute left-6 top-6 font-serif text-2xl sm:text-3xl font-medium leading-none text-brass-300"
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Bottom Info Bar */}
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-7">
                        <div className="min-w-0 max-w-xl">
                          <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-brass-300/90 mb-1.5">
                            {card.category}
                          </p>
                          <h3 className="break-words font-serif text-2xl sm:text-3xl lg:text-3xl font-semibold uppercase leading-[1.12] tracking-[0.03em] text-bone-50">
                            {card.title}
                          </h3>
                        </div>

                        <span
                          aria-hidden="true"
                          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/30 text-bone-50 transition-all duration-300 group-hover:border-brass-400 group-hover:bg-brass-400 group-hover:text-ink-950 group-hover:scale-110"
                        >
                          <ArrowUpRight size={18} />
                        </span>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Dots & Progress */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              {cards.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-500 ${idx === activeIndex
                    ? 'w-8 bg-brass-400'
                    : 'w-2 bg-white/20'
                    }`}
                />
              ))}
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-white/40 font-semibold">
              Project {activeIndex + 1} of {cards.length}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE & TABLET VERTICAL EXPERIENCE (< 1024px)                             */}
      {/* ========================================================================= */}
      <div className="block lg:hidden space-y-8 sm:space-y-12">
        {cards.map((card, index) => (
          <Reveal key={card.key} delay={index * 90} className="block">
            <Link
              href={card.href}
              className="group relative block w-full overflow-hidden rounded-card border border-white/10 bg-ink-900 transition-all duration-500 hover:border-white/25"
            >
              <div className="relative aspect-[4/5] sm:aspect-[16/10] w-full">
                {card.imageUrl ? (
                  <Image
                    src={card.imageUrl}
                    alt={card.imageAlt ?? card.title}
                    fill
                    sizes="(min-width: 640px) 90vw, 95vw"
                    quality={90}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <MediaPlaceholder
                    label={`${card.title} photograph`}
                    aspect="h-full w-full"
                    className="rounded-none border-0"
                  />
                )}

                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-ink-950/25 transition-opacity duration-500 group-hover:bg-ink-950/10"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink-950 via-ink-950/80 to-transparent"
                />

                <span
                  aria-hidden="true"
                  className="absolute left-6 top-6 font-serif text-2xl font-medium leading-none text-brass-300"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-8">
                  <div className="min-w-0">
                    <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-brass-300 mb-1.5">
                      {card.category}
                    </p>
                    <h3 className="break-words font-serif text-xl sm:text-2xl font-semibold uppercase leading-[1.15] tracking-[0.04em] text-bone-50">
                      {card.title}
                    </h3>
                  </div>

                  <span
                    aria-hidden="true"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/30 text-bone-50 transition-colors group-hover:border-brass-400 group-hover:bg-brass-400 group-hover:text-ink-950"
                  >
                    <ArrowUpRight size={18} />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
