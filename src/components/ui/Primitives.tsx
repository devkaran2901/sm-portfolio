import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Section scaffolding
// ---------------------------------------------------------------------------

/**
 * Compatibility shim, kept because a dozen interior pages still pass it.
 *
 * It used to remap the light-ground content tokens for use inside a navy band,
 * back when the site sat on white and navy was the exception. The ground is
 * navy everywhere now, so most of those mappings resolve to the shade the token
 * already holds. What is left is the part that still does something: the brass
 * steps move to the lighter red, which is the one that reads on a raised panel
 * rather than on the page ground.
 *
 * New sections should not reach for it. It stays so the interior pages keep
 * rendering unchanged, and it can go once they are revisited.
 */
export const ON_NAVY = [
  '[&_.text-brass-100]:text-brass-600',
  '[&_.text-brass-200]:text-brass-600',
  '[&_.text-brass-300]:text-brass-600',
  '[&_.border-ink-800]:border-navy-700',
].join(' ');

/**
 * The grounds a section can sit on.
 *
 * `paper` is the exception and the only light one: it carries `.on-paper`,
 * which re-points the content tokens the same way ON_NAVY used to, but in the
 * other direction. Exactly one section on the site uses it - Press &
 * Recognition - and that scarcity is the point. It is the page turning over.
 */
type SectionTone = 'default' | 'raised' | 'panel' | 'deep' | 'paper' | 'navy';

const SECTION_TONES: Record<SectionTone, string> = {
  default: '',
  raised: 'bg-ink-tint',
  // The deep navy panel. `navy` is the old name for it and still lands here.
  panel: 'bg-navy-900',
  navy: 'bg-navy-900',
  // Near black, for the one section that drops below the page ground.
  deep: 'bg-navy-950',
  paper: 'on-paper',
};

export function Section({
  id,
  children,
  className,
  tone = 'default',
  size = 'default',
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: SectionTone;
  /**
   * `band` is the taller vertical step, for the full-bleed blocks carrying one
   * idea - the stats strip, the closing call to action - where the editorial
   * rhythm wants more air around less content.
   */
  size?: 'default' | 'band' | 'tight';
}) {
  return (
    <section
      id={id}
      className={cn(
        size === 'band' ? 'py-band' : size === 'tight' ? 'py-16 sm:py-20' : 'py-section',
        SECTION_TONES[tone],
        className,
      )}
    >
      {children}
    </section>
  );
}

/**
 * The standard opener: a small-caps eyebrow, a serif headline, and optionally a
 * lead paragraph and a call to action set beside them rather than beneath.
 *
 * The `split` arrangement is what gives the page its editorial feel. The
 * headline holds the left column at a size that would read as self-important
 * with a paragraph stacked under it, and the supporting copy sits across the
 * gutter where it works as a caption to the headline instead of as its
 * continuation. Below `lg` the two columns become one, in the same order.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  tone = 'dark',
  id,
  action,
  layout = 'stacked',
  size = 'md',
  className,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: 'left' | 'center';
  /**
   * `paper` is for the one light section.
   *
   * Headings need no help either way - the base rule colours them and
   * `.on-paper` re-points them - so this only reaches the eyebrow and the lead,
   * neither of which is a heading.
   */
  tone?: 'dark' | 'paper';
  id?: string;
  /** A link or button set opposite the heading. Only drawn in `split` layout. */
  action?: ReactNode;
  layout?: 'stacked' | 'split';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const heading = (
    <>
      {eyebrow ? (
        <p className={cn('eyebrow', tone === 'paper' && 'text-brass-400')}>{eyebrow}</p>
      ) : null}
      <h2
        id={id}
        className={cn(
          'mt-5',
          size === 'lg' ? 'text-display-lg' : size === 'sm' ? 'text-display-sm' : 'text-display-md',
          tone === 'paper' && 'text-paper-900',
        )}
      >
        {title}
      </h2>
    </>
  );

  const support =
    lead || action ? (
      <div className="flex flex-col items-start gap-7">
        {lead ? (
          <p
            className={cn(
              'text-[1.0625rem] leading-[1.7] text-bone-300',
              layout === 'split' ? 'max-w-md' : 'max-w-2xl',
              tone === 'paper' && 'text-paper-600',
              align === 'center' && 'mx-auto',
            )}
          >
            {lead}
          </p>
        ) : null}
        {action}
      </div>
    ) : null;

  if (layout === 'split') {
    return (
      <header className={cn('grid gap-x-16 gap-y-8 lg:grid-cols-12 lg:items-end', className)}>
        <div className="lg:col-span-7">{heading}</div>
        {support ? <div className="lg:col-span-5 lg:pb-2">{support}</div> : null}
      </header>
    );
  }

  return (
    <header className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      {heading}
      {support ? <div className="mt-6">{support}</div> : null}
    </header>
  );
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

