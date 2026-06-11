# Staging / preview QA checklist

Run before promoting a preview deploy to production. Replace `BASE` with your Vercel preview URL or `http://127.0.0.1:3000` locally.

## 1. Automated (local or CI)

```bash
npm run verify          # lint + unit tests + build
npm run test:e2e        # Playwright (starts dev server)
```

## 2. API probe (no UI)

With dev server or preview running:

```bash
node scripts/booking-api-probe.mjs
# or
BASE_URL=https://your-preview.vercel.app node scripts/booking-api-probe.mjs
```

| Scenario | Expected |
|----------|----------|
| slots today / +14d | 200 |
| slots +15d / yesterday | 400 |
| slots + addonIds | 200, fewer slots vs no addon |
| book past date / 09:00 | 400 |
| subscribe POST | 200 (Sheets configured) or 503 (missing env) |

**Live write (optional):** creates one real booking row — cancel it in the sheet after.

```bash
PROBE_WRITE=1 BASE_URL=https://your-preview.vercel.app node scripts/booking-api-probe.mjs
```

## 3. Vercel env (required for book + newsletter)

Set in **Project → Settings → Environment Variables** (Preview + Production):

| Variable | Purpose |
|----------|---------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account client email |
| `GOOGLE_PRIVATE_KEY` | PEM private key (`\n` newlines OK) |
| `GOOGLE_SHEET_ID` | Spreadsheet ID from URL |
| `BOOKING_CANCEL_SECRET` | HMAC for cancel links |

Share the spreadsheet with the service account email (Editor). Tab **Bookings** must exist with headers A–L. Tab **Subscribers** is auto-created on first newsletter signup.

## 4. Manual — booking flow

- [ ] `/book` — pick service + add-on → duration label updates → fewer slots when add-ons selected
- [ ] Complete booking → confirmation shows cancel link
- [ ] Cancel **>2h** before → success; **<2h** → policy error
- [ ] Double-book same slot (two browsers) → second gets 409

## 5. Manual — newsletter

- [ ] Wait ~25s on home (or clear `farwa-newsletter-seen` in localStorage) → modal opens
- [ ] Submit email → success state (or graceful 503 if Sheets not configured on preview)
- [ ] Row appears in **Subscribers** sheet (Email, FirstName, SubscribedAt, Source)

### Exit-intent (desktop only)

Headless e2e cannot reliably trigger `mouseleave` at `clientY <= 0`. On a real desktop browser:

1. Clear `localStorage.farwa-newsletter-seen`
2. Load home, do not scroll for 25s (timer path) **or** move cursor quickly out through the top of the viewport
3. Newsletter dialog should open once per session

Documented skip: `e2e/newsletter-modal.spec.ts` (`exit-intent mouseleave opens modal`).

## 6. Manual — location pages

- [ ] `/sitemap-locations.xml` returns ~120 URLs (6 services × 10 neighborhoods × 2 patterns)
- [ ] Sample: `/services/threading-in-gulshan` — H1, book CTA, breadcrumbs
- [ ] Build log: no per-page data fetches (static `generateStaticParams`)

## 7. Post-deploy smoke

```bash
BASE_URL=https://farwasalon.com node scripts/booking-api-probe.mjs
```

- [ ] Home LCP is poster image; desktop hero video fades in (WebM on supported browsers)
- [ ] Plausible / Analytics receiving pageviews on preview
