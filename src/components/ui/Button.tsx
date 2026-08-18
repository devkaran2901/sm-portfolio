import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-bone-50 text-ink-950 hover:bg-white shadow-card hover:shadow-lift border border-transparent',
  secondary:
    'bg-transparent text-bone-100 border border-ink-600 hover:border-brass-400/70 hover:text-brass-100',
  ghost: 'bg-transparent text-bone-300 hover:text-bone-50 border border-transparent',
  danger: 'bg-danger-600 text-white hover:bg-danger-500 border border-transparent',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[0.8125rem]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-[0.9375rem]',
};

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-all duration-200 ease-editorial disabled:cursor-not-allowed disabled:opacity-55';

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
