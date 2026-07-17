# Tier A organic — offline checklist

Site/code work lives in the repo. Do these manually (owner / marketing). Check boxes as you go.

## Google Business Profile (GBP)

- [ ] Keep **NAP** identical to the site: Plot 165/G-1, Saima Terrace, Block 3 PECHS, Karachi 75400 · +92 322 278 2254 · Mon–Sat 11:00–19:00
- [ ] Primary category: **Beauty salon** (or Beauty parlour); add Bridal / Waxing / Hair if available
- [ ] Upload fresh photos monthly (exterior, waiting area, chair work — no stock)
- [ ] Post weekly GBP updates (offer, bridal season tip, or “book online” with farwasalon.com/book)
- [ ] Answer every review within 48h (thank + soft CTA to book)
- [ ] Add **Q&A** (seed then monitor):
  - Price of eyebrow threading? → From Rs 200 (full list on farwasalon.com/prices; lowest threading Rs 100)
  - Bridal makeup cost? → From Rs 8,000; Full Bridal Package Rs 25,000
  - Do you do walk-ins? → Yes when free; book online to hold a slot
  - Women-only? → Yes
  - Parking? → Street parking nearby in PECHS

## Reviews

- [ ] Ask happy clients (bridal + regulars) for Google reviews via short WhatsApp template
- [ ] Never incentivize reviews; do not gatekeep negative feedback
- [ ] Flag spam/fake reviews in GBP when they appear

## Directories & wedding platforms

- [ ] **Shadiyana** — claim/update listing; NAP + bridal packages + link to /bridal and /book
- [ ] **Shehnai** (or current PK wedding directory) — same NAP + portfolio photos
- [ ] **Fresha** / other booking directories — if listed, prices and hours must match the site; prefer deep-link to farwasalon.com/book rather than a second live calendar
- [ ] Bing Places — claim from GBP; match NAP

## Search Console / Bing (monthly)

- [ ] GSC → Performance: check CTR on home, /beauty-salon-karachi, /bridal, /prices, /services/threading, /book
- [ ] Fix “Duplicate aggregate rating” / soft-404 if any new URLs appear
- [ ] After major content deploys: `npm run ping:indexnow` (or wait for CI IndexNow step on `master`)
- [ ] Confirm key file: https://farwasalon.com/farwa-salon-indexnow.txt

## Do not invent on-menu services

Site and GBP copy must stay accurate to the published menu (no HydraFacial / lash extensions unless added to `src/data.js` first).
