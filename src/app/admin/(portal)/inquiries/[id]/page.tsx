import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { InquiryControls } from '@/components/admin/InquiryControls';
import { AdminPage, Panel, StatusPill } from '@/components/admin/Ui';
import { INQUIRY_STATUS_LABELS, INQUIRY_TYPE_LABELS } from '@/content/defaults';
import { can, getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Inquiry' };
export const dynamic = 'force-dynamic';

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!can(user, 'inquiry:read')) redirect('/admin');

  const { id } = await params;

  const [inquiry, assignees] = await Promise.all([
    prisma.contactInquiry.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true } },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { name: true } } },
        },
      },
    }),
    prisma.adminUser.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  if (!inquiry) notFound();

  const meta = [
    { label: 'Reference', value: inquiry.reference },
    { label: 'Received', value: formatDate(inquiry.createdAt, true) },
    { label: 'Type', value: INQUIRY_TYPE_LABELS[inquiry.inquiryType] },
    { label: 'Email', value: inquiry.email },
    { label: 'Phone', value: inquiry.phone },
    { label: 'Organisation', value: inquiry.organization },
    { label: 'Source page', value: inquiry.sourcePage },
    { label: 'Referrer', value: inquiry.referrer },
    { label: 'Campaign', value: inquiry.utmCampaign },
    { label: 'Campaign source', value: inquiry.utmSource },
    { label: 'Country', value: inquiry.countryCode },
    { label: 'Consent given', value: inquiry.consentGiven ? 'Yes' : 'No' },
    { label: 'First response', value: inquiry.respondedAt ? formatDate(inquiry.respondedAt, true) : null },
  ].filter((row) => Boolean(row.value));

  return (
    <AdminPage
      title={inquiry.subject}
      description={`From ${inquiry.name}`}
      actions={
        <Link
          href="/admin/inquiries"
          className="inline-flex items-center gap-1.5 rounded-full border border-ink-600 px-3.5 py-2 text-xs font-medium text-bone-200 transition-colors hover:border-brass-400/60"
        >
          <ArrowLeft size={13} aria-hidden="true" />
          All inquiries
        </Link>
      }
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel
            title="Message"
            actions={
              <StatusPill status={inquiry.status} label={INQUIRY_STATUS_LABELS[inquiry.status]} />
            }
          >
            <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-bone-200">
              {inquiry.message}
            </p>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-ink-800 pt-5">
              <a
                href={`mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: ${inquiry.subject} [${inquiry.reference}]`)}`}
                className="rounded-full border border-ink-600 px-4 py-2 text-xs font-semibold text-bone-100 transition-colors hover:border-brass-400/60"
              >
                Reply by email
              </a>
              {inquiry.phone ? (
                <a
                  href={`tel:${inquiry.phone}`}
                  className="rounded-full border border-ink-600 px-4 py-2 text-xs font-semibold text-bone-100 transition-colors hover:border-brass-400/60"
                >
                  Call {inquiry.phone}
                </a>
              ) : null}
            </div>
          </Panel>

          <Panel title="Details">
            <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {meta.map((row) => (
                <div key={row.label} className="flex flex-col gap-0.5">
                  <dt className="text-[0.6875rem] uppercase tracking-[0.1em] text-bone-500">
                    {row.label}
                  </dt>
                  <dd className="break-words text-sm text-bone-200">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel title={`Internal notes (${inquiry.notes.length})`}>
            {inquiry.notes.length === 0 ? (
              <p className="text-sm text-bone-600">No notes yet.</p>
            ) : (
              <ul className="space-y-4">
                {inquiry.notes.map((note) => (
                  <li key={note.id} className="border-l-2 border-ink-700 pl-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-bone-200">
                      {note.body}
                    </p>
                    <p className="mt-1.5 text-xs text-bone-600">
                      {note.author?.name ?? 'Removed user'} · {formatDate(note.createdAt, true)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="lg:col-span-1">
          <Panel title="Manage">
            <InquiryControls
              inquiryId={inquiry.id}
              initialStatus={inquiry.status}
              initialAssignee={inquiry.assignedTo?.id ?? null}
              assignees={assignees}
              canWrite={can(user, 'inquiry:write')}
            />
          </Panel>
        </div>
      </div>
    </AdminPage>
  );
}
