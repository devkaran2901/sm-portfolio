import { z } from 'zod';

/**
 * Server-side validation schemas.
 *
 * Every mutating endpoint parses its body through one of these. The client
 * mirrors the rules for UX, but the server treats client input as untrusted:
 * nothing is written that has not been through a schema here.
 */

/** Strips control characters and collapses runaway whitespace. */
function stripControlChars(value: string): string {
  let out = '';
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    // Keep tab and newline, drop the rest of the C0 range and DEL.
    if (code === 9 || code === 10 || (code >= 32 && code !== 127)) out += char;
  }
  return out;
}

const clean = (value: unknown) =>
  typeof value === 'string'
    ? stripControlChars(value)
        .replace(/[ \t]{3,}/g, '  ')
        .trim()
    : value;

const text = (min: number, max: number) => z.preprocess(clean, z.string().min(min).max(max));
const optionalText = (max: number) =>
  z.preprocess(
    (value) => {
      const cleaned = clean(value);
      return cleaned === '' ? undefined : cleaned;
    },
    z.string().max(max).optional(),
  );

const optionalUrl = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.url({ protocol: /^https?$/ }).max(2048).optional(),
);

export const INQUIRY_TYPES = [
  'SPORTS_FACILITY',
  'CRICKET',
  'BUSINESS',
  'PARTNERSHIP',
  'MEDIA',
  'EVENT',
  'GENERAL',
] as const;

export const INQUIRY_STATUSES = [
  'NEW',
  'CONTACTED',
  'IN_PROGRESS',
  'RESOLVED',
  'SPAM',
  'ARCHIVED',
] as const;

// ---------------------------------------------------------------------------
// Public: contact form
// ---------------------------------------------------------------------------

// Messages here are shown to visitors, so they say what to do rather than
// describing the type that failed.
export const contactSchema = z.object({
  name: z.preprocess(
    clean,
    z.string({ error: 'Please enter your full name.' }).min(2, 'Please enter your full name.').max(120),
  ),
  email: z.preprocess(
    clean,
    z
      .email({ error: 'Please enter a valid email address.' })
      .max(254, 'That email address is too long.'),
  ),
  phone: optionalText(32),
  organization: optionalText(160),
  subject: z.preprocess(
    clean,
    z
      .string({ error: 'Please add a short subject.' })
      .min(3, 'Please add a short subject.')
      .max(180, 'Please keep the subject under 180 characters.'),
  ),
  message: z.preprocess(
    clean,
    z
      .string({ error: 'Please write a message.' })
      .min(20, 'Please write at least 20 characters so the message is actionable.')
      .max(5000, 'Please keep the message under 5000 characters.'),
  ),
  inquiryType: z.enum(INQUIRY_TYPES).default('GENERAL'),
  consent: z.literal(true, { error: 'Consent is required before we can store your message.' }),
  // Honeypot. Accepted rather than rejected: the route scores it as spam and
  // returns a normal success response, so a bot learns nothing about the trap
  // and an over-eager autofill extension never shows a real visitor an error.
  website: z.string().max(200).optional(),
  // Round-trip timestamp used to reject instant submissions.
  renderedAt: z.coerce.number().int().optional(),
  sourcePage: optionalText(300),
  utmSource: optionalText(160),
  utmMedium: optionalText(160),
  utmCampaign: optionalText(160),
  utmTerm: optionalText(160),
  utmContent: optionalText(160),
});

export type ContactInput = z.infer<typeof contactSchema>;

// ---------------------------------------------------------------------------
// Public: analytics ingestion
// ---------------------------------------------------------------------------

export const ANALYTICS_EVENT_NAMES = [
  'page_view',
  'session_start',
  'contact_form_view',
  'contact_form_start',
  'contact_form_submit',
  'external_link_click',
  'media_open',
  'red_ball_link_click',
  'business_link_click',
] as const;

export const analyticsEventSchema = z.object({
  name: z.enum(ANALYTICS_EVENT_NAMES),
  path: z.string().max(300).default('/'),
  referrer: z.string().max(600).optional(),
  sessionKey: z.string().min(8).max(64).optional(),
  durationSec: z.number().int().min(0).max(86_400).optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  utm: z
    .object({
      source: z.string().max(160).optional(),
      medium: z.string().max(160).optional(),
      campaign: z.string().max(160).optional(),
      term: z.string().max(160).optional(),
      content: z.string().max(160).optional(),
    })
    .optional(),
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;

// ---------------------------------------------------------------------------
// Admin: authentication
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.preprocess(clean, z.email().max(254)),
  password: z.string().min(1).max(200),
  totp: z.string().regex(/^\d{6}$/).optional().or(z.literal('')),
});

