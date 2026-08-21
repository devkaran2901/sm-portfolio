import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Section scaffolding
// ---------------------------------------------------------------------------

/**
 * Remaps the light-ground content tokens for use inside a navy band.
 *
 * Every component on the site writes its type in `bone` and `brass` steps
 * chosen against white. Inside a dark band each of those has to move to its
 * navy counterpart at the same position in the hierarchy. Doing that by adding
 * a `tone` prop to each component means threading a prop through every one of
 * them; doing it here keys the override on the class the component already
 * carries, and a descendant selector outranks a plain utility, so it wins.
 *
 * Two things to know before reaching for it:
 *  - It is indiscriminate. Apply it only to a section whose type sits directly
 *    on the band. A section containing white cards must NOT use it, or the card
 *    copy goes pale on white - `what-he-runs` is navy without it for exactly
 *    that reason.
 *  - It is coupled to the class names it lists. Rename a token inside a
 *    component and the override stops applying, silently.
 */
export const ON_NAVY = [
  '[&_.text-bone-50]:text-navy-200',
  '[&_.text-bone-100]:text-navy-200',
  '[&_.text-bone-200]:text-navy-300',
  '[&_.text-bone-300]:text-navy-300',
  '[&_.text-bone-400]:text-navy-400',
  '[&_.text-bone-500]:text-navy-500',
  '[&_.text-brass-100]:text-brass-600',
  '[&_.text-brass-200]:text-brass-600',
  '[&_.text-brass-300]:text-brass-600',
  '[&_.border-ink-800]:border-navy-700',
  '[&_.border-ink-950]:border-navy-900',
].join(' ');

export function Section({
  id,
  children,
  className,
  tone = 'default',
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  /**
   * `navy` is a full-bleed dark band. Anything inside one needs its own light
   * type - pass `tone="light"` to SectionHeading, and check nested components,
   * because the defaults everywhere are tuned for the white ground.
   */
  tone?: 'default' | 'raised' | 'paper' | 'navy';
}) {
  return (
    <section
      id={id}
      className={cn(
        'py-section',
        // A wash, not a translucent white. The ground is white now, so
        // `bg-ink-900/60` - white at 60% over white - separated nothing.
        tone === 'raised' && 'bg-ink-tint',
        tone === 'paper' && 'bg-bone-100 text-ink-900',
        tone === 'navy' && 'bg-navy-900 text-navy-300 [&_.eyebrow]:text-brass-600',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  tone = 'dark',
  id,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: 'left' | 'center';
  tone?: 'dark' | 'light';
  id?: string;
}) {
  return (
    <header className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow ? (
        <p className={cn('eyebrow', tone === 'light' && 'text-brass-600')}>{eyebrow}</p>
      ) : null}
      <h2
        id={id}
        className={cn(
          'mt-4 text-display-md',
          tone === 'light' && 'text-ink-900',
        )}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={cn(
            'mt-5 text-[1.1875rem] leading-relaxed text-bone-300',
            tone === 'light' && 'text-ink-600',
            align === 'center' && 'mx-auto',
          )}
        >
          {lead}
        </p>
      ) : null}
    </header>
  );
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

type BadgeTone = 'neutral' | 'turf' | 'brass' | 'warn' | 'danger' | 'info';

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'border-ink-600 bg-ink-800/70 text-bone-300',
  turf: 'border-turf-500/50 bg-turf-900/50 text-turf-200',
  brass: 'border-brass-500/45 bg-brass-700/25 text-brass-200',
  warn: 'border-brass-400/40 bg-ink-800/80 text-brass-200',
  danger: 'border-danger-500/45 bg-danger-600/15 text-danger-400',
  info: 'border-info-500/45 bg-info-500/10 text-info-400',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.1em]',
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Marks a claim whose supporting source has not been attached yet.
 * Shown rather than hidden: the site is explicit about what is not yet proven.
 */
export function VerificationBadge({
  status,
  className,
}: {
  status: 'verified' | 'pending';
  className?: string;
}) {
  if (status === 'verified') {
    return (
      <Badge tone="turf" className={className}>
        <span aria-hidden="true">✓</span> Verified source
      </Badge>
    );
  }
  return (
    <Badge tone="warn" className={className}>
      Verification required
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Media placeholders
// ---------------------------------------------------------------------------

/**
 * A labelled empty frame.
 *
 * The brief forbids inventing photographs, clippings or certificates, so where
 * real media does not exist yet the site shows an honest placeholder that the
 * admin portal can later replace with genuine uploads.
 */
export function MediaPlaceholder({
  label = 'Verified media will be added here',
  aspect = 'aspect-[4/3]',
  className,
  tone = 'dark',
}: {
  label?: string;
  aspect?: string;
  className?: string;
  tone?: 'dark' | 'light';
}) {
  return (
    <div
      role="img"
      aria-label={`Image placeholder: ${label}`}
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-xl2 border border-dashed',
        aspect,
        tone === 'dark'
          ? 'border-ink-600 bg-ink-900/60'
          : 'border-ink-400/40 bg-bone-200/60',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 opacity-[0.18]',
          tone === 'dark'
            ? 'bg-[linear-gradient(135deg,transparent_46%,rgba(10,10,11,0.30)_50%,transparent_54%)]'
            : 'bg-[linear-gradient(135deg,transparent_46%,rgba(255,255,255,0.5)_50%,transparent_54%)]',
        )}
      />
      <p
        className={cn(
          'relative max-w-[16rem] px-6 text-center text-[0.8125rem] font-medium uppercase tracking-[0.16em]',
          tone === 'dark' ? 'text-bone-500' : 'text-ink-500',
        )}
      >
        {label}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

export function EmptyState({
  title,
  description,
  action,
  className,
  tone = 'dark',
}: {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  tone?: 'dark' | 'light';
}) {
  return (
    <div
      className={cn(
        'rounded-xl2 border border-dashed p-10 text-center',
        tone === 'dark' ? 'border-ink-600 bg-ink-900/40' : 'border-ink-400/30 bg-bone-200/50',
        className,
      )}
    >
      <h3 className={cn('text-display-sm', tone === 'light' && 'text-ink-900')}>{title}</h3>
      <p
        className={cn(
          'mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed',
          tone === 'dark' ? 'text-bone-400' : 'text-ink-600',
        )}
      >
        {description}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

export function Card({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        'surface p-6 transition-all duration-300 ease-editorial',
        interactive && 'hover:-translate-y-1 hover:border-brass-500/40 hover:shadow-lift',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatBlock({
  value,
  label,
  description,
  children,
  tone = 'dark',
}: {
  value?: string;
  label: string;
  description?: string | null;
  children?: ReactNode;
  tone?: 'dark' | 'light';
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          'font-display text-display-sm tabular-nums',
          tone === 'dark' ? 'text-brass-200' : 'text-turf-600',
        )}
      >
        {children ?? value}
      </div>
      <div
        className={cn(
          'text-base font-semibold',
          tone === 'dark' ? 'text-bone-100' : 'text-ink-900',
        )}
      >
        {label}
      </div>
      {description ? (
        <p className={cn('text-[0.9375rem] leading-relaxed', tone === 'dark' ? 'text-bone-400' : 'text-ink-600')}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
