import { ImageResponse } from 'next/og'

export const alt = 'Farwa Beauty Salon — PECHS Karachi · 4.6★ · printed prices · book online'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Default OG card — plum ground + type. No stock photography. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: '#6e2044',
          color: '#f7f3ef',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              opacity: 0.75,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            PECHS · Karachi
          </div>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            Farwa Beauty Salon
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ fontSize: 28, fontWeight: 600 }}>4.6★ · 19 Google reviews</div>
            <div style={{ fontSize: 22, opacity: 0.85 }}>102 printed prices · live online booking</div>
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-0.04em',
            }}
          >
            102
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
