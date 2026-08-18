import { handle, json, noStore, notFound, parseBody } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { ipHash } from '@/lib/request';
import { inquiryUpdateSchema } from '@/lib/validation';
import { INQUIRY_STATUS_LABELS } from '@/content/defaults';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  return handle(async () => {
    await requirePermission('inquiry:read');
    const { id } = await context.params;

    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { id: true, name: true } } },
        },
      },
    });
    if (!inquiry) notFound();

    // The visitor hash never leaves the server: it is an abuse-control value,
    // not something an inbox operator has any reason to see.
    const { visitorHash: _visitorHash, ...safe } = inquiry;

    return noStore(json({ inquiry: safe }));
  });
}

export async function PATCH(request: Request, context: Context) {
  return handle(async () => {
    const user = await requirePermission('inquiry:write');
    const { id } = await context.params;

    const previous = await prisma.contactInquiry.findUnique({
      where: { id },
      select: { id: true, reference: true, status: true, assignedToId: true },
    });
    if (!previous) notFound();

    const input = await parseBody(request, inquiryUpdateSchema);

    const updated = await prisma.contactInquiry.update({
      where: { id },
      data: {
        ...(input.status ? { status: input.status } : {}),
        ...(input.assignedToId !== undefined ? { assignedToId: input.assignedToId } : {}),
        // First move away from NEW is treated as the moment of response.
        ...(input.status && input.status !== 'NEW' && !previous.status.startsWith('RESOL')
          ? { respondedAt: new Date() }
          : {}),
      },
      select: { id: true, status: true, assignedToId: true },
    });

    if (input.status && input.status !== previous.status) {
      await recordAudit({
        actor: user,
        action: 'INQUIRY_STATUS_CHANGED',
        resourceType: 'ContactInquiry',
        resourceId: id,
        summary: `Inquiry ${previous.reference}: ${INQUIRY_STATUS_LABELS[previous.status]} to ${INQUIRY_STATUS_LABELS[input.status]}`,
        previousValue: { status: previous.status },
        newValue: { status: input.status },
        ipHash: ipHash(request.headers),
        userAgent: request.headers.get('user-agent'),
      });
    }

    if (input.assignedToId !== undefined && input.assignedToId !== previous.assignedToId) {
      await recordAudit({
        actor: user,
        action: 'INQUIRY_ASSIGNED',
        resourceType: 'ContactInquiry',
        resourceId: id,
        summary: `Inquiry ${previous.reference} assignment changed`,
        previousValue: { assignedToId: previous.assignedToId },
        newValue: { assignedToId: input.assignedToId },
        ipHash: ipHash(request.headers),
      });
    }

    return noStore(json({ ok: true, inquiry: updated }));
  });
}

export async function DELETE(request: Request, context: Context) {
  return handle(async () => {
    const user = await requirePermission('inquiry:delete');
    const { id } = await context.params;

    const previous = await prisma.contactInquiry.findUnique({
      where: { id },
      select: { reference: true, subject: true },
    });
    if (!previous) notFound();

    await prisma.contactInquiry.delete({ where: { id } });

    await recordAudit({
      actor: user,
      action: 'CONTENT_DELETED',
      resourceType: 'ContactInquiry',
      resourceId: id,
      summary: `Deleted inquiry ${previous.reference}`,
      previousValue: previous as never,
      ipHash: ipHash(request.headers),
    });

    return noStore(json({ ok: true }));
  });
}
