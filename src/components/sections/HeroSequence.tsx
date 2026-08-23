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
const RUNWAY_VH = Math.min(320, Math.max(180, FRAME_COUNT * 1.8));

/** Simultaneous image requests. Enough to saturate, few enough to stay polite. */
const CONCURRENCY = 6;

/**
 * Fraction of the frame height kept in view. The subject occupies ~5%-95% of
 * this footage, so 0.75 shows head through mid-shin.
 */
const SUBJECT_FRACTION = 0.75;

/**
 * Fraction of the frame height discarded before anything is drawn.
 *
 * The source clip carries a generative-AI watermark near the bottom right -
 * measured at x 576-623, y 1136-1183 of the 720x1280 frame, in the same place
 * on all 120 frames, so its top edge sits at 88.75% of frame height. On a wide
 * stage the subject cap hid it, but on a phone the cover fit is height-driven
 * and the whole frame height is on screen, so the mark was visible.
 *
 * Trimming 16% clears it by ~60px and puts the cut on the shin rather than the
 * ankle. Keep this below 1 - SUBJECT_FRACTION: that inequality is what
 * guarantees the drawn height always covers the stage, so the trim can never
 * leave an unpainted strip along the bottom.
 */
const FRAME_BOTTOM_TRIM = 0.16;

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
  const [loadState, setLoadState] = useState({ loaded: 0, planned: FRAME_COUNT });

  const hasFrames = FRAME_COUNT > 0;

  // ---- load ---------------------------------------------------------------
  useEffect(() => {
    if (!hasFrames) return;

    framesRef.current = new Array(FRAME_COUNT).fill(null);
    let cancelled = false;
    let loaded = 0;

    const load = (index: number, planned: number) =>
      new Promise<void>((resolve) => {
        const image = new window.Image();
        image.decoding = 'async';
        image.src = frameUrl(index);
        const done = () => {
          if (cancelled) return resolve();
          loaded += 1;
          setLoadState({ loaded, planned });
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

    /*
     * On a narrow screen every second frame is skipped. The whole sequence is
     * downloaded before it can be scrubbed, so on mobile data that halves the
     * cost; the scrub stays smooth because `nearestLoaded` snaps to the
     * neighbouring frame, and at 24fps the difference between adjacent frames
     * is imperceptible while scrolling.
     */
    const stride = window.matchMedia('(max-width: 767px)').matches ? 2 : 1;
    const plan: number[] = [];
    for (let index = 0; index < FRAME_COUNT; index += stride) plan.push(index);
    // Always include the final frame, so the sequence ends where the clip does.
    if (plan[plan.length - 1] !== FRAME_COUNT - 1) plan.push(FRAME_COUNT - 1);

    (async () => {
      await load(plan[0]!, plan.length);
      if (cancelled) return;

      let cursor = 1;
      const workers = Array.from({ length: CONCURRENCY }, async () => {
        while (!cancelled) {
          const position = cursor;
          cursor += 1;
          if (position >= plan.length) break;
          await load(plan[position]!, plan.length);
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

    /**
     * Draws a frame so the subject is framed head-down, not cropped to a strip.
     *
     * A plain cover fit fails badly here: the footage is 720x1280 portrait, so
     * on a wide stage the width drives the scale, the frame is blown up ~2.6x,
     * and the visible slice is a band across the middle - torso only, no face.
     *
     * Instead the scale is capped so the top SUBJECT_FRACTION of the frame
     * always fits the stage height, and the frame is anchored to the top. In
     * this footage the subject runs from ~5% to ~95% of frame height, so 0.75
     * lands on head-through-mid-shin: three quarters of the body, legs cropped.
     *
     * When that leaves the frame narrower than the stage, the margins are
     * filled with a zoomed, knocked-back copy of the same frame rather than an
     * invented colour, so the edges always belong to the footage.
     *
     * Both draws sample a source rectangle that stops short of the bottom of
     * the frame, so the watermarked strip is never read - not for the subject
     * and not for the knocked-back margins either.
     */
    const paint = (image: HTMLImageElement) => {
      const { width: cw, height: ch } = canvas;
      const iw = image.naturalWidth;
      const ih = image.naturalHeight;

      // The usable source: everything above the trim line.
      const sh = ih * (1 - FRAME_BOTTOM_TRIM);

      const coverScale = Math.max(cw / iw, ch / sh);
      const subjectScale = ch / (SUBJECT_FRACTION * ih);
      const scale = Math.min(coverScale, subjectScale);

      const dw = iw * scale;
      const dh = sh * scale;

      if (dw < cw - 1) {
        const bw = iw * coverScale;
        const bh = sh * coverScale;
        context.drawImage(image, 0, 0, iw, sh, (cw - bw) / 2, (ch - bh) / 2, bw, bh);
        context.fillStyle = 'rgba(10,10,11,0.62)';
        context.fillRect(0, 0, cw, ch);
      }

      // Top-anchored: overflow is taken off the bottom, never off the head.
      context.drawImage(image, 0, 0, iw, sh, (cw - dw) / 2, 0, dw, dh);
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
  }, [hasFrames, loadState.loaded]);

  return (
    <section
      ref={sectionRef}
      aria-label={`${name} — introduction`}
      /*
        Pulled up under the fixed header so the stage runs edge to edge.

        The near-black and the white below are literals, not palette tokens,
        and that is deliberate. This stage sits outside the site restyle, but
        it used to reach the ground it wanted through `bone-50` and `ink-900`
        - surface and content roles - and the rest of the site went dark by
        changing what those roles resolve to. Left as tokens, the stage would
        have flipped to white-with-navy-type along with everything else. These
        are the values the tokens carried before that change.
      */
      className="relative -mt-[4.5rem] bg-[#0A0A0B]"
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
          {/*
            Word spacing is pinned here rather than inherited. Headings take
            0.1em from the base rule, which is right at reading sizes and far
            too much at 13rem - and this line is `whitespace-nowrap` and sized
            in vw to just fit the viewport, so widening it is what pushes the
            page into a horizontal scroll.
          */}
          <h1 className="whitespace-nowrap text-center text-[clamp(2.25rem,15.5vw,13rem)] leading-[1.05] tracking-[0.005em] [word-spacing:0.02em] text-white [text-shadow:0_2px_28px_rgba(10,10,11,0.38)]">
            {name}
          </h1>
        </div>

        {/* Scroll cue, retired once the reader has started. */}
        <div
          aria-hidden="true"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 transition-opacity duration-500"
          style={{ opacity: started ? 0 : 1 }}
        >
          <span className="text-sm uppercase tracking-[0.2em] text-white/70">Scroll</span>
        </div>

        {/* Scroll cue and loading readout sit above; sentinel is below. */}

        {/* Loading readout: only while a meaningful share is still outstanding. */}
        {hasFrames && loadState.loaded < loadState.planned && loadState.loaded > 0 ? (
          <div
            aria-hidden="true"
            className="absolute bottom-10 right-[var(--shell-gutter)] text-xs uppercase tracking-[0.16em] text-white/45"
          >
            {Math.round((loadState.loaded / loadState.planned) * 100)}%
          </div>
        ) : null}
      </div>

    </section>
  );
}
