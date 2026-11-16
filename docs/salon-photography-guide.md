# Salon photography — replacing stock images

The site layout is ready for **owned PECHS photos**. Until you add them, some sections use salon-themed stock assets.

## Already using salon-owned media

- **Nail craft video:** `public/manicurephotography.webm` (homepage marquee + Nails category hover)

## Recommended shoot list (15–20 photos)

1. Reception / entrance (Saima Terrace, Block 3)
2. Threading station close-up
3. Bridal makeup in progress (with client consent)
4. Manicure / pedicure station
5. Rubina or team at work (with consent)
6. Product shelf / hygiene setup
7. Waiting area

## How to swap images in code

1. Add JPG/WebP files to `public/` (e.g. `public/salon-reception.jpg`).
2. Update paths in:
   - [`src/salon-media.js`](../src/salon-media.js) — `EDITORIAL_PHOTOS`
   - [`src/data.js`](../src/data.js) — `CAT_META`, `GALLERY_PHOTOS`, `GALLERY_SHOWCASE_ITEMS`
   - [`app/home-client.jsx`](../app/home-client.jsx) — `HERO_POSTER` if replacing hero still
3. Run `npm run verify` and deploy.

## File naming tips

- Lowercase, hyphens: `salon-threading-station.jpg`
- Width 1200–1600px is enough for web
- Compress with [Squoosh](https://squoosh.app) before upload
- Prefer names that match what people photograph / search (storefront, bridal look, threading station) — Google Images and Lens use filename as a weak clue alongside alt text

## Multimodal / Google Lens checklist (owner + eng)

What people Circle-to-Search or Lens near you: the **Saima Terrace storefront**, bridal looks, nail craft, threading/wax stations. Site images that help those queries need to be:

1. Real **HTML `<img>`** (or Next `<Image>`), not CSS-only backgrounds for portfolio heroes
2. **Descriptive alt** in plain language (service + place) — no keyword stuffing
3. A short **caption or nearby sentence** that names the service and PECHS / Farwa
4. Listed in the **image sitemap** when the page is a service hub (already wired for category pages)
5. Uploaded to **Google Business Profile** as well — Lens often resolves to Maps photos before the website

Do **not** fake EXIF/GPS on web assets or spam geotags on unrelated stock. If a photo was taken in the PECHS studio, optional real coordinates (24.8797532, 67.0584185) on the **GBP upload** are fine; website SEO does not depend on EXIF.

Priority next shoots for Lens: exterior/signboard, bridal finished look (consent), reception desk with visible branding.
