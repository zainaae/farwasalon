import { NextResponse } from 'next/server'
import {
  fetchPlaceReviews,
  isGooglePlacesConfigured,
} from '../../../lib/google-places.js'
import { getManualReviewsPayload } from '../../../lib/google-reviews.js'
import { checkRateLimit, getClientIp } from '../../../lib/rate-limit.js'
import { logger, hashIp, errCtx } from '../../../lib/logger.js'

export const revalidate = 86400

const CACHE_HEADERS = { 'Cache-Control': 'public, max-age=300' }

function manualOrFallbackResponse() {
  const manual = getManualReviewsPayload()
  if (manual) {
    return NextResponse.json(manual, { headers: CACHE_HEADERS })
  }
  return NextResponse.json(
    { configured: false, source: 'fallback' },
    { headers: CACHE_HEADERS },
  )
}

export async function GET(request) {
  const ip = getClientIp(request)
  const rl = checkRateLimit(ip, { scope: 'reviews', window: 60, max: 30 })
  if (rl.limited) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    )
  }

  if (!isGooglePlacesConfigured()) {
    return manualOrFallbackResponse()
  }

  try {
    const result = await fetchPlaceReviews()
    if (!result.ok) {
      if (result.error === 'not-configured') {
        return manualOrFallbackResponse()
      }
      logger.error('/api/reviews', 'places-fetch-failed', {
        ip: hashIp(ip),
        status: result.status,
        detail: result.detail,
      })
      const manual = getManualReviewsPayload()
      if (manual) {
        return NextResponse.json(manual, { headers: CACHE_HEADERS })
      }
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
    const manual = getManualReviewsPayload()
    if (manual) {
      return NextResponse.json(manual, { headers: CACHE_HEADERS })
    }
    return NextResponse.json(
      { configured: true, source: 'fallback', error: 'unavailable' },
      { status: 502 },
    )
  }
}
