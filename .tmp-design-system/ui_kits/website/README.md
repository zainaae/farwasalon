# Website UI kit — farwasalon.com

Pixel-faithful recreations of the production site, built from the repo source (not screenshots):

- `index.html` — Home: brand-first bridal hero, ink ProofStrip (from `gbp-stats.js`), Quick pick, Quoti-structure problem band + sticky booking story, loud ink Book/WhatsApp close. Source: `app/home-hero.jsx`, `app/components/proof-strip.jsx`, `app/home-below-fold.jsx`.
- `services.html` — title-stack services menu + ink finale (not page-level staccato / plum). Source: `app/services/services-client.jsx`.
- `book.html` — interactive 4-step booking flow on mist ground with `title-stack`. Simplified from `app/book/book-client.jsx`.
- `gbp-stats.js` — honest 4.6★ / 19 reviews / 102 services feeding ProofStrip.
- `Shared.jsx` — FixedNav, footer, `WaCta` stub.

Shared pieces: `data.js` (service catalog excerpt from `src/data.js` — real names, real PKR prices).

**North star:** Quoti rhythm below the fold; Farwa skin / hero / truth. No staccato home H1, no circular hero avatars, no plum finales.

Not recreated: newsletter modal, blog, gallery, deal/campaign pages, mobile drawer nav.
