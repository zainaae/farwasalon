import {
  GOOGLE_REVIEWS,
  GOOGLE_GBP_STATS,
} from '../src/google-reviews-data.js'

const GOOGLE_REVIEW_LINK = 'https://g.page/farwasalon/review'
const MIN_RATING = 4

export function getManualGoogleReviews() {
  return GOOGLE_REVIEWS.filter(
    (r) => typeof r.rating === 'number' && r.rating >= MIN_RATING && r.text?.trim(),
  )
}

export function normalizeManualReview(review) {
  const name = review.name?.trim() || 'Google user'
  const quote = review.text?.trim() || ''
  return {
    name,
    quote,
    translation: review.translation?.trim() || null,
    link: review.sourceUrl?.trim() || GOOGLE_REVIEW_LINK,
    rating: review.rating,
    relativeTime: review.relativeTime?.trim() || null,
    source: 'google',
  }
}

export function getManualReviewsPayload() {
  const reviews = getManualGoogleReviews().map(normalizeManualReview)
  if (!reviews.length) return null

  const manualStats = getManualReviewStats()
  const gbpRating = GOOGLE_GBP_STATS.rating ?? manualStats?.rating
  const gbpCount = GOOGLE_GBP_STATS.reviewCount ?? manualStats?.reviewCount

  return {
    source: 'google-manual',
    configured: false,
    rating: gbpRating ?? null,
    reviewCount: gbpCount ?? reviews.length,
    reviews,
  }
}

export function getManualReviewStats() {
  const reviews = getManualGoogleReviews()
  if (!reviews.length) return null

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
  const avg = Math.round((sum / reviews.length) * 10) / 10

  return {
    rating: avg,
    reviewCount: reviews.length,
  }
}

export function getGbpStatsForDisplay() {
  const manual = getManualReviewStats()
  return {
    rating: GOOGLE_GBP_STATS.rating ?? manual?.rating ?? null,
    reviewCount: GOOGLE_GBP_STATS.reviewCount ?? manual?.reviewCount ?? null,
  }
}
