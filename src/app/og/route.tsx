import { ImageResponse } from 'next/og';

import { SITE } from '@/content/defaults';

/**
 * Default social sharing image, rendered on demand.
 *
 * Generated rather than shipped as a binary so it stays in sync with the brand
 * palette, and so it can be regenerated per-title later without new artwork.
 */
export const runtime = 'nodejs';
export const revalidate = 86_400;

const WIDTH = 1200;
const HEIGHT = 630;

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') ?? SITE.name).slice(0, 90);
  const subtitle = (
    searchParams.get('subtitle') ?? 'Sports Infrastructure Founder · Rohtak, Haryana'
  ).slice(0, 120);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #070E1A 0%, #0C1A30 55%, #132743 100%)',
          color: '#E3EDF6',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: '#A9C6E4',
              display: 'flex',
            }}
          />
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: '#A9C6E4',
              display: 'flex',
            }}
          >
            {SITE.domain}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 82, lineHeight: 1.05, fontWeight: 700, display: 'flex' }}>
            {title}
          </div>
          <div style={{ fontSize: 30, color: '#C4D6E8', lineHeight: 1.3, display: 'flex' }}>
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #1E3A5F',
            paddingTop: 28,
            fontSize: 24,
            color: '#93AECB',
          }}
        >
          <div style={{ display: 'flex' }}>Red Ball Cricket Ground</div>
          <div style={{ display: 'flex' }}>Rohtak · Haryana · India</div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  );
}
