import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/lib/seo';
import { isProduction } from '@/lib/env';

/**
 * robots.txt
 *
 * Non-production deployments are disallowed wholesale so a staging copy cannot
 * compete with the real site in search results.
 *
 * AI crawlers are allowed deliberately: the point of the GEO work on this site
 * is for generative engines to read accurate, sourced information about Sonu
 * Malik rather than infer it from elsewhere.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      sitemap: absoluteUrl('/sitemap.xml'),
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/uploads/'],
      },
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot'],
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
