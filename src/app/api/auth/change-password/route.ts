import { handle, json, noStore, parseBody } from '@/lib/api';
import {
  hashPassword,
  passwordProblems,
  requireUser,
  revokeAllSessions,
  verifyPassword,
} from '@/lib/auth';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { ipHash } from '@/lib/request';
import { changePasswordSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Signed-in password change. Requires the current password, never just the session. */
export async function POST(request: Request) {
  return handle(async () => {
    const user = await requireUser();
    const hash = ipHash(request.headers);

    const limit = await rateLimit({ key: `change-password:${user.id}`, limit: 5, windowSeconds: 900 });
    if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

    const input = await parseBody(request, changePasswordSchema);

    const record = await prisma.adminUser.findUniqueOrThrow({ where: { id: user.id } });
    if (!(await verifyPassword(input.currentPassword, record.passwordHash))) {
      return noStore(
        json(
          { error: 'Your current password is not correct.', fields: { currentPassword: 'Incorrect password.' } },
          { status: 400 },
        ),
      );
    }

    const problems = passwordProblems(input.newPassword);
    if (problems.length > 0) {
      return noStore(json({ error: problems.join(' '), fields: { newPassword: problems[0] } }, { status: 422 }));
    }

    if (await verifyPassword(input.newPassword, record.passwordHash)) {
      return noStore(
        json(
          { error: 'Choose a password you have not used here before.', fields: { newPassword: 'Reusing the current password.' } },
          { status: 422 },
        ),
      );
    }

    await prisma.adminUser.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(input.newPassword), mustChangePassword: false },
    });

    // Every other session for this account is dropped; the caller re-authenticates.
    await revokeAllSessions(user.id);

    await recordAudit({
      actor: user,
      action: 'PASSWORD_CHANGED',
      resourceType: 'AdminUser',
      resourceId: user.id,
      summary: `${user.email} changed their password`,
      ipHash: hash,
      userAgent: request.headers.get('user-agent'),
    });

    return noStore(json({ ok: true }));
  });
}
