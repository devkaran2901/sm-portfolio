'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Field, Select, TextArea } from '@/components/ui/Form';
import { INQUIRY_STATUS_LABELS } from '@/content/defaults';
import { INQUIRY_STATUSES } from '@/lib/validation';

type Assignee = { id: string; name: string };

/**
 * Status, assignment and internal notes for one inquiry.
 *
 * Optimism is deliberately avoided: the UI waits for the server before showing
 * the new state, because an inbox that lies about whether something was saved
 * is worse than one that takes a moment.
 */
export function InquiryControls({
  inquiryId,
  initialStatus,
  initialAssignee,
  assignees,
  canWrite,
}: {
  inquiryId: string;
  initialStatus: string;
  initialAssignee: string | null;
  assignees: Assignee[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [assignee, setAssignee] = useState(initialAssignee ?? '');
  const [note, setNote] = useState('');
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  if (!canWrite) {
    return (
      <p className="text-sm text-bone-500">
        Your role can read inquiries but not change them.
      </p>
    );
  }

  const patch = async (payload: Record<string, unknown>, label: string) => {
    setPending(label);
    setError(null);
    setSaved(null);

    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? 'That change could not be saved.');
        return;
      }

      setSaved(`${label} updated.`);
      router.refresh();
    } catch {
      setError('Network error. The change was not saved.');
    } finally {
      setPending(null);
    }
  };

  const addNote = async () => {
    if (note.trim().length === 0) return;
    setPending('note');
    setError(null);
    setSaved(null);

    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: note }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? 'The note could not be saved.');
        return;
      }

      setNote('');
      setSaved('Note added.');
      router.refresh();
    } catch {
      setError('Network error. The note was not saved.');
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-5">
      {error ? (
        <p role="alert" className="rounded-lg border border-danger-500/50 bg-danger-600/10 px-3 py-2 text-xs text-danger-400">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="rounded-lg border border-turf-600/50 bg-turf-900/30 px-3 py-2 text-xs text-turf-200">
          {saved}
        </p>
      ) : null}

      <Field id="inquiry-status" label="Status" required>
        <Select
          id="inquiry-status"
          value={status}
          disabled={pending !== null}
          onChange={(event) => {
            const value = event.target.value;
            setStatus(value);
            void patch({ status: value }, 'Status');
          }}
        >
          {INQUIRY_STATUSES.map((value) => (
            <option key={value} value={value}>
              {INQUIRY_STATUS_LABELS[value]}
            </option>
          ))}
        </Select>
      </Field>

      <Field id="inquiry-assignee" label="Assigned to">
        <Select
          id="inquiry-assignee"
          value={assignee}
          disabled={pending !== null}
          onChange={(event) => {
            const value = event.target.value;
            setAssignee(value);
            void patch({ assignedToId: value || null }, 'Assignment');
          }}
        >
          <option value="">Unassigned</option>
          {assignees.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </Select>
      </Field>

      <div className="border-t border-ink-800 pt-5">
        <Field
          id="inquiry-note"
          label="Add an internal note"
          hint="Notes are visible to admins only. They are never sent to the person who wrote in."
        >
          <TextArea
            id="inquiry-note"
            rows={4}
            value={note}
            hint="Notes are visible to admins only. They are never sent to the person who wrote in."
            onChange={(event) => setNote(event.target.value)}
            placeholder="Called back, awaiting documents..."
          />
        </Field>

        <Button
          type="button"
          size="sm"
          className="mt-3"
          disabled={pending !== null || note.trim().length === 0}
          onClick={() => void addNote()}
        >
          {pending === 'note' ? 'Saving' : 'Add note'}
        </Button>
      </div>
    </div>
  );
}
