import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { MediaManager } from '@/components/admin/MediaManager';
import { AdminPage } from '@/components/admin/Ui';
import { can, getSessionUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Media & Press' };
export const dynamic = 'force-dynamic';

export default async function MediaPage() {
  const user = await getSessionUser();
  if (!can(user, 'media:read')) redirect('/admin');

  return (
    <AdminPage
      title="Media & Press"
      description="Newspaper articles, clippings, interviews, videos and external references. Items reach the public site only when their status is Verified and they are explicitly published."
    >
      <MediaManager canWrite={can(user, 'media:write')} canVerify={can(user, 'media:verify')} />
    </AdminPage>
  );
}
