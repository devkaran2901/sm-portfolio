import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getSessionUser } from '@/lib/auth';

/**
 * Chrome for the unauthenticated admin screens.
 *
 * An already-signed-in admin is redirected straight into the portal rather than
 * being shown a sign-in form they do not need.
 */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (user) redirect('/admin');

  return (
    <div className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span
            aria-hidden="true"
            className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-turf-600 font-display text-base font-semibold text-bone-50"
          >
            SM
          </span>
          <h1 className="mt-5 font-display text-2xl text-bone-50">Admin Portal</h1>
          <p className="mt-1.5 text-sm text-bone-500">Sonu Malik</p>
        </div>

        <div className="rounded-xl2 border border-ink-700/70 bg-ink-900/70 p-7">{children}</div>

        <p className="mt-6 text-center text-xs text-bone-600">
          <Link href="/" className="hover:text-bone-400">
            Back to the public site
          </Link>
        </p>
      </div>
    </div>
  );
}