export const passwordResetRequestSchema = z.object({
  email: z.preprocess(clean, z.email().max(254)),
});

export const passwordResetSchema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(12).max(200),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(12).max(200),
});

// ---------------------------------------------------------------------------
// Admin: content
// ---------------------------------------------------------------------------

export const profileSchema = z.object({
  fullName: text(2, 120),
  headline: text(2, 160),
  positioning: text(2, 240),
  shortBio: text(10, 600),
  longBio: text(10, 12_000),
  birthDate: z.coerce.date().optional().nullable(),
  birthPlace: optionalText(200),
  currentCity: optionalText(120),
  region: optionalText(120),
  country: optionalText(120),
  education: optionalText(160),
  educationBody: optionalText(200),
  portraitUrl: optionalUrl.nullable(),
  portraitAlt: optionalText(240),
  email: z.preprocess(clean, z.email().max(254).optional().or(z.literal(''))),
  phone: optionalText(40),
  socialLinks: z
    .array(z.object({ label: text(1, 60), url: z.url().max(600) }))
    .max(12)
    .default([]),
});

export const timelineSchema = z.object({
  slug: text(2, 90),
  yearLabel: text(1, 60),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  title: text(2, 160),
  summary: text(10, 2000),
  category: z.enum(['ORIGIN', 'CRICKET', 'INTERNATIONAL', 'INFRASTRUCTURE', 'BUSINESS', 'EDUCATION']),
  location: optionalText(160),
  country: optionalText(120),
  isVerified: z.coerce.boolean().default(false),
  needsSource: z.coerce.boolean().default(true),
  isPublished: z.coerce.boolean().default(true),
});

export const facilitySchema = z.object({
  slug: text(2, 90),
  name: text(2, 120),
  group: z.enum(['CRICKET', 'RACQUET', 'FITNESS', 'HOSPITALITY']),
  quantity: z.coerce.number().int().min(0).max(999).optional().nullable(),
  unitLabel: optionalText(60),
  description: text(10, 2000),
  iconKey: optionalText(40),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isPublished: z.coerce.boolean().default(true),
});

export const sportsEventSchema = z.object({
  slug: text(2, 90),
  name: text(2, 160),
  category: z.enum([
    'CORPORATE_LEAGUE',
    'OPEN_TOURNAMENT',
    'BCCI_U14',
    'BCCI_U16',
    'BCCI_U19',
    'OTHER',
  ]),
  yearLabel: optionalText(40),
  organizer: optionalText(160),
  summary: text(10, 2000),
  venue: optionalText(160),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isPublished: z.coerce.boolean().default(true),
});

export const playerSchema = z.object({
  slug: text(2, 90),
  name: text(2, 120),
  teamContext: optionalText(120),
  level: optionalText(80),
  associationType: z.enum([
    'PLAYED_AT_FACILITY',
    'TRAINED_AT_ACADEMY',
    'GUEST_APPEARANCE',
    'TOURNAMENT_PARTICIPANT',
    'UNSPECIFIED',
  ]),
  associationNote: text(5, 500),
  photoUrl: optionalUrl.nullable(),
  photoAlt: optionalText(240),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isPublished: z.coerce.boolean().default(true),
});

export const businessSchema = z.object({
  slug: text(2, 90),
  name: text(2, 140),
  role: text(2, 90),
  category: optionalText(90),
  description: text(10, 4000),
  logoUrl: optionalUrl.nullable(),
  websiteUrl: optionalUrl.nullable(),
  bookingUrl: optionalUrl.nullable(),
  location: optionalText(240),
  contactEmail: z.preprocess(clean, z.email().max(254).optional().or(z.literal(''))),
  contactPhone: optionalText(40),
  socialLinks: z
    .array(z.object({ label: text(1, 60), url: z.url().max(600) }))
    .max(12)
    .default([]),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isPublished: z.coerce.boolean().default(true),
});

export const statSchema = z.object({
  key: text(2, 60),
  value: text(1, 40),
  label: text(2, 120),
  description: optionalText(400),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isPublished: z.coerce.boolean().default(true),
});

