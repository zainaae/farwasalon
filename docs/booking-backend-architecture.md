# Production booking backend — design and scope

> **Status (14 Jul 2026): largely implemented.** This was written when the site was
> WhatsApp-only. Online booking now ships: `/book` plus `app/api/book`, `app/api/slots`,
> and `app/api/book/cancel`, backed by Google Sheets ([`lib/google-sheets.js`](../lib/google-sheets.js))
> with add-on-aware slot durations ([`lib/booking-duration.js`](../lib/booking-duration.js))
> and signed cancel links. Keep this doc as the **design rationale and the roadmap for what
> is still missing** (staff/resource modelling, reschedule, a real datastore) — see
> `master-improvement-plan.md` for current status.

This document scopes a **real appointment system** to replace or augment the original **WhatsApp-only** flow ([`waLink`](../src/data.js)).

## Goals

- **Truthful availability** — slots reflect staff, duration, buffers, holidays, and concurrent chairs/rooms.
- **Durable appointments** — create, confirm, reschedule, cancel with audit trail.
- **Notifications** — customer and staff confirmations/reminders (SMS, WhatsApp Business API, email — pick based on budget).
- **Operational safety** — idempotent booking API, rate limits, spam controls, admin override.

## Non-goals (initial phase)

- Full payments inside the web app (optional **deposit** link later).
- Multi-location franchise logic (single location can stay Karachi / PECHS until needed).

## Domain model (entities)

| Entity | Purpose | Key fields (conceptual) |
|--------|---------|-------------------------|
| **Location** | Salon site | `id`, address, timezone (`Asia/Karachi`), business hours rules |
| **Staff** | Bookable providers | `id`, name, active, services offered, color/calendar |
| **Service** | Sellable treatment | `id`, name, `category_id`, `duration_minutes`, `buffer_minutes`, `price_pkr` (optional), `active` |
| **Category** | UX grouping | mirrors current categories in [`SERVICES`](../src/data.js) |
| **AvailabilityRule** | Recurring hours | `staff_id` or location default, day-of-week, `opens_at`, `closes_at`, exceptions |
| **TimeOff** | Blackouts | `staff_id`, `starts_at`, `ends_at`, reason |
| **Appointment** | Booked slot | `id`, `customer_name`, `customer_phone`, `customer_email?`, `service_id` (+ optional add-ons), `staff_id?`, `starts_at`, `ends_at`, `status`, `source` (web/admin), `notes`, `created_at` |
| **AuditLog** | Compliance / debugging | who changed what on `Appointment` |

**Mapping from current app:** each row produced by `s(name, category)` in `data.js` becomes a **Service** row with `category` → **Category**; duration and price start as nullable or defaults until staff confirm.

## Slot generation (algorithm sketch)

1. Load **business window** for the day (e.g. Mon–Sat 11:00–19:00 Asia/Karachi).
2. Subtract **TimeOff** and **existing Appointment** intervals for chosen staff (or all staff for “any stylist” mode).
3. Offer start times every **N** minutes (e.g. 15) where `start + duration + buffer` fits in a free interval.
4. Enforce **double-booking rules** (one staff cannot overlap; optional **room** capacity if modeled).

Expose **`GET /api/availability?service_id=&date=&staff_id=`** returning ISO start times.

## API surface (REST shape)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/services` | Public list (categories + services + duration/price) |
| `GET` | `/api/availability` | Free starts for a service/day/staff |
| `POST` | `/api/appointments` | Create hold or confirmed booking (body: customer, service, start, optional staff) |
| `PATCH` | `/api/appointments/:id` | Reschedule/cancel (auth + token or staff session) |
| `POST` | `/api/webhooks/whatsapp` | Optional inbound status (if using WhatsApp Business) |

**Idempotency:** `POST /api/appointments` accepts `Idempotency-Key` header to prevent duplicates on double-submit.

**Validation:** server-side required fields (name, phone E.164, service_id, start); reject impossible times.

## Frontend integration (this repo)

1. Replace or supplement `BookingSheet` step 3: call **`POST /api/appointments`**; on success show confirmation UI + optional “open WhatsApp for directions” secondary CTA.
2. Replace `useNextSlot` consumer with **`GET /api/availability?date=today`** (or next open day) for first available label.
3. `Contact.jsx` form: optional **API submit** with “we’ll confirm by WhatsApp” + still allow WhatsApp fallback if API fails.

## Notifications

| Event | Channel | Content |
|-------|---------|---------|
| Created | SMS or WhatsApp template | time, service, address, reschedule link |
| Reminder T-24h / T-2h | same | reduce no-shows |
| Cancelled | same | cancellation + rebook CTA |

Use a provider (Twilio, MessageBird, Meta WhatsApp Cloud API) with **template approval** where required.

## Admin

- Minimal **staff calendar** (day/week), create block, mark no-show, move appointment.
- **Holiday** and **hours** editor tied to `AvailabilityRule`.

## Security and abuse

- Rate limit `POST /api/appointments` by IP + phone hash.
- CAPTCHA or proof-of-work on public form if spam appears.
- Staff/admin routes behind auth (session + CSRF or JWT).

## Migration path

1. **Phase A:** Read-only API serves services + fake availability (parity with current hours).
2. **Phase B:** Real calendar + appointments; WhatsApp as **notification** only.
3. **Phase C:** Deprecate pure `wa.me` compose for primary flow; keep **fallback** link in error states.

## Related docs

- [conversion-flow-and-kpis.md](./conversion-flow-and-kpis.md) — funnel KPIs once booking API exists.
- [cms-content-migration.md](./cms-content-migration.md) — moving service catalog to CMS/DB.
