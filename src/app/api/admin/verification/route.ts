import type { Prisma } from '@prisma/client';

import { handle, json, noStore, parseBody, readPagination } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { ipHash } from '@/lib/request';
import { verificationSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The evidence archive: one row per public claim plus its supporting source.
 *
 * This is the backbone of the accuracy policy. A claim only renders as verified
 * on the public site once a row here reaches VERIFIED with a source attached.
 */
export async function GET(request: Request) {
  return handle(async () => {
    await requirePermission('media:read');

    const url = new URL(request.url);
    const { page, pageSize, skip, take } = readPagination(url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('q')?.trim();

    const where: Prisma.VerificationRecordWhereInput = {
      ...(status ? { status: status as never } : {}),
      ...(search
        ? {
            OR: [
              { claim: { contains: search, mode: 'insensitive' } },
              { publication: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total, counts] = await Promise.all([
      prisma.verificationRecord.findMany({
        where,
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        skip,
        take,
        include: {
          reviewedBy: { select: { id: true, name: true } },
          timelineEvent: { select: { id: true, title: true } },
          sportsEvent: { select: { id: true, name: true } },
          player: { select: { id: true, name: true } },
          mediaArticle: { select: { id: true, title: true } },
        },
      }),
      prisma.verificationRecord.count({ where }),
      prisma.verificationRecord.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    return noStore(
      json({
        items,
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        statusCounts: Object.fromEntries(counts.map((row) => [row.status, row._count._all])),
      }),
    );
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    const user = await requirePermission('media:write');
    const input = await parseBody(request, verificationSchema);

    const created = await prisma.verificationRecord.create({
      data: {
        ...input,
        // Marking something verified is a review action, so it is stamped.
        reviewedById: input.status === 'VERIFIED' ? user.id : null,
        reviewedAt: input.status === 'VERIFIED' ? new Date() : null,
      },
      select: { id: true },
    });

    await recordAudit({
      actor: user,
      action: 'CONTENT_CREATED',
      resourceType: 'VerificationRecord',
      resourceId: created.id,
      summary: `Opened verification record: ${input.claim.slice(0, 90)}`,
      newValue: input as never,
      ipHash: ipHash(request.headers),
    });

    return noStore(json({ ok: true, id: created.id }, { status: 201 }));
  });
}
