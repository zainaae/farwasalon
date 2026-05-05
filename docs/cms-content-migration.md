# CMS / managed content migration — from `src/data.js`

Today, marketing and catalog content live in **[src/data.js](../src/data.js)** (services, categories, gallery items, testimonials seeds, links). This plan moves **editable** content to a **CMS or database** while keeping the SPA **resilient** when the remote source fails.

## Objectives

- Non-developers can update **services, prices, copy, gallery, hours, links** without deployments.
- Production builds **never render a blank catalog** if the API is down (fallback).
- **Stable IDs** for services/categories for analytics, booking API, and SEO slugs.

## Target content ownership

| Content | Today (`data.js`) | Target owner |
|---------|-------------------|--------------|
| WhatsApp number, maps, IG URLs | Exported constants | Env + CMS “site settings” |
| `SERVICES` / categories | `SERVICES`, `CATEGORIES` | CMS collection or DB tables |
| Category media/copy | `CAT_META` | CMS (media field + rich text) |
| Gallery | `GALLERY_PHOTOS` | CMS gallery collection |
| Testimonials | Mixed / static in components | CMS or reviews integration |
| SEO per page | `usePageMeta` + `index.html` | CMS or framework metadata API |

## Recommended stacks (pick one)

1. **Headless CMS (Sanity, Contentful, Strapi)** — Fast for marketing sites; webhooks to invalidate cache.
2. **Postgres + admin** — If booking backend already uses Postgres; single source for services + appointments.
3. **Hybrid** — CMS for copy/media; **booking DB** for duration/price truth synced by script or webhook.

## Data shape (API response contract)

Version the API: `GET /api/content/v1/site`

```json
{
  "version": "2026-05-05T12:00:00Z",
  "settings": {
    "waNumber": "923222782254",
    "mapsUrl": "...",
    "igUrl": "...",
    "brandName": "Farwa Beauty Salon"
  },
  "categories": [
    { "id": "threading", "title": "Threading", "slug": "threading", "sort": 10, "heroMedia": { "url": "...", "type": "image" }, "description": "..." }
  ],
  "services": [
    { "id": "svc_eyebrow_threading", "categoryId": "threading", "name": "Eyebrow Threading", "durationMinutes": 15, "pricePkr": null, "active": true }
  ],
  "gallery": [ { "id": "...", "src": "...", "label": "...", "sort": 1 } ]
}
```

**Stable `id` / `slug`:** migrate from current numeric `id` in `data.js` to explicit string IDs (e.g. `svc_eyebrow_threading`) so URLs and booking references do not break when lists reorder.

## Frontend integration pattern (route-safe)

1. **`useSiteContent()` hook**  
   - On mount: `fetch(API_URL)` with short timeout.  
   - On success: normalize into the same shape consumers expect today (adapter layer).

2. **Fallback bundle**  
   - Import **static snapshot** (generated at build time or committed JSON export from CMS): `import fallback from '../content/snapshot.json'`.  
   - If fetch fails or schema validation fails → `content = fallback` and optionally show a small **“offline menu”** banner.

3. **Schema validation**  
   - Use `zod` or similar at runtime on API response; invalid → fallback + `console.error` / error monitoring.

4. **Progressive rollout**  
   - Week 1: CMS powers **gallery + CAT_META** only; services still from `data.js`.  
   - Week 2: services + categories from API; keep `data.js` as fallback snapshot.  
   - Week 3: remove duplicate literals from components (Home hardcoded arrays → CMS lists).

## Build-time vs runtime

| Strategy | Pros | Cons |
|----------|------|------|
| **Runtime fetch** | Always fresh | Needs fallback, caching headers |
| **Build-time static** | Fast, reliable | Rebuild to publish |
| **Hybrid (ISR / stale-while-revalidate)** | Best of both | Needs hosting support |

For Vercel: edge config, KV, or build plugin to refresh snapshot on webhook.

## Migration checklist

1. Export current `data.js` to **seed JSON** matching the API contract (scripted one-time).
2. Import seed into CMS.
3. Add `content/snapshot.json` committed from seed (or CI-generated).
4. Implement `useSiteContent()` + adapters; switch **one page** (e.g. Gallery) first.
5. Wire **preview** URL for editors (CMS draft mode) without affecting production snapshot.
6. Deprecate unused exports in `data.js` only after all consumers migrated.

## Risks

- **Broken images** if CMS media URLs change — use CDN with stable paths.  
- **ID drift** — never reuse an old `id` for a different service.  
- **Locale** — if Urdu/English split later, CMS should model `locale` fields.

## Related docs

- [booking-backend-architecture.md](./booking-backend-architecture.md) — services should align with booking `Service` entity.
- [quality-gates-release.md](./quality-gates-release.md) — contract tests for content API.
