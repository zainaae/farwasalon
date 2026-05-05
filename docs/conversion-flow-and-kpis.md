# Conversion flow and KPIs — Farwa Beauty Salon site

This document maps the **current** visitor-to-booking journey in the React SPA and defines **measurable KPIs** and recommended analytics events for a professional salon funnel.

## Routes (entry points)

| Path | Page component | Primary intent |
|------|----------------|----------------|
| `/` | `Home.jsx` | Awareness, brand trust, push to services / booking |
| `/services` | `Services.jsx` | Service discovery by category; per-service detail modal |
| `/gallery` | `Gallery.jsx` | Visual proof; social (Instagram) |
| `/about` | `About.jsx` | Trust, story, longevity |
| `/contact` | `Contact.jsx` | Location, hours, **structured booking form → WhatsApp** |

Global shell: [src/App.jsx](src/App.jsx) wraps all routes in `BookingProvider` (from [src/shared.jsx](src/shared.jsx)).

## Conversion flow (as implemented)

### 1. Landing and navigation

- User arrives on `/` (or deep-links to another route).
- **Navbar** (`Navbar` in `shared.jsx`): links to Home, Services, Gallery, About, Contact; **Book** opens the global booking sheet (`booking.open()`).
- **Footer** / **StickyWA**: WhatsApp and booking entry points on multiple pages.

### 2. Service consideration

- **Home**: hero CTAs, featured categories, links to `/services`, testimonials, final CTA band with booking.
- **Services**: category grid → category detail → optional `ServiceModal`; book actions tie into `useBooking()` (category-level open in several places).

### 3. Booking intent (conversion)

All paths currently **terminate in WhatsApp** (no server-side appointment record):

| Mechanism | Location | Behavior |
|-----------|----------|----------|
| **BookingSheet** | `shared.jsx` — `BookingSheet` | 3-step flow: category → service (optional) → date/time → `window.open` WhatsApp with composed message |
| **Contact form** | `Contact.jsx` — `handleWhatsApp` | `preventDefault`; builds query string for `wa.me/{WA_NUMBER}` with name, service, date, time |
| **Direct links** | `data.js` — `waLink(service)`, `WA_DEFAULT` | Pre-filled WhatsApp URLs |
| **StickyWA / Footer / ServiceModal** | `shared.jsx` | Direct or contextual WhatsApp links |

Supporting UX:

- **`useNextSlot`** (`shared.jsx`): client-only “next slot” label (Mon–Sat 11–19, heuristic); shown on Home hero and Contact — **not** tied to real inventory.

### 4. Post-click (outside the app)

- Conversation and confirmation happen in **WhatsApp**; the site does not receive a “booking confirmed” signal unless you add backend or manual tagging.

## Funnel stages (for measurement)

Use these **stage names** consistently in analytics:

1. **`visit`** — Page view (Plausible already counts this; optionally use custom props for `path`).
2. **`service_view`** — User viewed services page or opened a category/detail (not fully instrumented today).
3. **`booking_started`** — User opened `BookingSheet` or focused intent (e.g. clicked “Book” in nav).
4. **`booking_step_completed`** — Step 1/2/3 in sheet (not instrumented today).
5. **`whatsapp_click`** — User triggered `wa.me` (sheet, form, sticky, footer, `waLink`).
6. **`lead_submitted`** — Reserved: when a server-side form/API exists; today proxy = **`whatsapp_click`** with props.

## Recommended KPIs

| KPI | Definition | Baseline tooling |
|-----|------------|------------------|
| **Visit → WhatsApp CTR** | Unique sessions with ≥1 `whatsapp_click` / unique sessions | Plausible + custom events |
| **Services engagement rate** | Sessions with `/services` or service modal open / sessions | Plausible goals or events |
| **Booking sheet completion rate** | `booking_step_completed` step 3 / `booking_started` | Custom events (once added) |
| **Contact form usage** | Submits on Contact (`handleWhatsApp`) / visits to `/contact` | Custom event on submit |
| **Bounce on home** | Single-page sessions landing on `/` | Plausible / hosting logs |

**North-star (today):** increase **qualified WhatsApp conversations** (clicks with service + date/time filled vs generic “Hi”).

## Suggested Plausible custom events

Site already loads Plausible with tagged events ([index.html](../index.html)). When implementing `plausible('EventName', { props: { ... } })`, align names with this table:

| Event name | When | Useful props |
|------------|------|----------------|
| `BookingStarted` | `booking.open()` / first step of sheet | `source`: nav \| hero \| sticky \| contact |
| `BookingStep` | Each step advance in `BookingSheet` | `step`: 1 \| 2 \| 3 |
| `WhatsAppIntent` | Before `window.open` to `wa.me` | `channel`: sheet \| contact_form \| sticky \| footer \| service_modal |
| `ServiceCategoryView` | Category selected on Services page | `category` |
| `ServiceModalOpen` | Modal opened | `service_id` or `service_name` |

Keep **PII out of props** (no full phone numbers in custom props beyond what the tag policy allows).

## Gaps vs professional funnel

- No **server-side** booking or lead capture → cannot measure true **conversion to appointment**, only WhatsApp clicks.
- No **returning visitor** or **remarketing** bridge without CRM/analytics integration.
- **`useNextSlot`** is illustrative only → risk of mismatch with real availability (trust/compliance).

## Related docs

- [booking-backend-architecture.md](./booking-backend-architecture.md) — production booking model.
- [quality-gates-release.md](./quality-gates-release.md) — how to gate releases once events exist.
