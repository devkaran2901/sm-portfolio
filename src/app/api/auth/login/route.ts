import { handle, json, noStore, parseBody } from '@/lib/api';
import {
  createSession,
  isLockedOut,
  registerFailedLogin,
  registerSuccessfulLogin,
  verifyPassword,
} from '@/lib/auth';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { ipHash } from '@/lib/request';
import { loginSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Identical message for every failure mode, so the endpoint cannot enumerate accounts. */
const GENERIC_FAILURE = 'Email or password is incorrect.';

export async function POST(request: Request) {
  return handle(async () => {
    const hash = ipHash(request.headers);
    const userAgent = request.headers.get('user-agent');

    const limit = await rateLimit({
      key: `login:${hash}`,
      limit: 10,
      windowSeconds: 900,
      durable: true,
    });
    if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

    const input = await parseBody(request, loginSchema);
    const email = input.email.toLowerCase();

    const user = await prisma.adminUser.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      // Burn comparable time whether or not the account exists.
      await verifyPassword(input.password, '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv');
      await recordAudit({
        action: 'ADMIN_LOGIN_FAILED',
        resourceType: 'AdminUser',
        summary: `Failed login for ${email}`,
        ipHash: hash,
        userAgent,
      });
      return noStore(json({ error: GENERIC_FAILURE }, { status: 401 }));
    }

    if (isLockedOut(user)) {
      await recordAudit({
        action: 'ADMIN_LOGIN_FAILED',
        resourceType: 'AdminUser',
        resourceId: user.id,
        summary: `Login attempt on locked account ${email}`,
        ipHash: hash,
        userAgent,
      });
      return noStore(
        json(
          { error: 'This account is temporarily locked after repeated failures. Try again shortly.' },
          { status: 423 },
        ),
      );
    }

    const passwordValid = await verifyPassword(input.password, user.passwordHash);
    if (!passwordValid) {
      await registerFailedLogin(user.id, user.failedAttempts);
      await recordAudit({
        actorEmail: email,
        action: 'ADMIN_LOGIN_FAILED',
        resourceType: 'AdminUser',
        resourceId: user.id,
        summary: `Failed login for ${email}`,
        ipHash: hash,
        userAgent,
      });
      return noStore(json({ error: GENERIC_FAILURE }, { status: 401 }));
    }

    // Second factor, when the account has one enrolled.
    if (user.twoFactorEnabled) {
      if (!input.totp) {
        return noStore(json({ error: 'Enter your authenticator code.', totpRequired: true }, { status: 401 }));
      }
      const { verifyTotp } = await import('@/lib/totp');
      if (!user.twoFactorSecret || !verifyTotp(user.twoFactorSecret, input.totp)) {
        await registerFailedLogin(user.id, user.failedAttempts);
        return noStore(
          json({ error: 'That authenticator code is not valid.', totpRequired: true }, { status: 401 }),
        );
      }
    }

    await registerSuccessfulLogin(user.id);
    await createSession(user, { userAgent, ipHash: hash });

    await recordAudit({
      actor: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        roleLabel: user.role.label,
        mustChangePassword: user.mustChangePassword,
        twoFactorEnabled: user.twoFactorEnabled,
        sessionId: '',
      },
      action: 'ADMIN_LOGIN',
      resourceType: 'AdminUser',
      resourceId: user.id,
      summary: `${user.email} signed in`,
      ipHash: hash,
      userAgent,
    });

    return noStore(
      json({
        ok: true,
        mustChangePassword: user.mustChangePassword,
        role: user.role.name,
      }),
    );
  });
}
