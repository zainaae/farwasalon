/**
 * The Google rating and review count do not update themselves.
 *
 * Production returns `configured: false` from /api/reviews, so the Places API
 * is not connected and every surface showing "4.6 / 19" — the review cards, the
 * aggregateRating on all 127 pages, the homepage meta description, all 13
 * category descriptions — is fed from two hand-maintained numbers in
 * src/google-reviews-data.js.
 *
 * A salon actively asking clients for reviews will pass 19 quickly. Nothing in
 * the system notices. This test is the thing that notices: it fails once the
 * figures are 90 days stale, and the fix is to read the two numbers off Google
 * Maps and set lastVerified to today.
 *
 * If this test is failing, that is it working. Do not extend the window to
 * silence it — check the numbers.
 */
import { describe, it, expect } from 'vitest'
import { GOOGLE_GBP_STATS, GOOGLE_REVIEWS, FACEBOOK_TESTIMONIALS } from './google-reviews-data.js'
import { describeReviewAge, formatReviewDate } from '../lib/google-reviews.js'

const MAX_AGE_DAYS = 90
const daysSince = (ymd) => Math.floor((Date.now() - Date.parse(`${ymd}T00:00:00Z`)) / 86_400_000)

describe('Google Business Profile figures are current', () => {
  it('records when the figures were last checked', () => {
    expect(GOOGLE_GBP_STATS.lastVerified, 'lastVerified is missing').toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('was verified in the last 90 days', () => {
    const age = daysSince(GOOGLE_GBP_STATS.lastVerified)
    expect(
      age,
      `The Google rating and review count were last checked ${age} days ago ` +
        `(${GOOGLE_GBP_STATS.lastVerified}) and still say ${GOOGLE_GBP_STATS.rating} / ` +
        `${GOOGLE_GBP_STATS.reviewCount}. Nothing syncs these from Google. Open the Maps ` +
        'listing, update rating and reviewCount in src/google-reviews-data.js, and set ' +
        'lastVerified to today.',
    ).toBeLessThanOrEqual(MAX_AGE_DAYS)
  })

  it('was not verified in the future', () => {
    expect(daysSince(GOOGLE_GBP_STATS.lastVerified)).toBeGreaterThanOrEqual(0)
  })
})

describe('the figures themselves are plausible', () => {
  it('rating is a real star rating', () => {
    expect(GOOGLE_GBP_STATS.rating).toBeGreaterThan(0)
    expect(GOOGLE_GBP_STATS.rating).toBeLessThanOrEqual(5)
  })

  it('review count is a whole positive number', () => {
    expect(Number.isInteger(GOOGLE_GBP_STATS.reviewCount)).toBe(true)
    expect(GOOGLE_GBP_STATS.reviewCount).toBeGreaterThan(0)
  })

  it('the count is never lower than the reviews actually quoted on the site', () => {
    // Quoting more reviews than the total claims would be visibly incoherent.
    expect(GOOGLE_GBP_STATS.reviewCount).toBeGreaterThanOrEqual(GOOGLE_REVIEWS.length)
  })

  it('every quoted review is 4 stars or better, as the file states', () => {
    for (const r of GOOGLE_REVIEWS) {
      expect(r.rating, r.name).toBeGreaterThanOrEqual(4)
      expect(r.rating, r.name).toBeLessThanOrEqual(5)
      expect(r.text?.trim().length, `${r.name} has no review text`).toBeGreaterThan(0)
    }
  })
})

describe('review ages are absolute, not frozen relative phrases', () => {
  it('every Google and Facebook testimonial has an absolute postedAt', () => {
    for (const r of [...GOOGLE_REVIEWS, ...FACEBOOK_TESTIMONIALS]) {
      expect(r.postedAt, r.name).toMatch(/^\d{4}-\d{2}(-\d{2})?$/)
      expect(r).not.toHaveProperty('relativeTime')
    }
  })

  it('old month-precision reviews render as archival dates, never “N weeks ago”', () => {
    const now = Date.parse('2026-08-02T12:00:00Z')
    for (const r of FACEBOOK_TESTIMONIALS) {
      const { label, isRelative } = describeReviewAge(r.postedAt, now)
      expect(isRelative, r.name).toBe(false)
      expect(label, r.name).toBe(formatReviewDate(r.postedAt))
      expect(label, r.name).not.toMatch(/weeks?\s+ago/i)
    }
  })
})
