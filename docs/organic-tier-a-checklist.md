# Tier A organic — offline checklist

Site/code work lives in the repo. Do these manually (owner / marketing). Check boxes as you go.

## Why the sitemap got smaller (and how impressions grow)

We **intentionally** cut ~120 thin `best-*` / duplicate location URLs down to curated hubs with unique copy. Thin duplicates hurt crawl quality more than raw URL count helps.

**GSC queries / clicks / impressions grow from:**

1. **Quality indexable URLs** (bridal, prices, near-me blogs, PECHS/Tariq hubs) — not blank templates.
2. **Stronger titles, H1s, FAQs, CTAs** on money pages so CTR rises when you already rank.
3. **Fresh commercial blogs** (bleach, massage, nails, haircut/colour, cleansing, wax packages).
4. **GBP + directory claims** with **identical NAP** everywhere.

Do **not** restore the pruned thin location matrix. Grow hubs only with real unique blurbs. Do **not** invent HydraFacial / keratin / lash SKUs.

**Sitemap after this ship (approx.):** static 12 · service categories 13 · blog **27** · locations **36** · **~88** total URLs (was ~58 after prune; thin matrix was ~180+).

### Locked NAP (copy exactly)

`Plot 165/G-1, Saima Terrace, Block 3, PECHS, Karachi 75400 · Mon–Sat 11–7 · +92 322 278 2254`

Women-only PECHS **studio** — one branch; not an at-home parlour for daily services.

## Directory claim list (same NAP everywhere)

Claim/update each listing; hours, phone, and address must match the locked NAP above. Prefer deep links to farwasalon.com/book, /bridal, /prices.

- [ ] **Google Business Profile (GBP)** — primary; photos, Q&A, posts
- [ ] **Bing Places** — claim from GBP
- [ ] **Lookup.pk** (or Lookup Karachi)
- [ ] **Hamariweb** business / salon listing
- [ ] **Ypages.pk**
- [ ] **Beautyparlour.com.pk**
- [ ] **Wheree**
- [ ] **Shehnai** (wedding directory)
- [ ] **Shadiyana** — bridal packages + /bridal + /book
- [ ] **Fresha** (if listed) — prices/hours match site; prefer farwasalon.com/book over a second live calendar

## After this deploy — request indexing (GSC)

URL Inspection → **Request indexing** for:

- `https://farwasalon.com/bridal`
- `https://farwasalon.com/prices`
- `https://farwasalon.com/blog/mehndi-engagement-makeup-karachi`
- `https://farwasalon.com/blog/threading-near-me-karachi-pechs`
- `https://farwasalon.com/blog/facials-near-me-karachi-pechs`
- `https://farwasalon.com/blog/face-bleach-karachi-loreal`
- `https://farwasalon.com/blog/full-body-massage-karachi-women-salon`
- `https://farwasalon.com/blog/manicure-pedicure-price-list-karachi`
- `https://farwasalon.com/blog/haircut-blowdry-hair-colour-cost-karachi`
- `https://farwasalon.com/blog/deep-cleansing-vs-facial-karachi`
- `https://farwasalon.com/blog/salon-near-tariq-road-pechs`
- New hubs e.g. `/services/waxing-in-pechs-karachi`, `/services/bridal-makeup-in-tariq-road`, `/services/threading-in-tariq-road`

Confirm sitemaps: `/sitemap.xml` + children. IndexNow on `master` deploy (`npm run ping:indexnow` if needed).

## Google Business Profile (GBP)

- [ ] NAP identical to locked string above
- [ ] Primary category: **Beauty salon**; add Bridal / Hair / Waxing if available
- [ ] Upload fresh photos monthly (no stock)
- [ ] Post weekly (offer, bridal tip, or book online)
- [ ] Answer every review within 48h
- [ ] Seed Q&A: threading from Rs 100/200; bridal from Rs 8,000; walk-ins when free; women-only; parking nearby

## Reviews

- [ ] Ask happy bridal + regular clients via WhatsApp (never incentivize)
- [ ] Flag spam/fake reviews in GBP

## Search Console / Bing (monthly)

- [ ] Performance CTR on home, /beauty-salon-karachi, /bridal, /prices, /services/*, /book
- [ ] Fix duplicate aggregate rating / soft-404 if they appear
- [ ] Impressions should track Tier A queries — not raw sitemap size

## Do not invent on-menu services

No HydraFacial, keratin-as-SKU, or lash extensions unless added to `src/data.js` first. Educational mentions only.
