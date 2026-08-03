# QA test dataset — Farwa Beauty Salon

Machine-readable source: [`scripts/qa-dataset.mjs`](../scripts/qa-dataset.mjs)  
Workflow runner: [`scripts/qa-workflow-run.mjs`](../scripts/qa-workflow-run.mjs)  
Checklist: [`qa-workflow-checklist.md`](./qa-workflow-checklist.md)

## Inventory (from live data modules)

| Entity | Count |
|--------|------:|
| Service categories | 13 |
| Bookable services | 102 |
| Blog posts | 8 |
| Location landing pages | 120 |
| Static sitemap URLs | 12 |
| **Total indexed URLs** | **153** |

Location formula: 6 top services × 10 neighborhoods × 2 patterns (`-in-` + `best-`).

---

## Base URLs

| Key | Value |
|-----|-------|
| Local default | `http://127.0.0.1:3000` |
| Production | `https://farwasalon.com` |
| Probe Origin header | `https://farwasalon.com` |

---

## Pakistani phone numbers (`PHONE_RE`)

**Valid (UI + API should accept)**

| Value | Notes |
|-------|-------|
| `03001234567` | Standard mobile |
| `0300 1234567` | Spaces |
| `0300-1234567` | Dashes |
| `+923001234567` | International |
| `923001234567` | Country code no plus |
| `03151234567` | Alternate prefix |

**Invalid (expect 400 on book, UI error on blur)**

| Value | Reason |
|-------|--------|
| `12345` | Too short |
| `02134567890` | Landline |
| `04001234567` | Bad mobile prefix |
| `abcdefghijk` | Non-numeric |
| *(empty)* | Required field |

Probe / write test phone: `03009999999`  
E2E default: `03001234567`

---

## Newsletter emails

**Valid:** `user@example.com`, `first.last@sub.example.com`, `a+tag@example.co`, `hello@farwa-salon.pk`

**Invalid (subscribe → 400):** `no-at-sign.com`, `two@@signs.com`, `@nouser.com`, `user@`, `trailing@dot.`

**Probe pattern:** `qa-probe-{timestamp}@example.com` (unique per run)

Sources: modal (`source: newsletter-modal`), footer, `qa-workflow-run` (`source: qa-workflow-run`)

---

## Slot times

Grid: **11:00–18:30** half-hour slots (16 total).

| Type | Times |
|------|-------|
| Valid | `11:00`, `11:30`, `14:00`, `18:30` |
| Invalid | `09:00`, `10:00`, `19:00`, `11:15` |

First slot: `11:00` · Last: `18:30`

---

## Date scenarios (computed at runtime)

Helpers: `localDateIso()`, `offsetDays(n)`, `offsetWeekday(n)`, `nextSunday()`.

| Scenario | Rule | slots API | book API |
|----------|------|-----------|----------|
| Today | In window | 200 | context |
| +14 days | Last allowed day | 200 | context |
| +15 days | Outside window | **400** | **400** |
| Yesterday | Past (or Sunday) | **400** or 200+`closed` | **400** |
| +2 weekday | Booking target | 200 | context |
| Next Sunday | Closed | 200+`closed:true` | **400** |

---

## Service categories (all 13)

| Category | Slug | Default service ID |
|----------|------|-------------------:|
| Threading | `threading` | 1 |
| Rica Hot Wax | `rica-hot-wax` | 8 |
| Honey Wax | `honey-wax` | 17 |
| Rica Wax | `rica-wax` | 28 |
| Bleach & Polish | `bleach-polish` | 38 |
| Massage | `massage` | 47 |
| Hair Treatments | `hair-treatments` | 54 |
| Cleansing | `cleansing` | 59 |
| Facials | `facials` | 63 |
| Nails | `nails` | 74 |
| Bridal | `bridal` | 92 |
| Hair | `hair` | 96 |
| Eyebrow Tattoo | `eyebrow-tattoo` | 100 |

*Default IDs = first service in category; see `SERVICE_CATEGORIES` in dataset for full rows.*

### Key service IDs

| ID | Service |
|----|---------|
| 1 | Eyebrow Threading |
| 2 | Upper Lip Threading |
| 7 | Full Face Threading |
| 17 | Half Arms Honey Wax |
| 25 | Underarms Honey Wax |
| 93+ | Bridal packages (default ID 92 = first bridal service) |

### Add-on booking scenarios

