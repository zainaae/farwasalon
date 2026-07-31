# Manual Google reviews (no Places API billing)

Farwa’s site can show **real Google reviews** without Google Cloud billing by pasting them into `src/google-reviews-data.js`. Only **4 or 5 star** reviews should be added.

## Why manual?

The Google Places API needs a billed GCP project. If billing cannot be enabled, `/api/reviews` serves curated reviews from this file instead of live API data.

## The star count and review total are separate from the reviews

Adding a review to `GOOGLE_REVIEWS` does **not** change the number the site
advertises. The headline figures live in `GOOGLE_GBP_STATS` in the same file:

```js
export const GOOGLE_GBP_STATS = {
  rating: 4.6,
  reviewCount: 19,
  lastVerified: '2026-07-31',
}
```

Those two numbers feed **everything** — the `aggregateRating` structured data on
all 127 pages, the homepage meta description, the "★ 4.6 on Google" appended to
all 13 category descriptions, and the stars on the homepage. Nothing reads them
from Google.

So a review drive can take the salon from 19 to 50 on Google while the website
keeps telling searchers 19. Undercounting yourself is the failure mode here, and
it happens silently.

### Updating them

1. Open the Google Maps listing and read the rating and total review count.
2. Set `rating` and `reviewCount` to match.
3. Set `lastVerified` to today's date.

That is the whole job. `src/gbp-stats-freshness.test.js` fails once these are 90
days old, so the check is scheduled rather than remembered. If that test is
failing, it is working — check the real numbers rather than extending the window.

### Why not just connect the API?

`lib/google-places.js` implements the live path and production currently returns
`configured: false`. Setting `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID` would
make the review *cards* live — but not the headline figures, because the schema
and the meta descriptions are rendered at build time and cannot read a runtime
API. The manual numbers would still need updating. Connect the API for fresher
review text, not to avoid this step.

## Add or update reviews

1. Open [Farwa on Google](https://g.page/farwasalon/review) (sign in if Google asks).
2. Copy **only 4★ or 5★** reviews: reviewer name, stars, text, and “X months ago” if shown.
3. Edit `src/google-reviews-data.js` and add an object to `GOOGLE_REVIEWS`:

```js
{
  name: 'Ayesha K.',
  rating: 5,
  text: 'Paste the review text exactly as on Google.',
  relativeTime: '3 months ago',
  sourceUrl: 'https://g.page/farwasalon/review',
},
```

4. Update `GOOGLE_GBP_STATS` so the header matches your live Google Maps totals:

```js
export const GOOGLE_GBP_STATS = {
  rating: 4.9,
  reviewCount: 6,
}
```

5. Deploy (push to GitHub; Vercel redeploys automatically).

## What changes on the site

- Homepage testimonials prefer: **Places API** (if configured) → **manual Google** → **Facebook** fallback.
- JSON-LD `aggregateRating` uses env vars first, then `GOOGLE_GBP_STATS`, then averages from manual entries.
- `/api/reviews` returns `{ source: 'google-manual', reviews: [...] }` when Places is not configured.

## Do not

- Invent or paraphrase reviews — use exact text from Google.
- Add reviews below 4 stars to the curated list.
- Copy Facebook posts into `GOOGLE_REVIEWS` unless the same text appears on Google.

## Optional: env overrides

You can still set `SALON_GBP_RATING` and `SALON_GBP_REVIEW_COUNT` in Vercel; they override the file for schema only.
