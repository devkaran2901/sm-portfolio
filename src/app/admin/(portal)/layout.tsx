import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AdminNav } from '@/components/admin/AdminNav';
import { getSessionUser } from '@/lib/auth';
import { ROLE_PERMISSIONS } from '@/lib/permissions';

/**
 * Authenticated admin shell.
 *
 * This is the authoritative gate. Middleware already bounced requests with no
 * valid JWT, but only this check reaches the database - so a session that was
 * revoked, or an account that was deactivated, is caught here even though its
 * token still verifies.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  return (
    <div className="min-h-dvh">
      <AdminNav
        identity={{
          name: user.name,
          email: user.email,
          roleLabel: user.roleLabel,
          permissions: [...ROLE_PERMISSIONS[user.role]],
        }}
      />

      <div className="lg:pl-[17rem]">
        <a href="#admin-main" className="skip-link">
          Skip to content
        </a>

        <main id="admin-main" className="min-h-dvh px-5 pb-16 pt-16 sm:px-8 lg:pt-8">
          {user.mustChangePassword ? (
            <div
              role="alert"
              className="mb-6 rounded-xl2 border border-brass-500/40 bg-brass-700/15 px-5 py-4"
            >
              <p className="text-sm font-semibold text-brass-100">Change your password</p>
              <p className="mt-1 text-sm text-bone-300">
                This account is still using the password it was created with.{' '}
                <Link href="/admin/account" className="font-semibold text-brass-200 underline">
                  Set a new one now
                </Link>
                .
              </p>
            </div>
          ) : null}

          {children}
        </main>
      </div>
    </div>
  );
}
