# How to execute: Google reviews API, JazzCash deposits, WhatsApp reminders

Practical roadmap for Farwa Beauty Salon (`farwasalon.com`) on the **current stack**: Next.js on Vercel, bookings in Google Sheets, email via Apps Script.

**Order of effort (recommended):** WhatsApp reminders → Google reviews sync → JazzCash deposits.

---

## 1. Google Places / reviews on the website

### What Google actually allows

| Approach | What you get | Best for |
|----------|----------------|----------|
| **Places API (New)** — Place Details | Up to **5** recent reviews + `rating` + `userRatingCount` | Homepage “latest reviews” widget |
| **Google Business Profile API** | List/manage reviews as **owner** (OAuth) | Syncing all reviews, replying from your app |
| **Embed / link only** | No API cost | What you have now (`g.page/farwasalon/review`) |

Google’s terms: don’t fake reviews; show attribution; cache responsibly. **Place ID must match your GBP listing.**

### Your Place ID

From `src/data.js` → `MAPS_LINK`, the listing is **Farwa beauty salon** at `24.8797532, 67.0584185`.

1. Open [Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder) or call Places API once with name + coordinates.
2. Save as env: `GOOGLE_PLACE_ID=ChIJeVyXMig_szoQEKI0TaSkW-U` (confirmed in `docs/domain-setup.md`).

### Step A — Places API (show reviews on site) — ~2–4 hours dev

1. **Google Cloud** (same project as Sheets if you have one):
   - Enable **billing** on the project. If card verification fails with **`OR_BACR2_31`**, try a different payment method or contact Google Cloud billing support — Places API will not work until billing is active.
   - Enable **Places API (New)**.
   - Create an API key → restrict to **Places API** + **IP** (Vercel) or use server-only routes (no browser key).

2. **Vercel env**
   ```env
   GOOGLE_PLACES_API_KEY=AIza...
   GOOGLE_PLACE_ID=ChIJ...
   ```

3. **Server route** (never expose the key to the browser):
   - `GET /api/reviews` → calls  
     `https://places.googleapis.com/v1/places/{PLACE_ID}`  
     with header `X-Goog-FieldMask: rating,userRatingCount,reviews`  
   - Cache response **24h** (`revalidate: 86400` + `Cache-Control` on the route).

4. **Frontend** *(implemented in repo)*
   - Homepage testimonials fetch `/api/reviews` when env is set; otherwise keep Facebook fallback (`app/home-below-fold.jsx`).
   - After first successful fetch, update `SALON_GBP_RATING` / `SALON_GBP_REVIEW_COUNT` in Vercel from `rating` + `userRatingCount` so JSON-LD matches Google (see `lib/business-schema.js`).

5. **Cost**
   - Places Details is billed per request; with 1 cached fetch/day → negligible.

### Step B — Auto-sync rating for SEO (optional cron)

- Vercel Cron: `GET /api/cron/sync-gbp-rating` weekly.
- Same Places call → if rating/count changed, you update env manually or store in a small JSON in the sheet / KV.

### Step C — Full review management (later)

- Enable **Google Business Profile API** + OAuth as salon owner.
- Heavier setup; use only if you need reply-to-review from a dashboard.

### Quick win (no API)

