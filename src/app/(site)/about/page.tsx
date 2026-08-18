import type { Metadata } from 'next';
import Link from 'next/link';

import { PageHeader } from '@/components/site/PageHeader';
import { Timeline } from '@/components/sections/Timeline';
import { EntityWeb } from '@/components/sections/EntityContext';
import { ContactCta } from '@/components/sections/CallToAction';
import { JsonLd } from '@/components/ui/JsonLd';
import { MediaPlaceholder, Section, SectionHeading } from '@/components/ui/Primitives';
import { buttonClass } from '@/components/ui/Button';
import { getProfile, getTimeline } from '@/lib/content';
import { breadcrumbSchema, profilePageSchema } from '@/lib/schema-org';
import { breadcrumbsFor, buildMetadata } from '@/lib/seo';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = buildMetadata({
  title: 'About Sonu Malik | Rohtak, Haryana',
  description:
    'Born in Mokhra village, Rohtak, in 1988. LLM from Kalinga University. Founder of Red Ball Cricket Ground and owner of The Page and Hotel The Prada.',
  path: '/about',
  type: 'profile',
});

export const revalidate = 3600;

export default async function AboutPage() {
  const [profile, timeline] = await Promise.all([getProfile(), getTimeline()]);
  const breadcrumbs = breadcrumbsFor('/about', 'About');
  const paragraphs = profile.longBio.split('\n\n').filter(Boolean);

  const facts = [
    { label: 'Born', value: profile.birthDate ? formatDate(profile.birthDate) : null },
    { label: 'Birthplace', value: profile.birthPlace },
    { label: 'Based in', value: [profile.currentCity, profile.region].filter(Boolean).join(', ') },
    {
      label: 'Education',
      value: [profile.education, profile.educationBody].filter(Boolean).join(' — '),
    },
    { label: 'Founder of', value: 'Red Ball Cricket Ground, Rohtak' },
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

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/cricket" className={buttonClass('secondary', 'md')}>
                Cricket journey
              </Link>
              <Link href="/red-ball" className={buttonClass('secondary', 'md')}>
                Red Ball Cricket Ground
              </Link>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <MediaPlaceholder label="Editorial portrait to be added" aspect="aspect-[4/5]" />

            <dl className="mt-8 divide-y divide-ink-800 border-y border-ink-800">
              {facts.map((fact) => (
                <div key={fact.label} className="flex justify-between gap-6 py-3.5">
                  <dt className="text-xs uppercase tracking-[0.12em] text-bone-500">{fact.label}</dt>
                  <dd className="text-right text-sm text-bone-200">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-xs leading-relaxed text-bone-500">
              Biographical details are limited to information supplied directly. Anything requiring
              documentary support is marked for verification rather than stated as settled fact.
            </p>
          </aside>
        </div>
      </Section>

      <Section tone="raised">
        <div className="shell">
          <SectionHeading
            eyebrow="Chronology"
            title="The path, in order"
            lead="Where a precise year was not supplied, the period is described rather than guessed."
          />
          <div className="mt-14">
            <Timeline events={timeline} />
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

      <JsonLd data={[profilePageSchema(profile), breadcrumbSchema(breadcrumbs)]} />
    </>
  );
}
