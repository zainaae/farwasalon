# QA workflow checklist

Structured manual + automated pass for Farwa Beauty Salon. Pair with [`qa-test-dataset.md`](./qa-test-dataset.md) and `scripts/qa-dataset.mjs`.

## Quick commands

```bash
# Full local gate (lint, unit, build, e2e)
npm run verify:full

# Lint + unit + build only
npm run verify

# Dataset-driven API + route crawl
npm run qa:workflow

# Against production
BASE_URL=https://farwasalon.com npm run qa:workflow

# Legacy booking probe (subset of API scenarios)
node scripts/booking-api-probe.mjs
BASE_URL=https://farwasalon.com node scripts/booking-api-probe.mjs

# Optional live sheet write (cancel row after)
QA_WRITE=1 BASE_URL=https://farwasalon.com npm run qa:workflow
```

## Automated matrix

| Layer | Command | Covers |
|-------|---------|--------|
| Unit | `npm run test` | Booking rules, slots, cancel tokens, data integrity |
| Build | `npm run build` | Static generation, sitemap routes |
| E2E | `npm run test:e2e` | Book UI, newsletter, footer, services, blog, locations, responsive |
| Workflow | `npm run qa:workflow` | API scenarios + key route crawl + HTML snippets |

## 1. Booking flow (UI)

- [ ] `/book` — expand category, pick service, **Next**
- [ ] Add-on chips appear for service IDs 1, 7, 17 (see dataset `ADDON_SCENARIOS`)
- [ ] Date strip skips Sundays; duration label updates with add-ons
- [ ] Slot grid loads from `/api/slots`; empty day shows “No times available”
- [ ] Contact step: invalid phone → `#bk-phone-error`; valid `03001234567` → enabled Confirm
- [ ] Confirmation `/book/confirmation` shows service, date, time, cancel link
- [ ] Cancel page `/book/cancel` with token → success **>2h** before slot; blocked **<2h**
- [ ] Double-book same slot (two browsers) → second gets **409**

## 2. Newsletter

- [ ] Home: clear `localStorage.farwa-newsletter-seen`, wait ~25s → modal
- [ ] Submit `e2e-test@example.com` → welcome state (or **503** if Sheets unset)
- [ ] Footer subscribe form (if present) posts to `/api/subscribe`
- [ ] Desktop exit-intent (manual only — e2e skipped)

## 3. Contact & WhatsApp

- [ ] `/contact` — form fields, service picker, WhatsApp submit link (`wa.me/923222782254`)
- [ ] Service modals on `/services/*` — **Book** links to `/book?serviceId=…`

## 4. Services & filters

- [ ] `/services` — 13 category cards, filter tabs (All + Waxing group)
- [ ] Each `/services/{slug}` — H1, prices, FAQ/schema where applicable
- [ ] Hair + Bridal modals open and book deep-link works

## 5. Blog, gallery, bridal

- [ ] `/blog` — 8 posts; each `/blog/{slug}` renders article
- [ ] `/blog/rss.xml` — valid RSS
- [ ] `/gallery` — photos and compare slider
- [ ] `/bridal` — packages, trial CTA → `/book?category=Bridal`

## 6. Location SEO

- [ ] `/beauty-salon-karachi` hub loads
- [ ] Sample location URLs (10 in dataset) — H1, book CTA, breadcrumbs
- [ ] `/sitemap-locations.xml` — **120** URLs (6 × 10 × 2)

## 7. APIs (workflow runner)

| Scenario | Expected |
|----------|----------|
| slots today / +14d | 200 |
| slots +15d | 400 |
| slots yesterday | 400 (or 200 + `closed` if Sunday) |
| slots + addonIds | 200 |
| subscribe valid | 200 or 503 |
| subscribe invalid email | 400 |
| book past date / 09:00 / bad phone | 400 |
| cancel invalid token / bad booking ID | 400 |

## 8. Responsive / a11y (e2e viewports)

Check at **320, 375, 390, 768, 1024, 1280** px on `/`, `/services`, `/services/threading`, `/book`, `/gallery`:

- [ ] No horizontal overflow
- [ ] `#main` visible; mobile nav usable (`e2e/mobile-nav.spec.ts`)

## 9. Footer / nav matrix

Navigate column (10 links) + Services column (13) + location hub — all **200** with H1 (`e2e/footer-links.spec.ts`).

## 10. Production smoke (post-deploy)

```bash
BASE_URL=https://farwasalon.com npm run qa:workflow
BASE_URL=https://farwasalon.com node scripts/booking-api-probe.mjs
```

- [ ] IndexNow key: `https://farwasalon.com/farwa-salon-indexnow.txt`
- [ ] Plausible / Vercel Analytics pageviews

## Pass criteria

Ship when **all** of the following are green on the target environment:

1. `npm run verify`
2. `npm run test:e2e`
3. `npm run qa:workflow` (local or `BASE_URL` for prod/preview)
