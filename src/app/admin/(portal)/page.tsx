import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { AdminEmpty, AdminPage, Panel, StatusPill } from '@/components/admin/Ui';
import { buttonClass } from '@/components/ui/Button';
import { INQUIRY_STATUS_LABELS, INQUIRY_TYPE_LABELS } from '@/content/defaults';
import { getSessionUser, can } from '@/lib/auth';
import { prisma, safeQuery } from '@/lib/db';
import { formatDate, relativeTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * Dashboard.
 *
 * Panels are gated by permission, so an Analytics Viewer sees traffic without
 * the inquiry inbox, and an Inquiry Manager sees the inbox without user
 * administration.
 */
export default async function AdminDashboard() {
  const user = await getSessionUser();

  const [recentInquiries, openClaims] = await Promise.all([
    can(user, 'inquiry:read')
      ? safeQuery(
          () =>
            prisma.contactInquiry.findMany({
              where: { status: { notIn: ['SPAM', 'ARCHIVED'] } },
              orderBy: { createdAt: 'desc' },
              take: 6,
              select: {
                id: true,
                reference: true,
                name: true,
                subject: true,
                inquiryType: true,
                status: true,
                createdAt: true,
              },
            }),
          [],
        )
      : Promise.resolve([]),
    can(user, 'media:read')
      ? safeQuery(
          () =>
            prisma.verificationRecord.count({
              where: { status: { in: ['UNVERIFIED', 'UNDER_REVIEW'] } },
            }),
          0,
        )
      : Promise.resolve(0),
  ]);

  return (
    <AdminPage
      title={`Welcome back, ${user?.name.split(' ')[0] ?? 'there'}`}
      description="Live traffic, inquiries and the state of the evidence archive."
      actions={
        <Link href="/" target="_blank" rel="noopener noreferrer" className={buttonClass('secondary', 'sm')}>
          View public site
          <ArrowUpRight size={13} aria-hidden="true" />
        </Link>
      }
    >
      <div className="space-y-6">
        {can(user, 'analytics:read') ? (
          <AnalyticsDashboard compact />
        ) : (
          <AdminEmpty
            title="Analytics not available for your role"
            description="Your role does not include analytics access. Ask a super admin if you need it."
          />
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          {can(user, 'inquiry:read') ? (
            <Panel
              className="lg:col-span-2"
              title="Recent inquiries"
              description="Newest first, excluding spam and archived"
              actions={
                <Link
                  href="/admin/inquiries"
                  className="text-xs font-semibold text-brass-200 hover:text-brass-100"
                >
                  View all
                </Link>
              }
            >
              {recentInquiries.length === 0 ? (
                <p className="text-sm text-bone-600">No inquiries yet.</p>
              ) : (
                <ul className="divide-y divide-ink-800">
                  {recentInquiries.map((inquiry) => (
                    <li key={inquiry.id} className="py-3 first:pt-0 last:pb-0">
                      <Link
                        href={`/admin/inquiries/${inquiry.id}`}
                        className="group flex items-start justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-bone-100 group-hover:text-brass-200">
                            {inquiry.subject}
                          </p>
                          <p className="mt-1 truncate text-xs text-bone-500">
                            {inquiry.name} · {INQUIRY_TYPE_LABELS[inquiry.inquiryType]} ·{' '}
                            <span title={formatDate(inquiry.createdAt, true)}>
                              {relativeTime(inquiry.createdAt)}
                            </span>
                          </p>
                        </div>
                        <StatusPill
                          status={inquiry.status}
                          label={INQUIRY_STATUS_LABELS[inquiry.status]}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          ) : null}

          {can(user, 'media:read') ? (
            <Panel title="Evidence archive" description="Claims still needing a source">
              <p className="font-display text-4xl text-brass-200 tabular-nums">{openClaims}</p>
              <p className="mt-2 text-sm leading-relaxed text-bone-400">
                {openClaims === 0
                  ? 'Every recorded claim has been reviewed.'
                  : 'These claims appear on the public site with a "Verification required" marker until a source is attached.'}
              </p>
              <Link
                href="/admin/verification"
                className={`${buttonClass('secondary', 'sm')} mt-5`}
              >
                Open verification
              </Link>
            </Panel>
          ) : null}
        </div>
      </div>
    </AdminPage>
  );
}
