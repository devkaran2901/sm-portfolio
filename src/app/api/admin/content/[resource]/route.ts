import { handle, json, noStore, notFound, parseBody, readPagination } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { recordAudit } from '@/lib/audit';
import { getResource } from '@/lib/resources';
import { ipHash } from '@/lib/request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ resource: string }> };

/** List a content collection. */
export async function GET(request: Request, context: Context) {
  return handle(async () => {
    const { resource: key } = await context.params;
    const resource = getResource(key);
    if (!resource) notFound('Unknown content collection.');

    await requirePermission(resource.readPermission);

    const url = new URL(request.url);
    const { page, pageSize, skip, take } = readPagination(url);
    const search = url.searchParams.get('q')?.trim() || undefined;

    const [items, total] = await Promise.all([
      resource.list({ skip, take, search }),
      resource.count({ search }),
    ]);

    return noStore(
      json({ items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }),
    );
  });
}

/** Create an item in a content collection. */
export async function POST(request: Request, context: Context) {
  return handle(async () => {
    const { resource: key } = await context.params;
    const resource = getResource(key);
    if (!resource) notFound('Unknown content collection.');

    const user = await requirePermission(resource.writePermission);
    const data = await parseBody(request, resource.schema);
    const created = await resource.create(data);

    await recordAudit({
      actor: user,
      action: 'CONTENT_CREATED',
      resourceType: key,
      resourceId: created.id,
      summary: `Created ${resource.singular}: ${String(data[resource.titleField] ?? created.id)}`,
      newValue: data as never,
      ipHash: ipHash(request.headers),
      userAgent: request.headers.get('user-agent'),
    });

    return noStore(json({ ok: true, id: created.id }, { status: 201 }));
  });
}