| Primary ID | Service | Add-on IDs |
|------------|---------|------------|
| 1 | Eyebrow Threading | 2 (Upper Lip) |
| 7 | Full Face Threading | 2, 4 |
| 17 | Half Arms Honey Wax | 25 (Underarms) |

API: `GET /api/slots?date=…&serviceId=1&addonIds=2`

---

## Blog slugs (8)

1. `bridal-beauty-timeline`
2. `skincare-mistakes-karachi-summer`
3. `threading-vs-waxing`
4. `make-manicure-last-two-weeks`
5. `best-bridal-makeup-packages-karachi-2026`
6. `gold-facial-vs-whitening-facial`
7. `complete-guide-hair-treatments-karachi`
8. `prepare-first-salon-visit-tips`

---

## Location sample URLs (10)

| Path |
|------|
| `/services/threading-in-pechs-karachi` |
| `/services/bridal-makeup-in-pechs-karachi` |
| `/services/facials-in-pechs-karachi` |
| `/services/threading-in-gulshan` |
| `/services/bridal-makeup-in-clifton-karachi` |
| `/services/best-bridal-makeup-dha` |
| `/services/best-threading-dha` |
| `/services/threading-in-bahadurabad` |
| `/services/waxing-in-tariq-road` |
| `/services/hair-in-dha` |

Neighborhoods: PECHS, Gulshan, Clifton, Bahadurabad, DHA, Tariq Road, Shahrah-e-Faisal, North Nazimabad, Saddar, Korangi.

---

## Static & marketing routes

`/`, `/beauty-salon-karachi`, `/bridal`, `/services`, `/gallery`, `/about`, `/contact`, `/team`, `/faq`, `/book`, `/blog`, `/privacy`

### Footer / nav matrix

**Navigate:** `/`, `/services`, `/book`, `/gallery`, `/blog`, `/about`, `/contact`, `/team`, `/faq`, `/bridal`

**Services column:** `/services/{slug}` for all 13 category slugs

**Hub:** `/beauty-salon-karachi`

---

## Sitemaps

| File | Expected entries |
|------|-----------------:|
| `sitemap-static.xml` | 12 |
| `sitemap-services.xml` | 13 |
| `sitemap-blog.xml` | 8 |
| `sitemap-locations.xml` | 120 |
| `sitemap.xml` | index of 4 child sitemaps |

Also: `/blog/rss.xml`

---

## Booking cancel tokens

- Issued in `POST /api/book` response as `booking.cancelToken`
- Format: `base64url(json).base64url(hmac-sha256)` with `BOOKING_CANCEL_SECRET`
- Booking ID pattern: `FBS-[A-F0-9]{4,16}`
- TTL: 90 days

**Test without live booking:**

| Case | Expected |
|------|----------|
| `POST /api/book/cancel` `{ token: "invalid.token" }` | 400 |
| `{ bookingId: "BAD-ID", date: "YYYY-MM-DD" }` | 400 |
| UI smoke | `/book/cancel?id=smoke` (mocked in e2e) |

---

## Viewport breakpoints (Playwright)

320×568, 375×812, 390×844, 768×1024, 1024×768, 1280×800  
Also tested at ~125% zoom (narrower layout width).

---

## HTML smoke strings (workflow crawl)

| Path | Must contain (SSR-safe) |
|------|-------------------------|
| `/` | Farwa Beauty Salon, PECHS |
| `/services` | Services, ItemList |
| `/book` | Book an Appointment, `id="main"` |
| `/gallery` | Gallery |
| `/blog` | Blog |
| `/bridal` | Bridal |
| `/contact` | Book Appointment, wa.me |
| `/services/threading` | Threading, Rs |
| `/about` | OUR, STORY |
| `/faq` | Frequently, `id="main"` |
| `/team` | Our Team |
| `/privacy` | Privacy Policy |

---

## WhatsApp

Number: `923222782254`  
Links: `https://wa.me/923222782254?text=…`

---

## Running the dataset

```bash
# Import in custom scripts
node -e "import { API_SCENARIOS, SERVICE_CATEGORIES } from './scripts/qa-dataset.mjs'; console.log(API_SCENARIOS().length, 'API cases')"

# Full workflow
npm run qa:workflow
BASE_URL=https://farwasalon.com npm run qa:workflow
QA_SKIP_CRAWL=1 npm run qa:workflow    # API only
QA_CRAWL_LIMIT=20 npm run qa:workflow  # partial crawl
```
