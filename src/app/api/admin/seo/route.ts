import { handle, json, noStore, parseBody } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { ipHash } from '@/lib/request';
import { seoSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return handle(async () => {
    await requirePermission('content:read');
    const settings = await prisma.seoSetting.findMany({ orderBy: { path: 'asc' } });
    return noStore(json({ settings }));
  });
}

/** Upsert by path, so the same call creates or updates a page entry. */
export async function PUT(request: Request) {
  return handle(async () => {
    const user = await requirePermission('seo:write');
    const input = await parseBody(request, seoSchema);

    const previous = await prisma.seoSetting.findUnique({ where: { path: input.path } });

    await prisma.seoSetting.upsert({
      where: { path: input.path },
      update: input,
      create: input,
    });

    await recordAudit({
      actor: user,
      action: 'SETTINGS_UPDATED',
      resourceType: 'SeoSetting',
      resourceId: input.path,
      summary: `Updated SEO metadata for ${input.path}`,
      previousValue: previous as never,
      newValue: input as never,
      ipHash: ipHash(request.headers),
    });

    return noStore(json({ ok: true }));
  });
}
