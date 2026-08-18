import { handle, json, noStore } from '@/lib/api';
import { destroySession, getSessionUser } from '@/lib/auth';
import { recordAudit } from '@/lib/audit';
import { ipHash } from '@/lib/request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return handle(async () => {
    const user = await getSessionUser();
    await destroySession();

    if (user) {
      await recordAudit({
        actor: user,
        action: 'ADMIN_LOGOUT',
        resourceType: 'AdminUser',
        resourceId: user.id,
        summary: `${user.email} signed out`,
        ipHash: ipHash(request.headers),
        userAgent: request.headers.get('user-agent'),
      });
    }

    return noStore(json({ ok: true }));
  });
}
