import { NextResponse } from 'next/server'
import { getSheetRows, appendBooking, generateBookingId, isConfigured, updateBookingStatus } from '../../../lib/google-sheets.js'
import { ALL_SERVICES, PHONE_RE } from '../../../src/data.js'
import { checkRateLimit } from '../../../lib/rate-limit.js'
import { requireStringField } from '../../../lib/sanitize.js'
import {
  FILTERED_SLOTS,
  slotIndex,
  addMinutes,
  buildOccupiedCounts,
  slotsNeededForDuration,
  canFitAtIndex,
} from '../../../lib/booking-slots.js'

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rl = checkRateLimit(ip, { window: 600, max: 5 })
  if (rl.limited) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body?.website?.trim?.() || body?._hp?.trim?.()) {
    return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
  }

  const serviceIdRaw = body.serviceId
  if (typeof serviceIdRaw !== 'number' && typeof serviceIdRaw !== 'string') {
    return NextResponse.json({ error: 'Invalid serviceId' }, { status: 400 })
  }

  const nameField = requireStringField(body, 'clientName', { maxLen: 120 })
  if (nameField.error) return NextResponse.json({ error: nameField.error }, { status: 400 })

  const phoneField = requireStringField(body, 'clientPhone', { maxLen: 32 })
  if (phoneField.error) return NextResponse.json({ error: phoneField.error }, { status: 400 })

  const dateField = requireStringField(body, 'date', { maxLen: 10 })
  if (dateField.error) return NextResponse.json({ error: dateField.error }, { status: 400 })

  const timeField = requireStringField(body, 'time', { maxLen: 5 })
  if (timeField.error) return NextResponse.json({ error: timeField.error }, { status: 400 })

  const notesField = requireStringField(body, 'notes', { required: false, maxLen: 500 })
  if (notesField.error) return NextResponse.json({ error: notesField.error }, { status: 400 })

  const { value: clientName } = nameField
  const { value: clientPhone } = phoneField
  const { value: date } = dateField
  const { value: time } = timeField
  const { value: notes } = notesField

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
  }

  if (!PHONE_RE.test(clientPhone.replace(/\s/g, ''))) {
    return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
  }

  const service = ALL_SERVICES.find(s => s.id === parseInt(String(serviceIdRaw), 10))
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

  const occupied = buildOccupiedCounts(bookings)
  const startIdx = slotIndex(time)
  const needed = slotsNeededForDuration(duration)

  if (!canFitAtIndex(occupied, startIdx, needed)) {
    return NextResponse.json({ error: 'Time slot is no longer available' }, { status: 409 })
  }

  const bookingId = generateBookingId()

  try {
    await appendBooking({
      bookingId,
      date,
      timeSlot: time,
      endTime,
      clientName,
      clientPhone,
      service: service.name,
      category: service.category,
      duration,
      status: 'Confirmed',
      bookedAt: new Date().toISOString(),
      notes,
    })
  } catch (err) {
    console.error('[book] Failed to write booking to Google Sheets:', err?.message || err)
    return NextResponse.json(
      { error: 'Failed to save your booking. Please try again or contact the salon.' },
      { status: 502 }
    )
  }

  try {
    const freshBookings = await getSheetRows(date)
    const freshOccupied = buildOccupiedCounts(freshBookings)
    if (!canFitAtIndex(freshOccupied, startIdx, needed)) {
      await updateBookingStatus(bookingId, 'Cancelled')
      return NextResponse.json(
        { error: 'This slot was just booked by someone else. Please choose a different time.' },
        { status: 409 }
      )
    }
  } catch {
    // Verify-read failed — treat booking as successful (optimistic)
  }

  return NextResponse.json({
    success: true,
    booking: {
      id: bookingId,
      date,
      time,
      endTime,
      service: service.name,
      duration,
      clientName,
      clientPhone,
    },
  })
}
