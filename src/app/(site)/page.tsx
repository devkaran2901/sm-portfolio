import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';

import { HeroSequence } from '@/components/sections/HeroSequence';
import { StatsBar } from '@/components/sections/StatsBar';
import { VenturesShowcase } from '@/components/sections/VenturesShowcase';
import { JourneyStrip } from '@/components/sections/JourneyStrip';
import { FeaturedVenture } from '@/components/sections/FeaturedVenture';
import { PlayersShowcase } from '@/components/sections/PlayersShowcase';
import { PressRecognition } from '@/components/sections/PressRecognition';
import { Faq } from '@/components/sections/Faq';
import { JsonLd } from '@/components/ui/JsonLd';
import { Section, SectionHeading } from '@/components/ui/Primitives';
import { buttonClass } from '@/components/ui/Button';
import { INTERNATIONAL, SITE } from '@/content/defaults';
import {
  getBusinesses,
  getFacilities,
  getFaqs,
  getMedia,
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

/**
 * A small caps link with an arrow, used beside a section heading where a filled
 * button would read as a second primary action. `.cta-link` carries the rule
 * that draws itself in on hover.
 */
function HeadingLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="cta-link">
      {children}
      <ArrowRight size={14} aria-hidden="true" />
    </Link>
  );
}

export default async function HomePage() {
  const [profile, stats, timeline, facilities, players, businesses, faqs, press] = await Promise.all(
    [
      getProfile(),
      getStats(),
      getTimeline(),
      getFacilities(),
      getPlayers(),
      getBusinesses(),
      getFaqs(),
      getMedia(),
    ],
  );

  const playersStat = stats.find((stat) => stat.key === 'players-progressed');
  // Six nodes is what the horizontal strip holds before the labels start
  // colliding: birth, village cricket, college, and the three trips abroad.
  const journeyPreview = timeline.slice(0, 6);
  /*
   * The homepage carries the opening of the bio; the about page prints all of
   * it. Taking a slice rather than indexing two fixed positions is what lets a
   * paragraph be inserted into the record without this section silently
   * dropping it - which is what happened to the education paragraph.
   */
  const bioParagraphs = profile.longBio.split('\n\n').filter(Boolean).slice(0, 3);
  const positioning = profile.positioning
    .split('·')
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <>
      <HeroSequence
        name={profile.fullName}
        fallbackImageUrl={profile.portraitUrl}
        fallbackAlt={profile.portraitAlt}
      />

      <StatsBar stats={stats} internationalCount={INTERNATIONAL.length} />

      <Section id="ventures">
        <div className="shell">
          <SectionHeading
            layout="split"
            eyebrow="Ventures"
            title="Business Built With Purpose"
            lead="Three operations, one method: build the place first, then let the sport and the trade that belong in it arrive."
            action={<HeadingLink href="/ventures">View All Ventures</HeadingLink>}
          />
          <div className="mt-16">
            <VenturesShowcase facilities={facilities} businesses={businesses} />
          </div>
        </div>
      </Section>

      <Section id="journey" tone="panel">
        <div className="shell">
          <SectionHeading
            layout="split"
            eyebrow="The Journey"
            title="A Journey Beyond Boundaries"
            lead="Village cricket, collegiate cricket, and international club cricket abroad. Not a BCCI professional playing career — club cricket, accurately described."
            action={<HeadingLink href="/about#journey">View Full Journey</HeadingLink>}
          />
          <div className="mt-20">
            <JourneyStrip events={journeyPreview} />
          </div>
        </div>
      </Section>

      <Section id="red-ball">
        <div className="shell">
          {/*
            The events line names the categories in EVENTS - corporate leagues,
            open tournaments, and the three BCCI age groups - so the sentence
            stays inside what the content records already carry.

            The age groups are written with a non-breaking hyphen (U+2011). An
            ordinary hyphen is a break opportunity, and in this column the line
            landed mid-label: "BCCI U-" then "14, U-16" on the next line.
          */}
          <FeaturedVenture
            facilities={facilities}
            description="Founded and operated by Sonu Malik in Rohtak, Haryana. What began as a cricket ground now spans cricket, racquet sports, fitness and hospitality, six years in, and regularly hosts BCCI U‑14, U‑16 and U‑19 matches alongside corporate leagues and open tournaments."
          />
        </div>
      </Section>

      <Section id="players" tone="deep">
        <div className="shell">
          <PlayersShowcase players={players} playersStat={playersStat} />
        </div>
      </Section>

      {/*
        The one light band on the page. `tone="paper"` carries `.on-paper`,
        which re-points every content token inside it, so the components below
        need no light variant of their own.
      */}
      <Section id="press" tone="paper">
        <div className="shell">
          <SectionHeading
            layout="split"
            tone="paper"
            eyebrow="As Seen In"
            title="Press & Recognition"
            lead="Coverage is listed here once the clipping, link or recording behind it has been attached."
            action={<HeadingLink href="/media">View All Articles</HeadingLink>}
          />
          <div className="mt-16">
            <PressRecognition articles={press} />
          </div>
        </div>
      </Section>

      {/* Who, in one screen. The ten-second answer the brief asks for. */}
      <Section id="overview">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Who is Sonu Malik" title="Cricket, then infrastructure." />
            <ul className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-8">
              {positioning.map((item) => (
                <li
                  key={item}
                  className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-bone-400"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            {bioParagraphs.map((paragraph, index) => (
              <p
                key={paragraph.slice(0, 40)}
                className={index === 0 ? 'prose-editorial' : 'prose-editorial mt-5'}
              >
                {paragraph}
              </p>
            ))}
            <Link href="/about" className={`${buttonClass('outline', 'md')} mt-10`}>
              Read the full profile
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Section>

      <Section id="faq" tone="panel">
        <div className="shell">
          <SectionHeading
            layout="split"
            eyebrow="Frequently Asked"
            title="Questions people actually ask"
            lead="Answers are limited to what is known and supportable."
          />
          <div className="mt-16">
            <Faq faqs={faqs} />
          </div>
        </div>
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
