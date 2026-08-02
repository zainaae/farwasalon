import { describe, it, expect, vi } from 'vitest'

vi.mock('../src/google-reviews-data.js', () => ({
  GOOGLE_GBP_STATS: { rating: 4.9, reviewCount: 6 },
  GOOGLE_REVIEWS: [
    { name: 'Ayesha K.', rating: 5, text: 'Lovely bridal work!', relativeTime: '2 months ago' },
    { name: 'Low star', rating: 3, text: 'Should be filtered out' },
    { name: 'Empty', rating: 5, text: '   ' },
  ],
}))

import {
  getManualGoogleReviews,
  normalizeManualReview,
  getManualReviewsPayload,
  getGbpStatsForDisplay,
} from './google-reviews.js'

describe('google-reviews manual helpers', () => {
  it('filters to 4+ stars with non-empty text', () => {
    const reviews = getManualGoogleReviews()
    expect(reviews).toHaveLength(1)
    expect(reviews[0].name).toBe('Ayesha K.')
  })

  it('normalizes manual review shape for the homepage', () => {
    const normalized = normalizeManualReview({
      name: 'Sara M.',
      rating: 5,
      text: 'Great threading',
      relativeTime: '1 week ago',
    })
    expect(normalized).toMatchObject({
      name: 'Sara M.',
      quote: 'Great threading',
      source: 'google',
      link: 'https://g.page/farwasalon/review',
      postedAt: null,
    })
    expect(normalized).not.toHaveProperty('relativeTime')
  })

  it('builds manual payload with GBP stats', () => {
    const payload = getManualReviewsPayload()
    expect(payload).toMatchObject({
      source: 'google-manual',
      configured: false,
      rating: 4.9,
      reviewCount: 6,
    })
    expect(payload.reviews).toHaveLength(1)
  })

  it('returns GBP stats for display when env is unset', () => {
    expect(getGbpStatsForDisplay()).toEqual({ rating: 4.9, reviewCount: 6 })
  })
})
