'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

import { MediaPlaceholder } from '@/components/ui/Primitives';
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

  const desktopSectionRef = useRef<HTMLDivElement>(null);
  const mobileSectionRef = useRef<HTMLDivElement>(null);

  const [desktopScrollProgress, setDesktopScrollProgress] = useState(0);
  const [mobileScrollProgress, setMobileScrollProgress] = useState(0);
  const [desktopActiveIndex, setDesktopActiveIndex] = useState(0);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsReduced(reducedMotion);

    let rafId = 0;

    const handleScroll = () => {
      // Desktop scroll calculation
      if (desktopSectionRef.current) {
        const rect = desktopSectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const scrollable = rect.height - windowHeight;
        if (scrollable > 0) {
          const raw = -rect.top / scrollable;
          const progress = Math.min(1, Math.max(0, raw));
          setDesktopScrollProgress(progress);
          const idx = Math.min(cards.length - 1, Math.round(progress * (cards.length - 1)));
          setDesktopActiveIndex(idx);
        }
      }

      // Mobile scroll calculation
      if (mobileSectionRef.current) {
        const rect = mobileSectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const scrollable = rect.height - windowHeight;
        if (scrollable > 0) {
          const raw = -rect.top / scrollable;
          const progress = Math.min(1, Math.max(0, raw));
          setMobileScrollProgress(progress);
          const idx = Math.min(cards.length - 1, Math.floor(progress * cards.length));
          setMobileActiveIndex(idx);
        }
      }
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
  const trackShiftVw = desktopScrollProgress * maxShiftVw;

  return (
    <div className="w-full">
      {/* ========================================================================= */}
      {/* DESKTOP & LAPTOP HORIZONTAL SCROLL GALLERY (>= 1024px)                     */}
      {/* ========================================================================= */}
      <div
        ref={desktopSectionRef}
        className="hidden lg:block relative -mx-[var(--shell-gutter)] px-[var(--shell-gutter)]"
        style={{ height: isReduced ? 'auto' : `${cards.length * 85 + 20}vh` }}
      >
        <div className="sticky top-0 flex h-screen w-full flex-col justify-between py-8 overflow-hidden select-none">
          {/* Header & Controls bar */}
          <div className="flex items-end justify-between gap-6 pb-2">
            <div className="flex items-baseline gap-4">
              <span className="font-serif text-2xl font-semibold text-brass-300">
                {String(desktopActiveIndex + 1).padStart(2, '0')}
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
                const distance = Math.abs(desktopScrollProgress * (cards.length - 1) - index);
                const cardScale = isReduced ? 1 : Math.max(0.93, 1 - distance * 0.07);
                const cardOpacity = isReduced ? 1 : Math.max(0.5, 1 - distance * 0.45);
                const parallaxX = isReduced ? 0 : (desktopScrollProgress * (cards.length - 1) - index) * 60;

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
                  className={`h-1.5 rounded-full transition-all duration-500 ${idx === desktopActiveIndex
                      ? 'w-8 bg-brass-400'
                      : 'w-2 bg-white/20'
                    }`}
                />
              ))}
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-white/40 font-semibold">
              Project {desktopActiveIndex + 1} of {cards.length}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE & TABLET OVERLAPPING STACK OF PROJECTS (< 1024px)                  */}
      {/* ========================================================================= */}
      <div
        ref={mobileSectionRef}
        className="block lg:hidden relative -mx-[var(--shell-gutter)] px-[var(--shell-gutter)]"
        style={{ height: isReduced ? 'auto' : `${cards.length * 85 + 20}vh` }}
      >
        <div className="sticky top-0 flex h-dvh w-full flex-col justify-between py-5 overflow-hidden select-none">
          {/* Header & Controls bar */}
          <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/10">
            <Link
              href="/ventures"
              className="group inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-brass-300 hover:text-brass-200 transition-colors"
            >
              <span>View All Ventures</span>
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <div className="flex items-baseline gap-2">
              <span className="font-serif text-xl font-semibold text-brass-300">
                {String(mobileActiveIndex + 1).padStart(2, '0')}
              </span>
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-white/40">
                / {String(cards.length).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Overlapping Image Stack Container */}
          <div className="relative w-full flex-1 flex items-center justify-center my-auto px-2">
            <div className="relative w-full aspect-[3/4] max-h-[58vh] max-w-[390px] flex items-center justify-center">
              {cards.map((card, index) => {
                const floatProgress = mobileScrollProgress * (cards.length - 1);
                const rel = index - floatProgress;

                let translateY = 0;
                let scale = 1;
                let rotate = 0;
                let opacity = 1;
                let zIndex = cards.length - index;

                if (isReduced) {
                  if (index !== mobileActiveIndex) return null;
                } else if (rel < 0) {
                  // Card has exited upward
                  translateY = rel * 105;
                  scale = Math.max(0.92, 1 + rel * 0.05);
                  rotate = rel * 4;
                  opacity = Math.max(0, 1 + rel * 1.4);
                  zIndex = 20 - Math.abs(Math.round(rel));
                } else if (rel < 1) {
                  // Front active card moving to stack layer 2
                  const p = rel;
                  translateY = p * 18;
                  scale = 1 - p * 0.05;
                  rotate = p * 1.2;
                  opacity = 1 - p * 0.15;
                  zIndex = cards.length - Math.floor(rel);
                } else if (rel < 2) {
                  // Stack layer 2 moving to stack layer 3
                  const p = rel - 1;
                  translateY = 18 + p * 18;
                  scale = 0.95 - p * 0.05;
                  rotate = 1.2 - p * 2.4;
                  opacity = 0.85 - p * 0.25;
                  zIndex = cards.length - 1 - Math.floor(rel);
                } else {
                  // Deeper rear stack layers
                  const p = Math.min(2, rel - 2);
                  translateY = 36 + p * 12;
                  scale = Math.max(0.85, 0.90 - p * 0.04);
                  rotate = -1.2;
                  opacity = Math.max(0, 0.60 - p * 0.40);
                  zIndex = 1;
                }

                return (
                  <div
                    key={card.key}
                    className="absolute inset-0 w-full h-full transition-transform duration-75 ease-out will-change-transform"
                    style={{
                      transform: isReduced
                        ? 'none'
                        : `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(3)}) rotate(${rotate.toFixed(2)}deg)`,
                      opacity: opacity.toFixed(2),
                      zIndex,
                      pointerEvents: Math.abs(rel) < 0.5 ? 'auto' : 'none',
                    }}
                  >
                    <Link
                      href={card.href}
                      className="group relative block h-full w-full overflow-hidden rounded-card border border-white/15 bg-ink-900 shadow-2xl transition-all duration-300 hover:border-brass-400/50"
                    >
                      <div className="relative h-full w-full overflow-hidden">
                        {card.imageUrl ? (
                          <Image
                            src={card.imageUrl}
                            alt={card.imageAlt ?? card.title}
                            fill
                            sizes="(min-width: 640px) 400px, 92vw"
                            quality={90}
                            className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
                          />
                        ) : (
                          <MediaPlaceholder
                            label={`${card.title} photograph`}
                            aspect="h-full w-full"
                            className="rounded-none border-0"
                          />
                        )}

                        {/* Overlays */}
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-ink-950/20"
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-ink-950 via-ink-950/85 to-transparent"
                        />

                        {/* Top Number Plate */}
                        <span
                          aria-hidden="true"
                          className="absolute left-5 top-5 font-serif text-2xl font-medium leading-none text-brass-300 drop-shadow-md"
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>

                        {/* Bottom Info Bar Overlay */}
                        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                          <div className="min-w-0">
                            <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-brass-300 mb-1">
                              {card.category}
                            </p>
                            <h3 className="break-words font-serif text-xl sm:text-2xl font-semibold uppercase leading-[1.12] tracking-[0.03em] text-bone-50">
                              {card.title}
                            </h3>
                          </div>

                          <span
                            aria-hidden="true"
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/30 text-bone-50 transition-colors group-hover:border-brass-400 group-hover:bg-brass-400 group-hover:text-ink-950"
                          >
                            <ArrowUpRight size={17} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Progress Cue */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-white/40">
            <span>Scroll to unveil stack</span>
            <div className="flex items-center gap-1.5">
              {cards.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === mobileActiveIndex ? 'w-6 bg-brass-400' : 'w-1.5 bg-white/20'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
