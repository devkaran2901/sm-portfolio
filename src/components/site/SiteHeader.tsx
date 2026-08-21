'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

import { NAV_LINKS } from '@/content/defaults';
import { cn } from '@/lib/utils';
import { buttonClass } from '@/components/ui/Button';

/**
 * Sticky site header.
 *
 * The mobile panel is a focus-trapped dialog: Escape closes it, focus moves to
 * the first item on open and returns to the trigger on close, and background
 * scrolling is locked while it is open.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /*
   * The home page opens with a full-viewport scroll sequence, and the nav would
   * sit on top of it. It is held back until the sequence has run.
   *
   * The initial value comes from the pathname rather than an effect: the server
   * knows the path too, so both renders agree and the nav never flashes on
   * before hiding itself.
   */
  const [heroHidden, setHeroHidden] = useState(pathname === '/');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sentinel = document.querySelector('[data-hero-sequence-end]');

    // Every other page has no sequence, so the nav behaves normally. The reset
    // is deferred a frame rather than set inline: the header survives
    // client-side navigation, so this runs when leaving the home page mid-
    // sequence, and setting state synchronously here would cascade a render.
    if (!sentinel) {
      const frame = requestAnimationFrame(() => setHeroHidden(false));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        // Revealed once the end marker has passed above the viewport, which is
        // the moment the last frame has been scrubbed.
        setHeroHidden(entry.isIntersecting || entry.boundingClientRect.top > 0);
      },
      { threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [pathname]);

  // A keyboard user at the top of the page would otherwise have no way to reach
  // the nav, so the first Tab press brings it back regardless of scroll.
  useEffect(() => {
    if (!heroHidden) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') setHeroHidden(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [heroHidden]);

  // Nav links close the panel themselves on click. This covers the other way a
  // route can change while it is open: the browser back and forward buttons.
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener('popstate', close);
    return () => window.removeEventListener('popstate', close);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector<HTMLElement>('a, button')?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables?.length) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-editorial',
        /*
          Solid white, not a translucent pane over a blur. The ground is light
          grey and the cards are white, so a semi-transparent bar let card
          edges and body copy read straight through the nav and the links had
          to compete with whatever happened to be behind them. Depth comes from
          a shadow once the page has moved instead.
        */
        'border-b border-ink-700 bg-ink-900',
        scrolled || open ? 'shadow-card' : 'shadow-none',
        // `invisible` matters as much as the opacity: it takes the links out of
        // the tab order while the nav is off screen, so focus cannot land on
        // something the reader cannot see.
        heroHidden
          ? 'invisible -translate-y-full opacity-0'
          : 'visible translate-y-0 opacity-100',
      )}
    >
      <div className="shell flex h-[4.5rem] items-center justify-between gap-6">
        <Link
          href="/"
          /*
            Anton is condensed and ships one weight, so the old
            `font-semibold tracking-tight` pair worked against it twice: the
            weight request had no 600 to resolve to and got synthesised by
            stroke-widening, and the negative tracking closed the gaps that
            widening had already eaten. At 1.125rem the two words ran together.
            The face carries its own weight - it needs air, not more ink.
          */
          className="group flex min-h-[44px] items-center gap-2.5 font-display text-lg tracking-[0.015em] [word-spacing:0.16em] text-bone-50"
        >
          Sonu Malik
          <span
            aria-hidden="true"
            className="hidden h-1.5 w-1.5 rounded-full bg-turf-400 transition-transform duration-300 group-hover:scale-150 sm:block"
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.filter((link) => link.href !== '/contact').map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={cn(
                'relative rounded-full px-4 py-2 text-[0.9375rem] font-medium transition-colors duration-200',
                isActive(link.href)
                  ? 'text-bone-50'
                  : 'text-bone-400 hover:text-bone-100',
              )}
            >
              {link.label}
              {isActive(link.href) ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3.5 -bottom-0.5 h-px bg-brass-400/80"
                />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/*
            Shown at every width. It used to be `hidden sm:inline-flex`, which
            removed the one direct route to contact on exactly the devices with
            the least patience for hunting through a menu. `primary` is already
            black on white, so it reads as the single action in the bar.

            Padding tightens on mobile: at 320px the wordmark, this and the
            menu trigger have to share the row.
          */}
          <Link
            href="/contact"
            className={cn(buttonClass('primary', 'sm'), 'px-4 sm:px-5')}
          >
            Contact Me
          </Link>

          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="grid h-10 w-10 min-h-[44px] min-w-[44px] place-items-center rounded-full border border-ink-600 text-bone-100 transition-colors hover:border-brass-400/60 lg:hidden"
          >
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          ref={panelRef}
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="border-t border-ink-700 bg-ink-900 lg:hidden"
        >
          <nav aria-label="Mobile" className="shell flex flex-col py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                /*
                  Black on white, and the active item is carried by weight
                  rather than colour. It used to be brass-200 against
                  bone-200 - #1F2124 against #202124 - which is a three-value
                  difference nobody can see, so the panel had no visible
                  current-page state at all.
                */
                className={cn(
                  'flex items-center justify-between border-b border-ink-800 py-3.5 text-[0.9375rem] text-bone-50 transition-colors last:border-b-0 hover:text-bone-300',
                  isActive(link.href) ? 'font-semibold' : 'font-normal',
                )}
              >
                {link.label}
                <span aria-hidden="true" className="text-ink-400">
                  &rarr;
                </span>
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
