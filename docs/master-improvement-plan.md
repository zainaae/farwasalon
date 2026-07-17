# Master improvement plan — Farwa Beauty Salon

**Site:** https://farwasalon.com
**Stack:** Next.js 16 · React 19 · Vercel · Google Sheets booking · Apps Script email
**Last audit:** 15 July 2026 · deployed to production (Vercel, master pushed)
**Baseline health:** lint clean · 279 unit tests · 174 e2e (axe color-contrast ENFORCED,
5 pages) · coverage ratchet in CI · nightly synthetic monitoring of production

This plan is the single roadmap: **what to do, in what order, and how to QA each step.**

---

## Status at a glance

**Phases 0, 1, 2.1 (fallback path), and 2.4 are complete AND live-verified on
production (15 July 2026):**

- **QA-0.3 PASSED** — email bot confirmed running: all 21 sheet rows marked
  Notified, including four test bookings made that same day.
- **QA-0.4 PASSED** — live book + cancel cycle on farwasalon.com
  (FBS-74685277: booked, cancelled with real HMAC token, tampered token
  rejected 400).
- **QA-1.5 PASSED** — rating claims aligned to the live Google listing
  (4.6★ / 19 reviews) in JSON-LD, copy, and meta; verified serving on prod.
- **Past-slot booking bug fixed and verified on prod** — /api/slots no longer
  offers times that already passed in Karachi time (Vercel runs UTC; the check
  is explicitly Asia/Karachi with a 30-min same-day lead).
- **Synthetic monitoring** — `.github/workflows/synthetic.yml` probes
  production nightly (12 API scenarios + 48-route crawl). Client errors now
  land in Vercel function logs via `/api/log-error` (see `app/error.jsx`).
- **Lighthouse CI** — category budgets promoted to **errors** (median of 3 runs,
  16 Jul 2026): a11y 0.9 / SEO 0.95 / best-practices 0.9, perf floor 0.65
  (throttled CI runners score ~0.73–0.78). Metric budgets (LCP/CLS/TBT) warn-only.

| Phase | Dev work | Ops work (owner: You) |
|-------|----------|----------------------|
| 0 — Correctness & trust | ✅ Done | ✅ Verified live 15 Jul 2026 |
| 1 — Conversion & performance | ✅ Done | ⚠️ 1.4 GBP hours check + 1.8 WhatsApp playbook |
| 2 — Integrations | 2.1 ✅ (manual fallback) · 2.4 ✅ · **2.2, 2.3 open** | Places API key needs GCP billing; Meta / JazzCash accounts |
| 3 — Growth & polish | Ongoing | Ongoing |

**Remaining dev work: Phase 2.2 (WhatsApp reminders) and 2.3 (JazzCash
deposits)** — both gated on external accounts. Remaining ops: create the
Google Places API key once GCP billing works (live reviews then replace the
curated fallback automatically), confirm GBP hours match the site, and run
the WhatsApp manual playbook (1.8).

---

## How to use this doc

| Symbol | Meaning |
|--------|---------|
| **Step** | One deliverable (code, config, or ops) |
| **QA gate** | Checklist — all boxes must pass before next phase |
| **S / M / L** | Effort: hours / 1–3 days / multi-day + external deps |
| **Owner** | Who does the work (You = salon/ops, Dev = codebase) |

**Automation baseline (run before every gate):**

```bash
npm run verify        # lint + test + build
npm run verify:full   # + Playwright e2e
```

**Production smoke (after every deploy):**

1. Home loads, hero poster visible
2. `/book` → pick service → date → time → submit (test row or real)
3. Footer NAP + Maps link open correctly

---

## Reference facts (verified in code, 14 July 2026)

Keep these consistent — they are the ones that drift.

| Fact | Value | Source of truth |
|------|-------|-----------------|
| Cancellation window | **2 hours** | `CANCELLATION_MIN_HOURS` in `lib/booking-duration.js` — FAQ copy must match |
| Google Place ID | **`ChIJeVyXMig_szoQEKI0TaSkW-U`** | `.env.example`, `next.config.mjs` (`/review` redirect) |
| Phone | +92 322 278 2254 | `lib/business-schema.js`, footer |
| Hours | Mon–Sat 11–7, Sun closed | `lib/business-schema.js` |
| Location SEO | Hub page `/beauty-salon-karachi` + location-aware variants of `/services/[categorySlug]` (32 areas in `src/location-seo.js`) | Not 120 standalone pages — that design was consolidated |

> ⚠️ The previous revision of this doc listed the Place ID as
> `ChIJeVyXMig_sz4REKl0TaSkW-U`. That value appears **nowhere else in the repo** and is
> believed wrong; five other sources agree on the ID above. Confirm once in Google's
> Place ID Finder, then never hand-copy it again.

---

