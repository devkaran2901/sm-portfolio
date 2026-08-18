import { prisma, safeQuery } from './db';
import {
  BUSINESSES,
  EVENTS,
  FACILITIES,
  FAQS,
  PLAYERS,
  PROFILE,
  STATS,
  TIMELINE,
} from '@/content/defaults';

/**
 * Public content access layer.
 *
 * Every reader goes through `safeQuery`, so if the database is unreachable the
 * public site still renders from `src/content/defaults.ts` instead of failing.
 * The shapes below are view models, deliberately decoupled from Prisma types so
 * the same components render database rows and fallback content identically.
 */

export type SocialLink = { label: string; url: string };

export type ProfileView = {
  fullName: string;
  headline: string;
  positioning: string;
  shortBio: string;
  longBio: string;
  birthDate: string | null;
  birthPlace: string | null;
  currentCity: string | null;
  region: string | null;
  country: string | null;
  education: string | null;
  educationBody: string | null;
  portraitUrl: string | null;
  portraitAlt: string | null;
  email: string | null;
  phone: string | null;
  socialLinks: SocialLink[];
};

export type TimelineView = {
  id: string;
  slug: string;
  yearLabel: string;
  title: string;
  summary: string;
  category: string;
  location: string | null;
  country: string | null;
  needsSource: boolean;
  isVerified: boolean;
};

export type FacilityView = {
  id: string;
  slug: string;
  name: string;
  group: 'CRICKET' | 'RACQUET' | 'FITNESS' | 'HOSPITALITY';
  quantity: number | null;
  unitLabel: string | null;
  description: string;
  iconKey: string;
  imageCount: number;
};

export type EventView = {
  id: string;
  slug: string;
  name: string;
  category: string;
  yearLabel: string | null;
  organizer: string | null;
  summary: string;
  venue: string | null;
  verifiedCount: number;
};

export type PlayerView = {
  id: string;
  slug: string;
  name: string;
  teamContext: string | null;
  level: string | null;
  associationNote: string;
  photoUrl: string | null;
  photoAlt: string | null;
  verifiedCount: number;
};

export type BusinessView = {
  id: string;
  slug: string;
  name: string;
  role: string;
  category: string | null;
  description: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  bookingUrl: string | null;
  location: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  socialLinks: SocialLink[];
};

export type StatView = { key: string; value: string; label: string; description: string | null };

export type FaqView = { slug: string; question: string; answer: string };

export type MediaView = {
  id: string;
  slug: string;
  title: string;
  publication: string | null;
  publishedOn: Date | null;
  category: string;
  mediaType: string;
  description: string | null;
  thumbnailUrl: string | null;
  thumbnailAlt: string | null;
  externalUrl: string | null;
  status: string;
  evidenceCount: number;
};

export type ReferenceView = {
  id: string;
  claim: string;
  publication: string | null;
  publishedOn: Date | null;
  sourceUrl: string | null;
  sourceType: string;
  status: string;
};

function parseLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const link = item as Record<string, unknown>;
    if (typeof link.label !== 'string' || typeof link.url !== 'string') return [];
    return [{ label: link.label, url: link.url }];
  });
}

// ---------------------------------------------------------------------------

export async function getProfile(): Promise<ProfileView> {
  const fallback: ProfileView = {
    ...PROFILE,
    socialLinks: [...PROFILE.socialLinks],
  };

  return safeQuery(async () => {
    const row = await prisma.profile.findUnique({ where: { id: 'primary' } });
    if (!row) return fallback;
    return {
      fullName: row.fullName,
      headline: row.headline,
      positioning: row.positioning,
      shortBio: row.shortBio,
      longBio: row.longBio,
      birthDate: row.birthDate ? row.birthDate.toISOString().slice(0, 10) : null,
      birthPlace: row.birthPlace,
      currentCity: row.currentCity,
      region: row.region,
      country: row.country,
      education: row.education,
      educationBody: row.educationBody,
      portraitUrl: row.portraitUrl,
      portraitAlt: row.portraitAlt,
      email: row.email,
      phone: row.phone,
      socialLinks: parseLinks(row.socialLinks),
    };
  }, fallback);
}

export async function getTimeline(): Promise<TimelineView[]> {
  const fallback: TimelineView[] = TIMELINE.map((item) => ({
    id: item.slug,
    slug: item.slug,
    yearLabel: item.yearLabel,
    title: item.title,
    summary: item.summary,
    category: item.category,
    location: item.location ?? null,
    country: item.country ?? null,
    needsSource: item.needsSource,
    isVerified: false,
  }));

  return safeQuery(async () => {
    const rows = await prisma.timelineEvent.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
    });
    if (rows.length === 0) return fallback;
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      yearLabel: row.yearLabel,
      title: row.title,
      summary: row.summary,
      category: row.category,
      location: row.location,
      country: row.country,
      needsSource: row.needsSource,
      isVerified: row.isVerified,
    }));
  }, fallback);
}

export async function getFacilities(): Promise<FacilityView[]> {
  const fallback: FacilityView[] = FACILITIES.map((item) => ({
    id: item.slug,
    slug: item.slug,
    name: item.name,
    group: item.group,
    quantity: item.quantity,
    unitLabel: item.unitLabel,
    description: item.description,
    iconKey: item.iconKey,
    imageCount: 0,
  }));

  return safeQuery(async () => {
    const rows = await prisma.facility.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { images: true } } },
    });
    if (rows.length === 0) return fallback;
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      group: row.group,
      quantity: row.quantity,
      unitLabel: row.unitLabel,
      description: row.description,
      iconKey: row.iconKey,
      imageCount: row._count.images,
    }));
  }, fallback);
}

