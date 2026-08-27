'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

import { NAV_LINKS, PRIMARY_NAV, SITE } from '@/content/defaults';
import { cn } from '@/lib/utils';

/**
 * Fixed site header.
 *
 * Wordmark left, the six primary routes right, and a circular trigger on the
 * far end that opens the full route list. The trigger is shown at every width,
 * not just on a phone: the bar carries a shortened nav by design, so the panel
 * behind it is the only place the complete list exists, and hiding it on the
 * desktop would make routes like Players & Impact unreachable from the bar.
 *
 * The panel is a focus-trapped dialog: Escape closes it, focus moves to the
 * first item on open and returns to the trigger on close, and background
 * scrolling is locked while it is open.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  /*
   * `/about#journey` and `/about` are different nav entries pointing at the same
   * document, so the trailing fragment has to be dropped before the comparison
   * or neither would ever match. Both light up on /about, which is honest: the
   * reader is on the page both of them lead to.
   */
  const isActive = (href: string) => {
    const path = href.split('#')[0]!;
    return path === '/' ? pathname === '/' : pathname.startsWith(path);
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 bg-ink-950 transition-[box-shadow,border-color] duration-500 ease-editorial',
        /*
          Solid at every scroll position, not a pane that fades in.

          A transparent bar over the opening frames of the scroll sequence looks
          better in a screenshot and worse in use: the links then sit on
          whatever the sequence happens to be showing, and the sequence is a
          moving image. The bar stays opaque and only its edge changes - the
          hairline and the shadow arrive once the page has moved, which is the
          part that needs to signal depth.
        */
        scrolled || open ? 'border-b border-white/10 shadow-card' : 'border-b border-transparent',
      )}
    >
      <div className="shell flex h-[4.5rem] items-center justify-between gap-6">
        {/*
          The wordmark, split across two weights of the same serif. "SONU" is
          the light half and "MALIK" the solid one, which is the whole device -
          no second colour, no second face, just the surname carrying more ink
          than the given name. Tracking is wide because the two words are set in
          caps at 1rem, where a serif closes up without it.
        */}
        <Link
          href="/"
          className="group flex min-h-[44px] items-center gap-3 font-serif text-[1.0625rem] uppercase tracking-[0.22em] text-bone-50"
        >
          {/*
            The monogram: a gold-ringed "SM", set apart from the wordmark it
            precedes. It is what the giant watermark in the hero echoes, so the
            same two letters appear at both the smallest and the largest scale
            on the page.
          */}
          <span
            aria-hidden="true"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-brass-400/70 font-serif text-[0.8125rem] font-semibold tracking-[0.02em] text-brass-300 transition-colors duration-300 group-hover:border-brass-400 group-hover:text-brass-200"
          >
            SM
          </span>
          <span>
            <span className="font-normal text-bone-200 transition-colors duration-300 group-hover:text-bone-50">
              Sonu
            </span>
            <span className="ml-[0.4em] font-bold text-bone-50">Malik</span>
          </span>
          <span className="sr-only">{SITE.name} — home</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav aria-label="Primary" className="hidden items-center lg:flex">
            {PRIMARY_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'relative px-4 py-2 font-sans text-[0.8125rem] font-medium uppercase tracking-[0.14em] transition-colors duration-200',
                  isActive(link.href) ? 'text-bone-50' : 'text-bone-400 hover:text-bone-50',
                )}
              >
                {link.label}
                {/*
                  The accent under the current route. Red rather than white, and
                  the only place the accent appears in the bar, so it reads as
                  position rather than as decoration.
                */}
                {isActive(link.href) ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-4 bottom-1 h-px bg-brass-400"
                  />
                ) : null}
              </Link>
            ))}
          </nav>

          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="site-navigation"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-full border border-brass-400/50 text-bone-100 transition-colors duration-300 hover:border-brass-400 hover:bg-brass-400 hover:text-ink-950"
          >
            {open ? <X size={17} aria-hidden="true" /> : <Menu size={17} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          ref={panelRef}
          id="site-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="border-t border-white/10 bg-ink-950"
        >
          {/*
            The complete route list, including the two the bar leaves out. Set
            in the serif at a reading size rather than as a stack of small nav
            links - the panel is the whole screen on a phone, and at that size
            the list is the page.
          */}
          <nav aria-label="All pages" className="shell flex flex-col py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'group flex items-center justify-between border-b border-white/10 py-4 font-serif text-xl transition-colors last:border-b-0',
                  isActive(link.href) ? 'text-bone-50' : 'text-bone-300 hover:text-bone-50',
                )}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className="font-sans text-sm text-bone-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brass-200"
                >
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
