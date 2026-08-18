import type { Metadata } from 'next';

import { PageHeader } from '@/components/site/PageHeader';
import { JsonLd } from '@/components/ui/JsonLd';
import { Section } from '@/components/ui/Primitives';
import { SITE } from '@/content/defaults';
import { breadcrumbSchema } from '@/lib/schema-org';
import { breadcrumbsFor, buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Terms & Conditions',
  description: 'Terms of use for this website, including accuracy, content ownership and liability.',
  path: '/terms',
});

export default function TermsPage() {
  const breadcrumbs = breadcrumbsFor('/terms', 'Terms & Conditions');

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms & Conditions"
        breadcrumbs={breadcrumbs}
        lead="The basis on which this website is published and used."
      />

      <Section>
        <div className="shell prose-editorial">
          <h2 className="text-display-sm">Use of this website</h2>
          <p>
            This website presents biographical, sporting and business information about Sonu Malik.
            You may read, link to and quote it with attribution. You may not scrape it at a rate
            that degrades service, misrepresent its contents, or reproduce it in a way that implies
            endorsement.
          </p>

          <h2 className="mt-12 text-display-sm">Accuracy of content</h2>
          <p>
            Content is published to the standard described on the site itself: claims are stated
            only to the extent they are supported by information supplied, and anything awaiting
            documentary support is marked as requiring verification rather than presented as
            settled. Descriptions of cricket experience refer to{' '}
            <strong>international club cricket</strong> and do not assert national representation or
            professional BCCI playing appearances.
          </p>
          <p>
            Where players are named, they are described as associated with the facility. No claim of
            coaching, training, mentoring, discovery or management is made unless separately
            documented and marked as verified.
          </p>

          <h2 className="mt-12 text-display-sm">Third-party links</h2>
          <p>
            The site links to external destinations, including{' '}
            <a href={SITE.redBallUrl} target="_blank" rel="noopener noreferrer">
              redballsportsarena.in
            </a>
            . Those sites are governed by their own terms and privacy practices, and no
            responsibility is accepted for their content or availability.
          </p>

          <h2 className="mt-12 text-display-sm">Intellectual property</h2>
          <p>
            Text, layout and original graphics on this site belong to their respective owners.
            Uploaded press material remains the property of the publication that produced it and is
            reproduced only where permitted.
          </p>

          <h2 className="mt-12 text-display-sm">Liability</h2>
          <p>
            The site is provided on an &ldquo;as is&rdquo; basis. While it is maintained carefully,
            no warranty is given that it will be uninterrupted or error-free, and no liability is
            accepted for decisions taken solely in reliance on it.
          </p>

          <h2 className="mt-12 text-display-sm">Contact</h2>
          <p>
            Questions about these terms, including corrections to any published claim, can be sent
            through the <a href="/contact">contact form</a>. Correction requests are taken seriously
            and actioned.
          </p>
        </div>
      </Section>

      <JsonLd data={[breadcrumbSchema(breadcrumbs)]} />
    </>
  );
}
