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

/* ══════════════════════════════════════════════════════════════════
 * REVIEW DIGEST — daily one-tap Google-review asks
 *
 * Every evening this emails the salon a list of the day's clients.
 * Each client has one-tap wa.me links that open WhatsApp with a
 * PERSONALIZED review-ask already typed (name filled in, bridal
 * variant auto-selected). Staff just taps and hits send — the human
 * stays in the loop, so this is fully WhatsApp-ToS-safe.
 *
 * Also lists clients from 3 days ago for the single follow-up nudge.
 *
 * Setup: run setupTriggers() once from the editor (replaces the old
 * setupTrigger — it creates the 5-min booking check, the 9 AM confirm
 * digest, and the daily 19:00 review digest).
 * ══════════════════════════════════════════════════════════════════ */

var REVIEW_LINK = 'https://farwasalon.com/review';
var DIGEST_HOUR = 19; // 7 PM PKT — right after closing
var SALON_TZ = 'Asia/Karachi';

var CONFIRM_DIGEST_HOUR = 9; // 9 AM PKT — morning Sheet→WA confirms

/** Creates booking-check + morning confirm + evening review triggers (idempotent). */
function setupTriggers() {
  setupTrigger(); // existing 5-minute booking-notification trigger
  ensureDailyTrigger_('sendMorningConfirmDigest', CONFIRM_DIGEST_HOUR);
  ensureDailyTrigger_('sendReviewDigest', DIGEST_HOUR);
}

function ensureDailyTrigger_(handlerName, hour) {
  var triggers = ScriptApp.getProjectTriggers();
  for (var t = 0; t < triggers.length; t++) {
    if (triggers[t].getHandlerFunction() === handlerName) {
      Logger.log('Trigger for ' + handlerName + ' already exists.');
      return;
    }
  }
  ScriptApp.newTrigger(handlerName)
    .timeBased()
    .everyDays(1)
    .atHour(hour)
    .inTimezone(SALON_TZ)
    .create();
  Logger.log('Created daily ' + hour + ':00 trigger for ' + handlerName + '.');
}

/** '0322 2782254' / '+92 322...' / '92322...' -> '923222782254' for wa.me */
function waNumber(phone) {
  var digits = String(phone || '').replace(/\D/g, '');
  if (digits.indexOf('92') === 0) return digits;
  if (digits.indexOf('0') === 0) return '92' + digits.slice(1);
  return digits ? '92' + digits : '';
}

/** Normalize a sheet date cell (Date object or 'YYYY-MM-DD' string). */
function cellDateStr(v) {
  if (v instanceof Date) return Utilities.formatDate(v, SALON_TZ, 'yyyy-MM-dd');
  return String(v || '').slice(0, 10);
}

function firstName(fullName) {
  var n = String(fullName || '').trim().split(/\s+/)[0];
  return n || 'there';
}

function reviewMessage(name, category) {
  var first = firstName(name);
  if (String(category || '').toLowerCase() === 'bridal') {
    return 'It was an honour being part of your special day, ' + first + '! 💍✨ You looked absolutely stunning.\n\n' +
      'When things settle down, we would love a short Google review about your bridal experience — it means the world to brides choosing their salon:\n\n' +
      '⭐ ' + REVIEW_LINK + '\n\n— Rubina & team 🌸';
  }
  return 'Thank you for visiting Farwa Beauty Salon today, ' + first + '! 🌸 It was lovely having you.\n\n' +
    'If you enjoyed your visit, would you take 30 seconds to leave us a Google review? It genuinely helps our small salon grow:\n\n' +
    '⭐ ' + REVIEW_LINK + '\n\n— Rubina & team 💕';
}

function reviewMessageUrdu(name) {
  var first = firstName(name);
  return 'Aaj Farwa Beauty Salon aane ka shukriya, ' + first + '! 🌸 Umeed hai aap ko apna look pasand aaya.\n\n' +
    'Agar aap ka tajurba acha raha ho to please 30 second nikaal kar Google review de dein — is se hamare salon ko bohat madad milti hai:\n\n' +
    '⭐ ' + REVIEW_LINK + '\n\n— Rubina & team 💕';
}