## North-star outcomes (12 weeks)

1. **Book online** is the default path; WhatsApp is secondary everywhere.
2. **Booking is trustworthy** — slots match duration (including add-ons); cancel policy is consistent.
3. **Salon gets notified** within 5 minutes of every booking; optional customer confirmation.
4. **Local SEO** — NAP matches GBP; schema honest.
5. **Performance** — mobile LCP < 2.5s target.
6. **Integrations** when unblocked — ~~Places reviews~~ → WhatsApp reminders → JazzCash deposits.

---

## Phase 0 — Correctness & trust ✅ (dev complete)

### Step 0.1 — Cancellation policy alignment ✅ Done · Dev

Policy is **2 hours**, defined once as `CANCELLATION_MIN_HOURS` in
`lib/booking-duration.js`, consumed by `app/api/book/cancel/route.js`, and matched by the
FAQ answer in `src/faq-data.js`.

**If you ever change it:** change the constant only, then update the FAQ copy to match.

---

### Step 0.2 — Add-ons and slot duration ✅ Done (option A) · Dev

`computeBookingDurationMinutes(service, addonIds)` sums the primary service duration plus
every allowed add-on, and **both** `app/api/book/route.js` and `app/api/slots/route.js`
use it. Add-ons can no longer cause overlapping bookings. `filterAllowedAddonIds` rejects
add-ons that aren't valid for the chosen service. Covered by `lib/booking-duration.test.js`.

---

### Step 0.3 — Apps Script email bot live (S) · ⚠️ You — **verify on production**

The script exists at `google-apps-script/EmailBot.gs`; whether it is *installed and
triggering* on the live Sheet cannot be checked from the repo.

#### QA-0.3

- [ ] New test booking → email within **10 minutes**
- [ ] Re-run trigger → no duplicate email (column M = YES)
- [ ] Cancelled booking → no email / skipped
- [ ] Email contains booking ID, service, date, time, phone
- [ ] `SALON_NOTIFY_EMAIL` is a real inbox, not the placeholder

---

### Step 0.4 — Production secrets (S) · ⚠️ You — **verify on production**

| Variable | Required |
|----------|----------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Yes |
| `GOOGLE_PRIVATE_KEY` | Yes |
| `GOOGLE_SHEET_ID` | Yes |
| `BOOKING_CANCEL_SECRET` | Strongly recommended |

**Security:** if any key was ever pasted into chat, a commit, or a screenshot, **rotate**
the service-account key and the cancel secret.

#### QA-0.4

- [ ] `POST /api/book` on production returns 200 (not 502/503)
- [ ] Confirmation page shows cancel link with token
- [ ] Cancel API returns 200 with secret configured
- [ ] No secrets committed to the repo

---

### Step 0.5 — CI runs tests ✅ Done · Dev

`.github/workflows/ci.yml` runs lint → test → build → Playwright e2e on push and PR to
`master`. This exceeds the original ask (which was just adding a test step).

---

## Phase 1 — Conversion, performance, content ✅ (dev complete)

| Step | Status | Evidence |
|------|--------|----------|
| 1.1 Hero video compression | ✅ Done | `public/hero-mp4.mp4` is **900KB** (target was < 2.5MB) |
| 1.2 Lazy heavy media | ✅ Done | `LazyVideo` wraps `/ct.mp4` in `app/home-below-fold.jsx`; SSR-safe sources |
| 1.3 Copy & CTA consistency | ✅ Done | FAQ points to `/book` first, WhatsApp second; `/contact` has two prominent Book buttons |
| 1.6 Confirmation URL privacy | ✅ Done | `app/book/confirmation/confirmation-client.jsx` reads display fields from `sessionStorage` keyed by booking id |
| 1.7 Docs & repo hygiene | ✅ Done | README rewritten for Next.js (14 Jul 2026); `.next-ci/` ignored; stale Vite/`App.jsx` references purged from docs |

### Step 1.4 — GBP / NAP audit (S) · ⚠️ You

Code-side NAP is consistent (`lib/business-schema.js`, footer in `src/shared.jsx`). What
remains is comparing it against the **live** Google Business Profile and WhatsApp Business
profile.

#### QA-1.4

- [ ] Name matches everywhere (Farwa Beauty Salon)
- [ ] Phone +92 322 278 2254 consistent
- [ ] Hours Mon–Sat 11–7, Sun closed — schema + site + GBP
- [ ] `/review` redirect opens the correct listing (see Place ID warning above)

### Step 1.5 — Schema rating honesty (S) · ⚠️ You

`SALON_GBP_RATING=4.9` and `SALON_GBP_REVIEW_COUNT=6` are wired into JSON-LD. **Confirm
these still match the live Google listing** and update the Vercel env when they drift.
Do not inflate.

#### QA-1.5

