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
3. Add these headers in **Row 1** (columns A through L):

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Booking ID | Date | Time Slot | End Time | Client Name | Client Phone | Service | Category | Duration (min) | Status | Booked At | Notes |

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

To receive email notifications when a new booking is added:

1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Replace the default code with:

```javascript
function onEdit(e) {
  // onEdit won't fire for API writes — use onChange or a time-driven trigger instead
}

function checkNewBookings() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bookings');
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  var statusCell = sheet.getRange(lastRow, 10); // Column J = Status
  var notifiedCell = sheet.getRange(lastRow, 13); // Column M = Notified flag (add this column)

  if (notifiedCell.getValue() === 'YES') return;

  var row = sheet.getRange(lastRow, 1, 1, 12).getValues()[0];
  var bookingId   = row[0];
  var date        = row[1];
  var timeSlot    = row[2];
  var endTime     = row[3];
  var clientName  = row[4];
  var clientPhone = row[5];
  var service     = row[6];
  var category    = row[7];
  var duration    = row[8];

  var subject = '🗓️ New Booking: ' + service + ' — ' + clientName;
  var body = [
    'New booking received!',
    '',
    'Booking ID: ' + bookingId,
    'Service: ' + service + ' (' + category + ')',
    'Client: ' + clientName,
    'Phone: ' + clientPhone,
    'Date: ' + date,
    'Time: ' + timeSlot + ' – ' + endTime,
    'Duration: ' + duration + ' minutes',
    '',
    'Open the sheet: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  ].join('\n');

  MailApp.sendEmail({
    to: 'your-email@example.com',  // ← Replace with your email
    subject: subject,
    body: body
  });

  notifiedCell.setValue('YES');
}
```

4. Replace `your-email@example.com` with your actual email
5. Save the script (Ctrl+S)
6. Set up a **time-driven trigger**:
   - Click the clock icon (Triggers) in the left sidebar
   - Click **+ Add Trigger**
   - Function: `checkNewBookings`
   - Event source: **Time-driven**
   - Type: **Minutes timer** → **Every minute**
   - Click **Save** and authorize

---

## Testing

Without Google Sheets configured, the booking system returns mock data — all slots show as available and bookings return a mock confirmation. This lets you develop and test the UI locally without any cloud setup.

Once env vars are configured, the system reads/writes real data from the sheet.