export const faqSchema = z.object({
  slug: text(2, 90),
  question: text(5, 240),
  answer: text(10, 4000),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isPublished: z.coerce.boolean().default(true),
});

// ---------------------------------------------------------------------------
// Admin: media and verification
// ---------------------------------------------------------------------------

export const mediaSchema = z.object({
  slug: text(2, 120),
  title: text(3, 240),
  publication: optionalText(160),
  publishedOn: z.coerce.date().optional().nullable(),
  category: z.enum([
    'NORWAY_CRICKET',
    'INTERNATIONAL_CLUB_CRICKET',
    'RED_BALL_GROUND',
    'SPORTS_INFRASTRUCTURE',
    'BUSINESS',
    'PLAYER_ASSOCIATIONS',
    'EVENTS',
    'OTHER',
  ]),
  mediaType: z.enum([
    'NEWSPAPER_ARTICLE',
    'NEWSPAPER_CLIPPING',
    'ONLINE_ARTICLE',
    'INTERVIEW',
    'VIDEO',
    'PHOTO',
    'PDF',
    'EXTERNAL_REFERENCE',
  ]),
  description: optionalText(4000),
  thumbnailUrl: optionalUrl.nullable(),
  thumbnailAlt: optionalText(240),
  externalUrl: optionalUrl.nullable(),
  sourceNote: optionalText(400),
  status: z.enum(['UNVERIFIED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED']).default('UNVERIFIED'),
  isPublished: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const verificationSchema = z.object({
  claim: text(5, 2000),
  subjectType: z
    .enum(['TIMELINE_EVENT', 'SPORTS_EVENT', 'PLAYER', 'MEDIA_ARTICLE', 'STANDALONE_CLAIM'])
    .default('STANDALONE_CLAIM'),
  sourceType: z
    .enum([
      'NEWSPAPER',
      'MAGAZINE',
      'ONLINE_PUBLICATION',
      'BROADCAST',
      'OFFICIAL_RECORD',
      'CLUB_WEBSITE',
      'INSTITUTIONAL_WEBSITE',
      'TOURNAMENT_RECORD',
      'OTHER',
    ])
    .default('OTHER'),
  publication: optionalText(200),
  publishedOn: z.coerce.date().optional().nullable(),
  sourceUrl: optionalUrl.nullable(),
  evidenceUrl: optionalText(600),
  evidenceName: optionalText(240),
  status: z.enum(['UNVERIFIED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED']).default('UNVERIFIED'),
  adminNotes: optionalText(4000),
  timelineEventId: optionalText(40).nullable(),
  sportsEventId: optionalText(40).nullable(),
  playerId: optionalText(40).nullable(),
  mediaArticleId: optionalText(40).nullable(),
});

// ---------------------------------------------------------------------------
// Admin: inquiries, users, SEO, settings
// ---------------------------------------------------------------------------

export const inquiryUpdateSchema = z.object({
  status: z.enum(INQUIRY_STATUSES).optional(),
  assignedToId: z.string().max(40).nullable().optional(),
});

export const inquiryNoteSchema = z.object({ body: text(1, 4000) });

export const adminUserCreateSchema = z.object({
  name: text(2, 120),
  email: z.preprocess(clean, z.email().max(254)),
  password: z.string().min(12).max(200),
  role: z.enum(['SUPER_ADMIN', 'CONTENT_ADMIN', 'INQUIRY_MANAGER', 'ANALYTICS_VIEWER']),
});

export const adminUserUpdateSchema = z.object({
  name: text(2, 120).optional(),
  role: z.enum(['SUPER_ADMIN', 'CONTENT_ADMIN', 'INQUIRY_MANAGER', 'ANALYTICS_VIEWER']).optional(),
  isActive: z.coerce.boolean().optional(),
  password: z.string().min(12).max(200).optional().or(z.literal('')),
});

export const seoSchema = z.object({
  path: z.preprocess(clean, z.string().regex(/^\/[a-z0-9\-\/]*$/, 'Use a clean path like /cricket')),
  title: text(3, 70),
  description: text(20, 320),
  keywords: optionalText(400),
  ogImageUrl: optionalUrl.nullable(),
  canonicalPath: optionalText(300),
  noindex: z.coerce.boolean().default(false),
});

export const settingSchema = z.object({
  key: text(2, 80),
  value: z.unknown(),
  group: optionalText(60),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export type FieldErrors = Record<string, string>;

/** Flattens a Zod error into a `field -> first message` map for form display. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join('.') : 'form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
