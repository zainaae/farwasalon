import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  isGooglePlacesConfigured,
  fetchPlaceReviews,
  getGooglePlaceId,
} from './google-places.js'

describe('isGooglePlacesConfigured', () => {
  afterEach(() => {
    delete process.env.GOOGLE_PLACES_API_KEY
    delete process.env.GOOGLE_PLACE_ID
  })

  it('returns false when env vars are missing', () => {
    expect(isGooglePlacesConfigured()).toBe(false)
  })

  it('returns true when key and place id are set', () => {
    process.env.GOOGLE_PLACES_API_KEY = 'test-key'
    process.env.GOOGLE_PLACE_ID = 'ChIJtest'
    expect(isGooglePlacesConfigured()).toBe(true)
    expect(getGooglePlaceId()).toBe('ChIJtest')
  })
})

describe('fetchPlaceReviews', () => {
  afterEach(() => {
    delete process.env.GOOGLE_PLACES_API_KEY
    delete process.env.GOOGLE_PLACE_ID
    vi.unstubAllGlobals()
  })

  it('returns not-configured without credentials', async () => {
    const result = await fetchPlaceReviews()
    expect(result.ok).toBe(false)
    expect(result.error).toBe('not-configured')
  })

  it('normalizes Places API response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          rating: 4.9,
          userRatingCount: 6,
          reviews: [
            {
              rating: 5,
              relativePublishTimeDescription: '2 weeks ago',
              text: { text: 'Lovely salon!', languageCode: 'en' },
              authorAttribution: {
                displayName: 'Ayesha K.',
                uri: 'https://maps.google.com/review',
              },
            },
          ],
        }),
      })),
    )

    const result = await fetchPlaceReviews({
      apiKey: 'key',
      placeId: 'ChIJtest',
    })

    expect(result.ok).toBe(true)
    expect(result.rating).toBe(4.9)
    expect(result.reviewCount).toBe(6)
    expect(result.reviews).toHaveLength(1)
    expect(result.reviews[0]).toMatchObject({
      name: 'Ayesha K.',
      quote: 'Lovely salon!',
      source: 'google',
      relativeTime: '2 weeks ago',
    })

    const [url, init] = fetch.mock.calls[0]
    expect(url).toContain('places/ChIJtest')
    expect(init.headers['X-Goog-FieldMask']).toBe(
      'rating,userRatingCount,reviews',
    )
  })

  it('surfaces API errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 403,
        text: async () => 'API key not valid',
      })),
    )

    const result = await fetchPlaceReviews({
      apiKey: 'bad',
      placeId: 'ChIJtest',
    })

    expect(result.ok).toBe(false)
    expect(result.error).toBe('api-error')
    expect(result.status).toBe(403)
  })
})
