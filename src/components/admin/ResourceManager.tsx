'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

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
import type { ResourceForm } from '@/lib/resource-fields';
import { humanizeEnum } from '@/lib/utils';

type Row = EntityValues & { id: string };

/**
 * Generic CMS screen.
 *
 * One component drives every content collection: it lists rows from the
 * resource API and renders create/edit forms from the field descriptors. Adding
 * a collection means adding a descriptor and a registry entry, not a new screen.
 */
export function ResourceManager({
  form,
  canWrite,
  canDelete,
}: {
  form: ResourceForm;
  canWrite: boolean;
  canDelete: boolean;
}) {
  const [editing, setEditing] = useState<Row | 'new' | null>(null);
  const { data, status, message, reload, fail } = useAdminResource<{ items: Row[] }>(
    `/api/admin/content/${form.key}?pageSize=100`,
    'This collection could not be loaded.',
  );
  const rows = data?.items ?? [];

  const remove = async (row: Row) => {
    const label = String(row[form.columns[0]!.name] ?? row.id);
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;

    const response = await fetch(`/api/admin/content/${form.key}/${row.id}`, { method: 'DELETE' });
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
          title={editing === 'new' ? `New ${form.title}` : `Edit ${form.title}`}
          description={form.description}
        >
          <EntityForm
            fields={form.fields}
            initial={editing === 'new' ? null : editing}
            endpoint={
              editing === 'new'
                ? `/api/admin/content/${form.key}`
                : `/api/admin/content/${form.key}/${editing.id}`
            }
            method={editing === 'new' ? 'POST' : 'PUT'}
            submitLabel={editing === 'new' ? 'Create' : 'Save changes'}
            onSlugSource={form.fields.some((field) => field.name === 'name') ? 'name' : undefined}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              reload();
            }}
          />
        </Panel>
      ) : null}

      <Panel
        title={form.title}
        description={`${rows.length} item${rows.length === 1 ? '' : 's'}`}
        actions={
          canWrite && editing === null ? (
            <Button type="button" size="sm" onClick={() => setEditing('new')}>
              <Plus size={14} aria-hidden="true" />
              Add
            </Button>
          ) : null
        }
        bodyClassName="p-4 sm:p-5"
      >
        {status === 'loading' ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <AdminEmpty
            title="Nothing here yet"
            description={`No ${form.title.toLowerCase()} entries exist. Use Add to create the first one.`}
          />
        ) : (
          <DataTable
            caption={form.title}
            headers={[...form.columns.map((column) => column.label), 'Published', '']}
          >
            {rows.map((row) => (
              <tr key={row.id} className="align-middle transition-colors hover:bg-ink-800/40">
                {form.columns.map((column) => (
                  <td key={column.name} className="max-w-[24rem] py-3 pr-5">
                    <span className="block truncate text-sm text-bone-200">
                      {formatCell(row[column.name])}
                    </span>
                  </td>
                ))}

                <td className="whitespace-nowrap py-3 pr-5">
                  <StatusPill
                    status={row.isPublished ? 'RESOLVED' : 'ARCHIVED'}
                    label={row.isPublished ? 'Live' : 'Hidden'}
                  />
                </td>

                <td className="whitespace-nowrap py-3 text-right">
                  <div className="flex justify-end gap-1">
                    {canWrite ? (
                      <button
                        type="button"
                        onClick={() => setEditing(row)}
                        className="rounded-lg p-2 text-bone-400 transition-colors hover:bg-ink-800 hover:text-bone-100"
                      >
                        <Pencil size={14} aria-hidden="true" />
                        <span className="sr-only">Edit {String(row[form.columns[0]!.name])}</span>
                      </button>
                    ) : null}
                    {canDelete ? (
                      <button
                        type="button"
                        onClick={() => void remove(row)}
                        className="rounded-lg p-2 text-bone-400 transition-colors hover:bg-danger-600/15 hover:text-danger-400"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        <span className="sr-only">Delete {String(row[form.columns[0]!.name])}</span>
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

function formatCell(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string' && /^[A-Z][A-Z0-9_]+$/.test(value)) return humanizeEnum(value);
  return String(value);
}
