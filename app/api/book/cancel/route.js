import { NextResponse } from 'next/server'
import { getSheetRows, updateBookingStatus, isConfigured } from '../../../../lib/google-sheets.js'
import { checkRateLimit, getClientIp } from '../../../../lib/rate-limit.js'
import { isAllowedOrigin } from '../../../../lib/origin-check.js'
import { verifyCancelToken, phoneLast4 } from '../../../../lib/booking-cancel-token.js'
import { CANCELLATION_MIN_HOURS } from '../../../../lib/booking-duration.js'
import { logger, hashIp, errCtx } from '../../../../lib/logger.js'
import { salonNow, timeToMinutes } from '../../../../lib/booking-slots.js'

export async function POST(request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const ip = getClientIp(request)
  const rl = checkRateLimit(ip, { scope: 'book-cancel', window: 600, max: 10 })
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
    /* No tokenless path. This branch trusted a bookingId supplied by the caller
       and skipped the phone-last-4 ownership check entirely — and the id is
       printed on the confirmation page, in the pre-filled WhatsApp message and
       in the salon's notification email, so it leaks by screenshot. Nothing in
       the app ever reached it: /api/book only succeeds when Sheets is
       configured, which guarantees a signed token is issued. */
    return NextResponse.json({ error: 'A valid cancellation link is required.' }, { status: 401 })
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
    logger.error('/api/book/cancel', 'sheets-fetch-failed', { ip: hashIp(ip), bookingId, ...errCtx(err) })
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

  /* Sheet times are Karachi wall-clock; Vercel runs UTC. Parsing them as
     server-local made every appointment look 5 hours further away than it was,
     so the 2-hour policy was never enforced and a client could cancel a slot
     she was already sitting in. salonNow() is the primitive the slots API
     already uses for exactly this. */
  const nowSalon = salonNow()
  const bookingMinutes = timeToMinutes(booking.timeSlot)
  const daysApart =
    (Date.parse(`${booking.date}T00:00:00Z`) - Date.parse(`${nowSalon.date}T00:00:00Z`)) / 86400000
  const hoursAway = (daysApart * 1440 + bookingMinutes - nowSalon.minutes) / 60
  if (hoursAway < CANCELLATION_MIN_HOURS) {
    return NextResponse.json(
      { error: `Cancellations must be made at least ${CANCELLATION_MIN_HOURS} hours before the appointment. Please WhatsApp the salon.` },
      { status: 400 },
    )
  }

  try {
    await updateBookingStatus(bookingId, 'Cancelled')
  } catch (err) {
    logger.error('/api/book/cancel', 'status-update-failed', { ip: hashIp(ip), bookingId, ...errCtx(err) })
    return NextResponse.json(
      { error: 'Failed to cancel. Please try again or WhatsApp the salon.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ success: true, bookingId })
}
