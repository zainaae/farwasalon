# Quality gates — testing, accessibility, SEO, performance

Release-readiness criteria for the Farwa Beauty Salon SPA ([Vite + React](../package.json)). Use as a **pre-deploy checklist** and CI policy.

## 1. Testing

### Unit / component

- **Framework:** Vitest + React Testing Library (match Vite).
- **Minimum coverage for critical paths:**
  - `waLink` / URL encoding in [data.js](../src/data.js)
  - `computeNextSlot` behavior in [shared.jsx](../src/shared.jsx) (extract to pure function for testability)
  - Booking sheet reducer / step transitions (if refactored)

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

- Unique **`title`** and **`meta description`** via `usePageMeta` (already) — extend with canonical per route when moving beyond single canonical in [index.html](../index.html).
- **Sitemap:** [public/sitemap.xml](../public/sitemap.xml) must list `/services`, `/gallery`, `/about`, `/contact` with accurate `lastmod`.
- **Structured data:** BeautySalon JSON-LD in `index.html`; add **service** or **FAQ** schema when you add deep service pages.

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

- Hero video: `poster`, `preload` strategy, consider `prefers-reduced-motion` to swap to image ([Home.jsx](../src/pages/Home.jsx)).
- Lazy-load below-fold media; ensure `width`/`height` or aspect boxes for images.
- Throttle **scroll** listeners in Navbar / `ScrollProgress` if profiler shows jank.

### Gate

- Lighthouse CI or WebPageTest on deploy preview; fail if **performance score < 80** (mobile) until exception documented.

## 5. Security & privacy

- All external `window.open` uses `noopener,noreferrer` where applicable (audit [Contact.jsx](../src/pages/Contact.jsx) contact form handler).
- No secrets in frontend bundle; only public IDs for analytics.

## 6. Observability

- **Error monitoring** (e.g. Sentry): `ErrorBoundary` in [App.jsx](../src/App.jsx) reports `componentStack`.
- **Plausible goals** aligned with [conversion-flow-and-kpis.md](./conversion-flow-and-kpis.md).

## Rollback

- Tag releases; Vercel instant rollback if error rate spikes after deploy.

## Related docs

- [conversion-flow-and-kpis.md](./conversion-flow-and-kpis.md)
- [cms-content-migration.md](./cms-content-migration.md)
