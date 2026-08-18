'use client';

import { useRef, useState } from 'react';
import { ExternalLink, Paperclip, Pencil, Plus, Trash2, Upload } from 'lucide-react';

import { EntityForm, type EntityValues } from '@/components/admin/EntityForm';
import { useAdminResource } from '@/components/admin/useAdminResource';
import {
  AdminEmpty,
  AdminError,
  DataTable,
  Panel,
  StatusPill,
  TableSkeleton,
} from '@/components/admin/Ui';
import { Button } from '@/components/ui/Button';
import {
  MEDIA_CATEGORY_LABELS,
  MEDIA_TYPE_LABELS,
  VERIFICATION_STATUS_LABELS,
} from '@/content/defaults';
import type { FieldDef } from '@/lib/resource-fields';
import { formatDate } from '@/lib/utils';

type MediaRow = EntityValues & {
  id: string;
  title: string;
  publication: string | null;
  publishedOn: string | null;
  category: string;
  mediaType: string;
  status: string;
  isPublished: boolean;
  _count?: { evidence: number; verifications: number };
};

const toOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

const MEDIA_FIELDS: FieldDef[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, span: 2 },
  { name: 'slug', label: 'Slug', type: 'text', required: true },
  { name: 'publication', label: 'Publication', type: 'text', hint: 'Leave blank if unknown.' },
  { name: 'publishedOn', label: 'Publication date', type: 'date' },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    options: toOptions(MEDIA_CATEGORY_LABELS),
  },
  {
    name: 'mediaType',
    label: 'Media type',
    type: 'select',
    required: true,
    options: toOptions(MEDIA_TYPE_LABELS),
  },
  { name: 'externalUrl', label: 'Source URL', type: 'url', hint: 'Link to the original article.' },
  { name: 'thumbnailUrl', label: 'Thumbnail URL', type: 'url' },
  { name: 'thumbnailAlt', label: 'Thumbnail alt text', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea', span: 2 },
  { name: 'sourceNote', label: 'Source note', type: 'text', span: 2 },
  {
    name: 'status',
    label: 'Verification status',
    type: 'select',
    required: true,
    options: toOptions(VERIFICATION_STATUS_LABELS),
    defaultValue: 'UNVERIFIED',
  },
  { name: 'sortOrder', label: 'Sort order', type: 'number', defaultValue: 0 },
  {
    name: 'isPublished',
    label: 'Publish on the public media page',
    type: 'checkbox',
    defaultValue: false,
    hint: 'Only takes effect once the status is Verified. Unverified items stay private.',
    span: 2,
  },
];

/**
 * Press and media archive.
 *
 * Two rules are enforced here and again on the server: an item cannot be
 * published unless its status is Verified, and nothing is pre-populated. The
 * archive starts empty because inventing coverage is exactly what this system
 * exists to prevent.
 */