function nudgeMessage(name) {
  var first = firstName(name);
  return 'Salaam ' + first + '! Just a gentle reminder 🌸 — if you have 30 seconds, we would love your Google review:\n\n' +
    '⭐ ' + REVIEW_LINK + '\n\n' +
    'Aur agar visit mein koi bhi masla raha ho, to please yahin bata dein — hum usay zaroor theek karenge. 💕';
}

function waLink(phone, message) {
  var num = waNumber(phone);
  return num ? 'https://wa.me/' + num + '?text=' + encodeURIComponent(message) : '';
}

function confirmMessage(name, service, time) {
  var first = firstName(name);
  return 'Assalam-o-Alaikum ' + first + '! 🌸 Your Farwa Beauty Salon appointment is confirmed.\n\n' +
    '📅 Today · ' + String(time || '') + '\n' +
    '✨ ' + String(service || 'your service') + '\n\n' +
    'We are at Plot 165/G-1, Saima Terrace, Block 3 PECHS. Reply here if you need to reschedule (at least 2 hours notice). See you soon!';
}

/**
 * Morning email: today's bookings with one-tap WhatsApp confirm messages.
 * Run manually any morning via sendMorningConfirmDigest, or rely on the 9 AM trigger.
 */
function sendMorningConfirmDigest() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bookings');
  if (!sheet) throw new Error('Sheet "Bookings" not found.');
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  var notifyTo = String(SALON_NOTIFY_EMAIL || '').trim();
  if (!notifyTo || notifyTo.indexOf('@') === -1) {
    throw new Error('Set SALON_NOTIFY_EMAIL at the top of EmailBot.gs.');
  }

  var data = sheet.getRange(2, 1, lastRow, 13).getValues();
  var today = Utilities.formatDate(new Date(), SALON_TZ, 'yyyy-MM-dd');
  var todays = clientsForDate(data, today);

  if (todays.length === 0) {
    Logger.log('Morning confirm digest: no bookings for ' + today);
    return;
  }

  var html = '<div style="font-family:Arial,sans-serif;max-width:560px;">' +
    '<h2 style="margin:0 0 4px;">📅 Today&#39;s bookings — ' + today + '</h2>' +
    '<p style="color:#666;margin:0 0 16px;font-size:13px;">Open on the salon phone. Tap <strong>Send confirm</strong> per client — WhatsApp opens with the message ready. Press send. Skip anyone you already messaged.</p>' +
    '<h3 style="margin:16px 0 4px;">Confirmed clients (' + todays.length + ')</h3><table style="border-collapse:collapse;width:100%;">';

  for (var i = 0; i < todays.length; i++) {
    var c = todays[i];
    html += digestRowHtml(c, [
      { label: 'Send confirm', href: waLink(c.phone, confirmMessage(c.name, c.service, c.time)) }
    ]);
  }
  html += '</table>' +
    '<p style="color:#999;font-size:12px;margin-top:20px;">Evening: the 7 PM review digest covers post-visit Google asks. Freedom Deal (if live): honour 14% at counter for baskets Rs 1,400+ through 14 Aug — no promo codes.</p></div>';

  MailApp.sendEmail({
    to: notifyTo,
    subject: '📅 Today\'s bookings: ' + todays.length + ' confirm' + (todays.length === 1 ? '' : 's'),
    body: 'Open this email on the salon phone to send one-tap WhatsApp confirms.',
    htmlBody: html
  });
  Logger.log('Morning confirm digest sent: ' + todays.length + ' clients.');
}

/** Collect non-cancelled bookings for a date, de-duped by phone. */
function clientsForDate(data, dateStr) {
  var seen = {};
  var out = [];
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    if (cellDateStr(row[1]) !== dateStr) continue;
    if (String(row[9] || '').trim() === 'Cancelled') continue;
    var phone = waNumber(row[5]);
    if (!phone || seen[phone]) continue;
    seen[phone] = true;
    out.push({ name: row[4], phone: row[5], service: row[6], category: row[7], time: row[2] });
  }
  return out;
}

