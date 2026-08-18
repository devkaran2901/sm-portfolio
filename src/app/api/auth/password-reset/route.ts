import { after } from 'next/server';

import { handle, json, noStore, parseBody } from '@/lib/api';
import { hashPassword, passwordProblems, randomToken, revokeAllSessions, sha256 } from '@/lib/auth';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { siteUrl } from '@/lib/env';
import { passwordResetTemplate, sendMail } from '@/lib/mail';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { ipHash } from '@/lib/request';
import { passwordResetRequestSchema, passwordResetSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TOKEN_TTL_MS = 60 * 60 * 1000;

/**
 * Request a reset link.
 *
 * Always answers 200 with the same message, whether or not the address belongs
 * to an account: a different response here is an account-enumeration oracle.
 */
export async function POST(request: Request) {
  return handle(async () => {
    const hash = ipHash(request.headers);
    const limit = await rateLimit({
      key: `reset:${hash}`,
      limit: 5,
      windowSeconds: 3600,
      durable: true,
    });
    if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

    const { email } = await parseBody(request, passwordResetRequestSchema);
    const user = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });

    if (user?.isActive) {
      const token = randomToken(32);
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: sha256(token),
          expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        },
      });

      after(async () => {
        const resetUrl = `${siteUrl()}/admin/reset?token=${token}`;
        const template = passwordResetTemplate(user.name, resetUrl);
        await sendMail({ to: user.email, subject: 'Reset your admin password', ...template });

        await recordAudit({
          actorEmail: user.email,
          action: 'PASSWORD_RESET_REQUESTED',
          resourceType: 'AdminUser',
          resourceId: user.id,
          summary: `Password reset requested for ${user.email}`,
          ipHash: hash,
        });
      });
    }

    return noStore(
      json({
        ok: true,
        message: 'If that address belongs to an admin account, a reset link is on its way.',
      }),
    );
  });
}

/** Consume a reset token and set a new password. */
export async function PUT(request: Request) {
  return handle(async () => {
    const hash = ipHash(request.headers);
    const limit = await rateLimit({ key: `reset-confirm:${hash}`, limit: 10, windowSeconds: 3600 });
    if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

    const input = await parseBody(request, passwordResetSchema);

    const problems = passwordProblems(input.password);
    if (problems.length > 0) {
      return noStore(json({ error: problems.join(' '), fields: { password: problems[0] } }, { status: 422 }));
    }

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: sha256(input.token) },
      include: { user: true },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return noStore(json({ error: 'This reset link is invalid or has expired.' }, { status: 400 }));
    }

    await prisma.$transaction([
      prisma.adminUser.update({
        where: { id: record.userId },
        data: {
          passwordHash: await hashPassword(input.password),
          mustChangePassword: false,
          failedAttempts: 0,
          lockedUntil: null,
        },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // A password change invalidates every existing session for that account.
    await revokeAllSessions(record.userId);

    await recordAudit({
      actorEmail: record.user.email,
      action: 'PASSWORD_CHANGED',
      resourceType: 'AdminUser',
      resourceId: record.userId,
      summary: `Password reset completed for ${record.user.email}`,
      ipHash: hash,
    });

    return noStore(json({ ok: true }));
  });
}
