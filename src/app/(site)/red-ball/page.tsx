import type { Metadata } from 'next';
import Link from 'next/link';

import { PageHeader } from '@/components/site/PageHeader';
import { Ecosystem } from '@/components/sections/Ecosystem';
import { FacilityShowcase } from '@/components/sections/FacilityShowcase';
import { EventsList } from '@/components/sections/EventsList';
import { ContactCta, RedBallCta } from '@/components/sections/CallToAction';
import { Counter } from '@/components/ui/Counter';
import { JsonLd } from '@/components/ui/JsonLd';
import { Section, SectionHeading, StatBlock } from '@/components/ui/Primitives';
import { Reveal } from '@/components/ui/Reveal';
import { buttonClass } from '@/components/ui/Button';
import { getEvents, getFacilities, getFaqs, getStats } from '@/lib/content';
import { breadcrumbSchema, faqSchema, sportsLocationSchema } from '@/lib/schema-org';
import { breadcrumbsFor, buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Red Ball Cricket Ground, Rohtak | Multi-Sports Complex',
  description:
    'Red Ball Cricket Ground in Rohtak, Haryana: two cricket grounds, two cricket academies, box cricket, badminton and pickleball courts, gym, swimming pool and restaurant.',
  path: '/red-ball',
  keywords: [
    'Red Ball Cricket Ground',
    'Red Ball Sports Arena Rohtak',
    'cricket academy Rohtak',
    'sports complex Rohtak',
    'box cricket Rohtak',
    'pickleball Rohtak',
  ],
});

export const revalidate = 3600;

export default async function RedBallPage() {
  const [facilities, stats, events, faqs] = await Promise.all([
    getFacilities(),
    getStats(),
    getEvents(),
    getFaqs(),
  ]);

  const breadcrumbs = breadcrumbsFor('/red-ball', 'Red Ball');
  const redBallFaqs = faqs.filter((faq) =>
    ['what-is-red-ball', 'red-ball-facilities', 'red-ball-events', 'players-associated'].includes(
      faq.slug,
    ),
  );

  return (
    <>
      <PageHeader
        eyebrow="Red Ball Cricket Ground"
        title="A cricket ground that grew into a sports ecosystem."
        lead="Founded and operated by Sonu Malik in Rohtak, Haryana, for approximately six years. Cricket remains the core; racquet sports, fitness and hospitality have been built around it."
        breadcrumbs={breadcrumbs}
      />

      <Section className="py-14">
        <div className="shell">
          <Reveal>
            <dl className="grid gap-8 border-y border-ink-800 py-10 sm:grid-cols-2 lg:grid-cols-5">
              {stats.map((stat) => (
                <StatBlock key={stat.key} label={stat.label} description={stat.description}>
                  <Counter value={stat.value} />
                </StatBlock>
              ))}
            </dl>
          </Reveal>
        </div>
      </Section>

      <Section id="ecosystem" tone="raised" className="pt-0">
        <div className="shell">
          <SectionHeading
            eyebrow="Sports Ecosystem"
            title="How the facilities connect"
            lead="One site, four connected areas. Players train, compete, recover and eat without leaving the complex."
          />
          <div className="mt-14">
            <Ecosystem facilities={facilities} />
          </div>
        </div>
      </Section>

      <Section id="facilities">
        <div className="shell">
          <SectionHeading
            eyebrow="Facility Showcase"
            title="What is on site"
            lead="Photography is added from the admin portal as it becomes available. Until then each card shows a labelled placeholder rather than a stand-in image."
          />
          <div className="mt-14">
            <FacilityShowcase facilities={facilities} />
          </div>
        </div>
      </Section>

      <Section id="events" tone="raised">
        <div className="shell">
          <SectionHeading
            eyebrow="Events & Competitions"
            title="Cricket hosted at the ground"
            lead="Corporate leagues, open tournaments and official BCCI age-group matches. Specific fixtures are published with their supporting reference attached."
          />
          <div className="mt-12">
            <EventsList events={events} />
          </div>

          <div className="mt-12">
            <Link href="/players" className={buttonClass('secondary', 'md')}>
              Players &amp; impact
            </Link>
          </div>
        </div>
      </Section>

      <Section>
        <div className="shell">
          <RedBallCta />
        </div>
      </Section>

      <Section>
        <ContactCta />
      </Section>

      <JsonLd
        data={[
          sportsLocationSchema(facilities.map((facility) => facility.name)),
          breadcrumbSchema(breadcrumbs),
          faqSchema(redBallFaqs),
        ]}
      />
    </>
  );
}
