import 'server-only';

import type { AuditAction, Prisma } from '@prisma/client';
import { prisma } from './db';
import type { SessionUser } from './auth';

/**
 * Audit trail.
 *
 * Writes are best-effort: a logging failure must never break the operation the
 * admin actually asked for, but it is always surfaced in the server logs.
 */
export type AuditInput = {
  actor?: SessionUser | null;
  /** Used when there is no session yet, e.g. a failed login attempt. */
  actorEmail?: string | null;
  action: AuditAction;
  resourceType: string;
  resourceId?: string | null;
  summary: string;
  previousValue?: Prisma.InputJsonValue | null;
  newValue?: Prisma.InputJsonValue | null;
  ipHash?: string | null;
  userAgent?: string | null;
};

/** Never let a password hash, token or secret reach the audit table. */
const REDACTED_KEYS = /password|token|secret|hash|authorization|cookie/i;

export function redact<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => redact(item)) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = REDACTED_KEYS.test(key) ? '[redacted]' : redact(val);
    }
    return out as T;
  }
  return value;
}

export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actor?.id ?? null,
        actorEmail: input.actor?.email ?? input.actorEmail ?? null,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId ?? null,
        summary: input.summary,
        previousValue: input.previousValue ? redact(input.previousValue) : undefined,
        newValue: input.newValue ? redact(input.newValue) : undefined,
        ipHash: input.ipHash ?? null,
        userAgent: input.userAgent?.slice(0, 400) ?? null,
      },
    });
  } catch (error) {
    console.error('[audit] failed to record entry:', (error as Error).message, input.action);
  }
}

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  ADMIN_LOGIN: 'Admin login',
  ADMIN_LOGIN_FAILED: 'Failed login attempt',
  ADMIN_LOGOUT: 'Admin logout',
  PASSWORD_RESET_REQUESTED: 'Password reset requested',
  PASSWORD_CHANGED: 'Password changed',
  CONTENT_CREATED: 'Content created',
  CONTENT_UPDATED: 'Content updated',
  CONTENT_DELETED: 'Content deleted',
  INQUIRY_STATUS_CHANGED: 'Inquiry status changed',
  INQUIRY_ASSIGNED: 'Inquiry assigned',
  INQUIRY_NOTE_ADDED: 'Inquiry note added',
  MEDIA_UPLOADED: 'Media uploaded',
  MEDIA_VERIFIED: 'Media verified',
  MEDIA_REJECTED: 'Media rejected',
  SETTINGS_UPDATED: 'Settings updated',
  USER_CREATED: 'Admin user created',
  USER_UPDATED: 'Admin user updated',
  USER_DEACTIVATED: 'Admin user deactivated',
};
