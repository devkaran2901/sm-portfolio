import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Prisma } from '@prisma/client';

import { AdminEmpty, AdminPage, DataTable, Panel, StatusPill } from '@/components/admin/Ui';
import { INQUIRY_STATUS_LABELS, INQUIRY_TYPE_LABELS } from '@/content/defaults';
import { can, getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { INQUIRY_STATUSES, INQUIRY_TYPES } from '@/lib/validation';
import { cn, formatDate, relativeTime } from '@/lib/utils';

export const metadata: Metadata = { title: 'Inquiries' };
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 25;

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; q?: string; page?: string }>;
}) {
  const user = await getSessionUser();
  if (!can(user, 'inquiry:read')) redirect('/admin');

  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);
  const status = INQUIRY_STATUSES.includes(params.status as never) ? params.status : undefined;
  const type = INQUIRY_TYPES.includes(params.type as never) ? params.type : undefined;
  const search = params.q?.trim();

  const where: Prisma.ContactInquiryWhereInput = {
    ...(status ? { status: status as never } : {}),
    ...(type ? { inquiryType: type as never } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { subject: { contains: search, mode: 'insensitive' } },
            { reference: { contains: search.toUpperCase() } },
          ],
        }
      : {}),
  };

  const [items, total, statusCounts] = await Promise.all([
    prisma.contactInquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        reference: true,
        name: true,
        email: true,
        organization: true,
        subject: true,
        inquiryType: true,
        status: true,
        createdAt: true,
        assignedTo: { select: { name: true } },
        _count: { select: { notes: true } },
      },
    }),
    prisma.contactInquiry.count({ where }),
    prisma.contactInquiry.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);

  const counts = Object.fromEntries(statusCounts.map((row) => [row.status, row._count._all]));
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { status, type, q: search, page: String(page), ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value && !(key === 'page' && value === '1')) next.set(key, value);
    }
    const query = next.toString();
    return query ? `/admin/inquiries?${query}` : '/admin/inquiries';
  };

  return (
    <AdminPage
      title="Inquiries"
      description="Every message submitted through the public contact form, with its status, assignment and internal notes."
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-1.5">
          <Link
            href={buildHref({ status: undefined, page: '1' })}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              !status
                ? 'border-brass-400/60 bg-brass-700/20 text-brass-100'
                : 'border-ink-700 text-bone-400 hover:border-ink-500 hover:text-bone-200',
            )}
          >
            All ({Object.values(counts).reduce((sum, value) => sum + value, 0)})
          </Link>

          {INQUIRY_STATUSES.map((value) => (
            <Link
              key={value}
              href={buildHref({ status: value, page: '1' })}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                status === value
                  ? 'border-brass-400/60 bg-brass-700/20 text-brass-100'
                  : 'border-ink-700 text-bone-400 hover:border-ink-500 hover:text-bone-200',
              )}
            >
              {INQUIRY_STATUS_LABELS[value]} ({counts[value] ?? 0})
            </Link>
          ))}
        </div>

        <Panel bodyClassName="p-4">
          <form method="get" className="flex flex-wrap items-end gap-3">
            {status ? <input type="hidden" name="status" value={status} /> : null}

            <div className="flex min-w-[15rem] flex-1 flex-col gap-1.5">
              <label
                htmlFor="inquiry-search"
                className="text-xs font-semibold uppercase tracking-[0.1em] text-bone-400"
              >
                Search
              </label>
              <input
                id="inquiry-search"
                name="q"
                defaultValue={search}
                placeholder="Name, email, subject or reference"
                className="rounded-lg border border-ink-600 bg-ink-900/70 px-3 py-2 text-sm text-bone-100 placeholder:text-bone-600"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="inquiry-type"
                className="text-xs font-semibold uppercase tracking-[0.1em] text-bone-400"
              >
                Type
              </label>
              <select
                id="inquiry-type"
                name="type"
                defaultValue={type ?? ''}
                className="rounded-lg border border-ink-600 bg-ink-900/70 px-3 py-2 text-sm text-bone-100"
              >
                <option value="">All types</option>
                {INQUIRY_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {INQUIRY_TYPE_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="h-[2.375rem] rounded-lg border border-ink-600 px-4 text-sm font-medium text-bone-100 transition-colors hover:border-brass-400/60"
            >
              Filter
            </button>
          </form>
        </Panel>

        {items.length === 0 ? (
          <AdminEmpty
            title="No inquiries match"
            description={
              total === 0 && !search && !status && !type
                ? 'Nothing has been submitted through the contact form yet. New messages appear here immediately.'
                : 'Try a different status, type or search term.'
            }
          />
        ) : (
          <Panel bodyClassName="p-0 sm:p-5">
            <DataTable
              caption="Contact inquiries"
              headers={['Reference', 'From', 'Subject', 'Type', 'Status', 'Received', '']}
            >
              {items.map((inquiry) => (
                <tr key={inquiry.id} className="align-top transition-colors hover:bg-ink-800/40">
                  <td className="whitespace-nowrap py-3 pr-5 font-mono text-xs text-brass-200">
                    {inquiry.reference}
                  </td>
                  <td className="py-3 pr-5">
                    <p className="text-sm text-bone-100">{inquiry.name}</p>
                    <p className="text-xs text-bone-500">{inquiry.email}</p>
                    {inquiry.organization ? (
                      <p className="text-xs text-bone-600">{inquiry.organization}</p>
                    ) : null}
                  </td>
                  <td className="max-w-[22rem] py-3 pr-5">
                    <p className="truncate text-sm text-bone-200">{inquiry.subject}</p>
                    {inquiry._count.notes > 0 ? (
                      <p className="text-xs text-bone-600">{inquiry._count.notes} note(s)</p>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap py-3 pr-5 text-xs text-bone-400">
                    {INQUIRY_TYPE_LABELS[inquiry.inquiryType]}
                  </td>
                  <td className="whitespace-nowrap py-3 pr-5">
                    <StatusPill
                      status={inquiry.status}
                      label={INQUIRY_STATUS_LABELS[inquiry.status]}
                    />
                    {inquiry.assignedTo ? (
                      <p className="mt-1 text-xs text-bone-600">{inquiry.assignedTo.name}</p>
                    ) : null}
                  </td>
                  <td
                    className="whitespace-nowrap py-3 pr-5 text-xs text-bone-500"
                    title={formatDate(inquiry.createdAt, true)}
                  >
                    {relativeTime(inquiry.createdAt)}
                  </td>
                  <td className="whitespace-nowrap py-3 pr-1 text-right">
                    <Link
                      href={`/admin/inquiries/${inquiry.id}`}
                      className="text-xs font-semibold text-brass-200 hover:text-brass-100"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </DataTable>
          </Panel>
        )}

        {totalPages > 1 ? (
          <nav aria-label="Pagination" className="flex items-center justify-between">
            <p className="text-xs text-bone-500">
              Page {page} of {totalPages} · {total} total
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link
                  href={buildHref({ page: String(page - 1) })}
                  className="rounded-lg border border-ink-600 px-3 py-1.5 text-xs text-bone-200 hover:border-brass-400/60"
                >
                  Previous
                </Link>
              ) : null}
              {page < totalPages ? (
                <Link
                  href={buildHref({ page: String(page + 1) })}
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
