/**
 * Database seed.
 *
 * Populates roles, permissions, the bootstrap super admin and the launch
 * content from `src/content/defaults.ts`.
 *
 * It seeds NO media articles, NO press coverage and NO analytics. Those tables
 * start empty by design: press items are uploaded from the admin portal with a
 * source attached, and analytics only ever contain real traffic.
 *
 * Safe to re-run: every write is an upsert keyed on a natural unique field.
 */

import { Prisma, PrismaClient, type RoleName } from '@prisma/client';
import bcrypt from 'bcryptjs';

import {
  BUSINESSES,
  EVENTS,
  FACILITIES,
  FAQS,
  OPEN_CLAIMS,
  PLAYERS,
  PROFILE,
  SITE,
  STATS,
  TIMELINE,
} from '../src/content/defaults';
import { PERMISSIONS, ROLE_DESCRIPTIONS, ROLE_PERMISSIONS } from '../src/lib/permissions';

const prisma = new PrismaClient();

async function seedAccessControl() {
  for (const [key, meta] of Object.entries(PERMISSIONS)) {
    await prisma.permission.upsert({
      where: { key },
      update: { label: meta.label, group: meta.group },
      create: { key, label: meta.label, group: meta.group },
    });
  }

  for (const [roleName, permissionKeys] of Object.entries(ROLE_PERMISSIONS)) {
    const name = roleName as RoleName;
    const meta = ROLE_DESCRIPTIONS[name];
    await prisma.role.upsert({
      where: { name },
      update: {
        label: meta.label,
        description: meta.description,
        permissions: { set: permissionKeys.map((key) => ({ key })) },
      },
      create: {
        name,
        label: meta.label,
        description: meta.description,
        permissions: { connect: permissionKeys.map((key) => ({ key })) },
      },
    });
  }
  console.log(`  roles: ${Object.keys(ROLE_PERMISSIONS).length}, permissions: ${Object.keys(PERMISSIONS).length}`);
}

async function seedAdminUser() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME?.trim() || 'Site Administrator';

  if (!email) {
    console.log('  admin user: skipped (set SEED_ADMIN_EMAIL to create one)');
    return;
  }
  if (!password || password.length < 12) {
    console.log('  admin user: skipped - SEED_ADMIN_PASSWORD must be at least 12 characters');
    return;
  }

  const role = await prisma.role.findUniqueOrThrow({ where: { name: 'SUPER_ADMIN' } });
  const existing = await prisma.adminUser.findUnique({ where: { email } });

  if (existing) {
    console.log(`  admin user: ${email} already exists, left untouched`);
    return;
  }

  await prisma.adminUser.create({
    data: {
      email,
      name,
      passwordHash: await bcrypt.hash(password, 12),
      roleId: role.id,
      // Force a change on first sign-in: the seed password lives in a shell history.
      mustChangePassword: true,
    },
  });
  console.log(`  admin user: created ${email} (must change password on first login)`);
}

async function seedProfile() {
  const data = {
    fullName: PROFILE.fullName,
    headline: PROFILE.headline,
    positioning: PROFILE.positioning,
    shortBio: PROFILE.shortBio,
    longBio: PROFILE.longBio,
    birthDate: new Date(PROFILE.birthDate),
    birthPlace: PROFILE.birthPlace,
    currentCity: PROFILE.currentCity,
    region: PROFILE.region,
    country: PROFILE.country,
    education: PROFILE.education,
    educationBody: PROFILE.educationBody,
    portraitUrl: PROFILE.portraitUrl,
    portraitAlt: PROFILE.portraitAlt,
    socialLinks: PROFILE.socialLinks,
  };

  await prisma.profile.upsert({ where: { id: 'primary' }, update: data, create: { id: 'primary', ...data } });
  console.log('  profile: upserted');
}

async function seedContent() {
  for (const item of TIMELINE) {
    const data = {
      yearLabel: item.yearLabel,
      sortOrder: item.sortOrder,
      title: item.title,
      summary: item.summary,
      category: item.category,
      location: item.location ?? null,
      country: item.country ?? null,
      needsSource: item.needsSource,
      isPublished: true,
    };
    await prisma.timelineEvent.upsert({
      where: { slug: item.slug },
      update: data,
      create: { slug: item.slug, ...data },
    });
  }
  console.log(`  timeline events: ${TIMELINE.length}`);

  for (const item of FACILITIES) {
    const data = {
      name: item.name,
      group: item.group,
      quantity: item.quantity,
      unitLabel: item.unitLabel,
      description: item.description,
      iconKey: item.iconKey,
      isFeatured: item.isFeatured,
      sortOrder: item.sortOrder,
      isPublished: true,
    };
    await prisma.facility.upsert({
      where: { slug: item.slug },
      update: data,
      create: { slug: item.slug, ...data },
    });
  }
  console.log(`  facilities: ${FACILITIES.length}`);

  for (const item of EVENTS) {
    const data = {
      name: item.name,
      category: item.category,
      organizer: item.organizer,
      summary: item.summary,
      sortOrder: item.sortOrder,
      isPublished: true,
    };
    await prisma.sportsEvent.upsert({
      where: { slug: item.slug },
      update: data,
      create: { slug: item.slug, ...data },
    });
  }
  console.log(`  sports events: ${EVENTS.length}`);

  for (const item of PLAYERS) {
    const data = {
      name: item.name,
      teamContext: item.teamContext,
      associationNote: item.associationNote,
      associationType: 'UNSPECIFIED' as const,
      sortOrder: item.sortOrder,
      isPublished: true,
    };
    await prisma.player.upsert({
      where: { slug: item.slug },
      update: data,
      create: { slug: item.slug, ...data },
    });
  }
  console.log(`  players: ${PLAYERS.length}`);

  for (const item of BUSINESSES) {
    const data = {
      name: item.name,
      role: item.role,
      category: item.category,
      description: item.description,
      sortOrder: item.sortOrder,
      isPublished: true,
    };
    await prisma.business.upsert({
      where: { slug: item.slug },
      update: data,
      create: { slug: item.slug, ...data },
    });
  }
  console.log(`  businesses: ${BUSINESSES.length}`);

  for (const item of STATS) {
    const data = {
      value: item.value,
      label: item.label,
      description: item.description,
      sortOrder: item.sortOrder,
      isPublished: true,
    };
    await prisma.siteStat.upsert({
      where: { key: item.key },
      update: data,
      create: { key: item.key, ...data },
    });
  }
  console.log(`  stats: ${STATS.length}`);

  for (const item of FAQS) {
    const data = {
      question: item.question,
      answer: item.answer,
      sortOrder: item.sortOrder,
      isPublished: true,
    };
    await prisma.faqItem.upsert({
      where: { slug: item.slug },
      update: data,
      create: { slug: item.slug, ...data },
    });
  }
  console.log(`  FAQ items: ${FAQS.length}`);
}

