import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { ProfileEditor } from '@/components/admin/ProfileEditor';
import { AdminPage } from '@/components/admin/Ui';
import { can, getSessionUser } from '@/lib/auth';
import { prisma, safeQuery } from '@/lib/db';

export const metadata: Metadata = { title: 'Profile' };
export const dynamic = 'force-dynamic';

export default async function ProfileAdminPage() {
  const user = await getSessionUser();
  if (!can(user, 'content:read')) redirect('/admin');

  const profile = await safeQuery(
    () => prisma.profile.findUnique({ where: { id: 'primary' } }),
    null,
  );

  // Dates are serialised for the date input; JSON columns pass straight through.
  const initial = profile
    ? {
        ...profile,
        birthDate: profile.birthDate ? profile.birthDate.toISOString().slice(0, 10) : '',
        socialLinks: Array.isArray(profile.socialLinks) ? profile.socialLinks : [],
      }
    : null;

  return (
    <AdminPage
      title="Profile"
      description="Name, biography, birthplace, education and contact details for the public site."
    >
      <ProfileEditor initial={initial as never} />
    </AdminPage>
  );
}
