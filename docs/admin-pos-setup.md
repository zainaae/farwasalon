# Admin POS foundation (staff `/admin`)

Secure empty staff desk at `/admin`. Public marketing pages are unchanged; robots already disallow `/admin`.

## Required environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server | Anon/public key (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Provision `staff_profiles` rows; never ship to the client |

Copy into `.env.local` (and Vercel project env for preview/production). Without the two `NEXT_PUBLIC_*` values, `/admin` redirects to login with a config error; the public site keeps working.

## Apply the migration

Migration file: `supabase/migrations/20260810120000_staff_profiles.sql`

Creates:

- `public.staff_profiles (user_id pk → auth.users, role in ('owner','front_desk'), display_name, created_at)`
- `public.is_staff()` security-definer helper for RLS
- RLS: authenticated staff can `SELECT` own/peer rows; no client insert/update/delete

### Option A — Supabase CLI

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

### Option B — SQL editor

Paste the migration SQL into the Supabase Dashboard → SQL → New query → Run.

## Create the first staff user (owner)

1. **Auth user** — Dashboard → Authentication → Users → Add user (email + password), or:

```bash
# Using service role (server-side / one-off script only)
# POST https://<project>.supabase.co/auth/v1/admin/users
# Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY
```

2. **Staff row** — after you have the `auth.users` UUID:

```sql
insert into public.staff_profiles (user_id, role, display_name)
values (
  '<auth-user-uuid>',
  'owner',
  'Farwa owner'
);
```

3. Open `/admin/login`, sign in with that email/password → land on **Today** stub.

Auth alone is not enough: a normal Supabase user without a `staff_profiles` row is signed out and sent back to login with `not_staff`.

## Route map

| Path | Access |
| --- | --- |
| `/admin/login` | Public form (no marketing nav) |
| `/admin` (and other `/admin/*`) | Session + `staff_profiles` row (Next.js `proxy.js` + layout `requireStaff`) |

## Residual risks

- Proxy is a network gate, not the only check — Server Components still call `requireStaff`; RLS remains the data boundary.
- Service role key must never be prefixed `NEXT_PUBLIC_`.
- Until env + migration + first staff row exist, `/admin` is unreachable by design.
- CSP allows `https://*.supabase.co` / `wss://*.supabase.co` for Auth; tighten to your project host later if desired.

## Sync POS service catalog (Slice 1)

Migration: `supabase/migrations/20260810130000_services_catalog.sql` (after `staff_profiles`).

Bridges `src/data.js` → `services_catalog`. Prices are never invented — only site menu values. `from_price` mirrors `fromPrice` (Hair, Hair Treatments, Bridal).

```bash
# Dry-run — expect row count == ALL_SERVICES (102 as of 2026-08-10)
npm run pos:sync-catalog:dry

# Live upsert (service role; apply migrations first)
# Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local
npm run pos:sync-catalog
```

Settings UI “Sync catalog” is deferred until `/admin/settings` exists (Foundation shell has Today + login only).

## Slice 2 — Clients + visits POS

Migration: `supabase/migrations/20260810140000_clients_visits.sql` (after `services_catalog`).

Creates:

- `clients` (unique `phone_e164` `923xxxxxxxxx`, `phone_display` `03…`)
- `visits` + `visit_items` (snapshots; money checks; unique `idempotency_key`)
- RPCs: `create_visit(payload jsonb)` (atomic + idempotent), `void_visit(p_visit_id uuid)`
- Staff RLS via `is_staff()`

```bash
npx supabase db push
# or paste the SQL into Dashboard → SQL → Run
```

Then sync catalog if not already (`npm run pos:sync-catalog`).

### Desk routes

