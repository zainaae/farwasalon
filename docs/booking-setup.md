# Online Booking System — Setup Guide

This document walks through setting up the Google Sheets backend for the Farwa Beauty Salon online booking system.

---

## 1. Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name it `farwa-salon-bookings` (or similar)
4. Click **Create**

## 2. Enable Google Sheets API

1. In the Google Cloud Console, go to **APIs & Services → Library**
2. Search for **Google Sheets API**
3. Click **Enable**

## 3. Create a Service Account

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → Service account**
3. Name: `salon-booking-bot`
4. Click **Create and Continue** → skip optional steps → **Done**
5. Click on the newly created service account email
6. Go to the **Keys** tab → **Add Key → Create new key → JSON**
7. Download the JSON key file — you'll need:
   - `client_email` → used as `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → used as `GOOGLE_PRIVATE_KEY`

## 4. Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com/) and create a new spreadsheet
2. Rename the first sheet tab to **Bookings** (exact spelling matters)
3. Add these headers in **Row 1** (columns A through M):

| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Booking ID | Date | Time Slot | End Time | Client Name | Client Phone | Service | Category | Duration (min) | Status | Booked At | Notes | Notified |

4. Copy the spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```

## 5. Share the Sheet with the Service Account

1. Open the Google Sheet
2. Click **Share**
3. Paste the service account email (e.g., `salon-booking-bot@farwa-salon-bookings.iam.gserviceaccount.com`)
4. Give it **Editor** access
5. Uncheck "Notify people" and click **Share**

## 6. Add Environment Variables

### Local development (`.env.local`)

Create a `.env.local` file in the project root:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=salon-booking-bot@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_spreadsheet_id_here
```

**Important:** The `GOOGLE_PRIVATE_KEY` must be wrapped in double quotes and use `\n` for newlines.

### Vercel deployment

1. Go to your Vercel project → **Settings → Environment Variables**
2. Add each variable for **Production** and **Preview** environments:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY` (paste the full key including `-----BEGIN/END PRIVATE KEY-----`)
   - `GOOGLE_SHEET_ID`

## 7. Email Notification (Google Apps Script)

**Quick checklist:** see [booking-email-setup.md](./booking-email-setup.md) for salon-owner steps to verify alerts work.

The website appends bookings via the Sheets API. **`onEdit` does not run for API writes**, so email alerts use a **time-driven trigger** that scans column **M (Notified)**.

### Sheet column M

Add header **`Notified`** in cell **M1** (the script can also set this on first run). After a booking email is sent, the script writes **`YES`** in column M for that row. Cancelled bookings are marked `YES` without sending mail.

### Paste the script

1. Open your Google Sheet → **Extensions → Apps Script**
2. Delete any broken code in the default `Code.gs`
3. Copy the full contents of **`google-apps-script/EmailBot.gs`** from this repo and paste into the Apps Script editor (one file is enough; you can rename it `EmailBot.gs` in the editor if you like)
4. At the top of the script, set **`SALON_NOTIFY_EMAIL`** to the inbox that should receive alerts (do not commit your real address to git)
5. **Save** (Ctrl+S) and **Run → checkNewBookings** once — approve permissions when prompted

### Time-driven trigger (recommended: every 5–10 minutes)

Do **not** use “every minute” — overlapping runs caused **“JavaScript runtime exited unexpectedly”** failures.

**Option A — helper (easiest):**

1. In the Apps Script editor, select **`setupTrigger`** → **Run**
2. Authorize if asked — this creates a **5-minute** trigger for `checkNewBookings` if one does not exist

**Option B — manual:**

1. Click the **clock** icon (Triggers) → **+ Add Trigger**
2. Function: **`checkNewBookings`**
3. Event source: **Time-driven**
4. Type: **Minutes timer** → **Every 5 minutes** (or 10)
5. Save and authorize

### Test

1. Add a test row on the **Bookings** tab (or submit a booking on the site)
2. Leave column **M** empty for that row; set **Status** (column J) to something other than `Cancelled`
3. Run **`checkNewBookings`** manually from the editor
4. Confirm email arrived and **M** is **`YES`**
5. Run again — it should skip that row (no duplicate email)

### Troubleshooting

| Symptom | Fix |
|--------|-----|
| `JavaScript runtime exited unexpectedly` | Use the repo `EmailBot.gs` (fixes `getRange(lastRow, 1, 1, 12)` bug); use 5–10 min trigger, not every minute |
| No email, no error | Check `SALON_NOTIFY_EMAIL`; run `checkNewBookings` manually and open **Executions** for logs |
| Missed bookings after bulk API writes | Fixed script scans **all** rows where M ≠ `YES`, up to 15 per run |
| Duplicate emails | Ensure column M exists; old script only checked the last row |

### Share sheet with service account (required for website)

The Next.js app still needs **Editor** access for the service account (see [§5](#5-share-the-sheet-with-the-service-account)). The Apps Script runs as **you** (the sheet owner) for `MailApp.sendEmail`; no extra share is needed for the script beyond owning the spreadsheet.

---

## Testing

Without Google Sheets configured, the booking system returns mock data — all slots show as available and bookings return a mock confirmation. This lets you develop and test the UI locally without any cloud setup.

Once env vars are configured, the system reads/writes real data from the sheet.
