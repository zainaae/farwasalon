import { NextResponse } from 'next/server'
import { getSheetRows, appendBooking, generateBookingId, isConfigured, updateBookingStatus } from '../../../lib/google-sheets.js'
import { PHONE_RE } from '../../../src/data.js'
import { checkRateLimit, getClientIp } from '../../../lib/rate-limit.js'
import { requireStringField } from '../../../lib/sanitize.js'
import { isAllowedOrigin } from '../../../lib/origin-check.js'
import {
  slotIndex,
  addMinutes,
  buildOccupiedCounts,
  slotsNeededForDuration,
  canFitAtIndex,
  isSlotInPast,
  shouldCancelSelf,
  MAX_WORKERS,
} from '../../../lib/booking-slots.js'
import { signCancelToken, phoneLast4 } from '../../../lib/booking-cancel-token.js'
import { validateBookingDate, validateTimeInGrid } from '../../../lib/booking-date-rules.js'
import { logger, hashIp, errCtx } from '../../../lib/logger.js'
import {
  computeServicesDurationMinutes,
  formatCombinedCategory,
  formatCombinedServiceName,
  getBookingMaxWorkers,
  parseAddonIdsParam,
  resolveBookingServices,
} from '../../../lib/booking-duration.js'

export async function POST(request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const ip = getClientIp(request)
  const rl = checkRateLimit(ip, { scope: 'book', window: 600, max: 5 })
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

  /* Legacy clients send serviceId; multi-select sends serviceIds (and may still
     include serviceId as the first pick). Either path must resolve to catalog rows. */
  const hasServiceId =
    typeof body.serviceId === 'number' || typeof body.serviceId === 'string'
  const hasServiceIds =
    body.serviceIds != null &&
    body.serviceIds !== '' &&
    !(Array.isArray(body.serviceIds) && body.serviceIds.length === 0)
  if (!hasServiceId && !hasServiceIds) {
    return NextResponse.json({ error: 'Invalid serviceId' }, { status: 400 })
  }
  if (
    hasServiceId &&
    typeof body.serviceId !== 'number' &&
    typeof body.serviceId !== 'string'
  ) {
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

  const resolved = resolveBookingServices({
    serviceId: hasServiceId ? body.serviceId : undefined,
    serviceIds: hasServiceIds ? body.serviceIds : undefined,
  })
  if (resolved.error) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status })
  }
  const services = resolved.services
  const service = services[0]

  /* Add-ons only apply to a single primary (whitelist). Multi-select already
     carries every menu item as a full service — do not double-count. */
  const addonIds = services.length === 1 ? parseAddonIdsParam(body.addonIds) : []
  const duration = computeServicesDurationMinutes(services, addonIds)
  const serviceLabel = formatCombinedServiceName(services)
  const categoryLabel = formatCombinedCategory(services)
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

  /* Idempotency. The client times out at 25s; if the write succeeded but the
     response was lost, a retry would otherwise create a second Confirmed row.
     A matching recent booking for the same slot + phone + service is the same
     visit — return it instead of appending again.
     Do NOT mint a fresh cancelToken here: Origin can be absent (curl), so
     anyone who knows phone + slot + service could otherwise cancel the visit.
     The original response (or durable storage) already holds the token.
     Compare phone and service leniently so a retry with differently formatted
     digits (+92… vs 03…) or reordered multi-service labels still dedupes. */
  const dupWindowMs = 15 * 60 * 1000
  /* Canonical national number: strip formatting, drop leading 0, and fold the
     +92 country code in — 03… and +92 3… are the same phone. */
  const digits = (p) => {
    let d = String(p || '').replace(/\D/g, '')
    if (d.startsWith('92') && d.length === 12) d = d.slice(2)
    if (d.startsWith('0')) d = d.slice(1)
    return d
  }
  const stableLabel = (label) =>
    String(label || '')
      .split(/\s+\+\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .sort()
      .join(' + ')
  /* The name is part of the key. Without it, a mother booking threading at
     15:00 and then booking the same slot for her daughter on the same phone
     looked like a retry: the second request returned the mother's bookingId,
     never wrote a row, and the daughter was turned away at the door — while
     MAX_WORKERS is 2 and the slot genuinely had room. A retry repeats the same
     name; a second guest does not. Normalised for case and spacing so
     "ayesha  khan" and "Ayesha Khan" still dedupe as one person. */
  const stableName = (n) => String(n || '').trim().replace(/\s+/g, ' ').toLowerCase()

  const myPhone = digits(clientPhone)
  const myLabel = stableLabel(serviceLabel)
  const myName = stableName(clientName)
  const duplicate = bookings.find(
    (b) =>
      b.status === 'Confirmed' &&
      b.timeSlot === time &&
      digits(b.clientPhone) === myPhone &&
      stableLabel(b.service) === myLabel &&
      stableName(b.clientName) === myName &&
      b.bookedAt &&
      Date.now() - Date.parse(b.bookedAt) < dupWindowMs,
  )
  if (duplicate) {
    /* Race loser whose cancel-write failed stays Confirmed over capacity.
       A blind 200 here would promote that overbook; refuse instead. */
    if (shouldCancelSelf(bookings, duplicate)) {
      return NextResponse.json(
        { error: 'This slot was just booked by someone else. Please choose a different time.' },
        { status: 409 },
      )
    }
    /* Report the duplicate's OWN duration/endTime/service, not the retry's —
       a retry that truncated the basket would otherwise echo wrong numbers. */
    const dupDuration = Number(duplicate.duration) || duration
    return NextResponse.json({
      success: true,
      booking: {
        id: duplicate.bookingId,
        date,
        time,
        endTime: duplicate.endTime || addMinutes(time, dupDuration),
        service: duplicate.service || serviceLabel,
        duration: dupDuration,
        /* Echo the name the client submitted — never the sheet's. The sheet
           value is PII the retry already knows, and leaking it on an
           unauthenticated phone+slot match is unnecessary. */
        clientName,
        cancelToken: null,
      },
    })
  }

  /* Station capacity is always MAX_WORKERS for pre-check, slots, and the race
     tiebreak. getBookingMaxWorkers may be ≤ that (exclusive services); never
     above — otherwise bridal could pass pre-check at "3" then lose to
     shouldCancelSelf (cap 2) after writing. */
  const maxWorkers = Math.min(getBookingMaxWorkers(services), MAX_WORKERS)
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
      service: serviceLabel,
      category: categoryLabel,
      duration,
      status: 'Confirmed',
      bookedAt: new Date().toISOString(),
      notes,
      source,
    })
  } catch (err) {
    logger.error('/api/book', 'sheets-write-failed', {
      ip: hashIp(ip),
      date,
      serviceId: service.id,
      serviceCount: services.length,
      ...errCtx(err),
    })
    return NextResponse.json(
      { error: 'Failed to save your booking. Please try again or contact the salon.' },
      { status: 502 }
    )
  }

  try {
    /* Re-read INCLUDING our own row, then resolve contention deterministically:
       earliest row wins, later racers cancel themselves. The old
       exclude-our-own check made two simultaneous bookings on the last free
       station cancel EACH OTHER — the slot ended up empty and both got 409.
       Earliest-wins guarantees exactly one survivor when capacity is genuinely
       exhausted. A verify-read failure stays optimistic: the write already
       landed, so the booking is treated as successful. */
    const freshBookings = await getSheetRows(date)
    const self = freshBookings.find((b) => b.bookingId === bookingId)
    /* shouldCancelSelf decides alone. It was gated behind !canFitAtIndex, and
       the two disagree about footprint: buildOccupiedCounts and
       shouldCancelSelf both apply a +/- BUFFER_MIN envelope, canFitAtIndex does
       not. So for any overbook landing on a buffer slot, canFitAtIndex still
       reported "fits", the && short-circuited, and shouldCancelSelf — which
       correctly returned true — was never asked. The guard added to catch races
       could not fire for that whole class. shouldCancelSelf already walks every
       slot self occupies against the shared cap, so it is the complete check;
       the precondition only ever subtracted from it. */
    if (shouldCancelSelf(freshBookings, self)) {
      try {
        const rolledBack = await updateBookingStatus(bookingId, 'Cancelled')
        if (!rolledBack) {
          /* Silent no-op: no row was written, so the overbook is still
             Confirmed. Same consequence as a throw — never report success. */
          logger.error('/api/book', 'race-rollback-noop', { ip: hashIp(ip), bookingId, date })
          return NextResponse.json(
            { error: 'Failed to save your booking. Please try again or contact the salon.' },
            { status: 502 },
          )
        }
      } catch (rollbackErr) {
        /* We have to cancel to keep capacity honest, and the cancel write
           failed. Do NOT report success — the row would stay Confirmed and
           overbook. Surface a retryable error; a later idempotent retry that
           still sees this over-capacity row will 409 via shouldCancelSelf. */
        logger.error('/api/book', 'race-rollback-failed', {
          ip: hashIp(ip),
          bookingId,
          date,
          ...errCtx(rollbackErr),
        })
        return NextResponse.json(
          { error: 'Failed to save your booking. Please try again or contact the salon.' },
          { status: 502 }
        )
      }
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
      service: serviceLabel,
      duration,
      clientName,
      cancelToken,
    },
  })
}
