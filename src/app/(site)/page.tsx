import Link from 'next/link';
import type { Metadata } from 'next';

import { Hero } from '@/components/sections/Hero';
import { WorkSummary } from '@/components/sections/WorkSummary';
import { HeroSequence } from '@/components/sections/HeroSequence';
import { Timeline } from '@/components/sections/Timeline';
import { Ecosystem } from '@/components/sections/Ecosystem';
import { PlayerImpact } from '@/components/sections/PlayerImpact';
import { VentureCards } from '@/components/sections/VentureCards';
import { Faq } from '@/components/sections/Faq';
import { AnswerBlocks, EntityWeb } from '@/components/sections/EntityContext';
import { ContactCta, RedBallCta } from '@/components/sections/CallToAction';
import { Counter } from '@/components/ui/Counter';
import { JsonLd } from '@/components/ui/JsonLd';
import { Section, SectionHeading, StatBlock } from '@/components/ui/Primitives';
import { Reveal } from '@/components/ui/Reveal';
import { buttonClass } from '@/components/ui/Button';
import { SITE } from '@/content/defaults';
import {
  getBusinesses,
  getFacilities,
  getFaqs,
  getPlayers,
  getProfile,
  getStats,
  getTimeline,
} from '@/lib/content';
import { faqSchema, sportsLocationSchema } from '@/lib/schema-org';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: SITE.defaultTitle,
  description: SITE.defaultDescription,
  path: '/',
  keywords: [
    'Sonu Malik',
    'Sonu Malik Rohtak',
    'Sonu Malik Haryana',
    'Red Ball Cricket Ground',
    'Red Ball Sports Arena Rohtak',
    'cricket academy Rohtak',
    'sports infrastructure Rohtak',
  ],
});

// Content is served from the database with a static fallback; revalidate hourly.
export const revalidate = 3600;

export default async function HomePage() {
  const [profile, stats, timeline, facilities, players, businesses, faqs] = await Promise.all([
    getProfile(),
    getStats(),
    getTimeline(),
    getFacilities(),
    getPlayers(),
    getBusinesses(),
    getFaqs(),
  ]);

  const playersStat = stats.find((stat) => stat.key === 'players-progressed');
  const journeyPreview = timeline.slice(0, 5);

  return (
    <>
      <HeroSequence
        name={profile.fullName}
        fallbackImageUrl={profile.portraitUrl}
        fallbackAlt={profile.portraitAlt}
      />

      <Hero profile={profile} showHeadline={false} />

      <Section id="what-he-runs" tone="raised" className="py-16">
        <div className="shell">
          <SectionHeading
            eyebrow="At a Glance"
            title="The arena and the ventures"
            lead="Two places to go next, depending on what brought you here."
          />
          <div className="mt-12">
            <WorkSummary facilities={facilities} businesses={businesses} />
          </div>
        </div>
      </Section>

      {/* Who, in one screen. The 10-second answer the brief asks for. */}
      <Section id="overview" tone="raised">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Who is Sonu Malik" title="Cricket, then infrastructure." />
          </div>
          <div className="lg:col-span-7">
            <p className="prose-editorial">
              {profile.longBio.split('\n\n')[0]}
            </p>
            <p className="prose-editorial mt-5">
              {profile.longBio.split('\n\n')[1]}
            </p>
            <Link href="/about" className={`${buttonClass('secondary', 'md')} mt-8`}>
              Read the full profile
            </Link>
          </div>
        </div>
      </Section>

      <Section id="journey">
        <div className="shell">
          <SectionHeading
            eyebrow="Cricket Journey"
            title="From Mokhra to the Norwegian Cup"
            lead="Village cricket, collegiate cricket, and international club cricket abroad. Not a BCCI professional playing career &mdash; club cricket, accurately described."
          />
          <div className="mt-14">
            <Timeline events={journeyPreview} />
          </div>
          <Link href="/about#journey" className={buttonClass('secondary', 'md')}>
            See the full timeline
          </Link>
        </div>
      </Section>

      <Section id="red-ball" tone="raised">
        <div className="shell">
          <SectionHeading
            eyebrow="Red Ball Cricket Ground"
            title="A multi-sports complex, six years in"
            lead="Founded and operated by Sonu Malik in Rohtak, Haryana. What began as a cricket ground now spans cricket, racquet sports, fitness and hospitality."
          />

          <Reveal className="mt-14">
            <dl className="grid grid-cols-3 gap-4 border-y border-ink-800 py-10 sm:gap-8 lg:grid-cols-5">
              {stats.map((stat) => (
                <StatBlock key={stat.key} label={stat.label} description={stat.description}>
                  <Counter value={stat.value} />
                </StatBlock>
              ))}
            </dl>
          </Reveal>

          <div className="mt-16">
            <Ecosystem facilities={facilities} />
          </div>

          <div className="mt-14 flex flex-wrap gap-3">
            <Link href="/red-ball" className={buttonClass('primary', 'md')}>
              Explore the facility
            </Link>
            <Link href="/players" className={buttonClass('secondary', 'md')}>
              Players &amp; impact
            </Link>
          </div>
        </div>
      </Section>

      <Section id="players">
        <div className="shell">
          <SectionHeading
            eyebrow="Player Development"
            title="A platform for players moving up"
            lead="Players who trained or played at the facility have progressed to higher levels of competitive cricket. The relationship described here is association with the ground, nothing more."
          />
          <div className="mt-14">
            <PlayerImpact players={players} playersStat={playersStat} />
          </div>
        </div>
      </Section>

      <Section id="ventures" tone="raised">
        <div className="shell">
          <SectionHeading
            eyebrow="Business Ventures"
            title="Founder & owner"
            lead="Two businesses alongside the sports infrastructure work."
          />
          <div className="mt-14">
            <VentureCards businesses={businesses} />
          </div>
        </div>
      </Section>

      <Section>
        <div className="shell">
          <RedBallCta />
        </div>
      </Section>

      {/* Entity-oriented passages: short, factual, quotable by generative engines. */}
      <Section id="quick-answers" tone="raised">
        <div className="shell">
          <SectionHeading eyebrow="Quick Answers" title="The essentials, stated plainly" />
          <div className="mt-12">
            <AnswerBlocks faqs={faqs} limit={6} />
          </div>
        </div>
      </Section>

      <Section id="faq">
        <div className="shell">
          <SectionHeading
            eyebrow="Frequently Asked"
            title="Questions people actually ask"
            lead="Answers are limited to what is known and supportable."
          />
          <div className="mt-12">
            <Faq faqs={faqs} />
          </div>
        </div>
      </Section>

      <Section tone="raised" className="py-16">
        <div className="shell">
          <h2 className="eyebrow">Explore</h2>
          <div className="mt-8">
            <EntityWeb profile={profile} />
          </div>
        </div>
      </Section>

      <Section>
        <ContactCta />
      </Section>

      <JsonLd
        data={[
          sportsLocationSchema(facilities.map((facility) => facility.name)),
          faqSchema(faqs),
        ]}
      />
    </>
  );
}
