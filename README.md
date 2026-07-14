# Farwa Beauty Salon

Marketing and online-booking site for [Farwa Beauty Salon](https://farwasalon.com), Block 3 PECHS, Karachi.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS 3 · Vercel
**Booking store:** Google Sheets (via service account) · **Notifications:** Google Apps Script email bot

---

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in the values you need (see below)
npm run dev                  # http://localhost:3000
```

The site renders without any environment variables — only the booking flow and
homepage reviews degrade. See [Environment](#environment).

---

## Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Next dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests (jsdom + React Testing Library) |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run verify` | **lint + test + build** — the gate to run before pushing |
| `npm run verify:full` | `verify` + Playwright e2e |
| `npm run ping:indexnow` | Submit changed URLs to IndexNow |
| `npm run qa:workflow` | Scripted QA pass against a running site |

CI (`.github/workflows/ci.yml`) runs lint → test → build → Playwright e2e on
every push and PR to `master`.

---

## Architecture

```
app/                 Next.js App Router — pages, layouts, API routes
  api/               book, book/cancel, slots, reviews, subscribe, indexnow
  book/              booking flow: picker → confirmation → cancel
  services/          service categories + location-aware SEO variants
lib/                 Server/shared logic — booking rules, Sheets, schema, SEO
src/                 Content data (services, blog, FAQ, media) + shared UI
e2e/                 Playwright specs (incl. axe accessibility checks)
google-apps-script/  EmailBot.gs — notifies the salon of new bookings
docs/                Setup, ops, and the roadmap (see below)
```

**Content lives in `src/`, not a CMS.** Services and pricing are in
[`src/data.js`](src/data.js), blog posts in [`src/blog-data.js`](src/blog-data.js),
FAQ in [`src/faq-data.js`](src/faq-data.js).

### Booking flow

1. `/book` — guest picks a service (plus optional add-ons), date, and time.
2. `GET /api/slots` — returns free times. Slot length is the **primary service
   duration plus every selected add-on**, computed by
   [`lib/booking-duration.js`](lib/booking-duration.js), so add-ons cannot cause
   overlapping bookings.
3. `POST /api/book` — appends a row to the Google Sheet and returns a booking id
   plus a signed cancel token.
4. `/book/confirmation` — shows the booking and an Add-to-Calendar link. Display
   fields come from `sessionStorage` (keyed by booking id), so names and phone
   numbers are **not** put in the URL.
5. `/book/cancel?token=…` — guests may cancel up to `CANCELLATION_MIN_HOURS`
   (**2 hours**) before the appointment. That constant lives in
   [`lib/booking-duration.js`](lib/booking-duration.js) and is the single source
   of truth — the FAQ copy must match it.
6. The Apps Script bot polls the sheet and emails the salon (see
   [`docs/booking-setup.md`](docs/booking-setup.md)).

---

## Environment

Copy [`.env.example`](.env.example) to `.env.local`. Everything is server-only —
**never** prefix a secret with `NEXT_PUBLIC_`.

| Variable | Needed for | Required? |
|----------|-----------|-----------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Writing bookings to the Sheet | Yes, for booking |
| `GOOGLE_PRIVATE_KEY` | ” | Yes, for booking |
| `GOOGLE_SHEET_ID` | ” | Yes, for booking |
| `BOOKING_CANCEL_SECRET` | Signing cancel links | Strongly recommended |
| `GOOGLE_PLACES_API_KEY` | Live Google reviews on the homepage | Optional |
| `GOOGLE_PLACE_ID` | ” | Optional |
| `SALON_GBP_RATING` / `SALON_GBP_REVIEW_COUNT` | JSON-LD `aggregateRating` | Optional |
| `INDEXNOW_SECRET` | IndexNow submissions | Optional |

Without a Places API key the homepage falls back to curated reviews in
[`src/google-reviews-data.js`](src/google-reviews-data.js).

> **Place ID:** `ChIJeVyXMig_szoQEKI0TaSkW-U` — used by `GOOGLE_PLACE_ID` and the
> `/review` redirect in [`next.config.mjs`](next.config.mjs). Keep the two in sync.

If a key is ever pasted into a chat, a commit, or a screenshot, **rotate it.**

---

## Deploying

Vercel builds from `master` and deploys to `farwasalon.com`. Before promoting,
run `npm run verify` and walk the smoke test in
[`docs/RELEASE_CHECKLIST.md`](docs/RELEASE_CHECKLIST.md).

---

## Docs

Start with [`docs/master-improvement-plan.md`](docs/master-improvement-plan.md) —
the roadmap and current status. Then, as needed:

| Topic | Doc |
|-------|-----|
| Booking setup, Sheets, email bot | `booking-setup.md`, `booking-backend-architecture.md`, `booking-email-setup.md` |
| Release process | `RELEASE_CHECKLIST.md`, `quality-gates-release.md` |
| Local SEO, GBP, listings | `google-business-profile.md`, `directory-listings.md`, `search-console-setup.md` |
| Integrations (Places, WhatsApp, payments) | `integrations-execution.md` |
| Domain / DNS | `domain-setup.md`, `domain-dns-setup.md` |
