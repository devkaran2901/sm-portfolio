import type { Metadata } from 'next';
import { siteUrl } from './env';
import { SITE } from '@/content/defaults';

/**
 * Metadata builders.
 *
 * Titles and descriptions target legitimate search intent (name, place,
 * facility) and describe what is actually on the page. No keyword stuffing and
 * no claims that the page does not support.
 */

export type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  /** Overrides the default social image. */
  image?: string;
  noindex?: boolean;
  keywords?: string[];
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
};

export function absoluteUrl(path: string): string {
  const base = siteUrl();
  if (!path || path === '/') return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildMetadata(input: PageMetaInput): Metadata {
  const url = absoluteUrl(input.path);
  // Generated on demand by src/app/og/route.tsx so it always matches the brand.
  const image = input.image ?? '/og';

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: { canonical: url },
    robots: input.noindex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
        },
    openGraph: {
      type: input.type ?? 'website',
      url,
      siteName: SITE.name,
      title: input.title,
      description: input.description,
      locale: SITE.locale,
      images: [{ url: absoluteUrl(image), width: 1200, height: 630, alt: input.title }],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [absoluteUrl(image)],
    },
  };
}

export type Breadcrumb = { name: string; path: string };

export function breadcrumbsFor(path: string, label: string): Breadcrumb[] {
  if (path === '/') return [{ name: 'Home', path: '/' }];
  return [
    { name: 'Home', path: '/' },
    { name: label, path },
  ];
}
