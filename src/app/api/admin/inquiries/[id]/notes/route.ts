import { handle, json, noStore, notFound, parseBody } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { ipHash } from '@/lib/request';
import { inquiryNoteSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

/** Adds an internal note to an inquiry. Notes are never shown to the sender. */
export async function POST(request: Request, context: Context) {
  return handle(async () => {
    const user = await requirePermission('inquiry:write');
    const { id } = await context.params;

    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id },
      select: { reference: true },
    });
    if (!inquiry) notFound();

    const { body } = await parseBody(request, inquiryNoteSchema);

    const note = await prisma.inquiryNote.create({
      data: { inquiryId: id, authorId: user.id, body },
      include: { author: { select: { id: true, name: true } } },
    });

    await recordAudit({
      actor: user,
      action: 'INQUIRY_NOTE_ADDED',
      resourceType: 'ContactInquiry',
      resourceId: id,
      summary: `Note added to inquiry ${inquiry.reference}`,
      ipHash: ipHash(request.headers),
    });

    return noStore(json({ ok: true, note }, { status: 201 }));
  });
}
