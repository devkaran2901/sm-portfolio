import { jwtVerify } from 'jose';

/**
 * Edge-safe slice of the auth module.
 *
 * Middleware runs on the edge runtime, where node:crypto, Prisma and bcrypt are
 * unavailable. Only signature verification lives here; anything requiring the
 * database stays in `src/lib/auth.ts`, which is Node-only.
 */

export const SESSION_COOKIE = 'sm_session';

export type EdgeSessionClaims = { sid: string; uid: string; role: string };

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error('AUTH_SECRET is missing or too short.');
  }
  return new TextEncoder().encode(value);
}

export async function verifySessionToken(token: string): Promise<EdgeSessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), {
      issuer: 'sm-portfolio',
      audience: 'sm-admin',
    });
    if (typeof payload.sid !== 'string' || typeof payload.uid !== 'string') return null;
    return { sid: payload.sid, uid: payload.uid, role: String(payload.role ?? '') };
  } catch {
    return null;
  }
}