Keep linking to [Google reviews](https://g.page/farwasalon/review) and Facebook; use Places API only when you want live stars + 5 snippets on the homepage.

---

## 2. JazzCash deposits (booking advance)

### Business setup (you do this, not code)

1. Register as **JazzCash Merchant** (business account): [JazzCash Business](https://www.jazzcash.com.pk/business/) or your relationship manager.
2. Get: **Merchant ID**, **Password/Integrity Salt**, **Return URL** allowed list, sandbox credentials for testing.
3. Decide policy: e.g. **Rs 500–2000 deposit** for bridal only, or 20% of service price.

### Product flow on the site

```
/book step 3 → optional "Pay deposit with JazzCash"
  → POST /api/payments/jazzcash/init
  → redirect to JazzCash hosted page
  → user pays
  → JazzCash POSTs to /api/payments/jazzcash/callback
  → mark booking Paid in Sheet + show confirmation
```

### Sheet changes

Add columns on **Bookings** tab (example):

| Col | Field |
|-----|--------|
| N | `paymentStatus` (`pending` / `paid` / `waived`) |
| O | `jazzcashTxnRef` |
| P | `depositPkr` |

Update `lib/google-sheets.js` `appendBooking` / a new `updateBookingPayment()` for columns N–P.

### Code pieces (implementation checklist)

1. `lib/jazzcash.js` — build secure hash per JazzCash docs (amount, bill reference, return URLs).
2. `POST /api/payments/jazzcash/init` — body: `bookingId`, `amount`; returns `{ redirectUrl }`.
3. `POST /api/payments/jazzcash/callback` — verify hash, idempotent update sheet, redirect to `/book/confirmation?paid=1`.
4. **Env**
   ```env
   JAZZCASH_MERCHANT_ID=
   JAZZCASH_PASSWORD=
   JAZZCASH_INTEGRITY_SALT=
   JAZZCASH_RETURN_URL=https://farwasalon.com/api/payments/jazzcash/callback
   JAZZCASH_SANDBOX=true
   ```
5. **Book flow UI** — only show deposit for services you configure (e.g. Bridal in `data.js` flag `depositRequired: true`).

### Risks

- Test in **sandbox** first; wrong hash = failed payments.
- Bookings without payment should stay `pending` with a time limit (release slot after 30 min) — phase 2.
- Refunds are manual via JazzCash merchant portal unless you add refund API later.

### Simpler alternative

**JazzCash “Request Money” / static QR** on confirmation page (no API): customer sends screenshot on WhatsApp; staff marks paid in sheet. Zero dev, no automation.

---

## 3. WhatsApp Business reminders

Two paths: **manual (today)** vs **automated (API)**.

### Path A — Manual (0 code, start today)

Use the existing guide: `docs/whatsapp-business-setup.md`.

| When | Action |
|------|--------|
| Booking confirmed (online) | Apps Script email + optional: you send WA template from phone |
| 24h before | WhatsApp **greeting + appointment details** (saved quick reply) |
| 2h before | Short reminder |
| After service | Link to Google review (message in setup doc §7) |

**Labels** in WhatsApp Business: New → Booked → Completed (see setup doc §7).

### Path B — Automated (WhatsApp Cloud API) — ~1–2 days dev + Meta approval

#### Prerequisites

1. [Meta Business Suite](https://business.facebook.com/) — verify business.
2. **WhatsApp Business Platform** → add phone number.  
   ⚠️ Cloud API number often **cannot** stay on the phone app the same way; confirm with Meta or use a second number for API.
3. Create **message templates** (English + Urdu if needed); Meta approves in ~24–48h:

   | Template name | Use |
   |----------------|-----|
   | `booking_confirmed` | Right after `/api/book` success |
   | `appointment_reminder_24h` | Day before |
   | `appointment_reminder_2h` | Same day |
   | `review_request` | 24h after appointment |

   Templates must use `{{1}}` placeholders (name, date, time, service, address).

#### Architecture (fits your repo)

```
Google Sheet (Bookings)
       ↑
/api/book (already writes rows)
       ↑
Vercel Cron (hourly)
  → /api/cron/whatsapp-reminders
  → reads rows: date=tomorrow, status=Confirmed, reminded_24h != YES
  → Meta Graph API POST /{phone_id}/messages
  → write reminded_24h=YES in sheet
```

#### Env

```env
WHATSAPP_TOKEN=EAAG...          # Permanent token from Meta
WHATSAPP_PHONE_NUMBER_ID=...    # From WhatsApp → API setup
WHATSAPP_BUSINESS_ACCOUNT_ID=...
CRON_SECRET=...                 # Protect /api/cron/*
```

#### Implementation checklist

1. `lib/whatsapp-cloud.js` — `sendWhatsAppTemplate` + `maybeSendBookingConfirmed` (ships env-gated; no-ops without credentials / flag).
2. On successful `POST /api/book` — optional immediate `booking_confirmed` when `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and `WHATSAPP_SEND_BOOKING_CONFIRM=true` are set.
3. **Staff path until then:** morning Sheet→WA digest (`sendMorningConfirmDigest` in `google-apps-script/EmailBot.gs`) — see `docs/whatsapp-business-setup.md` §5c.
4. `app/api/cron/whatsapp-reminders/route.js` — still future; verify `Authorization: Bearer ${CRON_SECRET}`; query sheet; send due reminders.
5. **vercel.json** cron (when reminders ship):
   ```json
   { "crons": [{ "path": "/api/cron/whatsapp-reminders", "schedule": "0 * * * *" }] }
   ```
6. Sheet columns for reminders (later): `reminded_24h`, `reminded_2h`, `review_sent` (YES/empty).

#### Providers (if you don’t want raw Meta API)

| Provider | Pros |
|----------|------|
| [Meta Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api) | Cheapest at scale |
| [WATI](https://wati.io) | UI + templates, popular in PK |
| [Twilio](https://www.twilio.com/whatsapp) | Reliable, higher cost |

All need the same approved templates.

#### Compliance

- Only message customers who **booked** (opt-in implied).
- 24-hour **session** rule: outside 24h window you must use **templates** (not free-form).
- Include opt-out: “Reply STOP to opt out” in template footer if you scale marketing.

### Path C — Hybrid (recommended for Farwa)

1. **Now:** Apps Script email on new booking (`google-apps-script/EmailBot.gs`) + **morning confirm digest** + manual WA review asks (evening digest).
2. **Next:** Cloud API only for `booking_confirmed` + `appointment_reminder_24h` (flag on after Meta approval).
3. **Later:** review_request + JazzCash paid confirmation template.

---

## Environment summary (all three features)

```env
# Reviews
GOOGLE_PLACES_API_KEY=
GOOGLE_PLACE_ID=
SALON_GBP_RATING=4.9
SALON_GBP_REVIEW_COUNT=

# JazzCash
JAZZCASH_MERCHANT_ID=
JAZZCASH_PASSWORD=
JAZZCASH_INTEGRITY_SALT=
JAZZCASH_RETURN_URL=
JAZZCASH_SANDBOX=true

# WhatsApp Cloud API
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
CRON_SECRET=

# Existing booking (already required)
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_SHEET_ID=
BOOKING_CANCEL_SECRET=
```

---

## What to do this week (checklist)

- [ ] **GBP:** Confirm address matches website (`lib/business-schema.js` / footer).
- [ ] **Reviews (you):** GCP billing active → enable Places API (New) → create restricted API key → add `GOOGLE_PLACES_API_KEY` + `GOOGLE_PLACE_ID` on Vercel → test `GET /api/reviews`.
- [x] **Reviews (code):** `lib/google-places.js`, `GET /api/reviews`, homepage fallback wired (`app/home-below-fold.jsx`).
- [ ] **WhatsApp:** Finish `docs/whatsapp-business-setup.md` quick replies; decide API vs manual.
- [ ] **JazzCash:** Open merchant account; decide deposit amount; start with QR/manual or sandbox API.
- [ ] **Templates:** Submit 2–3 WhatsApp templates in Meta if going automated.

---

## Related docs in this repo

| Doc | Topic |
|-----|--------|
| `docs/whatsapp-business-setup.md` | Phone app, labels, review messages |
| `docs/booking-setup.md` | Sheets + Vercel booking |
| `docs/booking-env.md` | Env vars |
| `docs/google-business-profile.md` | GBP + review link |
| `docs/booking-backend-architecture.md` | Full notification design |

When you’re ready to implement in code, say which track to build first (**reviews API**, **JazzCash**, or **WhatsApp cron**) and we can add the routes and sheet columns in the repo.

### Test `/api/reviews` after env is set

```bash
# Local (with .env.local)
curl -s http://127.0.0.1:3000/api/reviews | jq

# Production
curl -s https://farwasalon.com/api/reviews | jq
```

Expected when configured: `{ "configured": true, "source": "google", "rating": 4.9, "reviewCount": 6, "reviews": [...] }`.  
Without env: `{ "configured": false, "source": "fallback" }` (homepage keeps Facebook quotes).
