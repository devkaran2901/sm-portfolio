'use client';

import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Checkbox, Field, Select, TextArea, TextInput } from '@/components/ui/Form';
import type { FieldDef } from '@/lib/resource-fields';

/**
 * Descriptor-driven form used by every admin editor.
 *
 * One implementation of validation display, error handling and submission means
 * a fix to any of them applies everywhere, and no screen quietly diverges into
 * its own idea of how a failed save should look.
 */

export type EntityValues = Record<string, unknown>;

export function buildInitialValues(fields: FieldDef[], initial: EntityValues | null): EntityValues {
  const values: EntityValues = {};

  for (const field of fields) {
    const existing = initial?.[field.name];

    if (existing !== undefined && existing !== null) {
      // Dates arrive as ISO strings; the date input needs YYYY-MM-DD.
      values[field.name] =
        field.type === 'date' && typeof existing === 'string' ? existing.slice(0, 10) : existing;
    } else if (field.defaultValue !== undefined && !initial) {
      values[field.name] = field.defaultValue;
    } else {
      values[field.name] = field.type === 'checkbox' ? false : field.type === 'links' ? [] : '';
    }
  }

  return values;
}

/** Strips blank optional strings so the server sees "absent", not "empty". */
export function buildPayload(fields: FieldDef[], values: EntityValues): EntityValues {
  const payload: EntityValues = {};

  for (const [key, value] of Object.entries(values)) {
    if (typeof value === 'string' && value.trim() === '') continue;
    payload[key] = value;
  }
  for (const field of fields) {
    if (field.type === 'checkbox') payload[field.name] = Boolean(values[field.name]);
  }

  return payload;
}

export function FieldRenderer({
  field,
  value,
  error,
  onChange,
  onBlur,
}: {
  field: FieldDef;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
}) {
  const id = `field-${field.name}`;
  const fullWidth = field.span === 2 || field.type === 'textarea' || field.type === 'links';

  if (field.type === 'checkbox') {
    return (
      <div className={fullWidth ? 'sm:col-span-2' : undefined}>
        <Checkbox
          id={id}
          checked={Boolean(value)}
          error={error}
          onChange={(event) => onChange(event.target.checked)}
          label={
            <>
              {field.label}
              {field.hint ? (
                <span className="mt-1 block text-xs text-bone-500">{field.hint}</span>
              ) : null}
            </>
          }
        />
      </div>
    );
  }

  if (field.type === 'links') {
    const links = Array.isArray(value) ? (value as Array<{ label: string; url: string }>) : [];

    return (
      <div className="sm:col-span-2">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-bone-300">
          {field.label}
        </p>

        <ul className="space-y-2">
          {links.map((link, index) => (
            <li key={index} className="flex flex-wrap gap-2">
              <input
                aria-label={`Link ${index + 1} label`}
                value={link.label}
                placeholder="Label"
                onChange={(event) => {
                  const next = [...links];
                  next[index] = { ...link, label: event.target.value };
                  onChange(next);
                }}
                className="w-36 rounded-lg border border-ink-600 bg-ink-900/70 px-3 py-2 text-sm text-bone-100"
              />
              <input
                aria-label={`Link ${index + 1} URL`}
                value={link.url}
                placeholder="https://"
                onChange={(event) => {
                  const next = [...links];
                  next[index] = { ...link, url: event.target.value };
                  onChange(next);
                }}
                className="min-w-[12rem] flex-1 rounded-lg border border-ink-600 bg-ink-900/70 px-3 py-2 text-sm text-bone-100"
              />
              <button
                type="button"
                onClick={() => onChange(links.filter((_, position) => position !== index))}
                className="rounded-lg border border-ink-600 px-3 text-xs text-bone-400 transition-colors hover:border-danger-500/50 hover:text-danger-400"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onChange([...links, { label: '', url: '' }])}
          className="mt-2 text-xs font-semibold text-brass-200 hover:text-brass-100"
        >
          + Add link
        </button>

        {error ? (
          <p role="alert" className="mt-2 text-xs text-danger-400">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <Field
      id={id}
      label={field.label}
      required={field.required}
      hint={field.hint}
      error={error}
      className={fullWidth ? 'sm:col-span-2' : undefined}
    >
      {field.type === 'textarea' ? (
        <TextArea
          id={id}
          rows={4}
          value={String(value ?? '')}
          error={error}
          hint={field.hint}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : field.type === 'select' ? (
        <Select
          id={id}
          value={String(value ?? '')}
          error={error}
          hint={field.hint}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Select...</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      ) : (
        <TextInput
          id={id}
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          inputMode={field.type === 'number' ? 'numeric' : undefined}
          value={String(value ?? '')}
          error={error}
          hint={field.hint}
          placeholder={field.placeholder}
          onBlur={onBlur}
          onChange={(event) =>
            onChange(
              field.type === 'number'
                ? event.target.value === ''
                  ? ''
                  : Number(event.target.value)
                : event.target.value,
            )
          }
        />
      )}
    </Field>
  );
}

export function EntityForm({
  fields,
  initial,
  endpoint,
  method,
  submitLabel,
  onCancel,
  onSaved,
  children,
  onSlugSource,
}: {
  fields: FieldDef[];
  initial: EntityValues | null;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH';
  submitLabel: string;
  onCancel?: () => void;
  onSaved: () => void;
  children?: React.ReactNode;
  /** Auto-fills the slug from this field when the slug is left blank. */
  onSlugSource?: string;
}) {
  const [values, setValues] = useState<EntityValues>(() => buildInitialValues(fields, initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const set = (name: string, value: unknown) => {
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => {
      if (!previous[name]) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
    });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setErrors({});

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(fields, values)),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        fields?: Record<string, string>;
      };

      if (!response.ok) {
        setError(data.error ?? 'This could not be saved.');
        setErrors(data.fields ?? {});
        return;
      }

      onSaved();
    } catch {
      setError('Network error. Nothing was saved.');
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger-500/50 bg-danger-600/10 px-4 py-3 text-sm text-danger-400"
        >
          {error}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => (
          <FieldRenderer
            key={field.name}
            field={field}
            value={values[field.name]}
            error={errors[field.name]}
            onChange={(value) => set(field.name, value)}
            onBlur={
              onSlugSource && field.name === onSlugSource
                ? () => {
                    if (!values.slug && typeof values[onSlugSource] === 'string') {
                      import('@/lib/utils').then(({ slugify }) => {
                        set('slug', slugify(values[onSlugSource] as string));
                      });
                    }
                  }
                : undefined
            }
          />
        ))}
      </div>

      {children}

      <div className="flex gap-3 border-t border-ink-800 pt-5">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving' : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
