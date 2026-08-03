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
| `BOOKING_CANCEL_SECRET` | **Recommended.** Random string (32+ chars) used to sign JWT-style cancel tokens in confirmation emails/links. |

If `BOOKING_CANCEL_SECRET` is not set, tokens are derived from `GOOGLE_SHEET_ID` + `GOOGLE_SERVICE_ACCOUNT_EMAIL` (works once Sheets is configured, but a dedicated secret is safer for production).

Cancel links look like: `/book/cancel?id=FBS-…` (the signed cancel token is stored on the device with the booking record; the API validates that token from the POST body, not the URL).

## Optional

| Variable | Description |
|----------|-------------|
| `INDEXNOW_SECRET` | Protects `/api/indexnow` |

## Google Places (homepage reviews)

| Variable | Description |
|----------|-------------|
| `GOOGLE_PLACES_API_KEY` | Server-only Places API (New) key — **never** `NEXT_PUBLIC_` |
| `GOOGLE_PLACE_ID` | GBP Place ID, e.g. `ChIJeVyXMig_szoQEKI0TaSkW-U` |
| `SALON_GBP_RATING` | JSON-LD override; sync from `/api/reviews` when live |
| `SALON_GBP_REVIEW_COUNT` | JSON-LD override; sync from `/api/reviews` when live |

See `.env.example` and `docs/integrations-execution.md`.
