import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Accessible form primitives.
 *
 * Every control is bound to a real <label>, errors are announced through
 * aria-describedby + role="alert", and invalid controls carry aria-invalid so
 * assistive tech reports the state rather than relying on the red border alone.
 */

const CONTROL =
  'w-full rounded-lg border bg-ink-900/70 px-3.5 py-2.5 text-[0.9375rem] text-bone-100 placeholder:text-bone-500 transition-colors duration-200 focus:border-brass-400/70 focus:outline-none focus-visible:outline-none disabled:opacity-60';

export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.1em] text-bone-300">
        {label}
        {required ? (
          <span className="ml-1 text-brass-300" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-2 font-normal normal-case tracking-normal text-bone-500">
            (optional)
          </span>
        )}
      </label>

      {children}

      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-bone-500">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-danger-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, hint?: string, error?: string) {
  const ids = [error ? `${id}-error` : null, hint && !error ? `${id}-hint` : null].filter(Boolean);
  return ids.length ? ids.join(' ') : undefined;
}

export function TextInput({
  id,
  error,
  hint,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { id: string; error?: string; hint?: string }) {
  return (
    <input
      {...props}
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, hint, error)}
      className={cn(CONTROL, error ? 'border-danger-500/70' : 'border-ink-600', className)}
    />
  );
}

export function TextArea({
  id,
  error,
  hint,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; error?: string; hint?: string }) {
  return (
    <textarea
      {...props}
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, hint, error)}
      className={cn(
        CONTROL,
        'min-h-[9rem] resize-y',
        error ? 'border-danger-500/70' : 'border-ink-600',
        className,
      )}
    />
  );
}

export function Select({
  id,
  error,
  hint,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { id: string; error?: string; hint?: string }) {
  return (
    <select
      {...props}
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, hint, error)}
      className={cn(
        CONTROL,
        'appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10',
        error ? 'border-danger-500/70' : 'border-ink-600',
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23586069' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
      }}
    >
      {children}
    </select>
  );
}

export function Checkbox({
  id,
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { id: string; label: ReactNode; error?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-3">
        <input
          {...props}
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer appearance-none rounded border bg-ink-900 transition-colors',
            'checked:border-turf-400 checked:bg-turf-500',
            'checked:bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\' fill=\'none\'%3E%3Cpath d=\'M3 8.5l3.2 3.2L13 5\' stroke=\'white\' stroke-width=\'2.2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")] checked:bg-center checked:bg-no-repeat',
            error ? 'border-danger-500/70' : 'border-ink-600',
          )}
        />
        <label htmlFor={id} className="cursor-pointer text-sm leading-relaxed text-bone-300">
          {label}
        </label>
      </div>

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-danger-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
