import type { RoleName } from '@prisma/client';

/**
 * Permission catalogue and the role -> permission matrix.
 *
 * Authorisation is always checked against these keys, never against a role name
 * directly, so adding a role later does not require touching call sites.
 */
export const PERMISSIONS = {
  'dashboard:view': { label: 'View dashboard', group: 'General' },
  'content:read': { label: 'Read site content', group: 'Content' },
  'content:write': { label: 'Create and edit site content', group: 'Content' },
  'content:delete': { label: 'Delete site content', group: 'Content' },
  'media:read': { label: 'View media and press items', group: 'Media' },
  'media:write': { label: 'Upload and edit media items', group: 'Media' },
  'media:verify': { label: 'Verify or reject evidence', group: 'Media' },
  'inquiry:read': { label: 'View contact inquiries', group: 'Inquiries' },
  'inquiry:write': { label: 'Update inquiry status, notes and assignment', group: 'Inquiries' },
  'inquiry:delete': { label: 'Delete inquiries', group: 'Inquiries' },
  'analytics:read': { label: 'View analytics', group: 'Analytics' },
  'seo:write': { label: 'Edit SEO metadata', group: 'SEO' },
  'settings:write': { label: 'Edit site settings', group: 'Settings' },
  'user:read': { label: 'View admin users', group: 'Users' },
  'user:write': { label: 'Create and edit admin users', group: 'Users' },
  'audit:read': { label: 'View audit logs', group: 'Audit' },
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export const ROLE_PERMISSIONS: Record<RoleName, PermissionKey[]> = {
  SUPER_ADMIN: Object.keys(PERMISSIONS) as PermissionKey[],
  CONTENT_ADMIN: [
    'dashboard:view',
    'content:read',
    'content:write',
    'content:delete',
    'media:read',
    'media:write',
    'media:verify',
    'seo:write',
    'analytics:read',
  ],
  INQUIRY_MANAGER: ['dashboard:view', 'inquiry:read', 'inquiry:write', 'content:read', 'analytics:read'],
  ANALYTICS_VIEWER: ['dashboard:view', 'analytics:read'],
};

export const ROLE_DESCRIPTIONS: Record<RoleName, { label: string; description: string }> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    description: 'Full access to every area, including admin users and settings.',
  },
  CONTENT_ADMIN: {
    label: 'Content Admin',
    description: 'Manages portfolio content, media, evidence and SEO. No access to inquiries or users.',
  },
  INQUIRY_MANAGER: {
    label: 'Inquiry Manager',
    description: 'Handles contact inquiries end to end. Read-only on site content.',
  },
  ANALYTICS_VIEWER: {
    label: 'Analytics Viewer',
    description: 'Read-only access to the analytics dashboard. Cannot modify anything.',
  },
};

export function roleHas(role: RoleName, permission: PermissionKey): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function roleHasAny(role: RoleName, permissions: PermissionKey[]): boolean {
  return permissions.some((permission) => roleHas(role, permission));
}
