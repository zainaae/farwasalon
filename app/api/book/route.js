import { NextResponse } from 'next/server'
import { getSheetRows, appendBooking, generateBookingId, isConfigured } from '../../../lib/google-sheets.js'
import { ALL_SERVICES } from '../../../src/data.js'

const PHONE_RE = /^(\+?92|0)?3\d{2}[\s-]?\d{7}$/

const RATE_LIMIT_WINDOW = 10 * 60 * 1000
const RATE_LIMIT_MAX = 5
const rateLimitMap = new Map()

function isRateLimited(ip) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry) {
    rateLimitMap.set(ip, [now])
    return false
  }
  const recent = entry.filter(ts => now - ts < RATE_LIMIT_WINDOW)
  recent.push(now)
  rateLimitMap.set(ip, recent)
  return recent.length > RATE_LIMIT_MAX
}

function sanitizeForSheets(str) {
  if (typeof str !== 'string') return str
  return str.replace(/^[=+\-@\t\r]+/, '')
}

const SLOT_TIMES = []
for (let h = 11; h <= 18; h++) {
  SLOT_TIMES.push(`${String(h).padStart(2, '0')}:00`)
  if (h <= 18) SLOT_TIMES.push(`${String(h).padStart(2, '0')}:30`)
}
const FILTERED = SLOT_TIMES.filter(s => s <= '18:30')

const MAX_WORKERS = 2

function addMinutes(time, mins) {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function slotIndex(time) {
  return FILTERED.indexOf(time)
}

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { serviceId, date, time, clientName, clientPhone, notes } = body

  if (!serviceId || !date || !time || !clientName || !clientPhone) {
    return NextResponse.json({ error: 'Missing required fields: serviceId, date, time, clientName, clientPhone' }, { status: 400 })
  }

  if (!PHONE_RE.test(clientPhone.replace(/\s/g, ''))) {
    return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
  }

  const service = ALL_SERVICES.find(s => s.id === parseInt(serviceId, 10))
  if (!service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  const duration = service.durationMinutes || 30
  const endTime = addMinutes(time, duration)

  if (!isConfigured()) {
    console.error('[book] Google Sheets credentials not configured')
    return NextResponse.json(
      { error: 'Booking system is not configured. Please contact the salon directly.' },
      { status: 503 }
    )
  }

  let bookings = []
  try {
    bookings = await getSheetRows(date)
  } catch (err) {
    console.error('[book] Google Sheets fetch failed:', err?.message || err)
    return NextResponse.json(
      { error: 'Unable to check availability. Please try again or contact the salon.' },
      { status: 502 }
    )
  }

  const occupied = new Array(FILTERED.length).fill(0)
  for (const bk of bookings) {
    if (bk.status === 'Cancelled') continue
    const startIdx = slotIndex(bk.timeSlot)
    if (startIdx === -1) continue
    const dur = bk.duration || 30
    const needed = Math.ceil(dur / 30)
    for (let i = 0; i < needed && startIdx + i < FILTERED.length; i++) {
      occupied[startIdx + i]++
    }
  }

  const startIdx = slotIndex(time)
  if (startIdx === -1) {
    return NextResponse.json({ error: 'Invalid time slot' }, { status: 400 })
  }

  const slotsNeeded = Math.ceil(duration / 30)
  for (let i = 0; i < slotsNeeded; i++) {
    if (startIdx + i >= FILTERED.length || occupied[startIdx + i] >= MAX_WORKERS) {
      return NextResponse.json({ error: 'Time slot is no longer available' }, { status: 409 })
    }
  }

  const bookingId = generateBookingId(date, bookings.length)

  try {
    await appendBooking({
      bookingId,
      date,
      timeSlot: time,
      endTime,
      clientName: sanitizeForSheets(clientName),
      clientPhone: sanitizeForSheets(clientPhone),
      service: service.name,
      category: service.category,
      duration,
      status: 'Confirmed',
      bookedAt: new Date().toISOString(),
      notes: sanitizeForSheets(notes || ''),
    })
  } catch (err) {
    console.error('[book] Failed to write booking to Google Sheets:', err?.message || err)
    return NextResponse.json(
      { error: 'Failed to save your booking. Please try again or contact the salon.' },
      { status: 502 }
    )
  }

  return NextResponse.json({
    success: true,
    booking: {
      id: bookingId,
      date,
      time,
      endTime,
      service: service.name,
      clientName,
      clientPhone,
    },
  })
}
