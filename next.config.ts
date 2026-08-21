import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    /*
     * Next 16 only serves the qualities named here - anything else is a 400,
     * not a fallback - and the default list is [75] alone. 90 is used on the
     * supplied photographs: several are close to their display size, where
     * compression artefacts are magnified rather than hidden.
     */
    qualities: [75, 90],
    remotePatterns: [
      { protocol: 'https', hostname: '**.redballsportsarena.in' },
      { protocol: 'https', hostname: 'redballsportsarena.in' },
    ],
  },
  async redirects() {
    return [
      // /cricket merged into /about: both pages were biography, and splitting
      // them made a reader visit two URLs for one story. Permanent so search
      // moves its ranking across rather than treating /about as a new page.
      { source: '/cricket', destination: '/about', permanent: true },
    ];
  },

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Admin surfaces must never be cached or indexed.
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
      },
    ];
  },
};

export default nextConfig;
