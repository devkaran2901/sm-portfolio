'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Scroll-reveal wrapper.
 *
 * Uses IntersectionObserver, unobserves after the first reveal, and does nothing
 * at all when the user prefers reduced motion - content is rendered visible from
 * the start in that case, never hidden behind an animation that will not run.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'article';
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      // Reveal immediately. Deferred to the next frame rather than set inline,
      // because a synchronous setState in an effect forces a cascading render.
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      id={id}
      data-reveal
      className={cn(
        'transition-[opacity,transform] duration-700 ease-editorial will-change-[opacity,transform]',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',
        className,
      )}
      style={{ transitionDelay: visible && delay ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  );
}