export async function getEvents(): Promise<EventView[]> {
  const fallback: EventView[] = EVENTS.map((item) => ({
    id: item.slug,
    slug: item.slug,
    name: item.name,
    category: item.category,
    yearLabel: null,
    organizer: item.organizer,
    summary: item.summary,
    venue: null,
    verifiedCount: 0,
  }));

  return safeQuery(async () => {
    const rows = await prisma.sportsEvent.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      include: { verifications: { where: { status: 'VERIFIED' }, select: { id: true } } },
    });
    if (rows.length === 0) return fallback;
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: row.category,
      yearLabel: row.yearLabel,
      organizer: row.organizer,
      summary: row.summary,
      venue: row.venue,
      verifiedCount: row.verifications.length,
    }));
  }, fallback);
}

export async function getPlayers(): Promise<PlayerView[]> {
  const fallback: PlayerView[] = PLAYERS.map((item) => ({
    id: item.slug,
    slug: item.slug,
    name: item.name,
    teamContext: item.teamContext,
    level: null,
    associationNote: item.associationNote,
    photoUrl: null,
    photoAlt: null,
    verifiedCount: 0,
  }));

  return safeQuery(async () => {
    const rows = await prisma.player.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      include: { verifications: { where: { status: 'VERIFIED' }, select: { id: true } } },
    });
    if (rows.length === 0) return fallback;
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      teamContext: row.teamContext,
      level: row.level,
      associationNote: row.associationNote,
      photoUrl: row.photoUrl,
      photoAlt: row.photoAlt,
      verifiedCount: row.verifications.length,
    }));
  }, fallback);
}

export async function getBusinesses(): Promise<BusinessView[]> {
  const fallback: BusinessView[] = BUSINESSES.map((item) => ({
    id: item.slug,
    slug: item.slug,
    name: item.name,
    role: item.role,
    category: item.category,
    description: item.description,
    logoUrl: null,
    websiteUrl: null,
    bookingUrl: null,
    location: null,
    contactEmail: null,
    contactPhone: null,
    socialLinks: [],
  }));

  return safeQuery(async () => {
    const rows = await prisma.business.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
    });
    if (rows.length === 0) return fallback;
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      role: row.role,
      category: row.category,
      description: row.description,
      logoUrl: row.logoUrl,
      websiteUrl: row.websiteUrl,
      bookingUrl: row.bookingUrl,
      location: row.location,
      contactEmail: row.contactEmail,
      contactPhone: row.contactPhone,
      socialLinks: parseLinks(row.socialLinks),
    }));
  }, fallback);
}

export async function getStats(): Promise<StatView[]> {
  const fallback: StatView[] = STATS.map(({ key, value, label, description }) => ({
    key,
    value,
    label,
    description,
  }));

  return safeQuery(async () => {
    const rows = await prisma.siteStat.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
    });
    if (rows.length === 0) return fallback;
    return rows.map((row) => ({
      key: row.key,
      value: row.value,
      label: row.label,
      description: row.description,
    }));
  }, fallback);
}

export async function getFaqs(): Promise<FaqView[]> {
  const fallback: FaqView[] = FAQS.map(({ slug, question, answer }) => ({ slug, question, answer }));

  return safeQuery(async () => {
    const rows = await prisma.faqItem.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
    });
    if (rows.length === 0) return fallback;
    return rows.map((row) => ({ slug: row.slug, question: row.question, answer: row.answer }));
  }, fallback);
}

/**
 * Published press items only. Nothing is seeded here on purpose: the media
 * archive starts empty and fills up with genuine, uploaded material.
 */
export async function getMedia(category?: string): Promise<MediaView[]> {
  return safeQuery(async () => {
    const rows = await prisma.mediaArticle.findMany({
      where: {
        isPublished: true,
        ...(category && category !== 'ALL'
          ? { category: category as never }
          : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { publishedOn: 'desc' }],
      include: { _count: { select: { evidence: true } } },
    });
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      publication: row.publication,
      publishedOn: row.publishedOn,
      category: row.category,
      mediaType: row.mediaType,
      description: row.description,
      thumbnailUrl: row.thumbnailUrl,
      thumbnailAlt: row.thumbnailAlt,
      externalUrl: row.externalUrl,
      status: row.status,
      evidenceCount: row._count.evidence,
    }));
  }, []);
}

/** Verified public references, for the evidence section of the media page. */
export async function getVerifiedReferences(): Promise<ReferenceView[]> {
  return safeQuery(async () => {
    const rows = await prisma.verificationRecord.findMany({
      where: { status: 'VERIFIED' },
      orderBy: [{ publishedOn: 'desc' }, { createdAt: 'desc' }],
      take: 60,
    });
    return rows.map((row) => ({
      id: row.id,
      claim: row.claim,
      publication: row.publication,
      publishedOn: row.publishedOn,
      sourceUrl: row.sourceUrl,
      sourceType: row.sourceType,
      status: row.status,
    }));
  }, []);
}

/** Counts used by the media page to describe the state of the archive honestly. */
export async function getEvidenceSummary(): Promise<{
  verified: number;
  underReview: number;
  open: number;
}> {
  return safeQuery(
    async () => {
      const [verified, underReview, open] = await Promise.all([
        prisma.verificationRecord.count({ where: { status: 'VERIFIED' } }),
        prisma.verificationRecord.count({ where: { status: 'UNDER_REVIEW' } }),
        prisma.verificationRecord.count({ where: { status: 'UNVERIFIED' } }),
      ]);
      return { verified, underReview, open };
    },
    { verified: 0, underReview: 0, open: 0 },
  );
}

export async function getSeoSetting(path: string) {
  return safeQuery(async () => prisma.seoSetting.findUnique({ where: { path } }), null);
}
