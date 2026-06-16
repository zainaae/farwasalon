import { NextResponse } from 'next/server'
import {
  fetchPlaceReviews,
  isGooglePlacesConfigured,
} from '../../../lib/google-places.js'
import { checkRateLimit } from '../../../lib/rate-limit.js'
import { logger, hashIp, errCtx } from '../../../lib/logger.js'

export const revalidate = 86400

export async function GET(request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rl = checkRateLimit(ip, { window: 60, max: 30 })
  if (rl.limited) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    )
  }

  if (!isGooglePlacesConfigured()) {
    return NextResponse.json(
      { configured: false, source: 'fallback' },
      { headers: { 'Cache-Control': 'public, max-age=300' } },
    )
  }

  try {
    const result = await fetchPlaceReviews()
    if (!result.ok) {
      if (result.error === 'not-configured') {
        return NextResponse.json(
          { configured: false, source: 'fallback' },
          { headers: { 'Cache-Control': 'public, max-age=300' } },
        )
      }
      logger.error('/api/reviews', 'places-fetch-failed', {
        ip: hashIp(ip),
        status: result.status,
        detail: result.detail,
      })
      return NextResponse.json(
        { configured: true, source: 'fallback', error: 'unavailable' },
        { status: 502 },
      )
    }

    return NextResponse.json(
      {
        configured: true,
        source: 'google',
        rating: result.rating,
        reviewCount: result.reviewCount,
        reviews: result.reviews,
      },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=86400, stale-while-revalidate=3600',
        },
      },
    )
  } catch (err) {
    logger.error('/api/reviews', 'places-exception', {
      ip: hashIp(ip),
      ...errCtx(err),
    })
    return NextResponse.json(
      { configured: true, source: 'fallback', error: 'unavailable' },
      { status: 502 },
    )
  }
}
