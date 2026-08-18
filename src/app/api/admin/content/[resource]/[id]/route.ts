import { handle, json, noStore, notFound, parseBody } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { recordAudit } from '@/lib/audit';
import { getResource } from '@/lib/resources';
import { ipHash } from '@/lib/request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ resource: string; id: string }> };

export async function GET(_request: Request, context: Context) {
  return handle(async () => {
    const { resource: key, id } = await context.params;
    const resource = getResource(key);
    if (!resource) notFound('Unknown content collection.');

    await requirePermission(resource.readPermission);

    const item = await resource.find(id);
    if (!item) notFound();

    return noStore(json({ item }));
  });
}

export async function PUT(request: Request, context: Context) {
  return handle(async () => {
    const { resource: key, id } = await context.params;
    const resource = getResource(key);
    if (!resource) notFound('Unknown content collection.');

    const user = await requirePermission(resource.writePermission);

    // Read the current row first so the audit entry records what actually changed.
    const previous = await resource.find(id);
    if (!previous) notFound();

    const data = await parseBody(request, resource.schema);
    await resource.update(id, data);

    await recordAudit({
      actor: user,
      action: 'CONTENT_UPDATED',
      resourceType: key,
      resourceId: id,
      summary: `Updated ${resource.singular}: ${String(data[resource.titleField] ?? id)}`,
      previousValue: previous as never,
      newValue: data as never,
      ipHash: ipHash(request.headers),
      userAgent: request.headers.get('user-agent'),
    });

    return noStore(json({ ok: true, id }));
  });
}

export async function DELETE(request: Request, context: Context) {
  return handle(async () => {
    const { resource: key, id } = await context.params;
    const resource = getResource(key);
    if (!resource) notFound('Unknown content collection.');

    const user = await requirePermission(resource.deletePermission);

    const previous = await resource.find(id);
    if (!previous) notFound();

    await resource.remove(id);

    await recordAudit({
      actor: user,
      action: 'CONTENT_DELETED',
      resourceType: key,
      resourceId: id,
      summary: `Deleted ${resource.singular}`,
      previousValue: previous as never,
      ipHash: ipHash(request.headers),
      userAgent: request.headers.get('user-agent'),
    });

    return noStore(json({ ok: true }));
  });
}
