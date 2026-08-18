import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { AdminPage } from '@/components/admin/Ui';
import { can, getSessionUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Analytics' };
export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const user = await getSessionUser();
  if (!can(user, 'analytics:read')) redirect('/admin');

  return (
    <AdminPage
      title="Analytics"
      description="First-party measurement. No third-party trackers, no raw IP addresses, and no estimated or sample figures - every number below is computed from events actually collected."
    >
      <AnalyticsDashboard />
    </AdminPage>
  );
}
