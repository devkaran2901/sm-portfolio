'use client';

import { useState } from 'react';

import { EntityForm } from '@/components/admin/EntityForm';
import { useAdminResource } from '@/components/admin/useAdminResource';
import { AdminError, DataTable, Panel, StatusPill, TableSkeleton } from '@/components/admin/Ui';
import { Button } from '@/components/ui/Button';
import type { FieldDef } from '@/lib/resource-fields';

type SeoRow = {
  id: string;
  path: string;
  title: string;
  description: string;
  keywords: string | null;
  ogImageUrl: string | null;
  canonicalPath: string | null;
  noindex: boolean;
};

const FIELDS: FieldDef[] = [
  {
    name: 'path',
    label: 'Path',
    type: 'text',
    required: true,
    placeholder: '/cricket',
    hint: 'Clean path with a leading slash. Use / for the home page.',
  },
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    required: true,
    span: 2,
    hint: 'Aim for under 60 characters so it is not truncated in results.',
  },
  {
    name: 'description',
    label: 'Meta description',
    type: 'textarea',
    required: true,
    span: 2,
    hint: '120 to 160 characters. Describe what the page actually contains.',
  },
  { name: 'keywords', label: 'Keywords', type: 'text', span: 2, hint: 'Comma separated. Do not stuff.' },
  { name: 'ogImageUrl', label: 'Social image URL', type: 'url', span: 2 },
  { name: 'canonicalPath', label: 'Canonical path override', type: 'text' },
  {
    name: 'noindex',
    label: 'Exclude from search engines',
    type: 'checkbox',
    hint: 'Also removes the page from the sitemap.',
  },
];

/** Per-page metadata. Character counts are shown because both fields get truncated in results. */
export function SeoEditor({ canWrite }: { canWrite: boolean }) {
  const [editing, setEditing] = useState<SeoRow | 'new' | null>(null);
  const { data, status, message, reload } = useAdminResource<{ settings: SeoRow[] }>(
    '/api/admin/seo',
    'SEO settings could not be loaded.',
  );
  const rows = data?.settings ?? [];

  return (
    <div className="space-y-5">
      {status === 'error' ? <AdminError title="Something went wrong" description={message} /> : null}

      {editing !== null ? (
        <Panel title={editing === 'new' ? 'New page metadata' : `Edit ${editing.path}`}>
          <EntityForm
            fields={FIELDS}
            initial={editing === 'new' ? null : editing}
            endpoint="/api/admin/seo"
            method="PUT"
            submitLabel="Save metadata"
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              reload();
            }}
          />
        </Panel>
      ) : null}

      <Panel
        title="Page metadata"
        description={`${rows.length} page${rows.length === 1 ? '' : 's'}`}
        actions={
          canWrite && editing === null ? (
            <Button type="button" size="sm" onClick={() => setEditing('new')}>
              Add page
            </Button>
          ) : null
        }
        bodyClassName="p-4 sm:p-5"
      >
        {status === 'loading' ? (
          <TableSkeleton rows={5} />
        ) : (
          <DataTable
            caption="SEO metadata by page"
            headers={['Path', 'Title', 'Description', 'Indexing', '']}
          >
            {rows.map((row) => (
              <tr key={row.id} className="align-top transition-colors hover:bg-ink-800/40">
                <td className="whitespace-nowrap py-3 pr-5 font-mono text-xs text-brass-200">
                  {row.path}
                </td>
                <td className="max-w-[18rem] py-3 pr-5">
                  <span className="block truncate text-sm text-bone-200">{row.title}</span>
                  <span
                    className={`text-xs ${row.title.length > 60 ? 'text-brass-300' : 'text-bone-600'}`}
                  >
                    {row.title.length} chars
                  </span>
                </td>
                <td className="max-w-[24rem] py-3 pr-5">
                  <span className="block truncate text-sm text-bone-400">{row.description}</span>
                  <span
                    className={`text-xs ${
                      row.description.length > 160 || row.description.length < 100
                        ? 'text-brass-300'
                        : 'text-bone-600'
                    }`}
                  >
                    {row.description.length} chars
                  </span>
                </td>
                <td className="py-3 pr-5">
                  <StatusPill
                    status={row.noindex ? 'ARCHIVED' : 'RESOLVED'}
                    label={row.noindex ? 'No index' : 'Indexed'}
                  />
                </td>
                <td className="whitespace-nowrap py-3 text-right">
                  {canWrite ? (
                    <button
                      type="button"
                      onClick={() => setEditing(row)}
                      className="text-xs font-semibold text-brass-200 hover:text-brass-100"
                    >
                      Edit
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </div>
  );
}
