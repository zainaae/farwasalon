import { NextResponse } from 'next/server'
import { getSheetRows, appendBooking, generateBookingId, isConfigured, updateBookingStatus } from '../../../lib/google-sheets.js'
import { ALL_SERVICES, PHONE_RE, getServiceMaxWorkers } from '../../../src/data.js'
import { checkRateLimit } from '../../../lib/rate-limit.js'
import { requireStringField } from '../../../lib/sanitize.js'
import { isAllowedOrigin } from '../../../lib/origin-check.js'
import {
  FILTERED_SLOTS,
  slotIndex,
  addMinutes,
  buildOccupiedCounts,
  slotsNeededForDuration,
  canFitAtIndex,
  isSlotInPast,
} from '../../../lib/booking-slots.js'
import { signCancelToken, phoneLast4 } from '../../../lib/booking-cancel-token.js'
import { validateBookingDate, validateTimeInGrid } from '../../../lib/booking-date-rules.js'
import { logger, hashIp, errCtx } from '../../../lib/logger.js'
import { computeBookingDurationMinutes, parseAddonIdsParam } from '../../../lib/booking-duration.js'

export async function POST(request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
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

  /* `null` is valid JSON, so request.json() resolves and the catch above never
     fires — then the first field read throws and the route 500s. `[]` and a
     bare string reach here too. */
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
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

  /* Lead source, e.g. "meta/paid · freedom-deal-2026 · /freedom-deal". Optional
     and never trusted for logic — it is recorded so the sheet can answer which
     campaign produced which booking. Validated like any other client string. */
  const sourceField = requireStringField(body, 'source', { required: false, maxLen: 200 })
  if (sourceField.error) return NextResponse.json({ error: sourceField.error }, { status: 400 })

  const { value: clientName } = nameField
  const { value: clientPhone } = phoneField
  const { value: date } = dateField
  const { value: time } = timeField
  const { value: notes } = notesField
  const { value: source } = sourceField

  const dateCheck = validateBookingDate(date)
  if (!dateCheck.ok) {
    return NextResponse.json({ error: dateCheck.message }, { status: 400 })
  }

  const timeCheck = validateTimeInGrid(time)
  if (!timeCheck.ok) {
    return NextResponse.json({ error: timeCheck.message }, { status: 400 })
  }

  if (isSlotInPast(date, time)) {
    return NextResponse.json(
      { error: 'This time has already passed or starts too soon. Please pick a later slot.' },
      { status: 400 },
    )
  }

  if (!PHONE_RE.test(clientPhone.replace(/\s/g, ''))) {
    return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
  }

  const service = ALL_SERVICES.find(s => s.id === parseInt(String(serviceIdRaw), 10))
  if (!service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  const addonIds = parseAddonIdsParam(body.addonIds)
  const duration = computeBookingDurationMinutes(service, addonIds)
  const endTime = addMinutes(time, duration)

  if (!isConfigured()) {
    logger.error('/api/book', 'sheets-not-configured', { ip: hashIp(ip) })
    return NextResponse.json(
      { error: 'Booking system is not configured. Please contact the salon directly.' },
      { status: 503 }
    )
  }

  let bookings = []
  try {
    bookings = await getSheetRows(date)
  } catch (err) {
    logger.error('/api/book', 'sheets-fetch-failed', { ip: hashIp(ip), date, ...errCtx(err) })
    return NextResponse.json(
      { error: 'Unable to check availability. Please try again or contact the salon.' },
      { status: 502 }
    )
  }

  const maxWorkers = getServiceMaxWorkers(service)
  const occupied = buildOccupiedCounts(bookings)
  const startIdx = slotIndex(time)
  const needed = slotsNeededForDuration(duration)

  if (!canFitAtIndex(occupied, startIdx, needed, maxWorkers)) {
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
      source,
    })
  } catch (err) {
    logger.error('/api/book', 'sheets-write-failed', { ip: hashIp(ip), date, serviceId: service.id, ...errCtx(err) })
    return NextResponse.json(
      { error: 'Failed to save your booking. Please try again or contact the salon.' },
      { status: 502 }
    )
  }

  try {
    /* Count everyone EXCEPT the row we just wrote. Including it made the check
       compare occupied >= capacity against a total that already had us in it,
       so the last free station at any slot always failed: pre-check saw 1 of 2,
       the append made it 2 of 2, and the customer was told someone else had
       taken a slot that was hers. Half of online capacity was unbookable, and
       every attempt left a ghost Cancelled row. This now detects only a genuine
       race — someone else booking between our pre-check and our write. */
    const freshBookings = (await getSheetRows(date)).filter((b) => b.bookingId !== bookingId)
    const freshOccupied = buildOccupiedCounts(freshBookings)
    if (!canFitAtIndex(freshOccupied, startIdx, needed, maxWorkers)) {
      await updateBookingStatus(bookingId, 'Cancelled')
      return NextResponse.json(
        { error: 'This slot was just booked by someone else. Please choose a different time.' },
        { status: 409 }
      )
    }
  } catch {
    // Verify-read failed — treat booking as successful (optimistic)
  }

  const cancelToken = signCancelToken({
    bookingId,
    date,
    phoneLast4: phoneLast4(clientPhone),
  })

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
      cancelToken,
    },
  })
}
