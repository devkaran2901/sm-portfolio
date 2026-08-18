import { SITE } from '@/content/defaults';
import { absoluteUrl } from './seo';
import type {
  BusinessView,
  EventView,
  FaqView,
  MediaView,
  ProfileView,
} from './content';
import type { Breadcrumb } from './seo';

/**
 * JSON-LD builders.
 *
 * Rule enforced throughout this file: structured data may only assert what is
 * visible on the page. Optional properties are omitted when the underlying
 * value is unknown rather than filled with a plausible guess - an absent field
 * is honest, an invented one is not.
 */

type Json = Record<string, unknown>;

/** Drops null, undefined and empty-array properties so nothing is asserted emptily. */
function compact(input: Json): Json {
  const out: Json = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    out[key] = value;
  }
  return out;
}

export const PERSON_ID = `${SITE.domain}#person`;
export const ORGANISATION_ID = `${SITE.domain}#redball`;

export function personSchema(profile: ProfileView): Json {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': absoluteUrl('/') + '#person',
    name: profile.fullName,
    url: absoluteUrl('/'),
    description: profile.shortBio,
    birthDate: profile.birthDate ?? undefined,
    birthPlace: profile.birthPlace
      ? compact({ '@type': 'Place', name: profile.birthPlace })
      : undefined,
    homeLocation: profile.currentCity
      ? compact({
          '@type': 'Place',
          address: compact({
            '@type': 'PostalAddress',
            addressLocality: profile.currentCity,
            addressRegion: profile.region,
            addressCountry: profile.country ?? 'IN',
          }),
        })
      : undefined,
    alumniOf: profile.educationBody
      ? compact({ '@type': 'CollegeOrUniversity', name: profile.educationBody })
      : undefined,
    // Deliberately not "professional cricketer": the verified roles only.
    jobTitle: 'Sports Infrastructure Founder',
    knowsAbout: ['Cricket', 'Sports infrastructure', 'Sports facility management'],
    image: profile.portraitUrl ? absoluteUrl(profile.portraitUrl) : undefined,
    email: profile.email ? `mailto:${profile.email}` : undefined,
    telephone: profile.phone ?? undefined,
    sameAs: profile.socialLinks.map((link) => link.url),
    worksFor: { '@id': absoluteUrl('/red-ball') + '#organization' },
  });
}

/**
 * Red Ball as a SportsActivityLocation. No address, geo, opening hours, rating
 * or price data is emitted, because none of it has been supplied - and a
 * LocalBusiness node with invented details is exactly the failure mode to avoid.
 */
export function sportsLocationSchema(facilityNames: string[]): Json {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    '@id': absoluteUrl('/red-ball') + '#organization',
    name: 'Red Ball Cricket Ground',
    alternateName: 'Red Ball Sports Arena',
    url: SITE.redBallUrl,
    sameAs: [SITE.redBallUrl],
    description:
      'Multi-sports complex in Rohtak, Haryana, founded by Sonu Malik. Cricket grounds and academies, box cricket, badminton, pickleball, gym, swimming pool and restaurant.',
    address: compact({
      '@type': 'PostalAddress',
      addressLocality: 'Rohtak',
      addressRegion: 'Haryana',
      addressCountry: 'IN',
    }),
    founder: { '@id': absoluteUrl('/') + '#person' },
    amenityFeature: facilityNames.map((name) =>
      compact({ '@type': 'LocationFeatureSpecification', name, value: true }),
    ),
  });
}

export function organisationSchema(business: BusinessView): Json {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': absoluteUrl('/ventures') + `#${business.slug}`,
    name: business.name,
    description: business.description,
    url: business.websiteUrl ?? undefined,
    logo: business.logoUrl ?? undefined,
    email: business.contactEmail ?? undefined,
    telephone: business.contactPhone ?? undefined,
    address: business.location
      ? compact({ '@type': 'PostalAddress', name: business.location })
      : undefined,
    sameAs: business.socialLinks.map((link) => link.url),
    founder: { '@id': absoluteUrl('/') + '#person' },
  });
}

/**
 * Event nodes are only emitted for entries that carry a concrete date, because
 * schema.org Event requires startDate and inventing one would be fabrication.
 * Undated recurring formats stay out of the structured data.
 */
export function eventSchema(event: EventView, isoDate: string): Json {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: event.name,
    description: event.summary,
    startDate: isoDate,
    organizer: event.organizer ? compact({ '@type': 'Organization', name: event.organizer }) : undefined,
    location: { '@id': absoluteUrl('/red-ball') + '#organization' },
  });
}

export function articleSchema(article: MediaView): Json {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description ?? undefined,
    datePublished: article.publishedOn ? article.publishedOn.toISOString() : undefined,
    publisher: article.publication
      ? compact({ '@type': 'Organization', name: article.publication })
      : undefined,
    url: article.externalUrl ?? undefined,
    image: article.thumbnailUrl ?? undefined,
    about: { '@id': absoluteUrl('/') + '#person' },
  });
}

export function faqSchema(faqs: FaqView[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export function breadcrumbSchema(items: Breadcrumb[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function websiteSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluteUrl('/') + '#website',
    url: absoluteUrl('/'),
    name: SITE.name,
    description: SITE.defaultDescription,
    inLanguage: 'en-IN',
    publisher: { '@id': absoluteUrl('/') + '#person' },
  };
}

export function profilePageSchema(profile: ProfileView): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': absoluteUrl('/about') + '#profilepage',
    mainEntity: { '@id': absoluteUrl('/') + '#person' },
    name: `About ${profile.fullName}`,
  };
}
