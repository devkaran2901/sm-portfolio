import type { Prisma } from '@prisma/client';

import { handle, json, noStore, readPagination } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Audit log, newest first. Read-only: entries are never editable or deletable. */
export async function GET(request: Request) {
  return handle(async () => {
    await requirePermission('audit:read');

    const url = new URL(request.url);
    const { page, pageSize, skip, take } = readPagination(url, 50);
    const action = url.searchParams.get('action');
    const actorId = url.searchParams.get('actorId');

    const where: Prisma.AuditLogWhereInput = {
      ...(action ? { action: action as never } : {}),
      ...(actorId ? { actorId } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: { actor: { select: { id: true, name: true, email: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return noStore(
      json({ items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }),
    );
  });
}
