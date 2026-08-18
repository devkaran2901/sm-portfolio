import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { ChangePasswordForm } from '@/components/admin/AuthForms';
import { AdminPage, Panel } from '@/components/admin/Ui';
import { getSessionUser } from '@/lib/auth';
import { prisma, safeQuery } from '@/lib/db';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Account' };
export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  const sessions = await safeQuery(
    () =>
      prisma.adminSession.findMany({
        where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { lastSeenAt: 'desc' },
        take: 10,
        select: { id: true, userAgent: true, createdAt: true, lastSeenAt: true, expiresAt: true },
      }),
    [],
  );

  return (
    <AdminPage title="Account" description="Your sign-in details and active sessions.">
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Details">
          <dl className="space-y-3">
            {[
              { label: 'Name', value: user.name },
              { label: 'Email', value: user.email },
              { label: 'Role', value: user.roleLabel },
              { label: 'Two-factor', value: user.twoFactorEnabled ? 'Enabled' : 'Not enabled' },
            ].map((row) => (
              <div key={row.label} className="flex justify-between gap-4 border-b border-ink-800 pb-3 last:border-b-0">
                <dt className="text-xs uppercase tracking-[0.1em] text-bone-500">{row.label}</dt>
                <dd className="text-sm text-bone-200">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel
          title="Change password"
          description="Updating your password signs out every session, including this one."
        >
          <ChangePasswordForm />
        </Panel>

        <Panel
          className="lg:col-span-2"
          title={`Active sessions (${sessions.length})`}
          description="Sessions currently valid for this account."
        >
          {sessions.length === 0 ? (
            <p className="text-sm text-bone-600">No active sessions recorded.</p>
          ) : (
            <ul className="divide-y divide-ink-800">
              {sessions.map((session) => (
                <li key={session.id} className="flex flex-wrap justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-bone-200">
                      {session.userAgent ?? 'Unknown device'}
                      {session.id === user.sessionId ? (
                        <span className="ml-2 text-xs text-turf-300">this session</span>
                      ) : null}
                    </p>
                    <p className="text-xs text-bone-600">
                      Started {formatDate(session.createdAt, true)}
                    </p>
                  </div>
                  <p className="text-xs text-bone-500">
                    Expires {formatDate(session.expiresAt, true)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AdminPage>
  );
}
