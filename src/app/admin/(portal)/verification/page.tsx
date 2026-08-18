import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { VerificationManager } from '@/components/admin/VerificationManager';
import { AdminPage, Panel } from '@/components/admin/Ui';
import { can, getSessionUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Press & Verification' };
export const dynamic = 'force-dynamic';

export default async function VerificationPage() {
  const user = await getSessionUser();
  if (!can(user, 'media:read')) redirect('/admin');

  return (
    <AdminPage
      title="Press & Verification"
      description="A structured evidence archive: one record per public claim, with its source, date, link and review status."
    >
      <div className="space-y-5">
        <Panel title="How this archive is used">
          <div className="prose-editorial max-w-3xl text-sm">
            <p>
              Claims recorded here drive what the public site is willing to assert. A claim with no
              Verified record renders with a &ldquo;Verification required&rdquo; marker rather than
              being stated as settled fact, and the API refuses to mark a claim Verified unless a
              source URL or an uploaded document is attached.
            </p>
            <p>
              The archive is intended to support future PR work and any later notability research.
              It makes no claim about Wikipedia eligibility, and the public site never asserts that a
              Wikipedia article exists.
            </p>
          </div>
        </Panel>

        <VerificationManager
          canWrite={can(user, 'media:write')}
          canVerify={can(user, 'media:verify')}
        />
      </div>
    </AdminPage>
  );
}
