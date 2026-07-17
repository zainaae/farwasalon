# Live vs local comparison

Quick matrix for **https://farwasalon.com** vs `npm run build && npm run start` (port 3000).  
Last run: 2026-05-19.

## How to re-run

```bash
npm run verify
npm run build && npm run start   # or Playwright webServer
node scripts/booking-api-probe.mjs
BASE_URL=https://farwasalon.com node scripts/booking-api-probe.mjs
npm run test:e2e
```

## Matrix

| Area | Live (prod) | Local (`next start`) | Notes |
|------|-------------|----------------------|-------|
| **Git** | `origin/master` @ 9716fd9 | Same HEAD | In sync; prod **deploy** may lag |
| **CSP** | No `unsafe-eval` | No `unsafe-eval` | Match. Dev (`npm run dev`) adds `unsafe-eval` only |
| **Pages HTTP** | 200 on `/`, `/services`, `/book`, `/gallery`, sitemaps, RSS | 200 all | Pass |
| **Home HTML size** | ~214 KB | ~226 KB | Drift (minor SSR/content); same tablist + JSON-LD markers |
| **JSON-LD home** | BeautySalon, Offer, ItemList (no VideoObject — hero is decorative) | Same | Pass |
| **JSON-LD /services** | BeautySalon, Offer, ItemList | Same | Pass |
| **JSON-LD /services/threading** | BeautySalon, Offer, ItemList | Same | Pass |
| **Booking probe** | 5/7 (book past date + invalid time → **409**) | 7/7 (→ **400**) | **Drift** — prod on older `/api/book` validation order |
| **Slots error copy** | “today or within the next 14 days” | “within the next 14 days” | Confirms prod API build behind repo |
| **Features (SSR)** | tablist, mobile CTA nav, JSON-LD | Same | Newsletter/LiveAvailability are client-only |
| **Lint / unit / e2e** | — | lint OK, 167 tests, 19 e2e | Pass |

## Expected after deploy

`booking-api-probe.mjs` against prod should show **7/7**, including:

- `book past date (reject)` → 400 `Date cannot be in the past.`
- `book invalid time 09:00 (reject)` → 400 `Time is outside salon hours.`

## Do not commit

`public/*.webm`, `*.mp4`, `*.orig.mp4` unless intentionally shipping new hero assets.

## Known dev-server rendering quirk (2026-07-15)

Under `npm run dev` (Turbopack) + automated browsers, below-fold homepage
sections can render blank: the deferred `home-below-fold` chunk mounts late,
and per-row `whileInView` wrappers can stay at `opacity: 0` even when standing
on them. **Production builds do not have this problem** — verified by
screenshot tour against `next start` (all sections render at every scroll
position, desktop + mobile).

Practical rules:
- Judge visuals only against a production build (`npm run build && npm start`),
  never the dev server.
- Playwright's `toBeVisible()` does not catch `opacity: 0` (it checks display /
  visibility / size), so e2e green does not disprove an animation-stuck bug —
  screenshot or computed-style checks do.
- `chrome-headless-shell` ships without H.264: mp4-only panels screenshot as
  voids. Use `test.use({ channel: 'chrome' })` for pixel-accurate captures.
