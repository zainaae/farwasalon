# Master improvement plan — Farwa Beauty Salon

**Site:** https://farwasalon.com  
**Stack:** Next.js 16 · Vercel · Google Sheets booking · Apps Script email  
**Last audit:** June 2026 · `master` @ `157c849`

**Completed since last stamp:** single-location UX (footer, hub page, location landing copy), design tokens / shared UI polish, NAP aligned to Block 3 PECHS in code + docs, sitemap-locations e2e coverage.

This plan is the single roadmap: **what to do, in what order, and how to QA each step before moving on.** Do not start Phase 2 until Phase 0 QA is **PASS**.

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
npm run lint
npm run test
npm run build
```

**Production smoke (after every deploy):**

1. Home loads, hero poster visible  
2. `/book` → pick service → date → time → submit (test row or real)  
3. Footer NAP + Maps link open correctly  

---

## North-star outcomes (12 weeks)

1. **Book online** is the default path; WhatsApp is secondary everywhere.  
2. **Booking is trustworthy** — slots match duration (including add-ons); cancel policy is consistent.  
3. **Salon gets notified** within 5 minutes of every booking; optional customer confirmation.  
4. **Local SEO** — NAP matches GBP; schema honest; 120 location pages stay fast.  
5. **Performance** — mobile LCP &lt; 2.5s target; hero video &lt; 2MB.  
6. **Integrations** when unblocked — Places reviews → WhatsApp reminders → JazzCash deposits.

---

## Phase 0 — Correctness & trust (P0)

**Goal:** No lies to customers, no double-booking bugs, ops actually notified.  
**Duration:** ~1 week · **Block everything else until QA-0 passes.**

### Step 0.1 — Cancellation policy alignment (S) · Dev

**Decision (pick one and document in salon SOP):**

| Option | API | Customer message |
|--------|-----|------------------|
| A (current code) | 2 hours before appointment | Update FAQ to 2 hours |
| B (current FAQ) | 4 hours before appointment | Change `app/api/book/cancel/route.js` |

**Files:** `app/api/book/cancel/route.js`, `src/faq-data.js`, `app/book/cancel/cancel-client.jsx` (error copy)

#### QA-0.1

- [ ] FAQ cancellation answer matches API behavior  
- [ ] Cancel link works **outside** window → clear error message  
- [ ] Cancel link works **inside** window → status Cancelled in sheet column J  
- [ ] Salon team briefed on chosen policy  

**PASS when:** Policy is one number everywhere; one live cancel test on production.

---

### Step 0.2 — Add-ons and slot duration (M) · Dev

**Problem:** Add-ons only go to `notes`; API books **primary service duration** → overlap risk.

**Fix (choose one for v1):**

- **A (recommended):** Sum add-on durations from `getAddonsForService` + pass total minutes to `/api/book` and slot logic  
- **B (fast):** Hide add-ons UI until A is done  

**Files:** `app/book/book-client.jsx`, `app/api/book/route.js`, `app/api/slots/route.js`, `lib/booking-slots.js`, `src/data.js` (`SERVICE_ADDON_IDS`)

#### QA-0.2

- [ ] Book service 60min + add-on 15min → slot blocked for **75min** on sheet  
- [ ] `/api/slots` does not offer times that would overlap with existing 75min booking  
- [ ] Add-ons appear in sheet notes **and** duration is correct  
- [ ] Unit tests updated in `lib/booking-slots.test.js` if logic changed  

**PASS when:** Two manual bookings same day same staff window cannot overlap due to add-ons.

---

### Step 0.3 — Apps Script email bot live (S) · You + Dev

**Files:** `google-apps-script/EmailBot.gs`, `docs/booking-setup.md`

1. Paste script into Sheet → Extensions → Apps Script  
2. Set `SALON_NOTIFY_EMAIL` to real inbox (not placeholder)  
3. Run `setupTrigger` once (5–10 min interval)  
4. Sheet column **M = Notified**; skip Cancelled rows  

#### QA-0.3

- [ ] New test booking → email within **10 minutes**  
- [ ] Re-run trigger → no duplicate email (M = YES)  
- [ ] Cancelled booking → no email / skipped  
- [ ] Email contains booking ID, service, date, time, phone  

**PASS when:** 3 consecutive test bookings behave correctly.

---

### Step 0.4 — Production secrets (S) · You

**Vercel production env (verify set):**

| Variable | Required |
|----------|----------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Yes |
| `GOOGLE_PRIVATE_KEY` | Yes |
| `GOOGLE_SHEET_ID` | Yes |
| `BOOKING_CANCEL_SECRET` | Strongly recommended |

**Security:** If any key was pasted in chat, **rotate** service account key + cancel secret.

#### QA-0.4

- [ ] `POST /api/book` on production returns 200 (not 502/503)  
- [ ] Confirmation page shows cancel link with token  
- [ ] Cancel API returns 200 with secret configured  
- [ ] No secrets in GitHub repo  

**PASS when:** Live book + cancel cycle works once on production.

---

### Step 0.5 — CI runs tests (S) · Dev

**File:** `.github/workflows/ci.yml` — add step after lint:

```yaml
- name: Test
  run: npm run test
