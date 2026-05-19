import { NextResponse } from 'next/server'
import { getSheetRows, updateBookingStatus, isConfigured } from '../../../../lib/google-sheets.js'
import { checkRateLimit } from '../../../../lib/rate-limit.js'
import { isAllowedOrigin } from '../../../../lib/origin-check.js'
import { verifyCancelToken, phoneLast4 } from '../../../../lib/booking-cancel-token.js'
import { CANCELLATION_MIN_HOURS } from '../../../../lib/booking-duration.js'

export async function POST(request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rl = checkRateLimit(ip, { window: 600, max: 10 })
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

  let bookingId
  let date
  let tokenPhoneLast4

  const token = typeof body?.token === 'string' ? body.token.trim() : ''
  if (token) {
    const payload = verifyCancelToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired cancellation link.' }, { status: 400 })
    }
    bookingId = payload.bookingId
    date = payload.date
    tokenPhoneLast4 = payload.phoneLast4
  } else {
    bookingId = body?.bookingId
    date = body?.date
  }

  if (!bookingId || typeof bookingId !== 'string' || !/^FBS-[A-F0-9]{4,16}$/i.test(bookingId)) {
    return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 })
  }
  if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  if (!isConfigured()) {
    return NextResponse.json(
      { error: 'Booking system is not configured. Please contact the salon directly.' },
      { status: 503 },
    )
  }

  let bookings = []
  try {
    bookings = await getSheetRows(date)
  } catch (err) {
    console.error('[cancel] Sheets fetch failed:', err?.message || err)
    return NextResponse.json(
      { error: 'Unable to verify booking. Please try again or WhatsApp the salon.' },
      { status: 502 },
    )
  }

  const booking = bookings.find(b => b.bookingId === bookingId)
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  if (tokenPhoneLast4 && phoneLast4(booking.clientPhone) !== tokenPhoneLast4) {
    return NextResponse.json({ error: 'Invalid cancellation link.' }, { status: 403 })
  }

  if (booking.status === 'Cancelled') {
    return NextResponse.json({ error: 'This booking is already cancelled.' }, { status: 400 })
  }

  const bookingTime = new Date(`${booking.date}T${booking.timeSlot}:00`)
  const now = new Date()
  const hoursAway = (bookingTime.getTime() - now.getTime()) / 3600000
  if (hoursAway < CANCELLATION_MIN_HOURS) {
    return NextResponse.json(
      { error: `Cancellations must be made at least ${CANCELLATION_MIN_HOURS} hours before the appointment. Please WhatsApp the salon.` },
      { status: 400 },
    )
  }

  try {
    await updateBookingStatus(bookingId, 'Cancelled')
  } catch (err) {
    console.error('[cancel] Failed to update status:', err?.message || err)
    return NextResponse.json(
      { error: 'Failed to cancel. Please try again or WhatsApp the salon.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ success: true, bookingId })
}
