# SDLC automation — Farwa Beauty Salon

**Repo:** [zainaae/farwasalon](https://github.com/zainaae/farwasalon) · **Stack:** Next.js 16 (App Router), React 19, Vercel.  
**Audience:** Solo maintainer or small team. This file defines **phases**, **gates** (what must pass), and **ownership** (who does what).

---

## Phase 1 — Requirements & backlog hygiene

| Item | Gate | Owner |
|------|------|-------|
| Issues / PRs use clear scope (what / why / acceptance) | Optional templates in GitHub repo settings | Maintainer |
| Release readiness | Human checklist before production promotion | Maintainer |

**Automation / artifacts**

- Local pre-push: `npm run verify` (lint + test + build); `npm run verify:full` adds e2e. CI runs **lint → test → build → Playwright e2e** on `main` / `master`.
- Pre-release human gates: [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) and detailed criteria in [quality-gates-release.md](./quality-gates-release.md).

**Optional later:** GitHub Issue & PR templates (`.github/ISSUE_TEMPLATE/`, `pull_request_template.md`) — not required for CI to pass.

---

## Phase 2 — Design / architecture traceability

Lightweight pointers (not a full enterprise CMDB).

| Area | Where it lives |
|------|----------------|
| **Routes** | `app/` (App Router) — `/`, `/services/[categorySlug]`, `/gallery`, `/about`, `/contact`, `/book`, `/blog/[slug]`, `/faq`, `/bridal`, `not-found.jsx` (404). |
| **API routes** | `app/api/` — `book`, `book/cancel`, `slots`, `reviews`, `subscribe`, `indexnow`. |
| **Booking logic** | `lib/booking-duration.js` (durations + 2h cancel window), `lib/booking-slots.js`, `lib/google-sheets.js`; booking UX in `app/book/`. |
| **Booking / WhatsApp helpers** | `src/shared.jsx` — shared UI; `src/data.js` — `waLink`, `waLinkBooking`, `WA_NUMBER`. |
| **Content / services data** | `src/data.js` — `SERVICES`, `CAT_META`; `src/blog-data.js`, `src/faq-data.js`. |
| **Backend / CMS (future)** | `docs/booking-backend-architecture.md`, `docs/cms-content-migration.md`. |
| **Conversion / KPIs** | `docs/conversion-flow-and-kpis.md`. |

**ADR-style decisions:** Record any **non-obvious** choice in a short bullet under “Decisions” in this file (dated), e.g. “2026-05 — CI on Node 22 LTS; no secret deploy workflows; Vercel Git integration only.”

---

## Phase 3 — Implementation standards

| Standard | Enforcement |
|----------|-------------|
| ESLint (flat config) | `npm run lint` — `eslint.config.js` |
| Editor baseline | `.editorconfig` (spacing, UTF-8, final newline) |
| Pre-commit | **Not** wired (Husky can be fragile on Windows + OneDrive). Use **local** `npm run verify` and rely on **GitHub Actions** for team gate. |

**Scripts**

| Script | Purpose |
|--------|---------|
| `npm run lint` | ESLint |
| `npm run build` | Production bundle |
| `npm run test` | Vitest (unit + RTL smoke) |
| `npm run verify` | `lint` → `build` (fast local gate; run `test` when touching logic/UI) |

---

## Phase 4 — Build & CI

**Workflow:** [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

**Triggers:** `push` and `pull_request` to **`main`** and **`master`**.

**Steps:** `npm ci` → `npm run lint` → `npm run build` → `npm run test`  
**Node:** 22.x (LTS track). **npm cache:** enabled via `actions/setup-node`.

**Gate:** PRs should stay green before merge; default branch should always pass.

---

## Phase 5 — Test automation (baseline)

| Layer | Tool | Scope |
|-------|------|--------|
| Unit / smoke | Vitest + jsdom + RTL | Booking rules (durations, slots, cancel tokens, date rules), schema, SEO helpers, sanitisation, rate limiting — **185 tests across 19 files** |
| End-to-end | Playwright | 15 specs in `e2e/` — book flow, mobile nav, responsive overflow, location pages, footer links, newsletter |
| Accessibility | `@axe-core/playwright` | `e2e/a11y-axe.spec.ts` |

**Gate:** `npm run test` and `npm run test:e2e` pass locally and in CI.

---

## Phase 6 — Release / deploy

| Topic | Approach |
|-------|----------|
| **Primary** | **Vercel** connected to GitHub — pushes to the production branch deploy or produce preview deployments. **No** deploy secrets stored in this repo. |
| **Promotion** | Use Vercel dashboard: verify **Preview** URL → **Promote to Production** when [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) is satisfied. |
| **Optional workflow** | A `deploy.yml` is **not** required; document-only unless the team later adds OIDC / Vercel integration with approved tokens. |

---

## Phase 7 — Operate / observe

| Capability | Status |
|------------|--------|
| **Analytics** | Plausible script + Vercel Analytics (`@vercel/analytics`), both wired in `app/layout.jsx`. |
| **Errors** | `app/error.jsx` (route error boundary) and `app/not-found.jsx` — user-facing fallbacks; **optional:** Sentry (or similar) SDK + DSN via env — not mandated. |
| **Logging** | Browser console in dev; production relies on user reports + analytics funnels until error monitoring is added. |

**Placeholder actions:** Before major campaigns, confirm Plausible loads and spot-check critical paths (home, contact, WhatsApp links).

---

## Quick ownership summary

| Role | Responsibility |
|------|----------------|
| **Maintainer** | Backlog hygiene, release checklist, Vercel promotion, content updates in `data.js` / CMS. |
| **Automation** | CI on GitHub; local `verify` + `test`. |

---

## Related docs

- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) — human gates before production.
- [quality-gates-release.md](./quality-gates-release.md) — testing, a11y, SEO, performance criteria.
