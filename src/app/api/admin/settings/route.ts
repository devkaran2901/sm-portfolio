import { Prisma } from '@prisma/client';

import { handle, json, noStore, parseBody } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { ipHash } from '@/lib/request';
import { settingSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return handle(async () => {
    await requirePermission('content:read');
    const settings = await prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
    return noStore(json({ settings }));
  });
}

export async function PUT(request: Request) {
  return handle(async () => {
    const user = await requirePermission('settings:write');
    const input = await parseBody(request, settingSchema);

    const previous = await prisma.siteSetting.findUnique({ where: { key: input.key } });
    const value =
      input.value === null || input.value === undefined
        ? Prisma.JsonNull
        : (input.value as Prisma.InputJsonValue);

    await prisma.siteSetting.upsert({
      where: { key: input.key },
      update: { value, group: input.group ?? previous?.group ?? 'general' },
      create: { key: input.key, value, group: input.group ?? 'general' },
    });

    await recordAudit({
      actor: user,
      action: 'SETTINGS_UPDATED',
      resourceType: 'SiteSetting',
      resourceId: input.key,
      summary: `Updated setting ${input.key}`,
      previousValue: previous?.value as never,
      newValue: input.value as never,
      ipHash: ipHash(request.headers),
    });

    return noStore(json({ ok: true }));
  });
}