/**
 * Opens a verification record for every public claim that still needs a source.
 * They start UNVERIFIED - the archive is honest about what is not yet proven.
 */
async function seedOpenClaims() {
  let created = 0;
  for (const claim of OPEN_CLAIMS) {
    const existing = await prisma.verificationRecord.findFirst({ where: { claim } });
    if (existing) continue;
    await prisma.verificationRecord.create({
      data: {
        claim,
        status: 'UNVERIFIED',
        subjectType: 'STANDALONE_CLAIM',
        adminNotes: 'Seeded as an open claim. Attach a source, then set the status to Verified.',
      },
    });
    created += 1;
  }
  console.log(`  open verification records: ${created} created, ${OPEN_CLAIMS.length - created} already present`);
}

async function seedSeo() {
  const pages: Array<{ path: string; title: string; description: string }> = [
    {
      path: '/',
      title: 'Sonu Malik | Sports Infrastructure Founder, Rohtak',
      description: SITE.defaultDescription,
    },
    {
      path: '/about',
      title: 'About Sonu Malik | Rohtak, Haryana',
      description:
        'Born in Mokhra village, Rohtak, in 1988. LLM from Kalinga University. Founder of Red Ball Cricket Ground and owner of The Page and Hotel The Prada.',
    },
    {
      path: '/cricket',
      title: 'Cricket Journey | Sonu Malik',
      description:
        'From village cricket in Mokhra and collegiate cricket at Vaish College to international club cricket in South Africa, Nepal and Norway.',
    },
    {
      path: '/red-ball',
      title: 'Red Ball Cricket Ground, Rohtak | Multi-Sports Complex',
      description:
        'Red Ball Cricket Ground in Rohtak: two cricket grounds, two academies, box cricket, badminton, pickleball, gym, swimming pool and restaurant.',
    },
    {
      path: '/players',
      title: 'Players & Impact | Red Ball Cricket Ground',
      description:
        'More than 50 players who trained or played at Red Ball Cricket Ground have progressed to higher levels of competitive cricket.',
    },
    {
      path: '/ventures',
      title: 'Business Ventures | Sonu Malik',
      description: 'The Page and Hotel The Prada, founded and owned by Sonu Malik in Rohtak, Haryana.',
    },
    {
      path: '/media',
      title: 'Media, Press & Verified References | Sonu Malik',
      description:
        'Press coverage, interviews and verified public references relating to Sonu Malik and Red Ball Cricket Ground.',
    },
    {
      path: '/contact',
      title: 'Contact Sonu Malik | Rohtak, Haryana',
      description:
        'Get in touch about the sports facility, cricket, business, partnerships, media or events.',
    },
  ];

  for (const page of pages) {
    await prisma.seoSetting.upsert({
      where: { path: page.path },
      update: { title: page.title, description: page.description },
      create: page,
    });
  }
  console.log(`  SEO settings: ${pages.length}`);
}

async function seedSettings() {
  const settings: Array<{ key: string; value: unknown; group: string }> = [
    { key: 'site.redBallUrl', value: SITE.redBallUrl, group: 'general' },
    { key: 'site.contactEmailPublic', value: null, group: 'contact' },
    { key: 'site.contactPhonePublic', value: null, group: 'contact' },
    { key: 'privacy.analyticsDisclosure', value: true, group: 'privacy' },
    { key: 'inquiry.autoAcknowledge', value: true, group: 'inquiry' },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { group: setting.group },
      create: {
        key: setting.key,
        value: setting.value === null ? Prisma.JsonNull : (setting.value as Prisma.InputJsonValue),
        group: setting.group,
      },
    });
  }
  console.log(`  site settings: ${settings.length}`);
}

async function main() {
  console.log('Seeding database...');
  await seedAccessControl();
  await seedAdminUser();
  await seedProfile();
  await seedContent();
  await seedOpenClaims();
  await seedSeo();
  await seedSettings();
  console.log('Seed complete. Media, press and analytics tables are intentionally empty.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
