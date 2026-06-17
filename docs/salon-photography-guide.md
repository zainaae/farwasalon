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
