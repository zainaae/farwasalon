import { ImageResponse } from 'next/og'
import { GOOGLE_GBP_STATS } from '../src/google-reviews-data.js'
import { SERVICES } from '../src/data.js'

/* Same art as opengraph-image. Avoid ★ — Satori dynamic-font fetch has 400'd in CI. */
const SERVICE_COUNT = Object.values(SERVICES).reduce((n, list) => n + list.length, 0)

export const alt = `Farwa Beauty Salon — PECHS Karachi · ${GOOGLE_GBP_STATS.rating}/5 · ${SERVICE_COUNT} printed prices · book online`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Twitter card — same art as opengraph-image (no stock photography). */
export default function TwitterImage() {
  const ratingLine = `${GOOGLE_GBP_STATS.rating}/5 · ${GOOGLE_GBP_STATS.reviewCount} Google reviews`
  const count = String(SERVICE_COUNT)
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
            PECHS · Karachi · women-only
          </div>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            Farwa Beauty Salon
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ fontSize: 28, fontWeight: 600 }}>{ratingLine}</div>
            <div style={{ fontSize: 22, opacity: 0.85 }}>{count} printed prices · live online booking</div>
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-0.04em',
            }}
          >
            {count}
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
