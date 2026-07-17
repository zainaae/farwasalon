# Manual Google reviews (no Places API billing)

Farwa’s site can show **real Google reviews** without Google Cloud billing by pasting them into `src/google-reviews-data.js`. Only **4 or 5 star** reviews should be added.

## Why manual?

The Google Places API needs a billed GCP project. If billing cannot be enabled, `/api/reviews` serves curated reviews from this file instead of live API data.

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
