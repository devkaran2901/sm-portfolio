import type { Metadata } from 'next';

import { PageHeader } from '@/components/site/PageHeader';
import { JsonLd } from '@/components/ui/JsonLd';
import { Section } from '@/components/ui/Primitives';
import { breadcrumbSchema } from '@/lib/schema-org';
import { breadcrumbsFor, buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description:
    'What this website collects, why, how long it is kept, and how to request deletion. No advertising trackers and no raw IP storage.',
  path: '/privacy',
});

export default function PrivacyPage() {
  const breadcrumbs = breadcrumbsFor('/privacy', 'Privacy Policy');

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        lead="Written to describe what this site actually does, not what a template assumes."
        breadcrumbs={breadcrumbs}
      />

      <Section>
        <div className="shell prose-editorial">
          <h2 className="text-display-sm">What is collected</h2>
          <p>
            <strong>Contact form submissions.</strong> When you submit the contact form, the name,
            email address, phone number, organisation, subject, message and inquiry type you provide
            are stored, along with the page you submitted from and any campaign parameters in the
            URL. These are used solely to read and respond to your message.
          </p>
          <p>
            <strong>Measurement.</strong> The site runs its own first-party measurement. It records
            page paths, referrer, approximate device type, browser, operating system, coarse
            location from the network edge (country, region, city), and the time of each event. It
            does not use advertising or analytics products from third parties.
          </p>

          <h2 className="mt-12 text-display-sm">What is not collected</h2>
          <ul>
            <li>No raw IP addresses are stored. Addresses are hashed with a secret salt and the current date, so the identifier rotates daily and cannot be reversed.</li>
            <li>No advertising, remarketing or cross-site tracking.</li>
            <li>No fingerprinting beyond the coarse device type parsed from the user-agent string.</li>
            <li>No data is sold, rented or shared for marketing purposes.</li>
          </ul>

          <h2 className="mt-12 text-display-sm">Cookies</h2>
          <p>
            The public site sets no cookies. Measurement uses a session key held in{' '}
            <code>sessionStorage</code>, which the browser discards when the tab closes. A single
            strictly necessary cookie is set only inside the private admin portal, to keep an
            authenticated administrator signed in. See the{' '}
            <a href="/cookies">cookie and analytics policy</a> for detail and the opt-out control.
          </p>

          <h2 className="mt-12 text-display-sm">Legal basis and retention</h2>
          <p>
            Contact submissions are processed on the basis of your explicit consent, given via the
            checkbox on the form, and the legitimate interest of responding to an inquiry addressed
            to us. They are retained while the matter is open and for a reasonable period afterwards
            for reference, then deleted on request or during routine review.
          </p>
          <p>
            Measurement records are aggregated. Session-level rows are retained for operational
            reporting; because visitor identifiers rotate daily they cannot be linked back to an
            individual after that day.
          </p>

          <h2 className="mt-12 text-display-sm">Your rights</h2>
          <p>
            You may request access to, correction of, or deletion of the personal information you
            submitted through the contact form. Use the contact form itself, quoting the reference
            number shown after submission, and the request will be actioned.
          </p>

          <h2 className="mt-12 text-display-sm">Security</h2>
          <p>
            Data is stored in a managed PostgreSQL database with access restricted to authenticated
            administrators. Administrative passwords are hashed, sessions are signed and revocable,
            and administrative actions are recorded in an audit log.
          </p>

          <h2 className="mt-12 text-display-sm">Changes</h2>
          <p>
            If this policy changes materially, the updated version will be published on this page.
          </p>
        </div>
      </Section>

      <JsonLd data={[breadcrumbSchema(breadcrumbs)]} />
    </>
  );
}
