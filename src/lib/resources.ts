import 'server-only';

import type { ZodType } from 'zod';

import { prisma } from './db';
import type { PermissionKey } from './permissions';
import {
  businessSchema,
  facilitySchema,
  faqSchema,
  playerSchema,
  sportsEventSchema,
  statSchema,
  timelineSchema,
} from './validation';

/**
 * Content resource registry.
 *
 * The CMS collections are structurally identical (list, create, read, update,
 * delete) so they share one pair of route handlers. Each entry supplies its own
 * schema, permission and Prisma operations, which keeps the routes free of
 * per-model branching while every model keeps its real types.
 */

export type ResourceDefinition = {
  label: string;
  /** Human-readable singular, used in audit summaries. */
  singular: string;
  readPermission: PermissionKey;
  writePermission: PermissionKey;
  deletePermission: PermissionKey;
  schema: ZodType<Record<string, unknown>>;
  list: (args: { skip: number; take: number; search?: string }) => Promise<unknown[]>;
  count: (args: { search?: string }) => Promise<number>;
  find: (id: string) => Promise<unknown | null>;
  create: (data: Record<string, unknown>) => Promise<{ id: string }>;
  update: (id: string, data: Record<string, unknown>) => Promise<{ id: string }>;
  remove: (id: string) => Promise<unknown>;
  /** Field used to build a readable audit summary. */
  titleField: string;
};

const contentPermissions = {
  readPermission: 'content:read',
  writePermission: 'content:write',
  deletePermission: 'content:delete',
} as const;

function searchFilter(fields: string[], search?: string) {
  if (!search) return {};
  return {
    OR: fields.map((field) => ({
      [field]: { contains: search, mode: 'insensitive' as const },
    })),
  };
}

