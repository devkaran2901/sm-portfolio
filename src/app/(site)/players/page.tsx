import type { Metadata } from 'next';

import { PageHeader } from '@/components/site/PageHeader';
import { PlayerImpact } from '@/components/sections/PlayerImpact';
import { ContactCta } from '@/components/sections/CallToAction';
import { JsonLd } from '@/components/ui/JsonLd';
import { Section, SectionHeading } from '@/components/ui/Primitives';
import { getFaqs, getPlayers, getStats } from '@/lib/content';
import { breadcrumbSchema, faqSchema } from '@/lib/schema-org';
import { breadcrumbsFor, buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Players & Impact | Red Ball Cricket Ground',
  description:
    'More than 50 players who trained or played at Red Ball Cricket Ground in Rohtak have progressed to higher levels of competitive cricket.',
  path: '/players',
  keywords: ['Red Ball Cricket Ground players', 'cricket academy Rohtak', 'player development Haryana'],
});

export const revalidate = 3600;

export default async function PlayersPage() {
  const [players, stats, faqs] = await Promise.all([getPlayers(), getStats(), getFaqs()]);
  const breadcrumbs = breadcrumbsFor('/players', 'Players & Impact');
  const playersStat = stats.find((stat) => stat.key === 'players-progressed');
  const playerFaqs = faqs.filter((faq) => faq.slug === 'players-associated');

  return (
    <>
      <PageHeader
        eyebrow="Players & Impact"
        title="A ground that players pass through on the way up."
        lead="The facility has become a platform for players aspiring to progress toward higher levels of competitive cricket."
        breadcrumbs={breadcrumbs}
      />

      {/* The relationship boundary, stated before any player is named. */}
      <Section className="py-12">
        <div className="shell">
          <div className="rounded-xl2 border border-brass-500/30 bg-brass-700/10 p-6 sm:p-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-brass-200">
              How these associations are described
            </h2>
            <p className="mt-3 max-w-3xl text-[0.9375rem] leading-relaxed text-bone-300">
              Players listed here are{' '}
              <strong className="text-bone-100">associated with the facility</strong>. This page does
              not claim that Sonu Malik personally trained, coached, discovered, managed or mentored
              them, and it does not claim credit for their selection or professional careers. Where
              the exact nature of a relationship has not been documented, it is left unstated.
            </p>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="shell">
          <PlayerImpact players={players} playersStat={playersStat} />
        </div>
      </Section>

      <Section tone="raised">
        <div className="shell">
          <SectionHeading
            eyebrow="Evidence"
            title="What still needs a source"
            lead="Every figure and association on this page is tracked in the verification archive. Until a source is attached, it carries a visible marker."
          />

          <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4">
            {[
              'More than 50 players progressed to higher levels',
              'The ground hosts domestic, Ranji and IPL-level players',
              'Mohit Rathee is associated with the facility (Royal Challengers Bengaluru context)',
              'Nishant Sindhu is associated with the facility (Gujarat Titans context)',
            ].map((claim) => (
              <li
                key={claim}
                className="flex items-start gap-3 rounded-xl2 border border-ink-700/70 bg-ink-900/50 p-5"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brass-400"
                />
                <p className="text-sm leading-relaxed text-bone-300">{claim}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section>
        <ContactCta />
      </Section>

      <JsonLd data={[breadcrumbSchema(breadcrumbs), faqSchema(playerFaqs)]} />
    </>
  );
}
