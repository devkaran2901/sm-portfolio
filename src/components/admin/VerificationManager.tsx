'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';

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
import { SOURCE_TYPE_LABELS, VERIFICATION_STATUS_LABELS } from '@/content/defaults';
import type { FieldDef } from '@/lib/resource-fields';
import { formatDate, truncate } from '@/lib/utils';

type Row = EntityValues & {
  id: string;
  claim: string;
  publication: string | null;
  publishedOn: string | null;
  sourceUrl: string | null;
  status: string;
  reviewedBy?: { name: string } | null;
};

const FIELDS: FieldDef[] = [
  {
    name: 'claim',
    label: 'Claim',
    type: 'textarea',
    required: true,
    span: 2,
    hint: 'State the public claim exactly as it appears on the site.',
  },
  {
    name: 'subjectType',
    label: 'Subject',
    type: 'select',
    options: [
      { value: 'STANDALONE_CLAIM', label: 'Standalone claim' },
      { value: 'TIMELINE_EVENT', label: 'Timeline event' },
      { value: 'SPORTS_EVENT', label: 'Sports event' },
      { value: 'PLAYER', label: 'Player' },
      { value: 'MEDIA_ARTICLE', label: 'Media article' },
    ],
    defaultValue: 'STANDALONE_CLAIM',
  },
  {
    name: 'sourceType',
    label: 'Source type',
    type: 'select',
    options: Object.entries(SOURCE_TYPE_LABELS).map(([value, label]) => ({ value, label })),
    defaultValue: 'OTHER',
  },
  { name: 'publication', label: 'Publication', type: 'text' },
  { name: 'publishedOn', label: 'Publication date', type: 'date' },
  {
    name: 'sourceUrl',
    label: 'Source URL',
    type: 'url',
    span: 2,
    hint: 'A retrievable link. Required before a claim can be marked Verified.',
  },
  { name: 'evidenceUrl', label: 'Uploaded evidence URL', type: 'text', span: 2 },
  { name: 'evidenceName', label: 'Evidence file name', type: 'text', span: 2 },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: Object.entries(VERIFICATION_STATUS_LABELS).map(([value, label]) => ({ value, label })),
    defaultValue: 'UNVERIFIED',
  },
  { name: 'adminNotes', label: 'Admin notes', type: 'textarea', span: 2 },
];

const STATUS_FILTERS = ['ALL', 'UNVERIFIED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'] as const;

/**
 * Press & Verification workspace.
 *
 * This is the evidence archive behind the site's accuracy policy. A claim only
 * renders as verified publicly once a row here reaches Verified with a source
 * attached, and the API refuses to verify a claim that has neither a source URL
 * nor an uploaded document.
 */
export function VerificationManager({
  canWrite,
  canVerify,
}: {
  canWrite: boolean;
  canVerify: boolean;
}) {
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>('ALL');
  const [editing, setEditing] = useState<Row | 'new' | null>(null);

  // Changing the filter changes the URL, which re-runs the fetch. In-flight
  // responses for a previous filter are discarded by the hook.
  const url = useMemo(() => {
    const params = new URLSearchParams({ pageSize: '100' });
    if (filter !== 'ALL') params.set('status', filter);
    return `/api/admin/verification?${params.toString()}`;
  }, [filter]);

  const { data, status, message, reload, fail } = useAdminResource<{
    items: Row[];
    statusCounts: Record<string, number>;
  }>(url, 'The verification archive could not be loaded.');

  const rows = data?.items ?? [];
  const counts = data?.statusCounts ?? {};

  const remove = async (row: Row) => {
    if (!window.confirm('Delete this verification record? This cannot be undone.')) return;
    const response = await fetch(`/api/admin/verification/${row.id}`, { method: 'DELETE' });
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      fail(body.error ?? 'That record could not be deleted.');
      return;
    }
    reload();
  };

  return (
    <div className="space-y-5">
      {status === 'error' ? <AdminError title="Something went wrong" description={message} /> : null}

      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === value
                ? 'border-brass-400/60 bg-brass-700/20 text-brass-100'
                : 'border-ink-700 text-bone-400 hover:border-ink-500 hover:text-bone-200'
            }`}
          >
            {value === 'ALL'
              ? `All (${Object.values(counts).reduce((sum, count) => sum + count, 0)})`
              : `${VERIFICATION_STATUS_LABELS[value]} (${counts[value] ?? 0})`}
          </button>
        ))}
      </div>

      {editing !== null ? (
        <Panel
          title={editing === 'new' ? 'New verification record' : 'Edit verification record'}
          description="A claim can only be marked Verified once a source URL or an uploaded document is attached."
        >
          <EntityForm
            fields={FIELDS}
            initial={editing === 'new' ? null : editing}
            endpoint={
              editing === 'new'
                ? '/api/admin/verification'
                : `/api/admin/verification/${editing.id}`
            }
            method={editing === 'new' ? 'POST' : 'PUT'}
            submitLabel={editing === 'new' ? 'Create' : 'Save changes'}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              reload();
            }}
          />
        </Panel>
      ) : null}

      <Panel
        title="Claims and sources"
        description={`${rows.length} record${rows.length === 1 ? '' : 's'} in this view`}
        actions={
          canWrite && editing === null ? (
            <Button type="button" size="sm" onClick={() => setEditing('new')}>
              <Plus size={14} aria-hidden="true" />
              Add claim
            </Button>
          ) : null
        }
        bodyClassName="p-4 sm:p-5"
      >
        {status === 'loading' ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <AdminEmpty
            title="No records in this view"
            description="Open claims are created by the seed and whenever a new public statement needs backing. Nothing appears here automatically from published content."
          />
        ) : (
          <DataTable
            caption="Verification records"
            headers={['Claim', 'Source', 'Date', 'Status', 'Reviewed by', '']}
          >
            {rows.map((row) => (
              <tr key={row.id} className="align-top transition-colors hover:bg-ink-800/40">
                <td className="max-w-[28rem] py-3 pr-5 text-sm text-bone-200">
                  {truncate(row.claim, 130)}
                </td>
                <td className="py-3 pr-5 text-sm text-bone-300">
                  {row.publication ?? '—'}
                  {row.sourceUrl ? (
                    <a
                      href={row.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1.5 inline-flex text-brass-200 hover:text-brass-100"
                    >
                      <ExternalLink size={12} aria-hidden="true" />
                      <span className="sr-only">Open source</span>
                    </a>
                  ) : null}
                </td>
                <td className="whitespace-nowrap py-3 pr-5 text-xs text-bone-500">
                  {row.publishedOn ? formatDate(row.publishedOn) : '—'}
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
                <td className="py-3 pr-5 text-xs text-bone-500">{row.reviewedBy?.name ?? '—'}</td>
                <td className="whitespace-nowrap py-3 text-right">
                  <div className="flex justify-end gap-1">
                    {canWrite ? (
                      <button
                        type="button"
                        onClick={() => setEditing(row)}
                        className="rounded-lg p-2 text-bone-400 transition-colors hover:bg-ink-800 hover:text-bone-100"
                      >
                        <Pencil size={14} aria-hidden="true" />
                        <span className="sr-only">Edit claim</span>
                      </button>
                    ) : null}
                    {canVerify ? (
                      <button
                        type="button"
                        onClick={() => void remove(row)}
                        className="rounded-lg p-2 text-bone-400 transition-colors hover:bg-danger-600/15 hover:text-danger-400"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        <span className="sr-only">Delete claim</span>
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </div>
  );
}
