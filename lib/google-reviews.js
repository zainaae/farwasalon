import {
  GOOGLE_REVIEWS,
  GOOGLE_GBP_STATS,
} from '../src/google-reviews-data.js'

const GOOGLE_REVIEW_LINK = 'https://g.page/farwasalon/review'
const MIN_RATING = 4

/* ── Review dating ────────────────────────────────────────────────────────
 *
 * Reviews are stored with an absolute `postedAt` and the wording a visitor
 * reads is computed from it here, against the clock at render time. The point
 * is that the same review file read in 2026 and in 2030 produces different
 * words, because it is describing a distance from now rather than reciting a
 * distance someone measured once and typed in.
 *
 * Two rules keep the output honest:
 *
 * 1. Relative wording is only used inside RELATIVE_WINDOW_DAYS. Past that,
 *    the absolute month and year is shown. "27 weeks ago" on a review that is
 *    really eighteen months old is a lie told by rounding; "Mar 2025" on the
 *    same review is a fact, reads as archival, and is checkable against
 *    Google. An old review is worth showing. Making an old review look recent
 *    is not.
 *
 * 2. Relative wording is only used for day-precision dates. A `postedAt` of
 *    '2024-08' is not enough to say "3 weeks ago" — that phrase would be
 *    claiming a precision the data does not have.
 */

/** Past this age, show the absolute date instead of a relative phrase. */
export const RELATIVE_WINDOW_DAYS = 45

const DAY_MS = 86_400_000
const ISO_DATE = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** 'day' for YYYY-MM-DD, 'month' for YYYY-MM, null if unparseable. */
export function reviewDatePrecision(postedAt) {
  const m = ISO_DATE.exec(String(postedAt ?? '').trim())
  if (!m) return null
  return m[3] ? 'day' : 'month'
}

/**
 * Parse 'YYYY-MM-DD' or 'YYYY-MM' as UTC. Month precision anchors to the 1st
 * for arithmetic only — it is never formatted back out as a day.
 * @returns {Date|null}
 */
export function parseReviewDate(postedAt) {
  const m = ISO_DATE.exec(String(postedAt ?? '').trim())
  if (!m) return null
  const ymd = `${m[1]}-${m[2]}-${m[3] ?? '01'}`
  const ms = Date.parse(`${ymd}T00:00:00Z`)
  if (Number.isNaN(ms)) return null
  // Rejects '2025-02-30' and friends in engines that would roll them over.
  const d = new Date(ms)
  return d.toISOString().slice(0, 10) === ymd ? d : null
}

/** Absolute, always month + year: 'Mar 2025'. Never claims day precision. */
export function formatReviewDate(postedAt) {
  const d = parseReviewDate(postedAt)
  if (!d) return null
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/**
 * Turn an absolute `postedAt` into the words a visitor should see, as of `now`.
 *
 * @param {string} postedAt
 * @param {number} [now] — ms since epoch; injectable so tests can move the clock
 * @returns {{ label: string|null, absolute: string|null, days: number|null, isFuture: boolean, isRelative: boolean }}
 *   `label` is null when there is nothing truthful to show — an unparseable
 *   date, or a date in the future. A future date is a data error (a typo, or a
 *   clock problem) and the honest response is to print no date at all rather
 *   than "in 3 weeks" or a flattering "This week".
 */
export function describeReviewAge(postedAt, now = Date.now()) {
  const d = parseReviewDate(postedAt)
  if (!d) return { label: null, absolute: null, days: null, isFuture: false, isRelative: false }

  const absolute = formatReviewDate(postedAt)
  const days = Math.floor((now - d.getTime()) / DAY_MS)

  if (days < 0) return { label: null, absolute, days, isFuture: true, isRelative: false }

  const base = { absolute, days, isFuture: false }
  if (reviewDatePrecision(postedAt) !== 'day' || days >= RELATIVE_WINDOW_DAYS) {
    return { ...base, label: absolute, isRelative: false }
  }
  if (days <= 6) return { ...base, label: 'This week', isRelative: true }
  const weeks = Math.max(1, Math.round(days / 7))
  return { ...base, label: `${weeks} week${weeks === 1 ? '' : 's'} ago`, isRelative: true }
}

/**
 * Newest first. Anything without a usable `postedAt` keeps its original
 * position relative to the rest rather than being dumped at one end.
 */
export function sortByRecency(items) {
  return [...items]
    .map((item, i) => ({ item, i, t: parseReviewDate(item?.postedAt)?.getTime() ?? null }))
    .sort((a, b) => {
      if (a.t === b.t) return a.i - b.i
      if (a.t === null) return 1
      if (b.t === null) return -1
      return b.t - a.t
    })
    .map(({ item }) => item)
}

/** The `postedAt` of the most recently posted item, or null. */
export function newestPostedAt(items) {
  let best = null
  let bestT = -Infinity
  for (const item of items ?? []) {
    const t = parseReviewDate(item?.postedAt)?.getTime()
    if (t == null || Number.isNaN(t)) continue
    if (t > bestT) {
      bestT = t
      best = item.postedAt
    }
  }
  return best
}

export function getManualGoogleReviews() {
  return GOOGLE_REVIEWS.filter(
    (r) => typeof r.rating === 'number' && r.rating >= MIN_RATING && r.text?.trim(),
  )
}

/**
 * Manual reviews travel with `postedAt` (absolute) and no relative string.
 * Reviews coming back from the live Places API instead carry `relativeTime`,
 * which Google recomputes on every fetch — that one is genuinely live, so the
 * homepage is allowed to print it as-is. The two shapes are deliberately
 * distinguishable: a relative phrase is only trustworthy when its source is.
 */
export function normalizeManualReview(review) {
  const name = review.name?.trim() || 'Google user'
  const quote = review.text?.trim() || ''
  return {
    name,
    quote,
    translation: review.translation?.trim() || null,
    link: review.sourceUrl?.trim() || GOOGLE_REVIEW_LINK,
    rating: review.rating,
    postedAt: review.postedAt?.trim() || null,
    source: 'google',
  }
}

export function getManualReviewsPayload() {
  const reviews = sortByRecency(getManualGoogleReviews().map(normalizeManualReview))
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
