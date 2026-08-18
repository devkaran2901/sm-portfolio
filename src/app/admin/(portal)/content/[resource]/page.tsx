import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { ResourceManager } from '@/components/admin/ResourceManager';
import { AdminPage } from '@/components/admin/Ui';
import { can, getSessionUser } from '@/lib/auth';
import { getResourceForm, RESOURCE_FORMS } from '@/lib/resource-fields';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ resource: string }>;
}): Promise<Metadata> {
  const { resource } = await params;
  return { title: getResourceForm(resource)?.title ?? 'Content' };
}

/** Pre-renders the known collections; anything else 404s. */
export function generateStaticParams() {
  return Object.keys(RESOURCE_FORMS).map((resource) => ({ resource }));
}

export default async function ContentResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const user = await getSessionUser();
  if (!can(user, 'content:read')) redirect('/admin');

  const { resource } = await params;
  const form = getResourceForm(resource);
  if (!form) notFound();

  return (
    <AdminPage title={form.title} description={form.description}>
      <ResourceManager
        form={form}
        canWrite={can(user, 'content:write')}
        canDelete={can(user, 'content:delete')}
      />
    </AdminPage>
  );
}
