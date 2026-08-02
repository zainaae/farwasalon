/**
 * Manually curated social proof — the Google reviews and the Facebook
 * testimonials the homepage shows. Both live here rather than inside the
 * component so the freshness tests in src/gbp-stats-freshness.test.js can read
 * them.
 *
 * Copy new Google reviews from Google Business Profile → Reviews.
 * See docs/manual-google-reviews.md for step-by-step instructions.
 *
 * ── Dates ────────────────────────────────────────────────────────────────
 * Every entry stores `postedAt`, an ABSOLUTE date, and nothing stores a
 * relative phrase. Relative wording ("3 weeks ago") is computed from
 * `postedAt` at render time by describeReviewAge() in lib/google-reviews.js.
 *
 * This is not a style preference. The file used to store the literal string
 * "27 weeks ago", which meant the site said "27 weeks ago" in June 2026 and
 * would still say "27 weeks ago" in June 2030 — a clock painted on the wall.
 * A hardcoded relative phrase is worse than no date at all, because it is
 * actively wrong rather than merely absent.
 *
 * `postedAt` accepts YYYY-MM-DD when the exact day is known and YYYY-MM when
 * only the month is. Do not pad a month to a day to make it look precise —
 * month precision is honest and the renderer handles it.
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
 * @property {string} postedAt — When it was posted: 'YYYY-MM-DD', or 'YYYY-MM' if the day is unknown. Never a relative phrase.
 * @property {string} [postedAtDerivedFrom] — Set only when postedAt was reconstructed rather than read off Google directly. Records what it was reconstructed from, so it can be checked.
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
    // Was stored as the string '6 Mar 2025' — already absolute, just retyped
    // as ISO so it can be compared and formatted rather than only printed.
    postedAt: '2025-03-06',
    sourceUrl: 'https://g.page/farwasalon/review',
  },
  {
    name: 'Shehla Nadeem',
    rating: 5,
    text: 'The owner herself and her staff is very understanding and friendly,I always feel comfortable with there work . I suggest do try them and owner is very expert in hair department. Good luck from my side and good wishes.',
    translation: 'The owner and her staff are very understanding and friendly — I always feel comfortable with their work. I suggest you try them; the owner is very expert in the hair department. Good luck and best wishes from my side.',
    postedAt: '2025-12',
    postedAtDerivedFrom:
      "Google showed '27 weeks ago' when this review was copied into the repo " +
      'on 2026-06-16 (commit 9e00069). 27 weeks before that is 2025-12-09; ' +
      "Google rounds to the week, so the true date is 2025-12-05..2025-12-12 — " +
      'December 2025 either way, which is why this is month precision. ' +
      'Replace with the exact day from the GBP listing when someone next opens it.',
    sourceUrl: 'https://g.page/farwasalon/review',
  },
  {
    name: 'Sumera Abbas',
    rating: 5,
    text: 'My go-to salon! They always give their best and make me feel amazing every time. Love this salon! Professional, kind, and always perfect with their work.',
    postedAt: '2025-12',
    postedAtDerivedFrom:
      "Google showed '27 weeks ago' when this review was copied into the repo " +
      'on 2026-06-16 (commit 9e00069), same as the Shehla Nadeem entry above. ' +
      'See that entry for the full working.',
    sourceUrl: 'https://g.page/farwasalon/review',
  },
]

/**
 * @typedef {Object} FacebookTestimonial
 * @property {string} name
 * @property {string} initials
 * @property {string} postedAt — 'YYYY-MM' (Facebook only surfaces the month on these posts)
 * @property {string} service
 * @property {string} quote
 * @property {string} link
 * @property {string} [translation]
 */

/**
 * Facebook testimonials, oldest of which is now over two years old.
 *
 * These are real posts by real named people at real permalinks, so they are
 * not edited, re-dated or hidden. They are dated honestly instead: the card
 * renders "Aug 2024", which reads as archival, and the reviews block says out
 * loud how old the newest one is. See the note in app/home-below-fold.jsx.
 *
 * Previously these carried display strings like `date: 'Aug 2024'`. Same
 * information, but nothing could compare them, sort them or notice their age.
 *
 * @type {FacebookTestimonial[]}
 */
export const FACEBOOK_TESTIMONIALS = [
  {
    name: 'Tathira B.', initials: 'TB', postedAt: '2024-08', service: 'Bridal',
    quote: 'Farwa Aapi ne itni care aur detail se kaam kiya ke har visit pe ghar jaisa lagta hai. Best salon in Karachi, hands down.',
    translation: 'Farwa Aapi works with such care and detail that every visit feels like home. Best salon in Karachi, hands down.',
    link: 'https://www.facebook.com/tathirabid/posts/pfbid02J73qHitLiSYbpvJPJEYvNfBHyjSfKEhWL1hS6VbMupr15TzuPuGtXNTKBDMuvRyKl',
  },
  {
    name: 'Jessica J.', initials: 'JJ', postedAt: '2024-05', service: 'Facial & Hair',
    quote: 'Been coming here for years and the quality never drops. Rubina knows my skin better than I do — I leave glowing every single time.',
    link: 'https://www.facebook.com/jessica.joseph.522/posts/pfbid02ZCUhHYUrNBsv9yEfCY5t5MiBPWzJEs6nMwtRSGYaNViyYEEUhKiUZYuSSL8yup9Ul',
  },
  {
    name: 'Tashfeen G.', initials: 'TG', postedAt: '2024-03', service: 'Full package',
    quote: 'The attention to detail is unmatched. From brow threading to bridal — everyone on the team treats you like family. Highly recommend to every girl in PECHS.',
    link: 'https://www.facebook.com/tashfeen.ghulamali/posts/pfbid0LHJDHEFyLs7AefDCPGH6kPxL3z5Kov6sT1gdfXFvDXNZoAL1RXjpEBwzz81GMoPLl',
  },
  {
    name: 'Sumaiya M.', initials: 'SM', postedAt: '2024-02', service: 'Bridal',
    quote: 'I cannot thank Farwa Aapi enough for making me feel like a queen on my wedding day. Every step — from trials to the final look — was perfection. My family still talks about it.',
    link: 'https://www.facebook.com/Sumaiya.Mohsi/posts/pfbid02Th9Xxwdqp5WK66n9MShW4orY8WxWvrSaAA3CoGwdpFJdK4J4zKJ6dbHWsvA86TpTl',
  },
  {
    name: 'Sara K.', initials: 'SK', postedAt: '2024-01', service: 'Skincare',
    quote: 'Honestly the most calm and professional salon experience in Karachi. No rush, no shortcuts — just clean, careful, beautiful work.',
    link: 'https://www.facebook.com/cutesara.1995/posts/pfbid029WwdkbBNG5xsdX61yp4ixzDdZaFnFoxwKXPkvoECyQnfLFwbry4jUJz4y5VwqWB7l',
  },
  {
    name: 'Nadia A.', initials: 'NA', postedAt: '2023-12', service: 'Threading & Facial',
    quote: 'Always leave feeling fresh and confident. Rubina has been doing my brows for years — no one else gets the shape right the way she does.',
    link: 'https://www.facebook.com/farwasalon/reviews',
  },
]
