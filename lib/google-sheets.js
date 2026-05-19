import { randomBytes } from 'crypto'
import { google } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

function parsePrivateKey(raw) {
  if (!raw) return ''
  let key = raw.trim()
  if (key.startsWith('"') && key.endsWith('"')) {
    key = key.slice(1, -1)
  }
  key = key.replace(/\\n/g, '\n')
  return key
}

async function getAuthClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = parsePrivateKey(process.env.GOOGLE_PRIVATE_KEY)
  if (!email || !key) return null
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
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.GOOGLE_SHEET_ID
  )
}

export async function getSheetRows(date) {
  const auth = await getAuthClient()
  const sheetId = getSheetId()
  if (!auth || !sheetId) {
    throw new Error('Google Sheets auth or sheet ID unavailable')
  }

  const sheets = google.sheets({ version: 'v4', auth })
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Bookings!A:L',
  })

  const rows = res.data.values || []
  if (rows.length <= 1) return []

  return rows.slice(1)
    .filter(row => row[1] === date)
    .map(row => ({
      bookingId:   row[0]  || '',
      date:        row[1]  || '',
      timeSlot:    row[2]  || '',
      endTime:     row[3]  || '',
      clientName:  row[4]  || '',
      clientPhone: row[5]  || '',
      service:     row[6]  || '',
      category:    row[7]  || '',
      duration:    parseInt(row[8], 10) || 30,
      status:      row[9]  || '',
      bookedAt:    row[10] || '',
      notes:       row[11] || '',
    }))
}

export async function appendBooking(row) {
  const auth = await getAuthClient()
  const sheetId = getSheetId()
  if (!auth || !sheetId) {
    throw new Error('Google Sheets auth or sheet ID unavailable')
  }

  const sheets = google.sheets({ version: 'v4', auth })
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Bookings!A:L',
    valueInputOption: 'USER_ENTERED',
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
      ]],
    },
  })
}

export async function updateBookingStatus(bookingId, status) {
  const auth = await getAuthClient()
  const sheetId = getSheetId()
  if (!auth || !sheetId) return

  const sheets = google.sheets({ version: 'v4', auth })
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Bookings!A:L',
  })

  const rows = res.data.values || []
  const rowIndex = rows.findIndex(row => row[0] === bookingId)
  if (rowIndex === -1) return

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `Bookings!J${rowIndex + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[status]] },
  })
}

export function generateBookingId() {
  return `FBS-${randomBytes(4).toString('hex').toUpperCase()}`
}
