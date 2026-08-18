import { handle, json, noStore, parseBody } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { ipHash } from '@/lib/request';
import { profileSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return handle(async () => {
    await requirePermission('content:read');
    const profile = await prisma.profile.findUnique({ where: { id: 'primary' } });
    return noStore(json({ profile }));
  });
}

export async function PUT(request: Request) {
  return handle(async () => {
    const user = await requirePermission('content:write');
    const previous = await prisma.profile.findUnique({ where: { id: 'primary' } });
    const input = await parseBody(request, profileSchema);

    const data = {
      ...input,
      email: input.email || null,
      socialLinks: input.socialLinks,
    };

    const profile = await prisma.profile.upsert({
      where: { id: 'primary' },
      update: data,
      create: { id: 'primary', ...data },
    });

    await recordAudit({
      actor: user,
      action: 'CONTENT_UPDATED',
      resourceType: 'Profile',
      resourceId: profile.id,
      summary: 'Updated the public profile',
      previousValue: previous as never,
      newValue: data as never,
      ipHash: ipHash(request.headers),
      userAgent: request.headers.get('user-agent'),
    });

    return noStore(json({ ok: true }));
  });
}
