import type { Metadata } from 'next';

import { PageHeader } from '@/components/site/PageHeader';
import { AnalyticsOptOut } from '@/components/site/AnalyticsOptOut';
import { JsonLd } from '@/components/ui/JsonLd';
import { Section } from '@/components/ui/Primitives';
import { breadcrumbSchema } from '@/lib/schema-org';
import { breadcrumbsFor, buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Cookie & Analytics Policy',
  description:
    'This site sets no tracking cookies. How first-party measurement works, what it stores, and how to opt out.',
  path: '/cookies',
});

const STORAGE_ROWS = [
  {
    name: 'sm_analytics_session',
    type: 'sessionStorage (not a cookie)',
    purpose: 'Groups page views from one visit into a single session.',
    life: 'Cleared when the browser tab is closed.',
  },
  {
    name: 'sm_analytics_opt_out',
    type: 'localStorage (not a cookie)',
    purpose: 'Remembers that you opted out of measurement.',
    life: 'Until you clear it or opt back in.',
  },
  {
    name: 'sm_session',
    type: 'Cookie — strictly necessary',
    purpose: 'Keeps an authenticated administrator signed in to the private admin portal.',
    life: 'Expires with the session; set only after an administrator signs in.',
  },
];

export default function CookiePolicyPage() {
  const breadcrumbs = breadcrumbsFor('/cookies', 'Cookie & Analytics Policy');

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Cookie & Analytics Policy"
        lead="No advertising cookies, no third-party analytics, no consent wall. Here is exactly what is stored in your browser."
        breadcrumbs={breadcrumbs}
      />

      <Section>
        <div className="shell">
          <div className="prose-editorial">
            <h2 className="text-display-sm">Measurement without cookies</h2>
            <p>
              This site runs its own measurement rather than a third-party analytics product.
              Visitors are counted using a hash of the network address combined with a secret salt
              and the current date. Because the date is part of the input, the identifier changes
              every day and cannot be traced back to a person or followed across days.
            </p>
            <p>
              Since no identifier is stored on your device for tracking purposes, no cookie banner is
              required. The opt-out below is offered regardless.
            </p>
          </div>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <caption className="sr-only">Browser storage used by this website</caption>
              <thead>
                <tr className="border-b border-ink-700">
                  {['Name', 'Type', 'Purpose', 'Lifetime'].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="py-3 pr-6 text-xs font-semibold uppercase tracking-[0.12em] text-bone-400"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STORAGE_ROWS.map((row) => (
                  <tr key={row.name} className="border-b border-ink-800 align-top">
                    <td className="py-4 pr-6 font-mono text-xs text-brass-200">{row.name}</td>
                    <td className="py-4 pr-6 text-bone-300">{row.type}</td>
                    <td className="py-4 pr-6 text-bone-300">{row.purpose}</td>
                    <td className="py-4 pr-6 text-bone-400">{row.life}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-12 max-w-2xl">
            <h2 className="font-display text-xl text-bone-50">Your choice</h2>
            <p className="mt-3 text-sm leading-relaxed text-bone-400">
              Measurement can be switched off in this browser at any time. A Do Not Track signal is
              honoured automatically without you doing anything.
            </p>
            <div className="mt-6">
              <AnalyticsOptOut />
            </div>
          </div>

          <div className="prose-editorial mt-14">
            <h2 className="text-display-sm">Events recorded</h2>
            <p>
              Measurement records page views and a small set of interaction events: opening the
              contact form, starting it, submitting it, and clicking an outbound link to the arena
              site, a business site or a press source. Each event stores the page path and time. No
              form field contents are ever sent to measurement.
            </p>
          </div>
        </div>
      </Section>

      <JsonLd data={[breadcrumbSchema(breadcrumbs)]} />
    </>
  );
}
