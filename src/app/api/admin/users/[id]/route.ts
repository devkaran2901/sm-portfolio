import { handle, json, noStore, notFound, parseBody } from '@/lib/api';
import { hashPassword, passwordProblems, requirePermission, revokeAllSessions } from '@/lib/auth';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { ipHash } from '@/lib/request';
import { adminUserUpdateSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  return handle(async () => {
    const actor = await requirePermission('user:write');
    const { id } = await context.params;

    const target = await prisma.adminUser.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!target) notFound();

    const input = await parseBody(request, adminUserUpdateSchema);

    // Guard rails against locking the organisation out of its own admin portal.
    if (actor.id === id && input.isActive === false) {
      return noStore(json({ error: 'You cannot deactivate your own account.' }, { status: 400 }));
    }
    if (actor.id === id && input.role && input.role !== 'SUPER_ADMIN' && actor.role === 'SUPER_ADMIN') {
      return noStore(
        json({ error: 'You cannot remove your own super admin role.' }, { status: 400 }),
      );
    }

    if (
      (input.isActive === false || (input.role && input.role !== 'SUPER_ADMIN')) &&
      target.role.name === 'SUPER_ADMIN'
    ) {
      const remaining = await prisma.adminUser.count({
        where: { isActive: true, role: { name: 'SUPER_ADMIN' }, id: { not: id } },
      });
      if (remaining === 0) {
        return noStore(
          json({ error: 'At least one active super admin must remain.' }, { status: 400 }),
        );
      }
    }

    let roleId = target.roleId;
    if (input.role && input.role !== target.role.name) {
      const role = await prisma.role.findUnique({ where: { name: input.role } });
      if (!role) return noStore(json({ error: 'That role does not exist.' }, { status: 400 }));
      roleId = role.id;
    }

    let passwordHash: string | undefined;
    if (input.password) {
      const problems = passwordProblems(input.password);
      if (problems.length > 0) {
        return noStore(
          json({ error: problems.join(' '), fields: { password: problems[0] } }, { status: 422 }),
        );
      }
      passwordHash = await hashPassword(input.password);
    }

    await prisma.adminUser.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        roleId,
        ...(passwordHash ? { passwordHash, mustChangePassword: true } : {}),
      },
    });

    // Any change to credentials, role or status invalidates existing sessions.
    if (passwordHash || input.isActive === false || roleId !== target.roleId) {
      await revokeAllSessions(id);
    }

    await recordAudit({
      actor,
      action: input.isActive === false ? 'USER_DEACTIVATED' : 'USER_UPDATED',
      resourceType: 'AdminUser',
      resourceId: id,
      summary: `Updated admin user ${target.email}`,
      previousValue: { role: target.role.name, isActive: target.isActive },
      newValue: {
        role: input.role ?? target.role.name,
        isActive: input.isActive ?? target.isActive,
        passwordChanged: Boolean(passwordHash),
      },
      ipHash: ipHash(request.headers),
    });

    return noStore(json({ ok: true }));
  });
}
