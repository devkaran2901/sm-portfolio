import type { Prisma } from '@prisma/client';

import { handle, json, noStore, readPagination } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { INQUIRY_STATUSES, INQUIRY_TYPES } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Inquiry list with filtering.
 *
 * `visitorHash` and `spamScore` are deliberately excluded from the payload:
 * the inbox does not need a visitor identifier to do its job.
 */
export async function GET(request: Request) {
  return handle(async () => {
    await requirePermission('inquiry:read');

    const url = new URL(request.url);
    const { page, pageSize, skip, take } = readPagination(url);

    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const search = url.searchParams.get('q')?.trim();
    const assigned = url.searchParams.get('assignedToId');

    const where: Prisma.ContactInquiryWhereInput = {
      ...(status && INQUIRY_STATUSES.includes(status as never)
        ? { status: status as never }
        : {}),
      ...(type && INQUIRY_TYPES.includes(type as never) ? { inquiryType: type as never } : {}),
      ...(assigned ? { assignedToId: assigned } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { subject: { contains: search, mode: 'insensitive' } },
              { organization: { contains: search, mode: 'insensitive' } },
              { reference: { contains: search.toUpperCase() } },
            ],
          }
        : {}),
    };

    const [items, total, statusCounts] = await Promise.all([
      prisma.contactInquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          reference: true,
          name: true,
          email: true,
          phone: true,
          organization: true,
          subject: true,
          inquiryType: true,
          status: true,
          createdAt: true,
          respondedAt: true,
          sourcePage: true,
          utmSource: true,
          utmCampaign: true,
          assignedTo: { select: { id: true, name: true } },
          _count: { select: { notes: true } },
        },
      }),
      prisma.contactInquiry.count({ where }),
      prisma.contactInquiry.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    return noStore(
      json({
        items,
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        statusCounts: Object.fromEntries(
          statusCounts.map((row) => [row.status, row._count._all]),
        ),
      }),
    );
  });
}
