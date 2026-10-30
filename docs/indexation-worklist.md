# Farwa Salon — Indexation Worklist

Generated 2026-07-30 from the deployed sitemaps. 62 URLs total
(was 110 before the 48 near-duplicate location hubs were retired).

> I cannot read your Search Console. This is the full inventory of what the site
> *asks* to be indexed, grouped by what to do about it. Diff it against the GSC
> export ("Pages" -> Export) to confirm status per URL.

---

## Status — auditor recheck 30 Oct 2026 (~17:06 UTC)

| Status | Item | Notes |
|--------|------|-------|
| **Done** | Freedom Deal scrub | 0 “Freedom” in live HTML; `/freedom-deal` → `/deals` |
| **Done** | Hydration error | Cleared on recheck |
| **Done** | Waxing floor | From Rs 150 (hot-wax face floor) |
| **Done** | `/deals` | noindex + omitted from sitemap + in nav |
| **Done** | Ratings | 4.5★ / 35 reviews sitewide |
| **Partly** | Home → blog links | 7 of 29 posts linked — OK for now |
| **Done** | Area doorway 301s | 60 `*-in-*` → category; 6 thin `/areas` → `/areas`; keep PECHS, Tariq Road, Bahadurabad, Gulshan + `/areas` hub; sitemap-locations **5** |
| **Clears with 301s** | Meta cutoffs on retired hubs | Surviving kept-hub metas budgeted |
| **Still open** | `/prices` date | Still “updated 31 July 2026” — do **not** bump without a real printed-menu review |
| **Shipped / N/A** | Small copy (facials count, engagement duration, bridal “from”, phone display, titles) | Engagement `~3h`→`~2h 30m` on `/bridal`; privacy phone spacing; longest non-area titles trimmed. Facials already “11”; home bridal already “from”; featured+grid review repeat is intentional, not a data duplicate |

**Area 301s:** SHIPPED on auditor keepers (PECHS / Tariq Road / Bahadurabad / Gulshan).

---

## 1b. Money URLs — GSC re-request after trust/copy deploys (owner)

Engineering can ping IndexNow (`npm run ping:indexnow` / CI on `master`).
**Google still needs a human in Search Console.** After each production deploy
that changes prices, deals, or trust claims:

