import type { Prisma } from '@prisma/client';

import { handle, json, noStore, parseBody, readPagination } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { ipHash } from '@/lib/request';
import { mediaSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handle(async () => {
    await requirePermission('media:read');

    const url = new URL(request.url);
    const { page, pageSize, skip, take } = readPagination(url);
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('q')?.trim();

    const where: Prisma.MediaArticleWhereInput = {
      ...(status ? { status: status as never } : {}),
      ...(category && category !== 'ALL' ? { category: category as never } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { publication: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.mediaArticle.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take,
        include: { _count: { select: { evidence: true, verifications: true } } },
      }),
      prisma.mediaArticle.count({ where }),
    ]);

    return noStore(
      json({ items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }),
    );
  });
}

/**
 * Creates a press item.
 *
 * New items are unpublished unless the caller explicitly publishes one that is
 * already verified: nothing reaches the public archive by accident.
 */
export async function POST(request: Request) {
  return handle(async () => {
    const user = await requirePermission('media:write');
    const input = await parseBody(request, mediaSchema);

    const created = await prisma.mediaArticle.create({
      data: {
        ...input,
        description: input.description ?? null,
        isPublished: input.isPublished && input.status === 'VERIFIED',
      },
      select: { id: true, title: true },
    });

    await recordAudit({
      actor: user,
      action: 'MEDIA_UPLOADED',
      resourceType: 'MediaArticle',
      resourceId: created.id,
      summary: `Created press item: ${created.title}`,
      newValue: input as never,
      ipHash: ipHash(request.headers),
      userAgent: request.headers.get('user-agent'),
    });

    return noStore(json({ ok: true, id: created.id }, { status: 201 }));
  });
}
