/**
 * Manually curated Google reviews (4+ stars only).
 * Copy new reviews from Google Business Profile → Reviews.
 * See docs/manual-google-reviews.md for step-by-step instructions.
 */

/** Live GBP totals — update when your Google Maps star count changes. */
export const GOOGLE_GBP_STATS = {
  rating: 4.9,
  reviewCount: 6,
}

/**
 * @typedef {Object} GoogleReviewEntry
 * @property {string} name — Reviewer display name (first name + last initial is fine)
 * @property {number} rating — 4 or 5 only
 * @property {string} text — Review text exactly as shown on Google
 * @property {string} [relativeTime] — e.g. "3 months ago"
 * @property {string} [sourceUrl] — Link to the review or listing (optional)
 * @property {string} [translation] — English translation if review is in Urdu/Roman Urdu
 */

/** @type {GoogleReviewEntry[]} */
export const GOOGLE_REVIEWS = [
  // Add 4+ star reviews copied from https://g.page/farwasalon/review
  // Example (remove comments when adding a real review):
  // {
  //   name: 'Ayesha K.',
  //   rating: 5,
  //   text: 'Amazing bridal makeup — highly recommend!',
  //   relativeTime: '2 months ago',
  //   sourceUrl: 'https://g.page/farwasalon/review',
  // },
]
