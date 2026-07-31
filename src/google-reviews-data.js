/**
 * Manually curated Google reviews (4+ stars only).
 * Copy new reviews from Google Business Profile → Reviews.
 * See docs/manual-google-reviews.md for step-by-step instructions.
 */

/**
 * Live GBP totals. THIS IS THE ONLY PLACE THESE NUMBERS LIVE.
 *
 * Nothing on the site reads them from Google automatically. The Places API
 * integration exists (lib/google-places.js) but production returns
 * `configured: false`, so the review cards, the aggregateRating schema on every
 * page, the homepage meta description and all 13 category descriptions are all
 * fed from the two numbers below.
 *
 * That means a review drive succeeds on Google and the site keeps advertising
 * the old figure until someone edits this object — undercounting the salon at
 * exactly the moment it should not.
 *
 * TO UPDATE: open Google Maps, read the rating and review count off the
 * listing, change the two values, and set `lastVerified` to today. That is the
 * whole job; everything else follows. A test fails once this is 90 days old, so
 * the check-in is scheduled rather than remembered.
 */
export const GOOGLE_GBP_STATS = {
  rating: 4.6,
  reviewCount: 19,
  /** YYYY-MM-DD the two figures above were last checked against Google Maps. */
  lastVerified: '2026-07-31',
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
  {
    name: 'Sukoon mustafa',
    rating: 5,
    text: `Dear all

Being a regular customer at Farwa Salon, I have always received exceptional service and comfort from Rubina Appa and her team. Just like every time, this experience was no different.

I was quite anxious about my hair color, as I had a specific shade of burgundy in mind, but Rubina Appa understood exactly what I wanted and delivered beyond my expectations. But not just that—I was also really confused about my haircut. I didn't want to lose my hair length, so she patiently gave me multiple options. Then, with her expertise, she said, 'she make me sure that this will look good on you,' and she gave me a long layered butterfly curtain bangs cut.

And believe me or not, she is truly an expert! I don't know what kind of magic she has in her hands, but the result was absolutely stunning. She even considered the fact that I always tie my hair and rarely leave them open. Keeping all of that in mind, she created a look that was both practical and beautiful.

When I saw my hair, I was speechless! The cut, combined with the perfect burgundy shade, was beyond what I had imagined. She knew exactly what I wanted before I could even express it fully. The final look was elegant, aesthetic, and simply perfect.

Thank you, Rubina Appa, for your outstanding work! Highly recommended`,
    relativeTime: '6 Mar 2025',
    sourceUrl: 'https://g.page/farwasalon/review',
  },
  {
    name: 'Shehla Nadeem',
    rating: 5,
    text: 'The owner herself and her staff is very understanding and friendly,I always feel comfortable with there work . I suggest do try them and owner is very expert in hair department. Good luck from my side and good wishes.',
    translation: 'The owner and her staff are very understanding and friendly — I always feel comfortable with their work. I suggest you try them; the owner is very expert in the hair department. Good luck and best wishes from my side.',
    relativeTime: '27 weeks ago',
    sourceUrl: 'https://g.page/farwasalon/review',
  },
  {
    name: 'Sumera Abbas',
    rating: 5,
    text: 'My go-to salon! They always give their best and make me feel amazing every time. Love this salon! Professional, kind, and always perfect with their work.',
    relativeTime: '27 weeks ago',
    sourceUrl: 'https://g.page/farwasalon/review',
  },
]
