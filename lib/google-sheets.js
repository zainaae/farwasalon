import { google } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key   = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  if (!email || !key) return null
  return new google.auth.JWT(email, null, key, SCOPES)
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
  const auth = getAuth()
  const sheetId = getSheetId()
  if (!auth || !sheetId) return []

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
  const auth = getAuth()
  const sheetId = getSheetId()
  if (!auth || !sheetId) return

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

export function generateBookingId(date, existingCount) {
  const datePart = date.replace(/-/g, '')
  const seq = String(existingCount + 1).padStart(3, '0')
  return `FBS-${datePart}-${seq}`
}
