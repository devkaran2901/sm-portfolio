import type { MetadataRoute } from 'next';

import { prisma, safeQuery } from '@/lib/db';
import { absoluteUrl } from '@/lib/seo';

/**
 * XML sitemap.
 *
 * Only public, indexable pages. The admin area and API routes are excluded by
 * construction, and any page an admin has marked noindex is filtered out here
 * too, so the sitemap never contradicts the robots directives.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: Array<{ path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' }> = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/red-ball', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/players', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/ventures', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/media', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/contact', priority: 0.7, changeFrequency: 'yearly' },
    { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/cookies', priority: 0.2, changeFrequency: 'yearly' },
  ];

  const noindexPaths = await safeQuery(
    async () => {
      const rows = await prisma.seoSetting.findMany({
        where: { noindex: true },
        select: { path: true },
      });
      return new Set(rows.map((row) => row.path));
    },
    new Set<string>(),
  );

  const lastModified = await safeQuery(
    async () => {
      const profile = await prisma.profile.findUnique({
        where: { id: 'primary' },
        select: { updatedAt: true },
      });
      return profile?.updatedAt ?? new Date();
    },
    new Date(),
  );

  return routes
    .filter((route) => !noindexPaths.has(route.path))
    .map((route) => ({
      url: absoluteUrl(route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }));
}
