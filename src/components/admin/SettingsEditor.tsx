'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Panel } from '@/components/admin/Ui';
import { Button } from '@/components/ui/Button';
import { Field, TextInput } from '@/components/ui/Form';

type Setting = { key: string; group: string; value: unknown };

/**
 * Site settings.
 *
 * Values are stored as JSON, so the editor round-trips through a text field:
 * `true`, `null`, numbers and quoted strings are parsed as JSON, and anything
 * else is stored as a plain string. That keeps a boolean flag a real boolean
 * instead of the string "true".
 */
export function SettingsEditor({
  initial,
  canWrite,
}: {
  initial: Setting[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      initial.map((setting) => [
        setting.key,
        typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value ?? null),
      ]),
    ),
  );
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const save = async (setting: Setting) => {
    setPending(setting.key);
    setError(null);
    setSaved(null);

    const raw = values[setting.key] ?? '';
    let parsed: unknown = raw;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Not valid JSON, so treat it as a plain string value.
      parsed = raw;
    }

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: setting.key, value: parsed, group: setting.group }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? 'That setting could not be saved.');
        return;
      }

      setSaved(`${setting.key} saved.`);
      router.refresh();
    } catch {
      setError('Network error. Nothing was saved.');
    } finally {
      setPending(null);
    }
  };

  return (
    <Panel title="Site settings" description="Stored as JSON values.">
      {error ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-danger-500/50 bg-danger-600/10 px-3 py-2 text-xs text-danger-400"
        >
          {error}
        </p>
      ) : null}
      {saved ? (
        <p
          role="status"
          className="mb-4 rounded-lg border border-turf-600/50 bg-turf-900/30 px-3 py-2 text-xs text-turf-200"
        >
          {saved}
        </p>
      ) : null}

      {initial.length === 0 ? (
        <p className="text-sm text-bone-600">
          No settings recorded. Run the seed to create the defaults.
        </p>
      ) : (
        <ul className="space-y-4">
          {initial.map((setting) => (
            <li key={setting.key} className="flex flex-wrap items-end gap-3">
              <Field
                id={`setting-${setting.key}`}
                label={setting.key}
                hint={`Group: ${setting.group}`}
                className="min-w-[14rem] flex-1"
              >
                <TextInput
                  id={`setting-${setting.key}`}
                  value={values[setting.key] ?? ''}
                  hint={`Group: ${setting.group}`}
                  disabled={!canWrite}
                  onChange={(event) =>
                    setValues((previous) => ({ ...previous, [setting.key]: event.target.value }))
                  }
                />
              </Field>

              {canWrite ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={pending === setting.key}
                  onClick={() => void save(setting)}
                >
                  {pending === setting.key ? 'Saving' : 'Save'}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
