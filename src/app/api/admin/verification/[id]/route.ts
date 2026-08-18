import { handle, json, noStore, notFound, parseBody } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { ipHash } from '@/lib/request';
import { verificationSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Context) {
  return handle(async () => {
    const { id } = await context.params;

    const previous = await prisma.verificationRecord.findUnique({ where: { id } });
    if (!previous) notFound();

    const input = await parseBody(request, verificationSchema);
    const statusChanged = previous.status !== input.status;

    // Moving a claim into or out of VERIFIED requires the verify permission.
    const user = await requirePermission(statusChanged ? 'media:verify' : 'media:write');

    // Refuse to verify a claim that has no retrievable source attached. This is
    // the check that keeps "Verified" meaningful on the public site.
    if (input.status === 'VERIFIED' && !input.sourceUrl && !input.evidenceUrl) {
      return noStore(
        json(
          {
            error: 'Attach a source URL or an uploaded document before marking a claim verified.',
            fields: { sourceUrl: 'A source is required to verify a claim.' },
          },
          { status: 422 },
        ),
      );
    }

    await prisma.verificationRecord.update({
      where: { id },
      data: {
        ...input,
        reviewedById: statusChanged ? user.id : previous.reviewedById,
        reviewedAt: statusChanged ? new Date() : previous.reviewedAt,
      },
    });

    if (statusChanged) {
      await recordAudit({
        actor: user,
        action: input.status === 'REJECTED' ? 'MEDIA_REJECTED' : 'MEDIA_VERIFIED',
        resourceType: 'VerificationRecord',
        resourceId: id,
        summary: `Claim moved to ${input.status}: ${input.claim.slice(0, 90)}`,
        previousValue: { status: previous.status },
        newValue: { status: input.status, sourceUrl: input.sourceUrl },
        ipHash: ipHash(request.headers),
      });

      // Keep the denormalised flag on the linked timeline entry in step.
      if (input.timelineEventId) {
        await prisma.timelineEvent
          .update({
            where: { id: input.timelineEventId },
            data: { isVerified: input.status === 'VERIFIED' },
          })
          .catch(() => undefined);
      }
    }

    return noStore(json({ ok: true }));
  });
}

export async function DELETE(request: Request, context: Context) {
  return handle(async () => {
    const user = await requirePermission('media:verify');
    const { id } = await context.params;

    const previous = await prisma.verificationRecord.findUnique({
      where: { id },
      select: { claim: true, status: true },
    });
    if (!previous) notFound();

    await prisma.verificationRecord.delete({ where: { id } });

    await recordAudit({
      actor: user,
      action: 'CONTENT_DELETED',
      resourceType: 'VerificationRecord',
      resourceId: id,
      summary: `Deleted verification record: ${previous.claim.slice(0, 90)}`,
      previousValue: previous as never,
      ipHash: ipHash(request.headers),
    });

    return noStore(json({ ok: true }));
  });
}
