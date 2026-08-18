import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AdminEmpty, AdminPage, DataTable, Panel } from '@/components/admin/Ui';
import { AUDIT_ACTION_LABELS } from '@/lib/audit';
import { can, getSessionUser } from '@/lib/auth';
import { prisma, safeQuery } from '@/lib/db';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Audit Logs' };
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getSessionUser();
  if (!can(user, 'audit:read')) redirect('/admin');

  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);

  const [items, total] = await Promise.all([
    safeQuery(
      () =>
        prisma.auditLog.findMany({
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          include: { actor: { select: { name: true, email: true } } },
        }),
      [],
    ),
    safeQuery(() => prisma.auditLog.count(), 0),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminPage
      title="Audit Logs"
      description="Every administrative action, with who performed it and what changed. Entries are append-only: nothing here can be edited or deleted from the interface."
    >
      <div className="space-y-5">
        {items.length === 0 ? (
          <AdminEmpty
            title="No audit entries"
            description="Actions are recorded as administrators sign in and change content. An empty log means nothing has happened yet."
          />
        ) : (
          <Panel bodyClassName="p-4 sm:p-5">
            <DataTable
              caption="Administrative audit log"
              headers={['When', 'Actor', 'Action', 'Resource', 'Summary']}
            >
              {items.map((entry) => (
                <tr key={entry.id} className="align-top">
                  <td className="whitespace-nowrap py-3 pr-5 text-xs text-bone-500">
                    {formatDate(entry.createdAt, true)}
                  </td>
                  <td className="py-3 pr-5 text-sm text-bone-200">
                    {entry.actor?.name ?? entry.actorEmail ?? 'System'}
                    {entry.actor?.email ? (
                      <span className="block text-xs text-bone-600">{entry.actor.email}</span>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap py-3 pr-5 text-xs text-brass-200">
                    {AUDIT_ACTION_LABELS[entry.action]}
                  </td>
                  <td className="whitespace-nowrap py-3 pr-5 text-xs text-bone-500">
                    {entry.resourceType}
                  </td>
                  <td className="max-w-[26rem] py-3 pr-5 text-sm text-bone-300">{entry.summary}</td>
                </tr>
              ))}
            </DataTable>
          </Panel>
        )}

        {totalPages > 1 ? (
          <nav aria-label="Pagination" className="flex items-center justify-between">
            <p className="text-xs text-bone-500">
              Page {page} of {totalPages} · {total} entries
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link
                  href={`/admin/audit?page=${page - 1}`}
                  className="rounded-lg border border-ink-600 px-3 py-1.5 text-xs text-bone-200 hover:border-brass-400/60"
                >
                  Previous
                </Link>
              ) : null}
              {page < totalPages ? (
                <Link
                  href={`/admin/audit?page=${page + 1}`}
                  className="rounded-lg border border-ink-600 px-3 py-1.5 text-xs text-bone-200 hover:border-brass-400/60"
                >
                  Next
                </Link>
              ) : null}
            </div>
          </nav>
        ) : null}
      </div>
    </AdminPage>
  );
}