export function MediaManager({ canWrite, canVerify }: { canWrite: boolean; canVerify: boolean }) {
  const [editing, setEditing] = useState<MediaRow | 'new' | null>(null);
  const [uploadTarget, setUploadTarget] = useState<MediaRow | null>(null);
  const { data, status, message, reload, fail } = useAdminResource<{ items: MediaRow[] }>(
    '/api/admin/media?pageSize=100',
    'The media archive could not be loaded.',
  );
  const rows = data?.items ?? [];

  const remove = async (row: MediaRow) => {
    if (!window.confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
    const response = await fetch(`/api/admin/media/${row.id}`, { method: 'DELETE' });
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      fail(body.error ?? 'That item could not be deleted.');
      return;
    }
    reload();
  };

  return (
    <div className="space-y-5">
      {status === 'error' ? <AdminError title="Something went wrong" description={message} /> : null}

      {editing !== null ? (
        <Panel
          title={editing === 'new' ? 'New press item' : 'Edit press item'}
          description="Only genuine, supplied material belongs here. Leave fields blank rather than filling them speculatively."
        >
          <EntityForm
            fields={MEDIA_FIELDS}
            initial={editing === 'new' ? null : editing}
            endpoint={editing === 'new' ? '/api/admin/media' : `/api/admin/media/${editing.id}`}
            method={editing === 'new' ? 'POST' : 'PUT'}
            submitLabel={editing === 'new' ? 'Create' : 'Save changes'}
            onSlugSource="title"
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              reload();
            }}
          />
        </Panel>
      ) : null}

      {uploadTarget ? (
        <EvidenceUploader
          mediaArticleId={uploadTarget.id}
          title={uploadTarget.title}
          onClose={() => setUploadTarget(null)}
          onUploaded={() => {
            setUploadTarget(null);
            reload();
          }}
        />
      ) : null}

      <Panel
        title="Press archive"
        description={`${rows.length} item${rows.length === 1 ? '' : 's'}`}
        actions={
          canWrite && editing === null ? (
            <Button type="button" size="sm" onClick={() => setEditing('new')}>
              <Plus size={14} aria-hidden="true" />
              Add press item
            </Button>
          ) : null
        }
        bodyClassName="p-4 sm:p-5"
      >
        {status === 'loading' ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <AdminEmpty
            title="The archive is empty"
            description="No press coverage has been added. That is the correct starting state: items appear on the public site only after genuine material is uploaded and verified."
          />
        ) : (
          <DataTable
            caption="Press and media items"
            headers={['Title', 'Publication', 'Category', 'Status', 'Public', 'Evidence', '']}
          >
            {rows.map((row) => (
              <tr key={row.id} className="align-middle transition-colors hover:bg-ink-800/40">
                <td className="max-w-[22rem] py-3 pr-5">
                  <span className="block truncate text-sm text-bone-100">{row.title}</span>
                  <span className="text-xs text-bone-600">
                    {MEDIA_TYPE_LABELS[row.mediaType as keyof typeof MEDIA_TYPE_LABELS] ??
                      row.mediaType}
                  </span>
                </td>
                <td className="py-3 pr-5 text-sm text-bone-300">
                  {row.publication ?? '—'}
                  <span className="block text-xs text-bone-600">
                    {row.publishedOn ? formatDate(row.publishedOn) : 'No date'}
                  </span>
                </td>
                <td className="py-3 pr-5 text-xs text-bone-400">
                  {MEDIA_CATEGORY_LABELS[row.category as keyof typeof MEDIA_CATEGORY_LABELS] ??
                    row.category}
                </td>
                <td className="py-3 pr-5">
                  <StatusPill
                    status={row.status}
                    label={
                      VERIFICATION_STATUS_LABELS[
                        row.status as keyof typeof VERIFICATION_STATUS_LABELS
                      ]
                    }
                  />
                </td>
                <td className="py-3 pr-5">
                  <StatusPill
                    status={row.isPublished ? 'RESOLVED' : 'ARCHIVED'}
                    label={row.isPublished ? 'Live' : 'Hidden'}
                  />
                </td>
                <td className="py-3 pr-5 text-sm tabular-nums text-bone-400">
                  {row._count?.evidence ?? 0}
                </td>
                <td className="whitespace-nowrap py-3 text-right">
                  <div className="flex justify-end gap-1">
                    {typeof row.externalUrl === 'string' && row.externalUrl ? (
                      <a
                        href={row.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 text-bone-400 transition-colors hover:bg-ink-800 hover:text-bone-100"
                      >
                        <ExternalLink size={14} aria-hidden="true" />
                        <span className="sr-only">Open source for {row.title}</span>
                      </a>
                    ) : null}
                    {canWrite ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setUploadTarget(row)}
                          className="rounded-lg p-2 text-bone-400 transition-colors hover:bg-ink-800 hover:text-bone-100"
                        >
                          <Paperclip size={14} aria-hidden="true" />
                          <span className="sr-only">Attach evidence to {row.title}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(row)}
                          className="rounded-lg p-2 text-bone-400 transition-colors hover:bg-ink-800 hover:text-bone-100"
                        >
                          <Pencil size={14} aria-hidden="true" />
                          <span className="sr-only">Edit {row.title}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(row)}
                          className="rounded-lg p-2 text-bone-400 transition-colors hover:bg-danger-600/15 hover:text-danger-400"
                        >
                          <Trash2 size={14} aria-hidden="true" />
                          <span className="sr-only">Delete {row.title}</span>
                        </button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        )}

        {!canVerify ? (
          <p className="mt-4 text-xs text-bone-600">
            Your role can edit press items but not change their verification status.
          </p>
        ) : null}
      </Panel>
    </div>
  );
}

/**
 * Evidence upload.
 *
 * The server re-checks type, extension, magic bytes and size; this component
 * only gives fast feedback and keeps the accepted list visible.
 */
function EvidenceUploader({
  mediaArticleId,
  title,
  onClose,
  onUploaded,
}: {
  mediaArticleId: string;
  title: string;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async () => {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError('Choose a file first.');
      return;
    }

    setPending(true);
    setError(null);

    const body = new FormData();
    body.append('file', file);
    body.append('mediaArticleId', mediaArticleId);

    try {
      const response = await fetch('/api/admin/uploads', { method: 'POST', body });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? 'The upload failed.');
        return;
      }
      onUploaded();
    } catch {
      setError('Network error during upload.');
    } finally {
      setPending(false);
    }
  };

  return (
    <Panel title={`Attach evidence to "${title}"`} description="JPEG, PNG, WebP or PDF.">
      {error ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-danger-500/50 bg-danger-600/10 px-4 py-3 text-sm text-danger-400"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          aria-label="Evidence file"
          className="block w-full text-sm text-bone-300 file:mr-4 file:rounded-lg file:border file:border-ink-600 file:bg-ink-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-bone-100 hover:file:border-brass-400/60"
        />

        <div className="flex gap-3">
          <Button type="button" size="sm" onClick={() => void upload()} disabled={pending}>
            <Upload size={14} aria-hidden="true" />
            {pending ? 'Uploading' : 'Upload'}
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={onClose} disabled={pending}>
            Close
          </Button>
        </div>
      </div>
    </Panel>
  );
}
