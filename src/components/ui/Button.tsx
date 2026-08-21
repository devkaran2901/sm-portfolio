import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

/*
 * Hover language, shared by every variant: a half-step lift, a deepening
 * shadow, and a colour move. The press state drops back to zero on a short
 * duration so a click feels physical rather than mushy.
 *
 * `secondary` inverts on hover - outline to solid - which reads as deliberate
 * on a monochrome palette where a colour shift has nowhere to go.
 *
 * Motion is safe to declare unconditionally: globals.css collapses every
 * transition to ~0ms under prefers-reduced-motion, so the colour change still
 * lands and the movement does not.
 */
const VARIANTS: Record<Variant, string> = {
  primary:
    'border border-transparent bg-bone-50 text-ink-900 shadow-card hover:bg-bone-200 hover:shadow-lift',
  secondary:
    'border border-ink-600 bg-transparent text-bone-100 hover:border-bone-50 hover:bg-bone-50 hover:text-ink-900 hover:shadow-card',
  /*
   * The variant for dark grounds. `primary` is black on white, which vanishes
   * against navy, and `secondary` is near-black type on nothing, which vanishes
   * with it. Red on navy carries at 5.1:1 with white type over it, and it is
   * the accent the rest of the page already uses.
   */
  accent:
    'border border-transparent bg-brass-300 text-ink-900 shadow-card hover:bg-brass-200 hover:shadow-lift',
  ghost:
    'border border-transparent bg-transparent text-bone-300 hover:bg-ink-800 hover:text-bone-50',
  danger:
    'border border-transparent bg-danger-600 text-white shadow-card hover:bg-danger-500 hover:shadow-lift',
};

// Heights use real scale steps. `h-13` was silently dropped by Tailwind, which
// left large buttons with no height at all beyond their padding.
const SIZES: Record<Size, string> = {
  sm: 'h-10 min-h-[40px] gap-2 px-5 text-sm',
  md: 'h-12 min-h-[44px] gap-2.5 px-7 text-[0.9375rem]',
  lg: 'h-14 min-h-[48px] gap-3 px-9 text-base',
};

const BASE = [
  'group/btn inline-flex items-center justify-center rounded-full font-semibold tracking-tight',
  'transition-[transform,box-shadow,background-color,border-color,color] duration-300 ease-editorial',
  'hover:-translate-y-0.5 active:translate-y-0 active:duration-75',
  // Any icon inside nudges along with the lift.
  '[&_svg]:transition-transform [&_svg]:duration-300 [&_svg]:ease-editorial hover:[&_svg]:translate-x-0.5',
  'disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 disabled:hover:shadow-card',
].join(' ');

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

type ButtonProps = ComponentProps<'button'> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return <button {...props} className={buttonClass(variant, size, className)} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  /** Adds the rel/target pair required for safe external navigation. */
  external?: boolean;
};

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  external,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      {...props}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={buttonClass(variant, size, className)}
    />
  );
}
