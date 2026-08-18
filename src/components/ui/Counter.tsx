'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Animated statistic.
 *
 * Values here are strings like "50+" or "6+", so the numeric part is animated
 * and any prefix/suffix is preserved verbatim. Non-numeric values render as-is.
 * The final value is in the DOM from the first paint for screen readers and for
 * anyone who prefers reduced motion.
 */
export function Counter({ value, durationMs = 1100 }: { value: string; durationMs?: number }) {
  const match = value.match(/^(\D*)(\d[\d,]*)(.*)$/);
  const target = match ? Number(match[2]!.replace(/,/g, '')) : null;

  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState<number | null>(target);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (target === null) return;
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            setStarted(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [target, started]);

  useEffect(() => {
    if (!started || target === null) return;
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      // Ease-out cubic: fast to begin, settles gently on the final number.
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    // The first frame writes 0 itself, so no synchronous reset is needed here.
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, target, durationMs]);

  if (target === null || !match) return <span>{value}</span>;

  return (
    <span ref={ref}>
      {match[1]}
      {(display ?? target).toLocaleString('en-IN')}
      {match[3]}
    </span>
  );
}
