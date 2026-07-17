# Quality gates — testing, accessibility, SEO, performance

Release-readiness criteria for the Farwa Beauty Salon site ([Next.js 16 + React 19](../package.json)). Use as a **pre-deploy checklist** and CI policy.

## 1. Testing

### Unit / component

- **Framework:** Vitest + React Testing Library (jsdom).
- **Minimum coverage for critical paths:**
  - Booking duration incl. add-ons — [booking-duration.js](../lib/booking-duration.js)
  - Slot generation / overlap — [booking-slots.js](../lib/booking-slots.js)
  - Cancel-token signing and the 2-hour window — [booking-cancel-token.js](../lib/booking-cancel-token.js)
  - `waLink` / URL encoding in [data.js](../src/data.js)
  - Input sanitisation and rate limiting — [sanitize.js](../lib/sanitize.js), [rate-limit.js](../lib/rate-limit.js)

### End-to-end

- **Playwright** (or Cypress): smoke flows on production build:
  - Home loads, no console errors
  - Navigate Services → open category → open modal
  - Open booking sheet → reach final step (mock `window.open` or assert button present)
  - Contact form validation (if required fields added later)

### Contract tests (after CMS/API)

- **Content API:** response matches JSON schema; snapshot test for `categories.length > 0`.

### CI gate

- `npm run build` must pass.
- Unit + e2e smoke on PR to default branch (e2e optional `workflow_dispatch` if flakiness budget is tight).

## 2. Accessibility (WCAG 2.1 AA target)

### Automated

- **axe-core** in Playwright or `eslint-plugin-jsx-a11y` on strict rules.
- Fail build on **serious** axe violations in critical routes (`/`, `/contact`, `/services`).

### Manual / spot checks

- Full keyboard path: skip link → main → nav → mobile drawer → modals trap focus and return focus on close.
- **BookingSheet:** focus trap, initial focus, `aria-modal`, labelled headings (audit against [shared.jsx](../src/shared.jsx)).
- **SmoothyGallery:** arrow keys scoped when gallery focused (avoid global `window` listener conflicts).
- Color contrast for `text-stone` on white and overlays.

### Gate

- Zero **critical** axe issues; document **serious** issues as tracked exceptions with dates.

## 3. SEO

### Per-page

- Unique **`title`** and **`meta description`** per route via the Next.js Metadata API — helpers in [page-metadata.js](../lib/page-metadata.js). Each route sets its own canonical.
- **Sitemaps:** generated, not static — [app/sitemap.xml](../app/sitemap.xml) plus the `sitemap-static` / `sitemap-services` / `sitemap-locations` / `sitemap-blog` children, built from [sitemap-data.js](../lib/sitemap-data.js). Check `lastmod` is fresh after a content push.
- **Structured data:** JSON-LD via [json-ld.jsx](../app/json-ld.jsx) — BeautySalon from [business-schema.js](../lib/business-schema.js), plus service and FAQ schema from [service-schema.js](../lib/service-schema.js).

### Gate

- Validate with Rich Results Test for URL.
- No unintended `noindex` on public routes.

## 4. Performance (Core Web Vitals)

### Budgets (mobile p75 targets — adjust with real data)

| Metric | Target |
|--------|--------|
| LCP | < 2.5s on home |
| INP | < 200ms |
| CLS | < 0.1 |

### Actions aligned with this codebase

- Hero video: `poster`, `preload` strategy, consider `prefers-reduced-motion` to swap to image ([home-client.jsx](../app/home-client.jsx)). Heavy below-fold video is lazy-loaded via `LazyVideo`.
- Lazy-load below-fold media; ensure `width`/`height` or aspect boxes for images.
- Throttle **scroll** listeners in Navbar / `ScrollProgress` if profiler shows jank.

### Gate

- Lighthouse CI or WebPageTest on deploy preview; fail if **performance score < 80** (mobile) until exception documented.

## 5. Security & privacy

- All external `window.open` uses `noopener,noreferrer` where applicable (audit [contact-client.jsx](../app/contact/contact-client.jsx) contact form handler).
- No secrets in the client bundle; server-only env vars must never be prefixed `NEXT_PUBLIC_`. `GOOGLE_PLACES_API_KEY` is used only in [google-places.js](../lib/google-places.js) on the server.

## 6. Observability

- **Error monitoring** (e.g. Sentry): route error boundary in [error.jsx](../app/error.jsx).
- **Plausible goals** aligned with [conversion-flow-and-kpis.md](./conversion-flow-and-kpis.md).

## Rollback

- Tag releases; Vercel instant rollback if error rate spikes after deploy.

## Related docs

- [conversion-flow-and-kpis.md](./conversion-flow-and-kpis.md)
- [cms-content-migration.md](./cms-content-migration.md)
