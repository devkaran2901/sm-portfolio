import type { Metadata } from 'next';
import { Mail, MapPin, Phone } from 'lucide-react';

import { PageHeader } from '@/components/site/PageHeader';
import { ContactForm } from '@/components/site/ContactForm';
import { ExternalTrackedLink } from '@/components/site/ExternalTrackedLink';
import { JsonLd } from '@/components/ui/JsonLd';
import { Section } from '@/components/ui/Primitives';
import { INQUIRY_TYPE_LABELS, SITE } from '@/content/defaults';
import { getProfile } from '@/lib/content';
import { breadcrumbSchema } from '@/lib/schema-org';
import { breadcrumbsFor, buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Contact Sonu Malik | Rohtak, Haryana',
  description:
    'Get in touch with Sonu Malik about the sports facility, cricket, business, partnerships, media or events in Rohtak, Haryana.',
  path: '/contact',
});

export const revalidate = 3600;

export default async function ContactPage() {
  const profile = await getProfile();
  const breadcrumbs = breadcrumbsFor('/contact', 'Contact');

  const directContacts = [
    profile.email ? { icon: Mail, label: profile.email, href: `mailto:${profile.email}` } : null,
    profile.phone ? { icon: Phone, label: profile.phone, href: `tel:${profile.phone}` } : null,
  ].filter(Boolean) as Array<{ icon: typeof Mail; label: string; href: string }>;

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Get in touch."
        lead="Messages go straight into a monitored inbox. Choose the inquiry type that fits and it is routed accordingly."
        breadcrumbs={breadcrumbs}
      />

      <Section>
        <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          <aside className="lg:col-span-5">
            <div className="surface p-7">
              <h2 className="font-serif text-xl text-bone-50">What you can write about</h2>
              <ul className="mt-5 space-y-2.5">
                {Object.values(INQUIRY_TYPE_LABELS).map((label) => (
                  <li key={label} className="flex items-center gap-3 text-sm text-bone-300">
                    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-turf-400" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="surface mt-6 p-7">
              <h2 className="font-serif text-xl text-bone-50">Direct</h2>

              <ul className="mt-5 space-y-3">
                <li className="flex items-start gap-3 text-sm text-bone-300">
                  <MapPin size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-brass-300" />
                  {[profile.currentCity, profile.region, profile.country].filter(Boolean).join(', ')}
                </li>

                {directContacts.map((contact) => (
                  <li key={contact.href} className="flex items-start gap-3 text-sm">
                    <contact.icon
                      size={15}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-brass-300"
                    />
                    <a href={contact.href} className="text-bone-200 hover:text-brass-200">
                      {contact.label}
                    </a>
                  </li>
                ))}
              </ul>

              {directContacts.length === 0 ? (
                <p className="mt-4 text-xs leading-relaxed text-bone-500">
                  A public email address and phone number have not been published. The form above is
                  the reliable route, and every message is stored and tracked.
                </p>
              ) : null}
            </div>

            <div className="surface mt-6 p-7">
              <h2 className="font-serif text-xl text-bone-50">Red Ball Sports Arena</h2>
              <p className="mt-3 text-sm leading-relaxed text-bone-400">
                For facility bookings and arena-specific enquiries, the arena site is the fastest
                route.
              </p>
              <ExternalTrackedLink
                href={SITE.redBallUrl}
                event="red_ball_link_click"
                className="mt-4 inline-flex text-sm font-semibold text-brass-200 hover:text-brass-100"
              >
                redballsportsarena.in
              </ExternalTrackedLink>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-bone-500">
              Submissions are stored securely and used only to respond to your inquiry. See the{' '}
              <a href="/privacy" className="text-brass-200 underline underline-offset-2">
                privacy policy
              </a>{' '}
              for retention and your rights.
            </p>
          </aside>
        </div>
      </Section>

      <JsonLd data={[breadcrumbSchema(breadcrumbs)]} />
    </>
  );
}
