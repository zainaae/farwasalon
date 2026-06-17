# Booking email notifications (salon owner)

When a client books online, the row is added to your Google Sheet. **Email alerts do not send automatically** until you paste and run the Apps Script below.

## One-time setup (about 10 minutes)

1. Open your **Bookings** Google Sheet (same sheet as `GOOGLE_SHEET_ID` in Vercel).
2. **Extensions → Apps Script** — delete any old code and paste the full contents of [`google-apps-script/EmailBot.gs`](../google-apps-script/EmailBot.gs).
3. At the top of `EmailBot.gs`, set:
   ```js
   var SALON_NOTIFY_EMAIL = 'your-real-inbox@example.com';
   ```
4. In the Apps Script editor, select **`setupTrigger`** → **Run** → authorize when prompted.
5. Confirm column **M** header is **Notified** (the script sets this on first run).

## Verify it works

1. Make a **test booking** on [farwasalon.com/book](https://farwasalon.com/book).
2. Within **5–10 minutes**, you should receive an email with booking ID, service, date, time, and phone.
3. Column **M** should show **YES** for that row.
4. Run **`checkNewBookings`** manually once — you should **not** get a duplicate email.

## Cancelled bookings

Rows with status **Cancelled** in column J are skipped (marked YES without email).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No email after 15 min | Check spam; confirm `SALON_NOTIFY_EMAIL` is correct |
| Script error on run | Ensure sheet tab is named exactly `Bookings` |
| Duplicate emails | Column M should be YES after first send — re-run should skip |

Full booking stack: [`docs/booking-setup.md`](booking-setup.md)