1. Open [Google Search Console](https://search.google.com/search-console) → property `farwasalon.com`
2. **URL Inspection** → paste one URL → wait for result → **Request indexing**
3. Work the money list first (quota ~10/day):

| # | URL | Why |
|---|-----|-----|
| 1 | `https://farwasalon.com/freedom-deal` | Azadi / Freedom Deal canonical (AI Features was citing `/azadi-sale`) |
| 2 | `https://farwasalon.com/` | Home trust + deal strip |
| 3 | `https://farwasalon.com/prices` | Full rate card |
| 4 | `https://farwasalon.com/services/nails` | Top AI Features page |
| 5 | `https://farwasalon.com/services/eyebrow-tattoo` | Microblading Rs 20,000 |
| 6 | `https://farwasalon.com/blog/eyebrow-microblading-karachi-guide` | Money blog |
| 7 | `https://farwasalon.com/deals` | Live offers only |
| 8 | `https://farwasalon.com/faq` | Price / booking answers |

Same checklist lives in [`search-console-setup.md`](./search-console-setup.md)
(Request indexing after deploy). Spot-check the Inspection HTML preview: no
`first-facial-10`, no invented 20%/10% off copy, Freedom still **14%** until end date.

---

## 1c. Aug 2026 — Validate fix (Redirect error + Not found)

Live probes (2026-08-10): all five Azadi aliases are a **single** `308` →
`/freedom-deal` → `200`. The two “Not found” hubs are **200** on apex again.
GSC rows are stale — owner must click **Validate fix**.

**Redirect error → Validate fix** (do not Request indexing on these):

1. `https://farwasalon.com/azadi-offer`
2. `https://farwasalon.com/independence-sale`
3. `https://farwasalon.com/independence-day-offer`
4. `https://farwasalon.com/jashn-e-azadi`
5. `https://farwasalon.com/azadi-deal`

Also validate if listed: `/azadi-sale`, `/azaadi-sale`, `/14-august-sale`, `/14-august-offer`.

**Not found → Validate fix:**

1. `https://farwasalon.com/services/nails-in-north-nazimabad`
2. `https://farwasalon.com/services/bridal-makeup-in-tariq-road`

Then **URL Inspection → Request indexing** on `https://farwasalon.com/freedom-deal`
so Azadi / Independence queries stop attaching to alias URLs in AI Features.

---

## 1. Re-request indexing — 9 rewritten posts

These were 108-236 words and were very likely your "Crawled - currently not
indexed". All rewritten to 717-881 words on 2026-07-30. Google has already
crawled and rejected them once, so they need an explicit re-request.

Priority order (commercial intent first) — do ~10/day as quota allows:

 1. https://farwasalon.com/blog/haircut-blowdry-hair-colour-cost-karachi   (880w, pricing intent)
 2. https://farwasalon.com/blog/face-bleach-karachi-loreal                (881w)
 3. https://farwasalon.com/blog/manicure-pedicure-price-list-karachi      (859w, full rate list)
 4. https://farwasalon.com/blog/janssen-vs-hd-whitening-facial-karachi    (729w, was thinnest at 108)
 5. https://farwasalon.com/blog/rica-wax-vs-honey-wax-karachi             (785w, consolidated)
 6. https://farwasalon.com/blog/deep-cleansing-vs-facial-karachi          (857w)
 7. https://farwasalon.com/blog/full-body-massage-karachi-women-salon     (820w)
 8. https://farwasalon.com/blog/face-polish-karachi-loreal-diamond-sandal (738w)
 9. https://farwasalon.com/blog/salon-near-tariq-road-pechs               (717w, local intent)

Also worth a slot — campaign page, opens 5 August:

    https://farwasalon.com/freedom-deal

---

## 2. Resolved — 48 location pages retired

This was your "Alternative page with proper canonical: 48". The arithmetic was
exact: 54 location pages minus 6 kept (one per service group) = 48 folded.

Measured on the built HTML, pages sharing a service were 84-91% identical to
each other — one template with the area name swapped. Every one declared a
self-canonical and Google overrode it, which is what it does with
near-duplicates.

**Action taken (2026-07-30):** the 48 now 301 to their service category. Six
PECHS hubs survive, because those differ by service rather than by area —
58% similarity against each other, not 91%. Nothing 404s.

You do not need to do anything with these in Search Console. As Google
recrawls it will follow the 301s; the "Alternative page" count should fall
toward zero over the following weeks and the signal consolidates onto the
category pages.

Kept:

    https://farwasalon.com/services/threading-in-pechs-karachi
    https://farwasalon.com/services/bridal-makeup-in-pechs-karachi
    https://farwasalon.com/services/facials-in-pechs-karachi
    https://farwasalon.com/services/hair-in-pechs-karachi
    https://farwasalon.com/services/nails-in-pechs-karachi
    https://farwasalon.com/services/waxing-in-pechs-karachi

Adjacent areas are now served by real writing rather than a template — see
/blog/salon-near-tariq-road-pechs. Add an area hub back only when there is a
page's worth of genuinely different things to say about it.

---

## 3. Healthy — no action

### Core pages (14)

    https://farwasalon.com/
    https://farwasalon.com/about
    https://farwasalon.com/beauty-salon-karachi
    https://farwasalon.com/blog
    https://farwasalon.com/book
    https://farwasalon.com/bridal
    https://farwasalon.com/contact
    https://farwasalon.com/deals
    https://farwasalon.com/faq
    https://farwasalon.com/freedom-deal
    https://farwasalon.com/gallery
    https://farwasalon.com/prices
    https://farwasalon.com/privacy
    https://farwasalon.com/services

### Service categories (13)

    https://farwasalon.com/services/bleach-polish
    https://farwasalon.com/services/bridal
    https://farwasalon.com/services/cleansing
    https://farwasalon.com/services/eyebrow-tattoo
    https://farwasalon.com/services/facials
    https://farwasalon.com/services/hair
    https://farwasalon.com/services/hair-treatments
    https://farwasalon.com/services/honey-wax
    https://farwasalon.com/services/massage
    https://farwasalon.com/services/nails
    https://farwasalon.com/services/rica-hot-wax
    https://farwasalon.com/services/rica-wax
    https://farwasalon.com/services/threading

### Blog posts not in section 1 (20)

    https://farwasalon.com/blog/beauty-parlour-near-me-karachi-guide
    https://farwasalon.com/blog/best-bridal-makeup-packages-karachi-2026
    https://farwasalon.com/blog/best-facial-for-acne-oily-skin-karachi
    https://farwasalon.com/blog/bridal-beauty-timeline
    https://farwasalon.com/blog/complete-guide-hair-treatments-karachi
    https://farwasalon.com/blog/eid-salon-booking-guide-karachi
    https://farwasalon.com/blog/eyebrow-microblading-karachi-guide
    https://farwasalon.com/blog/facials-near-me-karachi-pechs
    https://farwasalon.com/blog/gold-facial-vs-whitening-facial
    https://farwasalon.com/blog/hair-fall-treatment-karachi-guide
    https://farwasalon.com/blog/keratin-treatment-price-karachi
    https://farwasalon.com/blog/make-manicure-last-two-weeks
    https://farwasalon.com/blog/mehndi-engagement-makeup-karachi
    https://farwasalon.com/blog/monsoon-hair-skin-care-karachi
    https://farwasalon.com/blog/party-makeup-karachi-guide
    https://farwasalon.com/blog/prepare-first-salon-visit-tips
    https://farwasalon.com/blog/salon-price-list-karachi-2026
    https://farwasalon.com/blog/skincare-mistakes-karachi-summer
    https://farwasalon.com/blog/threading-near-me-karachi-pechs
    https://farwasalon.com/blog/threading-vs-waxing

---

## 4. Expected in GSC as "Page with redirect" — correct, ignore

These permanently redirect. They should never be indexed. After the Aug 2026
absolute-destination fix, each is a **single hop** to the apex 200 URL (even
when crawled on `www`).

**"Redirect error" is different from "Page with redirect".** Redirect error
means Google could not finish the hop (chain, loop, or target 404). That
showed up in the Jul 28–Aug 5 validation window while location hubs were
briefly retired (best-* → -in-* → 404) and while www + relative Location
headers chained through an extra hop. Re-run **Validate fix** in GSC after
deploying absolute apex destinations; do not delete these redirects.

    https://farwasalon.com/team
    https://farwasalon.com/pricing
    https://farwasalon.com/azadi-sale
    https://farwasalon.com/azadi-deal
    https://farwasalon.com/azaadi-sale
    https://farwasalon.com/azadi-offer
    https://farwasalon.com/jashn-e-azadi
    https://farwasalon.com/independence-day-offer
    https://farwasalon.com/independence-sale
    https://farwasalon.com/14-august-sale
    https://farwasalon.com/14-august-offer
    https://farwasalon.com/blog/full-body-wax-honey-vs-rica-karachi
    https://farwasalon.com/freedom-deal
    https://farwasalon.com/azadi
    https://farwasalon.com/freedom
    /* plus legacy /services/best-{service}-{neighborhood} → canonical -in- hubs */

---

## 5. SHIPPED — mass 301 of doorway area/location pages (30 Oct 2026)

**Status:** shipped on auditor-recommended keepers (owner did not pick a custom
list). Branch `fix/area-doorway-redirects`.

**Before:** ~70 live URLs — 60 `/services/{service}-in-{area}` SKUs + 10
`/areas/{slug}` hubs — all returning **200**, listed in
`sitemap-locations.xml` (70 entries).

**After:**

### Keep (indexed + in sitemap)

| URL | Notes |
|-----|--------|
| `/areas` | New hub — kept catchments + “we serve greater Karachi from PECHS” |
| `/areas/pechs-karachi` | Highest priority — salon location |
| `/areas/tariq-road` | Kept hub |
| `/areas/bahadurabad` | Kept hub |
| `/areas/gulshan` | Gulshan-e-Iqbal |

`sitemap-locations.xml` = **5** URLs (hub + 4 kept). `LAST_SERVICE_UPDATE` /
`/prices` “updated 31 July” unchanged.

### Redirect (301)

| Pattern | Count | Destination |
|---------|------:|-------------|
| `/services/{service}-in-{area}` | 60 | Parent category (`/services/threading`, `/services/bridal`, `/services/facials`, `/services/hair`, `/services/nails`, `/services/rica-wax`) |
| Legacy `/services/best-{service}-{area}` | 60 | Same parent categories (no hop through retired `-in-` landers) |
| Non-kept `/areas/{slug}` (dha, clifton-karachi, saddar, north-nazimabad, shahrah-e-faisal, korangi) | 6 | `/areas` |

Meta cutoffs on retired SKUs clear via redirect. Kept hub + major category
metas already budgeted; trivial kept-hub description polish only.

### Post-deploy

- GSC **Validate fix** on Redirect / Soft 404 rows for old URLs — do **not**
  Request indexing on redirected URLs.
- Internal chrome/blog/bridal/home links updated to `/areas/*` + category pages
  (avoid redirect chains).


## 6. Oct 2026 crawl — Freedom Deal retirement (eng)

`/freedom-deal` and Azadi aliases now **301 → `/deals`**. Dropped from sitemap
and `llms.txt`. Re-request indexing is not needed on `/freedom-deal`; use
**Validate fix** under "Page with redirect" after production deploy clears the
stale prerender (home/prices/llms must show zero "freedom" in HTML).

`/deals` is **noindex** while no live/teased offers exist; sitemap + IndexNow
omit it under the same `hasDealOffers` gate and re-include it when a real deal
is published again.

### Prices date honesty (30 Oct 2026)

`/prices` still shows **updated 31 July 2026** (`LAST_SERVICE_UPDATE`). That is
intentional: `PRICES_LAST_VERIFIED` was bumped to 2026-10-30 for freshness-test
hygiene / targeted waxing-floor corrections, **not** a full line-by-line menu
re-verify. Do **not** bump sitemap `/prices` lastmod or the page eyebrow until
the owner completes a real printed-menu pass against the floor list.

---

## 7. SEO watch status — run 4 (30 Oct 2026)

Automated crawl / SERP spot-check. Update after each watch run.

| ID | Item | Status | Notes |
|----|------|--------|-------|
| **NEW** | Waxing FAQ / FAQPage JSON-LD claimed “Individual area pricing starts from Rs 600” on waxing hubs while titles/meta use **From Rs 150** (Lower Lip Rica Hot Wax) | **Fixed** | `CAT_FAQS['Rica Wax']` full-body Q&A now splits body (from Rs 600) vs face hot wax (from Rs 150). Feeds `/services/waxing-in-*`, `/services/rica-wax`, `/services/honey-wax` (shared FAQ slice), and FAQPage JSON-LD. |
| F1 | *(prior crawl item)* | Holding | — |
| F2 | *(prior crawl item)* | Holding | — |
| #418 | *(prior crawl item)* | Holding | — |
| Reviews | GBP / on-site review sync | Holding | — |
| **O1** | Mass 301 of ~70 area/location pages | **Done** | Shipped: keep 4 hubs + `/areas`; 60+6 redirects (§5). |
| **O2** | Meta description cutoffs | **Open** | Mostly area hubs; trivial polish on keepers only until redirect plan ships. |
| **O3** | `/prices` “updated” date | **Untouched** | No fake bump — see §6 Prices date honesty. |
| **O4** | `/deals` noindex + home blog count | **Intentional** | `/deals` stays noindex until a real offer; do not re-index. Home showing 7 blogs is OK for now. |

**Cache / external checks:** Google’s cached HTML may still show old **Rs 600** waxing FAQ floors or stale **4.6·19** rating snippets until the owner **Request indexing** on money URLs (§1b). For live SERP/cache probes, use WebSearch **extended mode** — do not treat cache as source of truth after deploy.