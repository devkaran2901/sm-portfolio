import { handle, json, noStore, parseBody } from '@/lib/api';
import { hashPassword, passwordProblems, requirePermission } from '@/lib/auth';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { ipHash } from '@/lib/request';
import { adminUserCreateSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return handle(async () => {
    await requirePermission('user:read');

    // No password hashes, no TOTP secrets, no session tokens leave this endpoint.
    const users = await prisma.adminUser.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        twoFactorEnabled: true,
        mustChangePassword: true,
        lastLoginAt: true,
        lockedUntil: true,
        createdAt: true,
        role: { select: { name: true, label: true } },
      },
    });

    return noStore(json({ users }));
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    const actor = await requirePermission('user:write');
    const input = await parseBody(request, adminUserCreateSchema);

    const problems = passwordProblems(input.password);
    if (problems.length > 0) {
      return noStore(
        json({ error: problems.join(' '), fields: { password: problems[0] } }, { status: 422 }),
      );
    }

    const role = await prisma.role.findUnique({ where: { name: input.role } });
    if (!role) {
      return noStore(json({ error: 'That role does not exist.' }, { status: 400 }));
    }

    const user = await prisma.adminUser.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash: await hashPassword(input.password),
        roleId: role.id,
        // The creator knows this password, so it has to be replaced on first use.
        mustChangePassword: true,
      },
      select: { id: true, email: true },
    });

    await recordAudit({
      actor,
      action: 'USER_CREATED',
      resourceType: 'AdminUser',
      resourceId: user.id,
      summary: `Created admin user ${user.email} with role ${input.role}`,
      newValue: { email: user.email, role: input.role },
      ipHash: ipHash(request.headers),
    });

    return noStore(json({ ok: true, id: user.id }, { status: 201 }));
  });
}