function digestRowHtml(c, links) {
  var parts = [];
  for (var i = 0; i < links.length; i++) {
    parts.push('<a href="' + links[i].href + '" style="display:inline-block;padding:6px 14px;margin:2px 6px 2px 0;background:#0d0d0d;color:#fff;text-decoration:none;border-radius:4px;font-size:13px;">' + links[i].label + '</a>');
  }
  return '<tr><td style="padding:10px 8px;border-bottom:1px solid #eee;">' +
    '<strong>' + c.name + '</strong> — ' + c.service + ' (' + c.time + ')<br>' + parts.join('') +
    '</td></tr>';
}

/**
 * Emails the salon today's one-tap review asks + 3-day nudge list.
 * Safe to run manually from the editor any time.
 */
function sendReviewDigest() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bookings');
  if (!sheet) throw new Error('Sheet "Bookings" not found.');
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  var notifyTo = String(SALON_NOTIFY_EMAIL || '').trim();
  if (!notifyTo || notifyTo.indexOf('@') === -1) {
    throw new Error('Set SALON_NOTIFY_EMAIL at the top of EmailBot.gs.');
  }

  var data = sheet.getRange(2, 1, lastRow, 13).getValues();
  var today = Utilities.formatDate(new Date(), SALON_TZ, 'yyyy-MM-dd');
  var threeDaysAgo = Utilities.formatDate(new Date(Date.now() - 3 * 86400000), SALON_TZ, 'yyyy-MM-dd');

  var todays = clientsForDate(data, today);
  var nudges = clientsForDate(data, threeDaysAgo);

  if (todays.length === 0 && nudges.length === 0) {
    Logger.log('Review digest: nothing to send today.');
    return;
  }

  var html = '<div style="font-family:Arial,sans-serif;max-width:560px;">' +
    '<h2 style="margin:0 0 4px;">⭐ Review asks — ' + today + '</h2>' +
    '<p style="color:#666;margin:0 0 16px;font-size:13px;">Tap a button on the salon phone — WhatsApp opens with the message ready. Just press send. Skip anyone who seemed unhappy (use /recover instead).</p>';

  if (todays.length) {
    html += '<h3 style="margin:16px 0 4px;">Today&#39;s clients (' + todays.length + ')</h3><table style="border-collapse:collapse;width:100%;">';
    for (var i = 0; i < todays.length; i++) {
      var c = todays[i];
      html += digestRowHtml(c, [
        { label: 'Ask — English', href: waLink(c.phone, reviewMessage(c.name, c.category)) },
        { label: 'Ask — Urdu', href: waLink(c.phone, reviewMessageUrdu(c.name)) }
      ]);
    }
    html += '</table>';
  }

  if (nudges.length) {
    html += '<h3 style="margin:20px 0 4px;">Follow-up nudges — visited ' + threeDaysAgo + ' (' + nudges.length + ')</h3>' +
      '<p style="color:#666;margin:0 0 8px;font-size:12px;">Only nudge clients who never replied and have not reviewed. One nudge maximum.</p>' +
      '<table style="border-collapse:collapse;width:100%;">';
    for (var j = 0; j < nudges.length; j++) {
      var n = nudges[j];
      html += digestRowHtml(n, [{ label: 'Send nudge', href: waLink(n.phone, nudgeMessage(n.name)) }]);
    }
    html += '</table>';
  }

  html += '<p style="color:#999;font-size:12px;margin-top:20px;">Friday check: review count at <a href="' + REVIEW_LINK + '">' + REVIEW_LINK + '</a> · goal +2–3/week · never offer anything in exchange for a review.</p></div>';

  MailApp.sendEmail({
    to: notifyTo,
    subject: '⭐ Review asks: ' + todays.length + ' today' + (nudges.length ? ' + ' + nudges.length + ' nudges' : ''),
    body: 'Open this email on the salon phone to send one-tap review asks.',
    htmlBody: html
  });
  Logger.log('Review digest sent: ' + todays.length + ' asks, ' + nudges.length + ' nudges.');
}