```

#### QA-0.5

- [ ] GitHub Actions green on `master`  
- [ ] `npm run verify` documented = lint + build (add test to script optional)  

---

### Phase 0 gate — QA-0 (full)

| # | Check | Pass? |
|---|--------|-------|
| 1 | Book → sheet row → email | ☐ |
| 2 | Cancel policy consistent | ☐ |
| 3 | Add-ons duration OR disabled | ☐ |
| 4 | Production secrets OK | ☐ |
| 5 | CI lint + build + test | ☐ |

**Sign-off:** _______________ **Date:** _______________

---

## Phase 1 — Conversion, performance, content (P1)

**Goal:** Faster site, clearer CTAs, honest local SEO, operational docs.  
**Start only after QA-0 passes.**

### Step 1.1 — Hero video compression (S) · Dev

**File:** `public/hero-mp4.mp4` (~7.1MB → target &lt;2MB)

```bash
ffmpeg -i public/hero-mp4.mp4 -vf "scale=1280:-2" -c:v libx264 -crf 28 -preset slow -an -movflags +faststart public/hero-mp4-new.mp4
```

See `docs/hero-video.md`.

#### QA-1.1

- [ ] File size &lt; 2.5MB  
- [ ] Desktop hero: poster first, video fades in, no long blur  
- [ ] Mobile: no video download (poster only)  
- [ ] Lighthouse performance not worse than before on `/`  

---

### Step 1.2 — Lazy heavy media (S) · Dev

- `app/home-below-fold.jsx` — `ServiceMediaPanel` `/ct.mp4`: IntersectionObserver or `LazyVideo`  
- `app/services/services-client.jsx` — hover videos only after first interaction (optional)

#### QA-1.2

- [ ] Network tab on `/`: `ct.mp4` not requested until section near viewport  
- [ ] No layout shift when video appears  

---

### Step 1.3 — Copy & CTA consistency (S) · Dev

**Files:** `src/faq-data.js`, `app/contact/contact-client.jsx`, `app/home-below-fold.jsx` (featured services → use `tagline`)

| Page | Primary CTA |
|------|-------------|
| FAQ walk-ins | Book online first, then WhatsApp |
| Contact | Prominent `/book` above WhatsApp form |
| Home services grid | Short taglines like `/services` |

#### QA-1.3

- [ ] Grep: no “book via WhatsApp” as *only* option on FAQ  
- [ ] Contact page has visible **Book online** link  
- [ ] Home + `/services` card copy visually similar length  

---

### Step 1.4 — GBP / NAP audit (S) · You

**Compare side by side:**

| Source | Address / hours / phone / name |
|--------|--------------------------------|
| Google Maps listing (when editable) | |
| `lib/business-schema.js` | |
| Footer `src/shared.jsx` | |
| WhatsApp Business profile | |

**Place ID for future API:** `ChIJeVyXMig_sz4REKl0TaSkW-U` (confirm in Place ID Finder)

Marketing copy: **PECHS** · Full street in NAP/schema/footer.

#### QA-1.4

- [ ] Name matches everywhere (Farwa Beauty Salon)  
- [ ] Phone +92 322 278 2254 consistent  
- [ ] Hours Mon–Sat 11–7, Sun closed — schema + site + GBP (when fixed)  
- [ ] `/review` redirect opens correct listing  

---

### Step 1.5 — Schema rating honesty (S) · You + Dev

Until Places API works, set Vercel manually from **live Google Maps** star count:

```env
SALON_GBP_RATING=4.9
SALON_GBP_REVIEW_COUNT=<actual count>
```

Do not inflate. Homepage can say “Reviews on Google” without fake count.

#### QA-1.5

- [ ] JSON-LD `aggregateRating` matches Google within 0.1 stars  
- [ ] Rich Results Test: no critical errors on `/`  

---

### Step 1.6 — Confirmation URL privacy (M) · Dev

**Problem:** Name, phone, service in query string on `/book/confirmation`.

**Fix:** Store display fields in `sessionStorage` keyed by booking id; URL only `id`, `date`, `time`, `token`, `cancelToken`.

#### QA-1.6

- [ ] Shared confirmation URL does not expose full name/phone in bar  
- [ ] Refresh confirmation page still works same session  
- [ ] Add to Calendar + cancel link still work  

---

### Step 1.7 — Docs & repo hygiene (M) · Dev

- Rewrite `README.md` for Next.js (scripts, env, architecture)  
- Update `docs/sdlc-automation.md` — remove Vite/`App.jsx` references  
- Add `.next-ci/` to `.gitignore`  
- Confirm Vercel production branch = `master`  

#### QA-1.7

- [ ] New dev can run site from README alone  
- [ ] No stale Vite instructions in primary docs  

---

### Step 1.8 — WhatsApp manual playbook (S) · You

Execute `docs/whatsapp-business-setup.md`:

- Quick replies: confirmed, 24h reminder, review link  
- Labels: New → Booked → Completed  
- After each online booking: send confirm template manually until API  

#### QA-1.8

- [ ] 5 test conversations use quick replies correctly  
- [ ] Review link matches `g.page/farwasalon/review`  

---

### Phase 1 gate — QA-1 (full)

| # | Check | Pass? |
|---|--------|-------|
| 1 | Lighthouse mobile perf ≥ previous baseline | ☐ |
| 2 | Hero video &lt; 2.5MB | ☐ |
| 3 | Book flow on iPhone Safari (375px) | ☐ |
| 4 | NAP audit signed off | ☐ |
| 5 | FAQ/Contact CTAs → `/book` | ☐ |
| 6 | Schema rating honest | ☐ |

**Sign-off:** _______________ **Date:** _______________

---

## Phase 2 — Integrations (P2, dependency-ordered)

**Start only after QA-1 passes.**

### Step 2.1 — Google Places API (M) · Dev + You

**Blocked until:** GCP billing completes (`OR_BACR2_31` resolved).

1. Enable Places API (New)  
2. Key restricted to Places only; server-side only  
3. Vercel: `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID=ChIJeVyXMig_sz4REKl0TaSkW-U`  
4. Implement `GET /api/reviews` — cache 24h  
5. Homepage: optional “Google reviews” strip (max 5)  
6. Sync `SALON_GBP_*` env from API response  

See `docs/integrations-execution.md`.

#### QA-2.1

- [ ] `/api/reviews` returns 200 on production (no key in client bundle)  
- [ ] Rating/count match Google Maps listing  
- [ ] Rich Results Test still valid  
- [ ] API budget alert set in GCP ($5/month)  

---

### Step 2.2 — WhatsApp Cloud API reminders (L) · Dev + You

**Prerequisites:** Meta Business verified; templates approved; business number +92 322 2782254 strategy confirmed.

1. Sheet columns: `reminded_24h`, `reminded_2h`, `review_sent`  
2. `lib/whatsapp-cloud.js`  
3. Cron: `/api/cron/whatsapp-reminders` + `CRON_SECRET`  
4. Optional: send on `POST /api/book` success  

See `docs/integrations-execution.md` Path B.

#### QA-2.2

- [ ] Template `booking_confirmed` delivered within 1 min of test book  
- [ ] 24h reminder only fires once per row  
- [ ] STOP/opt-out documented for staff  
- [ ] Failed sends logged (sheet column or Vercel logs)  

---

### Step 2.3 — JazzCash deposits (L) · Dev + You

**Prerequisites:** Merchant account + sandbox.

1. Sheet cols N–P: paymentStatus, jazzcashTxnRef, depositPkr  
2. `/api/payments/jazzcash/init` + callback  
3. Bridal-only deposit flag in UI (configurable)  

**OR** Phase 2.3-lite: QR + manual confirm (no API) — QA only needs staff process doc.

#### QA-2.3

- [ ] Sandbox payment → sheet `paid`  
- [ ] Failed/cancelled payment does not confirm booking  
- [ ] Customer sees clear success/failure page  

---

### Step 2.4 — E2E & a11y automation (M) · Dev

- Playwright: home, `/book` happy path, cancel with token  
- axe on `/`, `/book`, `/services` in CI (allow known warnings list)  

#### QA-2.4

- [ ] Playwright green in CI  
- [ ] No critical a11y violations on book flow  

---

### Phase 2 gate — QA-2 (full)

| Integration | Live? | QA pass? |
|-------------|-------|----------|
| Places reviews | ☐ | ☐ |
| WhatsApp reminders | ☐ | ☐ |
| JazzCash (or manual QR) | ☐ | ☐ |
| E2E CI | ☐ | ☐ |

---

## Phase 3 — Growth & polish (ongoing)

| Item | Cadence |
|------|---------|
| Request Google reviews after appointments | Weekly habit |
| GBP posts (offers, bridal season) | 2×/month when editing works |
| Blog 1 post/month | SEO long-tail |
| Compress new images before `public/` | Per upload |
| Review Search Console queries | Monthly |
| Rotate API keys | Annually or if leaked |
| Refresh `sitemap.js` lastModified on content pushes | Per release |

---

## Release checklist (every deploy)

Use `docs/RELEASE_CHECKLIST.md` plus:

1. `npm run lint && npm run test && npm run build`  
2. Phase-appropriate QA gate above  
3. Vercel preview URL smoke test  
4. Promote to production → repeat smoke on `farwasalon.com`  
5. Monitor Plausible 24h for `/book` completions and errors  

---

## Risk register

| Risk | Mitigation |
|------|------------|
| GCP billing never completes | Manual rating env; Facebook testimonials; focus GBP via phone app |
| GBP edit lock persists | NAP on website = source of truth; support ticket to Google |
| Sheet API down | 502 to user; salon monitors WhatsApp; status page later |
| Double booking race | Step 0.2 + pessimistic slot check |
| Exposed API keys | Rotate; server-only; restrict by API |

---

## Suggested execution calendar

| Week | Focus | Gate |
|------|--------|------|
| 1 | Phase 0 steps 0.1–0.5 | QA-0 |
| 2 | Phase 1 steps 1.1–1.5 | Partial QA-1 |
| 3 | Phase 1 steps 1.6–1.8 | QA-1 |
| 4+ | Phase 2 as deps unblock | QA-2 per integration |

---

## What to build next (if you say “execute Phase 0”)

1. Step 0.1 — cancellation policy (15 min)  
2. Step 0.2 — add-ons duration (half day)  
3. Step 0.5 — CI tests (5 min)  

Ops-only steps 0.3–0.4 are on you in parallel.

---

*Related docs:* `integrations-execution.md` · `booking-setup.md` · `RELEASE_CHECKLIST.md` · `quality-gates-release.md`
