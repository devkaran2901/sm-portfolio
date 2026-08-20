import type { Metadata } from 'next';

import { PageHeader } from '@/components/site/PageHeader';
import { Timeline } from '@/components/sections/Timeline';
import { InternationalMap } from '@/components/sections/InternationalMap';
import { EntityWeb } from '@/components/sections/EntityContext';
import { WorkSummary } from '@/components/sections/WorkSummary';
import { ContactCta } from '@/components/sections/CallToAction';
import { JsonLd } from '@/components/ui/JsonLd';
import { Section, SectionHeading } from '@/components/ui/Primitives';
import { getBusinesses, getFacilities, getFaqs, getProfile, getTimeline } from '@/lib/content';
import { breadcrumbSchema, faqSchema, profilePageSchema } from '@/lib/schema-org';
import { breadcrumbsFor, buildMetadata } from '@/lib/seo';
import { formatDate } from '@/lib/utils';

/**
 * About - the whole person in one page.
 *
 * This absorbed the former /cricket page. Both were biography: one covered the
 * origins and the other the playing years, and splitting them meant a reader
 * had to visit two pages to get one story. /cricket now redirects here.
 */
export const metadata: Metadata = buildMetadata({
  title: 'About Sonu Malik | Cricket Journey, Rohtak, Haryana',
  description:
    'Born in Mokhra village, Rohtak, in 1988. Village and collegiate cricket, then international club cricket in South Africa, Nepal and Norway. LLM from Kalinga University, founder of Red Ball Sports Arena.',
  path: '/about',
  type: 'profile',
  keywords: [
    'Sonu Malik',
    'Sonu Malik cricket',
    'Sonu Malik Rohtak',
    'international club cricket',
    'Norwegian Cup',
    'Vaish College cricket',
  ],
});

export const revalidate = 3600;

export default async function AboutPage() {
  const [profile, timeline, facilities, businesses, faqs] = await Promise.all([
    getProfile(),
    getTimeline(),
    getFacilities(),
    getBusinesses(),
    getFaqs(),
  ]);

  const breadcrumbs = breadcrumbsFor('/about', 'About');
  const paragraphs = profile.longBio.split('\n\n').filter(Boolean);

  const aboutFaqs = faqs.filter((faq) =>
    [
      'who-is-sonu-malik',
      'where-is-sonu-malik-from',
      'education',
      'cricket-connection',
      'international-club-cricket',
    ].includes(faq.slug),
  );

  const facts = [
    { label: 'Born', value: profile.birthDate ? formatDate(profile.birthDate) : null },
    { label: 'Birthplace', value: profile.birthPlace },
    { label: 'Based in', value: [profile.currentCity, profile.region].filter(Boolean).join(', ') },
    {
      label: 'Education',
      value: [profile.education, profile.educationBody].filter(Boolean).join(' — '),
    },
    { label: 'Founder of', value: 'Red Ball Sports Arena, Rohtak' },
    { label: 'Ventures', value: 'The Page · Hotel The Prada' },
  ].filter((fact) => Boolean(fact.value));

  return (
    <>
      <PageHeader
        eyebrow="About"
        title="A cricketer who ended up building the ground."
        lead={profile.shortBio}
        breadcrumbs={breadcrumbs}
      />

      <Section>
        <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="prose-editorial">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-5">
            <dl className="divide-y divide-ink-800 border-y border-ink-800">
              {facts.map((fact) => (
                <div key={fact.label} className="flex justify-between gap-6 py-3.5">
                  <dt className="text-xs uppercase tracking-[0.12em] text-bone-500">{fact.label}</dt>
                  <dd className="text-right text-[0.9375rem] text-bone-200">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-sm leading-relaxed text-bone-500">
              Biographical details are limited to information supplied directly. Anything requiring
              documentary support is marked for verification rather than stated as settled fact.
            </p>
          </aside>
        </div>
      </Section>

      {/* Stated before the cricket sections, so no reader has to infer the limits. */}
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

      <Section id="journey" tone="raised" className="pt-0">
        <div className="shell">
          <SectionHeading
            eyebrow="Cricket Journey"
            title="The journey in sequence"
            lead="Village cricket in Mokhra, collegiate cricket at Vaish College, then club cricket abroad. Where a precise year was not supplied, the period is described rather than guessed."
          />
          <div className="mt-14">
            <Timeline events={timeline} />
          </div>
        </div>
      </Section>

      <Section id="international">
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

      <Section tone="raised">
        <div className="shell">
          <SectionHeading
            eyebrow="Beyond Playing"
            title="What he runs today"
            lead="The sports arena in Rohtak and two businesses."
          />
          <div className="mt-12">
            <WorkSummary facilities={facilities} businesses={businesses} />
          </div>
        </div>
      </Section>

      <Section className="py-16">
        <div className="shell">
          <h2 className="eyebrow">Related</h2>
          <div className="mt-8">
            <EntityWeb profile={profile} />
          </div>
        </div>
      </Section>

      <Section>
        <ContactCta />
      </Section>

      <JsonLd
        data={[profilePageSchema(profile), breadcrumbSchema(breadcrumbs), faqSchema(aboutFaqs)]}
      />
    </>
  );
}
