const PLACES_BASE = 'https://places.googleapis.com/v1/places'
const FIELD_MASK = 'rating,userRatingCount,reviews'

export function isGooglePlacesConfigured() {
  return Boolean(
    process.env.GOOGLE_PLACES_API_KEY?.trim() &&
      process.env.GOOGLE_PLACE_ID?.trim(),
  )
}

export function getGooglePlaceId() {
  return process.env.GOOGLE_PLACE_ID?.trim() || null
}

function normalizeReview(review) {
  const name = review?.authorAttribution?.displayName || 'Google user'
  const quote = review?.text?.text || ''
  const link =
    review?.authorAttribution?.uri || 'https://g.page/farwasalon/review'
  return {
    name,
    quote,
    translation: null,
    link,
    rating: review?.rating ?? null,
    relativeTime: review?.relativePublishTimeDescription || null,
    source: 'google',
  }
}

/**
 * Fetch rating + up to 5 reviews from Places API (New).
 * @param {{ apiKey?: string, placeId?: string }} opts
 */
export async function fetchPlaceReviews({ apiKey, placeId } = {}) {
  const key = apiKey?.trim() || process.env.GOOGLE_PLACES_API_KEY?.trim()
  const id = placeId?.trim() || process.env.GOOGLE_PLACE_ID?.trim()

  if (!key || !id) {
    return { ok: false, error: 'not-configured' }
  }

  const url = `${PLACES_BASE}/${encodeURIComponent(id)}`
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    next: { revalidate: 86400 },
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    return {
      ok: false,
      error: 'api-error',
      status: res.status,
      detail: detail.slice(0, 300),
    }
  }

  const data = await res.json()
  const reviews = (data.reviews || [])
    .filter((r) => r?.text?.text)
    .map(normalizeReview)

  return {
    ok: true,
    rating: data.rating ?? null,
    reviewCount: data.userRatingCount ?? null,
    reviews,
  }
}