- [ ] JSON-LD `aggregateRating` matches Google within 0.1 stars
- [ ] Review count matches the live listing
- [ ] Rich Results Test: no critical errors on `/`

### Step 1.8 — WhatsApp manual playbook (S) · ⚠️ You

Execute `docs/whatsapp-business-setup.md` — quick replies, labels, manual confirmation
after each online booking, until 2.2 automates it.

---

## Phase 2 — Integrations

### Step 2.1 — Google Places API ✅ Done · Dev

`GET /api/reviews` is live (`app/api/reviews/route.js`), backed by `lib/google-places.js`
with caching, and falls back to curated reviews in `src/google-reviews-data.js` when the
API key is absent or the call fails. The homepage shows Google and Facebook reviews
together. Covered by `lib/google-places.test.js` and `lib/google-reviews.test.js`.

**Remaining ops:** confirm the production key is set and restricted to Places only, and
set a GCP budget alert (~$5/month).

---

### Step 2.2 — WhatsApp Cloud API reminders (L) · 🔴 **OPEN** · Dev + You

**Prerequisites (yours):** Meta Business verified; message templates approved; strategy
confirmed for the number +92 322 278 2254.

**Build plan:**

1. Sheet columns: `reminded_24h`, `reminded_2h`, `review_sent`
2. `lib/whatsapp-cloud.js` — send-template wrapper
3. Cron route `/api/cron/whatsapp-reminders` guarded by `CRON_SECRET`
4. Optional: fire `booking_confirmed` on `POST /api/book` success

See `docs/integrations-execution.md` Path B.

#### QA-2.2

- [ ] Template `booking_confirmed` delivered within 1 min of a test booking
- [ ] 24h reminder fires **once** per row (idempotent — check the column before sending)
- [ ] STOP / opt-out documented for staff
- [ ] Failed sends logged (sheet column or Vercel logs)

---

### Step 2.3 — JazzCash deposits (L) · 🔴 **OPEN** · Dev + You

**Prerequisites (yours):** merchant account + sandbox credentials.

1. Sheet columns N–P: `paymentStatus`, `jazzcashTxnRef`, `depositPkr`
2. `/api/payments/jazzcash/init` + callback route
3. Bridal-only deposit flag in the UI (configurable)

**Cheaper alternative — 2.3-lite:** QR code + manual confirmation, no API. Needs only a
staff process doc.

#### QA-2.3

- [ ] Sandbox payment → sheet marked `paid`
- [ ] Failed/cancelled payment does **not** confirm the booking
- [ ] Customer sees a clear success/failure page

---

### Step 2.4 — E2E & a11y automation ✅ Done · Dev

15 Playwright specs in `e2e/`, including `a11y-axe.spec.ts`, plus book-flow, mobile-nav,
responsive-overflow, and location-page coverage. CI runs them on every push and PR.

---

## Phase 3 — Growth & polish (ongoing)

| Item | Cadence |
|------|---------|
| Request Google reviews after appointments — templates + rhythm in [whatsapp-business-setup.md §5b](whatsapp-business-setup.md) | Daily ask, Friday count |
| GBP posts (offers, bridal season) | 2×/month |
| Blog 1 post/month | SEO long-tail |
| Compress new images/video before `public/` | Per upload |
| Review Search Console queries | Monthly |
| Rotate API keys | Annually or if leaked |

---

## Release checklist (every deploy)

Use `docs/RELEASE_CHECKLIST.md` plus:

1. `npm run verify` (lint + test + build)
2. Vercel preview URL smoke test
3. Promote to production → repeat the smoke test on `farwasalon.com`
4. Monitor 24h for `/book` completions and errors

---

## Risk register

| Risk | Mitigation |
|------|------------|
| GBP edit lock persists | NAP on website = source of truth; support ticket to Google |
| Sheet API down | 502 to user; salon monitors WhatsApp |
| Double booking race | Closed by Step 0.2 (add-on-aware slot duration) |
| Exposed API keys | Rotate; server-only; restrict by API |
| **This doc going stale again** | Re-stamp the audit line (`master` @ commit) whenever you mark a step done |

---

## What to build next

Dev work is caught up. The next moves, in order:

1. **Ops verification** — close QA-0.3, QA-0.4, QA-1.4, QA-1.5. These are quick and they
   are the only things standing between the site and a clean Phase 0/1 sign-off.
2. **Phase 2.2 (WhatsApp reminders)** — the biggest remaining feature. Unblock it by
   getting Meta Business verified and templates approved; the code is a day's work after that.
3. **Phase 2.3-lite (QR deposits)** — if JazzCash merchant onboarding drags, the manual QR
   path captures most of the value for none of the integration risk.

---

*Related docs:* `integrations-execution.md` · `booking-setup.md` · `RELEASE_CHECKLIST.md` · `quality-gates-release.md`
