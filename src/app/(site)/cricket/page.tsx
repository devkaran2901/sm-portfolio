import type { Metadata } from 'next';

import { PageHeader } from '@/components/site/PageHeader';
import { Timeline } from '@/components/sections/Timeline';
import { InternationalMap } from '@/components/sections/InternationalMap';
import { EventsList } from '@/components/sections/EventsList';
import { ContactCta, RedBallCta } from '@/components/sections/CallToAction';
import { JsonLd } from '@/components/ui/JsonLd';
import { Section, SectionHeading } from '@/components/ui/Primitives';
import { getEvents, getFaqs, getTimeline } from '@/lib/content';
import { breadcrumbSchema, faqSchema } from '@/lib/schema-org';
import { breadcrumbsFor, buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Cricket Journey | Sonu Malik',
  description:
    'From village cricket in Mokhra and collegiate cricket at Vaish College to international club cricket in South Africa, Nepal and Norway, including the Norwegian Cup.',
  path: '/cricket',
  keywords: [
    'Sonu Malik cricket',
    'international club cricket',
    'Norwegian Cup',
    'Dolphin Club South Africa',
    'Vaish College cricket',
  ],
});

export const revalidate = 3600;

export default async function CricketPage() {
  const [timeline, events, faqs] = await Promise.all([getTimeline(), getEvents(), getFaqs()]);
  const breadcrumbs = breadcrumbsFor('/cricket', 'Cricket Journey');

  const cricketFaqs = faqs.filter((faq) =>
    ['cricket-connection', 'international-club-cricket', 'red-ball-events'].includes(faq.slug),
  );

  return (
    <>
      <PageHeader
        eyebrow="Cricket Journey"
        title="Village ground, college side, then club cricket abroad."
        lead="Sonu Malik started with his village team in Mokhra and played collegiate cricket for Vaish College. He did not play professionally in BCCI competitions; his cricket abroad was at club level."
        breadcrumbs={breadcrumbs}
      />

      {/* Stated up front so no reader has to infer the limits of these claims. */}
      <Section className="py-12">
        <div className="shell">
          <div className="rounded-xl2 border border-brass-500/30 bg-brass-700/10 p-6 sm:p-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-brass-200">
              How this page describes his cricket
            </h2>
            <p className="mt-3 max-w-3xl text-[0.9375rem] leading-relaxed text-bone-300">
              His experience abroad is described as{' '}
              <strong className="text-bone-100">international club cricket</strong>. It does not
              represent India, and it is not participation in professional BCCI tournaments as a
              player. Where a specific fixture or season has not yet been documented, the entry is
              marked as requiring verification.
            </p>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="shell">
          <SectionHeading eyebrow="Timeline" title="The journey in sequence" />
          <div className="mt-14">
            <Timeline events={timeline} />
          </div>
        </div>
      </Section>

      <Section id="international" tone="raised">
        <div className="shell">
          <SectionHeading
            eyebrow="International Club Cricket"
            title="Three countries, club level"
            lead="Club cricket and tournament participation abroad, listed exactly as supplied."
          />
          <div className="mt-14">
            <InternationalMap />
          </div>
        </div>
      </Section>

      <Section id="events">
        <div className="shell">
          <SectionHeading
            eyebrow="Events at Red Ball"
            title="Cricket hosted at the ground"
            lead="Formats and categories hosted at the facility. Individual tournament names, dates and results are published only when a source is attached."
          />
          <div className="mt-12">
            <EventsList events={events} />
          </div>
        </div>
      </Section>

      <Section tone="raised">
        <div className="shell">
          <RedBallCta />
        </div>
      </Section>

      <Section>
        <ContactCta />
      </Section>

      <JsonLd data={[breadcrumbSchema(breadcrumbs), faqSchema(cricketFaqs)]} />
    </>
  );
}
