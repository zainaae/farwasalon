# Booking environment variables

Set these in Vercel (or `.env.local` for local dev). Do not commit secrets.

## Google Sheets (required for online booking)

| Variable | Description |
|----------|-------------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email |
| `GOOGLE_PRIVATE_KEY` | PEM private key (use `\n` for newlines in Vercel) |
| `GOOGLE_SHEET_ID` | Spreadsheet ID for appointments |

## Cancellation magic links

| Variable | Description |
|----------|-------------|
| `BOOKING_CANCEL_SECRET` | **Required.** Random string (32+ chars) used to sign cancel tokens. The system **fails closed** when it's unset — `signCancelToken` returns null, the confirmation page shows no cancel link, and `/api/book/cancel` rejects every request (401). There is no fallback derived from `GOOGLE_SHEET_ID` + `GOOGLE_SERVICE_ACCOUNT_EMAIL` anymore (that was removed as insecure). If self-service cancellation must work, set this in Vercel Production **and** Preview. |

Cancel links look like: `/book/cancel?id=FBS-…` (the signed cancel token is stored on the device with the booking record; the API validates that token from the POST body, not the URL).

## Booking Origin allowlist (CSRF)

`POST /api/book`, `/api/book/cancel`, and other state-changing routes accept:

- Production: `https://farwasalon.com`, `https://www.farwasalon.com`
- Exact Vercel alias: `https://farwasalon.vercel.app`
- The current deployment host from `VERCEL_URL` (set automatically on Vercel)
- Localhost / loopback for development
- Extra origins listed in `ALLOWED_BOOKING_ORIGINS`

| Variable | Description |
|----------|-------------|
| `ALLOWED_BOOKING_ORIGINS` | Optional. Comma-separated full origins (e.g. `https://farwasalon-git-branch-team.vercel.app`) for preview deploys that are not the current `VERCEL_URL`. Without this, preview traffic should use `farwasalon.com` or the deployment's own URL. Attacker hosts like `farwasalon-evil.vercel.app` are **not** allowed by prefix. |

## Optional

| Variable | Description |
|----------|-------------|
| `INDEXNOW_SECRET` | Protects `/api/indexnow` |

## WhatsApp Cloud API (optional outbound confirms)

Disabled by default. Staff path today: morning Sheet→WA digest
(`docs/whatsapp-business-setup.md` §5c + `google-apps-script/EmailBot.gs`).

| Variable | Description |
|----------|-------------|
| `WHATSAPP_TOKEN` | Meta permanent token |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp phone number ID from Meta |
| `WHATSAPP_SEND_BOOKING_CONFIRM` | Set `true` / `1` to send after successful `POST /api/book` |
| `WHATSAPP_TEMPLATE_BOOKING_CONFIRMED` | Optional; default `booking_confirmed` |
| `WHATSAPP_TEMPLATE_LANG` | Optional; default `en` |

Without token + phone ID, `lib/whatsapp-cloud.js` no-ops and logs `skip-unconfigured`.
Do not enable the flag until the template is Meta-approved.

## Google Places (homepage reviews)

| Variable | Description |
|----------|-------------|
| `GOOGLE_PLACES_API_KEY` | Server-only Places API (New) key — **never** `NEXT_PUBLIC_` |
| `GOOGLE_PLACE_ID` | GBP Place ID, e.g. `ChIJeVyXMig_szoQEKI0TaSkW-U` |
| `SALON_GBP_RATING` | JSON-LD override; sync from `/api/reviews` when live |
| `SALON_GBP_REVIEW_COUNT` | JSON-LD override; sync from `/api/reviews` when live |

See `.env.example` and `docs/integrations-execution.md`.