type BadgeTone = 'neutral' | 'turf' | 'brass' | 'warn' | 'danger' | 'info';

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'border-ink-600 bg-ink-800/70 text-bone-300',
  turf: 'border-turf-500/60 bg-turf-900/70 text-turf-200',
  brass: 'border-brass-400/45 bg-brass-700/60 text-brass-200',
  warn: 'border-brass-400/40 bg-ink-800/80 text-brass-200',
  danger: 'border-danger-500/45 bg-danger-600/25 text-danger-400',
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
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.12em]',
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
  /** `light` is for the paper section, where the dark frame would disappear. */
  tone?: 'dark' | 'light';
}) {
  return (
    <div
      role="img"
      aria-label={`Image placeholder: ${label}`}
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-card border border-dashed',
        aspect,
        tone === 'dark' ? 'border-ink-600 bg-ink-900/70' : 'border-paper-300 bg-paper-50',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 opacity-[0.18]',
          tone === 'dark'
            ? 'bg-[linear-gradient(135deg,transparent_46%,rgba(255,255,255,0.10)_50%,transparent_54%)]'
            : 'bg-[linear-gradient(135deg,transparent_46%,rgba(23,19,16,0.10)_50%,transparent_54%)]',
        )}
      />
      <p
        className={cn(
          'relative max-w-[16rem] px-6 text-center font-sans text-[0.75rem] font-medium uppercase tracking-[0.18em]',
          tone === 'dark' ? 'text-bone-500' : 'text-paper-600',
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
        'rounded-card border border-dashed p-10 text-center',
        tone === 'dark' ? 'border-ink-600 bg-ink-900/50' : 'border-paper-300 bg-paper-50',
        className,
      )}
    >
      <h3 className={cn('text-display-sm', tone === 'light' && 'text-paper-900')}>{title}</h3>
      <p
        className={cn(
          'mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed',
          tone === 'dark' ? 'text-bone-400' : 'text-paper-600',
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
        interactive && 'hover:-translate-y-1 hover:border-brass-400/50 hover:shadow-lift',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * A figure and its caption.
 *
 * The number is set in the display serif and the caption in the sans, which is
 * the pairing the whole restyle runs on: serif carries the quantity, sans
 * carries the label that explains it. Sizing them apart matters more than
 * colouring them apart - the caption is small caps at 12px, so the two never
 * compete even when the number is only one character wide.
 */
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
          'font-serif text-display-sm tabular-nums',
          tone === 'dark' ? 'text-bone-50' : 'text-paper-900',
        )}
      >
        {children ?? value}
      </div>
      <div
        className={cn(
          'font-sans text-[0.75rem] font-semibold uppercase tracking-[0.16em]',
          tone === 'dark' ? 'text-bone-200' : 'text-paper-700',
        )}
      >
        {label}
      </div>
      {description ? (
        <p
          className={cn(
            'text-[0.9375rem] leading-relaxed',
            tone === 'dark' ? 'text-bone-400' : 'text-paper-600',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