| Path | Purpose |
| --- | --- |
| `/admin` | Today KPIs + visits (Karachi day; `?ymd=` for another day) |
| `/admin/month` | Month KPIs, avg net ticket, top services, day collected (`?ym=`) |
| `/admin/export/day` | CSV visit money for a Karachi day (`?ymd=`) |
| `/admin/export/month` | CSV visits or day table (`?ym=` & `kind=visits\|days`) |
| `/admin/visits/new` | Phone → client → lines → discount/deal → pay → WA receipt |
| `/admin/visits/[id]` | View + void + copy receipt |
| `/admin/clients` | Search |
| `/admin/clients/[id]` | Profile + outstanding dues + Record payment + history |
| `/admin/inventory` | Products, low-stock, adjust in/out |
| `/admin/bookings` | Online Sheet import + Complete visit (Slice 6) |

Money is validated in Next.js with `lib/pos/totals.validateVisit` before `create_visit`.

## Slice 3 — Today / Month reports

Migration (optional view): `supabase/migrations/20260810160000_v_visit_money.sql`

KPIs (completed visits only; voided excluded):

| KPI | Definition |
| --- | --- |
| Visits | count |
| Gross | Σ `subtotal_pkr` (line finals × qty — **never** printed floors) |
| Discounts | Σ `discount_pkr` |
| Net | Σ `net_pkr` |
| Collected | Σ `amount_paid_pkr` |
| Dues opened | Σ `due_pkr` |
| Avg net ticket | net ÷ visits (month) |

Helpers: `lib/pos/reports.js` (+ `lib/pos/karachi.js`). Unit tests: `npm test -- lib/pos/reports.test.js`.

```sql
select visit_date_khi,
       count(*) filter (where status = 'completed') as visits,
       coalesce(sum(gross_pkr) filter (where status = 'completed'), 0) as gross,
       coalesce(sum(collected_pkr) filter (where status = 'completed'), 0) as collected
from public.v_visit_money
where visit_date_khi = (now() at time zone 'Asia/Karachi')::date
group by 1;
```

## Slice 4 — Payments ledger / dues settlement

Migration: `supabase/migrations/20260810150000_payments.sql` (after `clients_visits`).

Creates:

- `payments` (`client_id`, nullable `visit_id`, `amount_pkr`, `mode` in Cash|JazzCash|EasyPaisa, `paid_at`, `notes`, `created_by`, unique `idempotency_key`)
- Staff RLS via `is_staff()`
- `create_visit` seeds an initial payment row when mode is Partial/Credit and `amount_paid_pkr > 0` (tender defaults to Cash unless `tender_mode` is a site tender; uses the visit `idempotency_key`)
- RPC: `record_payment(payload jsonb)` — locks visit, appends payment, reduces `due_pkr` / increases `amount_paid_pkr`, **rejects overpay** (no credit wallet in v1)

```bash
npx supabase db push
# or paste 20260810150000_payments.sql into Dashboard → SQL → Run
```

Desk: open `/admin/clients/[id]` → **Open dues** → **Record payment**. Settlement modes are site tenders only (not Partial/Credit).

### Residual risks (Slice 4)

- Migration must be applied before client profile loads payments — otherwise Supabase select errors.
- Partial visit create seeds ledger as **Cash** unless `tender_mode` is passed (desk UI does not yet ask for partial tender).
- Voiding a visit does not reverse or delete payment rows; dues freeze on the voided visit (`record_payment` rejects voided).
- No month KPI / till totals here (Slice 3); client open-due total only.

## Slice 5 — Inventory (products + stock movements)

Migration: `supabase/migrations/20260810170000_inventory.sql` (after `v_visit_money` / Slice 3 view).

Creates:

- `products` (`sku`, `name`, `kind` in retail|consumable, `unit`, `qty_on_hand`, `reorder_level`, nullable `sale_price_pkr`, `active`)
- `stock_movements` (`product_id`, `delta` +in/−out, `reason` in purchase|sale|adjust|waste, nullable `visit_id`, `created_by`, `created_at`, `notes`)
- Staff RLS via `is_staff()` (movements are append-only: SELECT + INSERT)
- Trigger: every movement updates `qty_on_hand` atomically; **rejects any movement that would make qty negative** (covers retail sale underflow in v1; no owner override yet)
- Trigger: direct `UPDATE products.qty_on_hand` is rejected unless the movement apply path sets `app.stock_apply`
- RPC: `record_stock_movement(payload jsonb)`

```bash
npx supabase db push
# or paste 20260810170000_inventory.sql into Dashboard → SQL → Run
```

Desk: `/admin/inventory` — product list, low-stock badge (`qty_on_hand <= reorder_level`), Adjust in/out form, Add product (starts at qty 0; seed with purchase In).

Helpers + unit tests: `lib/pos/stock.js` — `npm test -- lib/pos/stock.test.js`.

### Slice 5.1 — Retail on visit (deferred)

Not shipped in this slice. Wiring retail lines into `create_visit` / New visit would need `product_id` (or snapshot) on `visit_items`, stock `sale` movements inside the same transaction, and UI for picking SKUs — too easy to break Gate 3 visits/payments. Track as a follow-up; until then sell retail as a custom line without stock deduct, or adjust stock manually after the visit.

### Residual risks (Slice 5)

- Migration must be applied before `/admin/inventory` loads — otherwise table-missing errors.
- Opening stock is never set on product insert; always use a purchase (or adjust-in) movement.
- Negative stock is blocked for all reasons in v1 (not only retail sale); owner override is future work.
- Voiding a visit does not reverse stock movements (no visit-linked sales yet).

## Slice 6 — Online bookings → CRM (import-first)

**Design choice:** a separate `appointments` table (not visit stubs).

| Concept | Role |
| --- | --- |
| Google Sheets `Bookings` | Source of truth for *online* holds (public `/api/book` unchanged) |
| `appointments` | CRM mirror: `source='online'`, `external_id=FBS-…` (Sheet Booking ID) |
| `visits` | POS money tickets only (`completed` / `voided`) |

Import upserts **clients by phone** and **appointments by `external_id`** (idempotent). Desk **Complete visit** opens New visit prefilled by phone + matched catalog service; saving runs `create_visit` and sets `appointments.visit_id` / `status=completed`. **POS money is never written back to Sheets.**

Migration: `supabase/migrations/20260810180000_appointments.sql`

```bash
npx supabase db push
# or paste 20260810180000_appointments.sql into Dashboard → SQL → Run
```

### Import (CLI)

Needs the same Google env as public booking (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`) plus Supabase service role for live writes. Missing Google creds → clear skip message (exit 2); public `/book` unaffected.

```bash
# Dry-run — read + validate Sheet rows from today (Karachi); no DB writes
npm run pos:import-bookings:dry

# Optional date window (Sheet calendar dates)
node scripts/import-online-bookings.mjs --dry-run --from=2026-08-10 --to=2026-08-17

# Live upsert (service role)
$env:NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
npm run pos:import-bookings
```

### Desk

| Path | Purpose |
| --- | --- |
| `/admin/bookings` | Upcoming online appointments; **Import from Sheets**; **Complete visit** |
| `/admin/visits/new?appointment=<uuid>` | Prefill client + service; save links appointment → visit |

Helpers + unit tests: `lib/pos/bookings-import.js` — `npm test -- lib/pos/bookings-import.test.js`.

### Residual risks (Slice 6)

- Sheet service names that do not match `services_catalog` become custom lines at Rs 0 until staff set a final/price.
- Re-import never downgrades `completed` / `no_show` appointments when the Sheet still says Confirmed.
- Import defaults `--from` to **today Karachi**; older Sheet rows need an explicit `--from=`.
- If `create_visit` succeeds but appointment link fails, the ticket still exists — staff can reconcile from `/admin/bookings`.
- Dual-write of payments/status to Sheets is intentionally out of scope.
