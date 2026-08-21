import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { UsersManager } from '@/components/admin/UsersManager';
import { AdminPage, Panel } from '@/components/admin/Ui';
import { can, getSessionUser } from '@/lib/auth';
import { ROLE_DESCRIPTIONS, ROLE_PERMISSIONS, PERMISSIONS } from '@/lib/permissions';

export const metadata: Metadata = { title: 'Users & Roles' };
export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const user = await getSessionUser();
  if (!can(user, 'user:read')) redirect('/admin');

  return (
    <AdminPage
      title="Users & Roles"
      description="Admin accounts and what each role can reach. Permissions are enforced by the API, not just hidden in the interface."
    >
      <div className="space-y-5">
        <UsersManager currentUserId={user!.id} />

        <Panel title="Role permissions" description="What each role can do">
          <ul className="grid gap-5 sm:grid-cols-2">
            {(Object.keys(ROLE_DESCRIPTIONS) as Array<keyof typeof ROLE_DESCRIPTIONS>).map(
              (role) => (
                <li key={role} className="rounded-xl2 border border-ink-800 bg-ink-950/40 p-5">
                  <h3 className="text-sm font-sans font-semibold text-bone-100">
                    {ROLE_DESCRIPTIONS[role].label}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-bone-500">
                    {ROLE_DESCRIPTIONS[role].description}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {ROLE_PERMISSIONS[role].map((permission) => (
                      <li
                        key={permission}
                        className="rounded-full border border-ink-700 px-2 py-0.5 text-[0.625rem] text-bone-400"
                        title={PERMISSIONS[permission].label}
                      >
                        {permission}
                      </li>
                    ))}
                  </ul>
                </li>
              ),
            )}
          </ul>
        </Panel>
      </div>
    </AdminPage>
  );
}