export const RESOURCES: Record<string, ResourceDefinition> = {
  timeline: {
    label: 'Cricket journey',
    singular: 'timeline event',
    ...contentPermissions,
    schema: timelineSchema as unknown as ZodType<Record<string, unknown>>,
    titleField: 'title',
    list: ({ skip, take, search }) =>
      prisma.timelineEvent.findMany({
        where: searchFilter(['title', 'summary', 'slug'], search),
        orderBy: { sortOrder: 'asc' },
        skip,
        take,
        include: { verifications: { select: { id: true, status: true } } },
      }),
    count: ({ search }) =>
      prisma.timelineEvent.count({ where: searchFilter(['title', 'summary', 'slug'], search) }),
    find: (id) => prisma.timelineEvent.findUnique({ where: { id } }),
    create: (data) => prisma.timelineEvent.create({ data: data as never, select: { id: true } }),
    update: (id, data) =>
      prisma.timelineEvent.update({ where: { id }, data: data as never, select: { id: true } }),
    remove: (id) => prisma.timelineEvent.delete({ where: { id } }),
  },

  facilities: {
    label: 'Facilities',
    singular: 'facility',
    ...contentPermissions,
    schema: facilitySchema as unknown as ZodType<Record<string, unknown>>,
    titleField: 'name',
    list: ({ skip, take, search }) =>
      prisma.facility.findMany({
        where: searchFilter(['name', 'description', 'slug'], search),
        orderBy: { sortOrder: 'asc' },
        skip,
        take,
        include: { _count: { select: { images: true } } },
      }),
    count: ({ search }) =>
      prisma.facility.count({ where: searchFilter(['name', 'description', 'slug'], search) }),
    find: (id) => prisma.facility.findUnique({ where: { id }, include: { images: true } }),
    create: (data) => prisma.facility.create({ data: data as never, select: { id: true } }),
    update: (id, data) =>
      prisma.facility.update({ where: { id }, data: data as never, select: { id: true } }),
    remove: (id) => prisma.facility.delete({ where: { id } }),
  },

  events: {
    label: 'Sports events',
    singular: 'event',
    ...contentPermissions,
    schema: sportsEventSchema as unknown as ZodType<Record<string, unknown>>,
    titleField: 'name',
    list: ({ skip, take, search }) =>
      prisma.sportsEvent.findMany({
        where: searchFilter(['name', 'summary', 'slug'], search),
        orderBy: { sortOrder: 'asc' },
        skip,
        take,
        include: { verifications: { select: { id: true, status: true } } },
      }),
    count: ({ search }) =>
      prisma.sportsEvent.count({ where: searchFilter(['name', 'summary', 'slug'], search) }),
    find: (id) => prisma.sportsEvent.findUnique({ where: { id } }),
    create: (data) => prisma.sportsEvent.create({ data: data as never, select: { id: true } }),
    update: (id, data) =>
      prisma.sportsEvent.update({ where: { id }, data: data as never, select: { id: true } }),
    remove: (id) => prisma.sportsEvent.delete({ where: { id } }),
  },

  players: {
    label: 'Players',
    singular: 'player association',
    ...contentPermissions,
    schema: playerSchema as unknown as ZodType<Record<string, unknown>>,
    titleField: 'name',
    list: ({ skip, take, search }) =>
      prisma.player.findMany({
        where: searchFilter(['name', 'teamContext', 'slug'], search),
        orderBy: { sortOrder: 'asc' },
        skip,
        take,
        include: { verifications: { select: { id: true, status: true } } },
      }),
    count: ({ search }) =>
      prisma.player.count({ where: searchFilter(['name', 'teamContext', 'slug'], search) }),
    find: (id) => prisma.player.findUnique({ where: { id } }),
    create: (data) => prisma.player.create({ data: data as never, select: { id: true } }),
    update: (id, data) =>
      prisma.player.update({ where: { id }, data: data as never, select: { id: true } }),
    remove: (id) => prisma.player.delete({ where: { id } }),
  },

  ventures: {
    label: 'Business ventures',
    singular: 'venture',
    ...contentPermissions,
    schema: businessSchema as unknown as ZodType<Record<string, unknown>>,
    titleField: 'name',
    list: ({ skip, take, search }) =>
      prisma.business.findMany({
        where: searchFilter(['name', 'description', 'slug'], search),
        orderBy: { sortOrder: 'asc' },
        skip,
        take,
        include: { _count: { select: { images: true } } },
      }),
    count: ({ search }) =>
      prisma.business.count({ where: searchFilter(['name', 'description', 'slug'], search) }),
    find: (id) => prisma.business.findUnique({ where: { id }, include: { images: true } }),
    create: (data) => prisma.business.create({ data: data as never, select: { id: true } }),
    update: (id, data) =>
      prisma.business.update({ where: { id }, data: data as never, select: { id: true } }),
    remove: (id) => prisma.business.delete({ where: { id } }),
  },

  stats: {
    label: 'Statistics',
    singular: 'statistic',
    ...contentPermissions,
    schema: statSchema as unknown as ZodType<Record<string, unknown>>,
    titleField: 'label',
    list: ({ skip, take, search }) =>
      prisma.siteStat.findMany({
        where: searchFilter(['label', 'key'], search),
        orderBy: { sortOrder: 'asc' },
        skip,
        take,
      }),
    count: ({ search }) => prisma.siteStat.count({ where: searchFilter(['label', 'key'], search) }),
    find: (id) => prisma.siteStat.findUnique({ where: { id } }),
    create: (data) => prisma.siteStat.create({ data: data as never, select: { id: true } }),
    update: (id, data) =>
      prisma.siteStat.update({ where: { id }, data: data as never, select: { id: true } }),
    remove: (id) => prisma.siteStat.delete({ where: { id } }),
  },

  faqs: {
    label: 'FAQ',
    singular: 'FAQ item',
    ...contentPermissions,
    schema: faqSchema as unknown as ZodType<Record<string, unknown>>,
    titleField: 'question',
    list: ({ skip, take, search }) =>
      prisma.faqItem.findMany({
        where: searchFilter(['question', 'answer', 'slug'], search),
        orderBy: { sortOrder: 'asc' },
        skip,
        take,
      }),
    count: ({ search }) =>
      prisma.faqItem.count({ where: searchFilter(['question', 'answer', 'slug'], search) }),
    find: (id) => prisma.faqItem.findUnique({ where: { id } }),
    create: (data) => prisma.faqItem.create({ data: data as never, select: { id: true } }),
    update: (id, data) =>
      prisma.faqItem.update({ where: { id }, data: data as never, select: { id: true } }),
    remove: (id) => prisma.faqItem.delete({ where: { id } }),
  },
};

export type ResourceKey = keyof typeof RESOURCES;

export function getResource(key: string): ResourceDefinition | null {
  return Object.hasOwn(RESOURCES, key) ? RESOURCES[key]! : null;
}
