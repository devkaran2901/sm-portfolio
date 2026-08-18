import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AdminPage, Panel } from '@/components/admin/Ui';
import { SettingsEditor } from '@/components/admin/SettingsEditor';
import { can, getSessionUser } from '@/lib/auth';
import { prisma, safeQuery } from '@/lib/db';
import { analyticsEnabled, mailConfig, siteUrl, uploadConfig } from '@/lib/env';

export const metadata: Metadata = { title: 'Settings' };
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!can(user, 'content:read')) redirect('/admin');

  const settings = await safeQuery(
    () => prisma.siteSetting.findMany({ orderBy: { key: 'asc' } }),
    [],
  );

  // Configuration status only. No secret, host name or credential is rendered.
  const environment = [
    { label: 'Public site URL', value: siteUrl() },
    { label: 'Database', value: process.env.DATABASE_URL ? 'Configured' : 'Not configured' },
    {
      label: 'Outbound email',
      value: mailConfig.isConfigured
        ? 'Configured'
        : 'Not configured - inquiries are still saved, but no notification is sent',
    },
    {
      label: 'Inquiry acknowledgement',
      value: mailConfig.sendAcknowledgement ? 'Enabled' : 'Disabled',
    },
    { label: 'Analytics collection', value: analyticsEnabled ? 'Enabled' : 'Disabled' },
    { label: 'Upload driver', value: uploadConfig.driver },
    {
      label: 'Max upload size',
      value: `${Math.round(uploadConfig.maxBytes / (1024 * 1024))} MB`,
    },
  ];

  return (
    <AdminPage
      title="Settings"
      description="Site-level values and the current deployment configuration."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <SettingsEditor
          initial={settings.map((setting) => ({
            key: setting.key,
            group: setting.group,
            value: setting.value as unknown,
          }))}
          canWrite={can(user, 'settings:write')}
        />

        <Panel
          title="Deployment configuration"
          description="Read-only. Change these through environment variables, never in the browser."
        >
          <dl className="space-y-3">
            {environment.map((row) => (
              <div
                key={row.label}
                className="flex flex-wrap justify-between gap-3 border-b border-ink-800 pb-3 last:border-b-0"
              >
                <dt className="text-xs uppercase tracking-[0.1em] text-bone-500">{row.label}</dt>
                <dd className="text-right text-sm text-bone-200">{row.value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 text-xs leading-relaxed text-bone-600">
            Secrets - the database URL, auth secret, SMTP credentials and analytics salt - are never
            read into the browser and are never displayed here, only reported as configured or not.
          </p>
        </Panel>
      </div>
    </AdminPage>
  );
}
