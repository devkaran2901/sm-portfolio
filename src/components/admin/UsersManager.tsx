'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { EntityForm } from '@/components/admin/EntityForm';
import { useAdminResource } from '@/components/admin/useAdminResource';
import { AdminError, DataTable, Panel, StatusPill, TableSkeleton } from '@/components/admin/Ui';
import { Button } from '@/components/ui/Button';
import { ROLE_LABELS } from '@/content/defaults';
import type { FieldDef } from '@/lib/resource-fields';
import { formatDate, relativeTime } from '@/lib/utils';

type AdminRow = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  lockedUntil: string | null;
  createdAt: string;
  role: { name: string; label: string };
};

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

const CREATE_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Full name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'text', required: true },
  {
    name: 'password',
    label: 'Temporary password',
    type: 'text',
    required: true,
    span: 2,
    hint: 'At least 12 characters. The user is required to change it at first sign-in.',
  },
  { name: 'role', label: 'Role', type: 'select', required: true, options: ROLE_OPTIONS, span: 2 },
];

const EDIT_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Full name', type: 'text' },
  { name: 'role', label: 'Role', type: 'select', options: ROLE_OPTIONS },
  {
    name: 'password',
    label: 'New password',
    type: 'text',
    span: 2,
    hint: 'Leave blank to keep the current password. Setting one signs the user out everywhere.',
  },
  { name: 'isActive', label: 'Account is active', type: 'checkbox', span: 2 },
];

/**
 * Admin users and roles.
 *
 * The server enforces the rules that matter - at least one active super admin
 * must remain, and nobody can deactivate or demote themselves - so this UI can
 * stay simple and surface those refusals as ordinary errors.
 */
export function UsersManager({ currentUserId }: { currentUserId: string }) {
  const [editing, setEditing] = useState<AdminRow | 'new' | null>(null);
  const { data, status, message, reload } = useAdminResource<{ users: AdminRow[] }>(
    '/api/admin/users',
    'Users could not be loaded.',
  );
  const rows = data?.users ?? [];

  return (
    <div className="space-y-5">
      {status === 'error' ? <AdminError title="Something went wrong" description={message} /> : null}

      {editing !== null ? (
        <Panel
          title={editing === 'new' ? 'New admin user' : `Edit ${editing.name}`}
          description={
            editing === 'new'
              ? 'The new account must change its password at first sign-in.'
              : 'Changing a role, password or active state signs that user out of all sessions.'
          }
        >
          <EntityForm
            fields={editing === 'new' ? CREATE_FIELDS : EDIT_FIELDS}
            initial={
              editing === 'new'
                ? null
                : {
                    name: editing.name,
                    role: editing.role.name,
                    isActive: editing.isActive,
                    password: '',
                  }
            }
            endpoint={editing === 'new' ? '/api/admin/users' : `/api/admin/users/${editing.id}`}
            method={editing === 'new' ? 'POST' : 'PATCH'}
            submitLabel={editing === 'new' ? 'Create user' : 'Save changes'}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              reload();
            }}
          />
        </Panel>
      ) : null}

      <Panel
        title="Admin users"
        description={`${rows.length} account${rows.length === 1 ? '' : 's'}`}
        actions={
          editing === null ? (
            <Button type="button" size="sm" onClick={() => setEditing('new')}>
              <Plus size={14} aria-hidden="true" />
              Add user
            </Button>
          ) : null
        }
        bodyClassName="p-4 sm:p-5"
      >
        {status === 'loading' ? (
          <TableSkeleton rows={4} />
        ) : (
          <DataTable
            caption="Admin users"
            headers={['Name', 'Role', 'Status', '2FA', 'Last sign-in', '']}
          >
            {rows.map((row) => (
              <tr key={row.id} className="align-middle transition-colors hover:bg-ink-800/40">
                <td className="py-3 pr-5">
                  <p className="text-sm text-bone-100">
                    {row.name}
                    {row.id === currentUserId ? (
                      <span className="ml-2 text-xs text-bone-600">(you)</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-bone-500">{row.email}</p>
                </td>
                <td className="py-3 pr-5 text-sm text-bone-300">{row.role.label}</td>
                <td className="py-3 pr-5">
                  <StatusPill
                    status={row.isActive ? 'RESOLVED' : 'ARCHIVED'}
                    label={row.isActive ? 'Active' : 'Disabled'}
                  />
                  {row.mustChangePassword ? (
                    <p className="mt-1 text-xs text-brass-300">Must change password</p>
                  ) : null}
                  {row.lockedUntil && new Date(row.lockedUntil) > new Date() ? (
                    <p className="mt-1 text-xs text-danger-400">
                      Locked until {formatDate(row.lockedUntil, true)}
                    </p>
                  ) : null}
                </td>
                <td className="py-3 pr-5 text-xs text-bone-400">
                  {row.twoFactorEnabled ? 'Enabled' : 'Off'}
                </td>
                <td className="py-3 pr-5 text-xs text-bone-500">
                  {row.lastLoginAt ? relativeTime(row.lastLoginAt) : 'Never'}
                </td>
                <td className="whitespace-nowrap py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setEditing(row)}
                    className="text-xs font-semibold text-brass-200 hover:text-brass-100"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </div>
  );
}
