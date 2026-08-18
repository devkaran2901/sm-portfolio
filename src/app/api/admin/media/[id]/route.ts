import { handle, json, noStore, notFound, parseBody } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { ipHash } from '@/lib/request';
import { mediaSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  return handle(async () => {
    await requirePermission('media:read');
    const { id } = await context.params;

    const item = await prisma.mediaArticle.findUnique({
      where: { id },
      include: {
        evidence: { orderBy: { createdAt: 'desc' } },
        verifications: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!item) notFound();

    return noStore(json({ item }));
  });
}

export async function PUT(request: Request, context: Context) {
  return handle(async () => {
    const { id } = await context.params;
    const input = await parseBody(request, mediaSchema);

    // Changing the verification status is a stronger action than editing copy,
    // so it requires the verify permission rather than plain write access.
    const previous = await prisma.mediaArticle.findUnique({ where: { id } });
    if (!previous) notFound();

    const statusChanged = previous.status !== input.status;
    const user = await requirePermission(statusChanged ? 'media:verify' : 'media:write');

    await prisma.mediaArticle.update({
      where: { id },
      data: {
        ...input,
        description: input.description ?? null,
        // An unverified item can never be publicly published.
        isPublished: input.isPublished && input.status === 'VERIFIED',
      },
    });

    if (statusChanged) {
      await recordAudit({
        actor: user,
        action: input.status === 'REJECTED' ? 'MEDIA_REJECTED' : 'MEDIA_VERIFIED',
        resourceType: 'MediaArticle',
        resourceId: id,
        summary: `Press item "${previous.title}" moved to ${input.status}`,
        previousValue: { status: previous.status },
        newValue: { status: input.status },
        ipHash: ipHash(request.headers),
      });
    } else {
      await recordAudit({
        actor: user,
        action: 'CONTENT_UPDATED',
        resourceType: 'MediaArticle',
        resourceId: id,
        summary: `Updated press item: ${input.title}`,
        previousValue: previous as never,
        newValue: input as never,
        ipHash: ipHash(request.headers),
      });
    }

    return noStore(json({ ok: true }));
  });
}

export async function DELETE(request: Request, context: Context) {
  return handle(async () => {
    const user = await requirePermission('media:write');
    const { id } = await context.params;

    const previous = await prisma.mediaArticle.findUnique({
      where: { id },
      select: { title: true, status: true },
    });
    if (!previous) notFound();

    await prisma.mediaArticle.delete({ where: { id } });

    await recordAudit({
      actor: user,
      action: 'CONTENT_DELETED',
      resourceType: 'MediaArticle',
      resourceId: id,
      summary: `Deleted press item: ${previous.title}`,
      previousValue: previous as never,
      ipHash: ipHash(request.headers),
    });

    return noStore(json({ ok: true }));
  });
}
