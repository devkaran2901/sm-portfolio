'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import manifest from '@/content/frame-manifest.json';
import { cn } from '@/lib/utils';

/**
 * Scroll-driven hero: an image sequence painted to a canvas, with the name
 * locked in front of it.
 *
 * Mechanics: the section is a tall scroll runway containing one sticky,
 * viewport-height stage. Scroll position through the runway maps to a frame
 * index, so the sequence is scrubbed by the reader rather than played on a
 * timer, and it can be scrolled backwards.
 *
 * Frames are painted to a <canvas> instead of swapping <img> elements. Swapping
 * elements makes the browser re-composite a new layer on every frame, which
 * stutters once the sequence is more than a few dozen images; drawing to one
 * canvas keeps it to a single surface.
 *
 * Loading: frame one is fetched first so the stage paints immediately, then the
 * rest stream in behind it with a small concurrency window. Until a given frame
 * has arrived the nearest loaded one is drawn, so scrubbing never shows a gap.
 *
 * Degradation, in order:
 *   - no frames in public/frames  -> the portrait renders as a still backdrop
 *   - prefers-reduced-motion      -> frame one only, no scrubbing
 *   - no JavaScript               -> the <noscript> still and the name
 */

type Props = {
  name: string;
  /** Shown when no frames exist yet, and inside <noscript>. */
  fallbackImageUrl?: string | null;
  fallbackAlt?: string | null;
};

const FRAME_COUNT = manifest.frameCount;
const BASE_URL = (process.env.NEXT_PUBLIC_FRAMES_BASE_URL ?? '/frames').replace(/\/+$/, '');

/** Longer sequences earn a longer runway, within sane bounds. */
const RUNWAY_VH = Math.min(500, Math.max(220, FRAME_COUNT * 2.4));

/** Simultaneous image requests. Enough to saturate, few enough to stay polite. */
const CONCURRENCY = 6;

function frameUrl(index: number): string {
  const number = String(manifest.start + index).padStart(manifest.pad, '0');
  return `${BASE_URL}/${manifest.prefix}${number}${manifest.extension}`;
}

