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
          background: 'linear-gradient(135deg, #070B16 0%, #0A0E1A 52%, #141C33 100%)',
          color: '#F5F5F0',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: '#C0392B',
              display: 'flex',
            }}
          />
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: '#E0705C',
              display: 'flex',
            }}
          >
            {SITE.domain}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: 82,
              lineHeight: 1.05,
              fontWeight: 700,
              fontFamily: 'serif',
              display: 'flex',
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 30, color: '#B6BCCB', lineHeight: 1.3, display: 'flex' }}>
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            paddingTop: 28,
            fontSize: 24,
            color: '#9AA2B5',
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
