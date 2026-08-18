import type { Metadata } from 'next';

import { PageHeader } from '@/components/site/PageHeader';
import { VentureCards } from '@/components/sections/VentureCards';
import { ContactCta, RedBallCta } from '@/components/sections/CallToAction';
import { JsonLd } from '@/components/ui/JsonLd';
import { Section, SectionHeading } from '@/components/ui/Primitives';
import { getBusinesses, getFaqs } from '@/lib/content';
import { breadcrumbSchema, faqSchema, organisationSchema } from '@/lib/schema-org';
import { breadcrumbsFor, buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Business Ventures | Sonu Malik',
  description:
    'The Page and Hotel The Prada, founded and owned by Sonu Malik, alongside Red Ball Cricket Ground in Rohtak, Haryana.',
  path: '/ventures',
  keywords: ['Sonu Malik business', 'Hotel The Prada', 'The Page Rohtak'],
});

export const revalidate = 3600;

export default async function VenturesPage() {
  const [businesses, faqs] = await Promise.all([getBusinesses(), getFaqs()]);
  const breadcrumbs = breadcrumbsFor('/ventures', 'Ventures');
  const ventureFaqs = faqs.filter((faq) => faq.slug === 'businesses');

  return (
    <>
      <PageHeader
        eyebrow="Business Ventures"
        title="Founder and owner."
        lead="Two businesses alongside the sports infrastructure work in Rohtak."
        breadcrumbs={breadcrumbs}
      />

      <Section>
        <div className="shell">
          <VentureCards businesses={businesses} />

          <p className="mt-10 max-w-2xl text-xs leading-relaxed text-bone-500">
            Business details such as photography, locations, booking links, contact numbers and
            social profiles are published from the admin portal once supplied. Fields shown as
            &ldquo;to be added&rdquo; are genuinely unknown rather than withheld.
          </p>
        </div>
      </Section>

      <Section tone="raised">
        <div className="shell">
          <SectionHeading
            eyebrow="Also"
            title="Sports infrastructure"
            lead="The largest of the ventures is the sports complex itself."
          />
          <div className="mt-12">
            <RedBallCta />
          </div>
        </div>
      </Section>

      <Section>
        <ContactCta />
      </Section>

      <JsonLd
        data={[
          ...businesses.map((business) => organisationSchema(business)),
          breadcrumbSchema(breadcrumbs),
          faqSchema(ventureFaqs),
        ]}
      />
    </>
  );
}