export function HeroSequence({ name, fallbackImageUrl, fallbackAlt }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<Array<HTMLImageElement | null>>([]);
  const drawnIndexRef = useRef(-1);
  const startedRef = useRef(false);
  const rafRef = useRef(0);

  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  const hasFrames = FRAME_COUNT > 0;

  // ---- load ---------------------------------------------------------------
  useEffect(() => {
    if (!hasFrames) return;

    framesRef.current = new Array(FRAME_COUNT).fill(null);
    let cancelled = false;
    let loaded = 0;

    const load = (index: number) =>
      new Promise<void>((resolve) => {
        const image = new window.Image();
        image.decoding = 'async';
        image.src = frameUrl(index);
        const done = () => {
          if (cancelled) return resolve();
          loaded += 1;
          setLoadedCount(loaded);
          resolve();
        };
        image.onload = () => {
          framesRef.current[index] = image;
          if (index === 0 && !cancelled) setReady(true);
          done();
        };
        // A missing frame must not stall the queue behind it.
        image.onerror = done;
      });

    (async () => {
      await load(0);
      if (cancelled) return;

      // Simple worker pool over the remaining indices.
      let next = 1;
      const workers = Array.from({ length: CONCURRENCY }, async () => {
        while (!cancelled) {
          const index = next;
          next += 1;
          if (index >= FRAME_COUNT) break;
          await load(index);
        }
      });
      await Promise.all(workers);
    })();

    return () => {
      cancelled = true;
    };
  }, [hasFrames]);

  // ---- paint --------------------------------------------------------------
  useEffect(() => {
    if (!hasFrames) return;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /** Draws `image` to cover the canvas, centred, preserving aspect ratio. */
    const paint = (image: HTMLImageElement) => {
      const { width: cw, height: ch } = canvas;
      const scale = Math.max(cw / image.naturalWidth, ch / image.naturalHeight);
      const dw = image.naturalWidth * scale;
      const dh = image.naturalHeight * scale;
      context.drawImage(image, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    /** Falls back outward to the closest frame that has actually arrived. */
    const nearestLoaded = (target: number): HTMLImageElement | null => {
      const frames = framesRef.current;
      if (frames[target]) return frames[target];
      for (let offset = 1; offset < FRAME_COUNT; offset += 1) {
        if (frames[target - offset]) return frames[target - offset]!;
        if (frames[target + offset]) return frames[target + offset]!;
      }
      return null;
    };

    const resize = () => {
      // Cap DPR at 2: beyond that the extra pixels cost more than they show.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      drawnIndexRef.current = -1;
    };

    const render = () => {
      rafRef.current = requestAnimationFrame(render);

      const rect = section.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const raw = scrollable > 0 ? -rect.top / scrollable : 0;
      const value = Math.min(1, Math.max(0, raw));

      // Only a threshold crossing reaches React; the float stays in the loop.
      if (value > 0.04 !== startedRef.current) {
        startedRef.current = value > 0.04;
        setStarted(startedRef.current);
      }

      const index = reduced ? 0 : Math.min(FRAME_COUNT - 1, Math.round(value * (FRAME_COUNT - 1)));
      if (index === drawnIndexRef.current) return;

      const image = nearestLoaded(index);
      if (!image) return;
      paint(image);
      drawnIndexRef.current = index;
    };

    resize();
    rafRef.current = requestAnimationFrame(render);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [hasFrames, loadedCount]);

  return (
    <section
      ref={sectionRef}
      aria-label={`${name} — introduction`}
      // Pulled up under the fixed header so the stage runs edge to edge.
      className="relative -mt-[4.5rem] bg-bone-50"
      style={{ height: hasFrames ? `${RUNWAY_VH}vh` : undefined }}
    >
      <div className="sticky top-0 flex h-dvh w-full items-center justify-center overflow-hidden">
        {hasFrames ? (
          <>
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              className={cn(
                'absolute inset-0 h-full w-full transition-opacity duration-700',
                ready ? 'opacity-100' : 'opacity-0',
              )}
            />
            <noscript>
              {fallbackImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- noscript cannot use next/image
                <img
                  src={fallbackImageUrl}
                  alt={fallbackAlt ?? name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
            </noscript>
          </>
        ) : fallbackImageUrl ? (
          <Image
            src={fallbackImageUrl}
            alt={fallbackAlt ?? name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : null}

        {/*
          No scrim over the frames: the clip plays at its own brightness.
          Legibility is handled on the text itself instead, so nothing dims the
          image to buy it.
        */}
        <div className="relative flex w-full flex-col items-center px-[var(--shell-gutter)]">
          {/*
            One line, sized in vw so it scales to the viewport instead of
            wrapping. `whitespace-nowrap` keeps it on a single line at every
            width; the clamp floor stops it collapsing on narrow phones.

            The name holds steady for the whole sequence - it does not fade or
            scale, so only the frames behind it move. The soft shadow is the
            one legibility concession, and it costs the image nothing because
            it is drawn on the glyphs rather than over the frame.
          */}
          <h1 className="whitespace-nowrap text-center text-[clamp(2.25rem,15.5vw,13rem)] leading-[1.05] tracking-[0.005em] text-ink-900 [text-shadow:0_2px_28px_rgba(10,10,11,0.38)]">
            {name}
          </h1>
        </div>

        {/* Scroll cue, retired once the reader has started. */}
        <div
          aria-hidden="true"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 transition-opacity duration-500"
          style={{ opacity: started ? 0 : 1 }}
        >
          <span className="text-sm uppercase tracking-[0.2em] text-ink-900/70">Scroll</span>
        </div>

        {/* Scroll cue and loading readout sit above; sentinel is below. */}

        {/* Loading readout: only while a meaningful share is still outstanding. */}
        {hasFrames && loadedCount < FRAME_COUNT && loadedCount > 0 ? (
          <div
            aria-hidden="true"
            className="absolute bottom-10 right-[var(--shell-gutter)] text-xs uppercase tracking-[0.16em] text-ink-900/45"
          >
            {Math.round((loadedCount / FRAME_COUNT) * 100)}%
          </div>
        ) : null}
      </div>

      {/*
        Marks the end of the runway. SiteHeader observes this to know when the
        sequence is done, so the nav can stay out of the way until then. A
        sentinel is used rather than a shared state store because the header
        lives in the layout and the sequence in the page - they have no common
        ancestor to hold that state.
      */}
      <div data-hero-sequence-end aria-hidden="true" className="absolute bottom-0 h-px w-full" />
    </section>
  );
}
