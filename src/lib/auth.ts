import 'server-only';

import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import type { AdminUser, Role, RoleName } from '@prisma/client';

import { prisma } from './db';
import { authSecret, isProduction, sessionTtlSeconds } from './env';
import { roleHas, type PermissionKey } from './permissions';

export const SESSION_COOKIE = 'sm_session';
const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: RoleName;
  roleLabel: string;
  mustChangePassword: boolean;
  twoFactorEnabled: boolean;
  sessionId: string;
};

// ---------------------------------------------------------------------------
// Passwords
// ---------------------------------------------------------------------------

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Password policy. Deliberately length-first rather than a symbol soup:
 * long passphrases beat short complex ones.
 */
export function passwordProblems(password: string): string[] {
  const problems: string[] = [];
  if (password.length < 12) problems.push('Use at least 12 characters.');
  if (!/[a-z]/.test(password)) problems.push('Include a lowercase letter.');
  if (!/[A-Z]/.test(password)) problems.push('Include an uppercase letter.');
  if (!/\d/.test(password)) problems.push('Include a number.');
  if (/^(password|admin|welcome|qwerty|letmein)/i.test(password)) {
    problems.push('Avoid common words like "password" or "admin".');
  }
  return problems;
}

// ---------------------------------------------------------------------------
// Tokens and sessions
// ---------------------------------------------------------------------------

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

/** Constant-time string comparison for tokens of equal expected length. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

type SessionClaims = { sid: string; uid: string; role: RoleName };

async function signSessionToken(claims: SessionClaims, expiresAt: Date): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('sm-portfolio')
    .setAudience('sm-admin')
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(authSecret());
}

/**
 * Verifies the JWT signature only. Edge middleware uses this as a cheap gate;
 * the authoritative check (revocation, user still active) happens in
 * `getSessionUser`, which also hits the database.
 */
export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, authSecret(), {
      issuer: 'sm-portfolio',
      audience: 'sm-admin',
    });
    if (typeof payload.sid !== 'string' || typeof payload.uid !== 'string') return null;
    return { sid: payload.sid, uid: payload.uid, role: payload.role as RoleName };
  } catch {
    return null;
  }
}

export async function createSession(
  user: AdminUser & { role: Role },
  context: { userAgent?: string | null; ipHash?: string | null },
): Promise<void> {
  const expiresAt = new Date(Date.now() + sessionTtlSeconds() * 1000);
  const sessionId = randomToken(18);
  const token = await signSessionToken(
    { sid: sessionId, uid: user.id, role: user.role.name },
    expiresAt,
  );

  await prisma.adminSession.create({
    data: {
      id: sessionId,
      userId: user.id,
      tokenHash: sha256(token),
      userAgent: context.userAgent?.slice(0, 400) ?? null,
      ipHash: context.ipHash ?? null,
      expiresAt,
    },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

/**
 * Resolves the current admin from the session cookie.
 * Returns null for anonymous, expired, revoked or deactivated sessions.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const claims = await verifySessionToken(token);
  if (!claims) return null;

  try {
    const session = await prisma.adminSession.findUnique({
      where: { tokenHash: sha256(token) },
      include: { user: { include: { role: true } } },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) return null;
    if (!session.user.isActive) return null;

    // Sliding "last seen", throttled so a burst of requests is not a write storm.
    if (Date.now() - session.lastSeenAt.getTime() > 60_000) {
      await prisma.adminSession
        .update({ where: { id: session.id }, data: { lastSeenAt: new Date() } })
        .catch(() => undefined);
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role.name,
      roleLabel: session.user.role.label,
      mustChangePassword: session.user.mustChangePassword,
      twoFactorEnabled: session.user.twoFactorEnabled,
      sessionId: session.id,
    };
  } catch (error) {
    console.error('[auth] session lookup failed:', (error as Error).message);
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.adminSession
      .updateMany({ where: { tokenHash: sha256(token) }, data: { revokedAt: new Date() } })
      .catch(() => undefined);
  }
  store.delete(SESSION_COOKIE);
}

export async function revokeAllSessions(userId: string): Promise<void> {
  await prisma.adminSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

// ---------------------------------------------------------------------------
// Brute-force protection
// ---------------------------------------------------------------------------

export function isLockedOut(user: Pick<AdminUser, 'lockedUntil'>): boolean {
  return Boolean(user.lockedUntil && user.lockedUntil > new Date());
}

export async function registerFailedLogin(userId: string, current: number): Promise<void> {
  const attempts = current + 1;
  await prisma.adminUser.update({
    where: { id: userId },
    data: {
      failedAttempts: attempts,
      lockedUntil:
        attempts >= MAX_FAILED_ATTEMPTS
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000)
          : null,
    },
  });
}

export async function registerSuccessfulLogin(userId: string): Promise<void> {
  await prisma.adminUser.update({
    where: { id: userId },
    data: { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
}

// ---------------------------------------------------------------------------
// Authorisation helpers
// ---------------------------------------------------------------------------

export class AuthorizationError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403,
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/** Throws 401 when signed out. Use inside route handlers. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthorizationError('Authentication required.', 401);
  return user;
}

/** Throws 401 when signed out, 403 when the role lacks the permission. */
export async function requirePermission(permission: PermissionKey): Promise<SessionUser> {
  const user = await requireUser();
  if (!roleHas(user.role, permission)) {
    throw new AuthorizationError('You do not have access to this resource.', 403);
  }
  return user;
}

export function can(user: SessionUser | null, permission: PermissionKey): boolean {
  return Boolean(user && roleHas(user.role, permission));
}
