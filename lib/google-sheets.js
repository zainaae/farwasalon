import { randomBytes } from 'crypto'
import { google } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

/** @param {unknown} err */
export function sheetsErrorDetail(err) {
  if (!err || typeof err !== 'object') return String(err)
  const gaxios = /** @type {{ response?: { data?: { error?: { message?: string } } }, message?: string }} */ (err)
  const apiMsg = gaxios.response?.data?.error?.message
  if (apiMsg) return apiMsg
  if (err instanceof Error) return err.message
  return String(err)
}

function isRetryableSheetsError(err) {
  const status = err?.response?.status ?? err?.code
  if (status === 429 || status === 500 || status === 503) return true
  const msg = sheetsErrorDetail(err)
  return /ECONNRESET|ETIMEDOUT|socket hang up/i.test(msg)
}

async function withSheetsRetry(fn, { attempts = 3 } = {}) {
  let lastErr
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (!isRetryableSheetsError(err) || i === attempts - 1) throw err
      await new Promise((r) => setTimeout(r, 250 * (i + 1)))
    }
  }
  throw lastErr
}

function parsePrivateKey(raw) {
  if (!raw) return ''
  let key = String(raw).trim()
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1)
  }
  key = key.replace(/\\n/g, '\n')
  return key
}

async function getAuthClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim()
  const key = parsePrivateKey(process.env.GOOGLE_PRIVATE_KEY)
  if (!email || !key || !key.includes('BEGIN PRIVATE KEY')) return null
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key: key },
    scopes: SCOPES,
  })
  return auth.getClient()
}

function getSheetId() {
  return process.env.GOOGLE_SHEET_ID || null
}

export function isConfigured() {
  const key = parsePrivateKey(process.env.GOOGLE_PRIVATE_KEY)
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() &&
    key.includes('BEGIN PRIVATE KEY') &&
    process.env.GOOGLE_SHEET_ID?.trim()
  )
}

/** Short in-process cache for Bookings!A:L — cuts Sheets round-trips under concurrent /api/slots + /api/book. */
const BOOKINGS_CACHE_TTL_MS = 15_000
/** @type {{ at: number, rows: string[][] } | null} */
let bookingsRowsCache = null

function invalidateBookingsCache() {
  bookingsRowsCache = null
}

/** Google Sheets USER_ENTERED turns ISO dates and HH:MM into serial numbers.
 *  Cancel + occupancy then fail string equality (`2026-08-03` !== `46237`). */
export function sheetsSerialToYmd(value) {
  if (value == null || value === '') return ''
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim()
  }
  const n = typeof value === 'number' ? value : Number(String(value).trim())
  if (!Number.isFinite(n) || n < 20000) return String(value).trim()
  /* Sheets serial day 0 = 1899-12-30 (Lotus leap-year quirk). */
  const ms = Date.UTC(1899, 11, 30) + Math.round(n) * 86400000
  return new Date(ms).toISOString().slice(0, 10)
}

export function sheetsSerialToHm(value) {
  if (value == null || value === '') return ''
  if (typeof value === 'string') {
    const trimmed = value.trim()
    const m = trimmed.match(/^(\d{1,2}):(\d{2})/)
    if (m) return `${m[1].padStart(2, '0')}:${m[2]}`
  }
  const n = typeof value === 'number' ? value : Number(String(value).trim())
  if (!Number.isFinite(n) || n >= 1) return String(value).trim()
  const totalMinutes = Math.round(n * 24 * 60)
  const h = Math.floor(totalMinutes / 60) % 24
  const mins = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

async function fetchAllBookingRows() {
  const now = Date.now()
  if (bookingsRowsCache && now - bookingsRowsCache.at < BOOKINGS_CACHE_TTL_MS) {
    return bookingsRowsCache.rows
  }

  const auth = await getAuthClient()
  const sheetId = getSheetId()
  if (!auth || !sheetId) {
    throw new Error('Google Sheets auth or sheet ID unavailable')
  }

  const sheets = google.sheets({ version: 'v4', auth })
  const res = await withSheetsRetry(() =>
    sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Bookings!A:N',
    }),
  )

  const rows = res.data.values || []
  bookingsRowsCache = { at: Date.now(), rows }
  return rows
}

export async function getSheetRows(date) {
  const rows = await fetchAllBookingRows()
  if (rows.length <= 1) return []

  return rows.slice(1)
    .map(row => ({
      bookingId:   row[0]  || '',
      date:        sheetsSerialToYmd(row[1]),
      timeSlot:    sheetsSerialToHm(row[2]),
      endTime:     sheetsSerialToHm(row[3]),
      clientName:  row[4]  || '',
      clientPhone: row[5]  || '',
      service:     row[6]  || '',
      category:    row[7]  || '',
      duration:    parseInt(row[8], 10) || 30,
      status:      row[9]  || '',
      bookedAt:    row[10] || '',
      notes:       row[11] || '',
    }))
    .filter(row => row.date === date)
}

export async function appendBooking(row) {
  const auth = await getAuthClient()
  const sheetId = getSheetId()
  if (!auth || !sheetId) {
    throw new Error('Google Sheets auth or sheet ID unavailable')
  }

  const sheets = google.sheets({ version: 'v4', auth })
  await withSheetsRetry(() =>
    sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Bookings!A:L',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[
          row.bookingId,
          row.date,
          row.timeSlot,
          row.endTime,
          row.clientName,
          row.clientPhone,
          row.service,
          row.category,
          row.duration,
          row.status,
          row.bookedAt,
          row.notes,
          /* M is owned by the Apps Script email bot ("Notified"), so it is left
             blank here and Source takes N. Changing this order means updating
             google-apps-script/EmailBot.gs too. */
          '',
          row.source || '',
        ]],
      },
    }),
  )
  invalidateBookingsCache()
}

/**
 * Set a booking's status cell. Returns true only when a row was actually
 * written.
 *
 * This used to `return` silently on missing auth and on a row it could not
 * find. Both callers await it inside a try/catch, so a no-op looked exactly
 * like success: the customer saw "Cancelled", the row stayed Confirmed, the
 * salon held the station and she did not arrive. The /api/book rollback
 * inherited the same hole — a failed rollback returned 409 to the customer
 * while leaving a Confirmed ghost row consuming a station.
 */
export async function updateBookingStatus(bookingId, status) {
  const auth = await getAuthClient()
  const sheetId = getSheetId()
  if (!auth || !sheetId) return false

  const sheets = google.sheets({ version: 'v4', auth })
  // Bypass short-lived read cache so we resolve the live row index before writing.
  invalidateBookingsCache()
  const rows = await fetchAllBookingRows()
  const rowIndex = rows.findIndex(row => row[0] === bookingId)
  if (rowIndex === -1) return false

  await withSheetsRetry(() =>
    sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Bookings!J${rowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[status]] },
    }),
  )
  invalidateBookingsCache()
  return true
}

export function generateBookingId() {
  /* 8 random bytes (64 bits) — the old randomBytes(4) gave only 32 bits
     (~77k bookings for a ~50% collision chance) and the ID is semi-public
     (confirmation URL, WhatsApp text, salon email), so a brute-forceable ID
     is a footgun if any future endpoint ever trusts it alone. */
  return `FBS-${randomBytes(8).toString('hex').toUpperCase()}`
}
