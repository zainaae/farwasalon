/**
 * Farwa Salon — booking email notifications
 *
 * Paste this entire file into Extensions → Apps Script in your Bookings sheet.
 * Bookings tab columns (must match lib/google-sheets.js):
 *   A=bookingId, B=date, C=timeSlot, D=endTime, E=clientName, F=clientPhone,
 *   G=service, H=category, I=duration, J=status, K=bookedAt, L=notes, M=Notified
 */

/** Replace with the inbox that should receive new-booking alerts */
var SALON_NOTIFY_EMAIL = 'your-email@example.com';

/** Max rows to email per run (stays under the 6-minute execution limit) */
var BATCH_LIMIT = 15;

/**
 * onEdit does NOT run when the Next.js API appends rows via the Sheets API.
 * Use a time-driven trigger on checkNewBookings() instead (see setupTrigger).
 */
function onEdit(e) {
  // Intentionally empty — API writes do not fire onEdit.
}

/**
 * Run once from the Apps Script editor after pasting: selects checkNewBookings,
 * Run, then authorize. Creates a 5-minute time-driven trigger if none exists.
 */
function setupTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var t = 0; t < triggers.length; t++) {
    if (triggers[t].getHandlerFunction() === 'checkNewBookings') {
      Logger.log('Trigger for checkNewBookings already exists.');
      return;
    }
  }
  ScriptApp.newTrigger('checkNewBookings')
    .timeBased()
    .everyMinutes(5)
    .create();
  Logger.log('Created 5-minute trigger for checkNewBookings.');
}

/** Ensures column M header is "Notified" (row 1). */
function ensureNotifiedColumn(sheet) {
  var header = sheet.getRange(1, 13).getValue();
  if (!header || String(header).trim() === '') {
    sheet.getRange(1, 13).setValue('Notified');
  }
}

/**
 * Scans all data rows for bookings not yet marked YES in column M,
 * sends notification emails, and marks M as YES. Skips Cancelled rows
 * (marks them YES without emailing).
 */
function checkNewBookings() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    console.warn('checkNewBookings: could not acquire lock; another run is in progress.');
    return;
  }

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bookings');
    if (!sheet) {
      throw new Error('Sheet "Bookings" not found.');
    }

    ensureNotifiedColumn(sheet);

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return;
    }

    var notifyTo = String(SALON_NOTIFY_EMAIL || '').trim();
    if (!notifyTo || notifyTo.indexOf('@') === -1) {
      throw new Error('Set SALON_NOTIFY_EMAIL at the top of EmailBot.gs to a valid address.');
    }

    // Rows 2..lastRow, columns A..M (13 columns)
    var data = sheet.getRange(2, 1, lastRow, 13).getValues();
    var sent = 0;
    var sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();

    for (var i = 0; i < data.length && sent < BATCH_LIMIT; i++) {
      var row = data[i];
      var rowNumber = i + 2;

      // M = Notified
      if (String(row[12] || '').trim().toUpperCase() === 'YES') {
        continue;
      }

      var bookingId = row[0];
      if (!bookingId) {
        continue;
      }

      // J = status — skip cancelled without emailing
      var status = String(row[9] || '').trim();
      if (status === 'Cancelled') {
        sheet.getRange(rowNumber, 13).setValue('YES');
        continue;
      }

      var subject = '\uD83D\uDCC5 New Booking: ' + row[6] + ' — ' + row[4];
      var body = [
        'New booking received!',
        '',
        'Booking ID: ' + bookingId,
        'Service: ' + row[6] + ' (' + row[7] + ')',
        'Client: ' + row[4],
        'Phone: ' + row[5],
        'Date: ' + row[1],
        'Time: ' + row[2] + ' – ' + row[3],
        'Duration: ' + row[8] + ' minutes',
        'Status: ' + status,
        '',
        'Open the sheet: ' + sheetUrl
      ].join('\n');

      MailApp.sendEmail({
        to: notifyTo,
        subject: subject,
        body: body
      });

      sheet.getRange(rowNumber, 13).setValue('YES');
      sent++;
    }

    if (sent > 0) {
      Logger.log('Sent ' + sent + ' booking notification(s).');
    }
  } catch (err) {
    console.error('checkNewBookings failed: ' + (err && err.message ? err.message : err));
    throw err;
  } finally {
    lock.releaseLock();
  }
}
