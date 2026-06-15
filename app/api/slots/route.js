import { NextResponse } from 'next/server'
import { getSheetRows, isConfigured } from '../../../lib/google-sheets.js'
import { ALL_SERVICES, getServiceMaxWorkers } from '../../../src/data.js'
import { checkRateLimit } from '../../../lib/rate-limit.js'
import {
  FILTERED_SLOTS,
  MAX_WORKERS,
  buildOccupiedCounts,
  slotsNeededForDuration,
} from '../../../lib/booking-slots.js'
import { validateBookingDate } from '../../../lib/booking-date-rules.js'
import { computeBookingDurationMinutes, parseAddonIdsParam } from '../../../lib/booking-duration.js'
import { logger, hashIp, errCtx } from '../../../lib/logger.js'

export async function GET(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rl = checkRateLimit(ip, { window: 60, max: 30 })
  if (rl.limited) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    )
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const serviceIdParam = searchParams.get('serviceId')
  const addonIdsParam = searchParams.get('addonIds')

  if (!date) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
  }

  const dateCheck = validateBookingDate(date)
  if (!dateCheck.ok) {
    if (dateCheck.closed) {
      return NextResponse.json({ slots: [], closed: true, reason: dateCheck.message })
    }
    return NextResponse.json({ error: dateCheck.message }, { status: 400 })
  }

  if (!isConfigured()) {
    logger.error('/api/slots', 'sheets-not-configured', { ip: hashIp(ip) })
    return NextResponse.json(
      { error: 'Booking system is not configured.' },
      { status: 503 }
    )
  }

  let bookings = []
  try {
    bookings = await getSheetRows(date)
  } catch (err) {
    logger.error('/api/slots', 'sheets-fetch-failed', { ip: hashIp(ip), date, ...errCtx(err) })
    return NextResponse.json(
      { error: 'Unable to load availability. Please try again.' },
      { status: 502 }
    )
  }

  const occupied = buildOccupiedCounts(bookings)

  let serviceDuration = 30
  let maxWorkers = MAX_WORKERS
  const addonIds = parseAddonIdsParam(addonIdsParam)
  if (serviceIdParam) {
    const svc = ALL_SERVICES.find(s => s.id === parseInt(serviceIdParam, 10))
    if (svc) {
      serviceDuration = computeBookingDurationMinutes(svc, addonIds)
      maxWorkers = getServiceMaxWorkers(svc)
    }
  }

  const slotsNeeded = slotsNeededForDuration(serviceDuration)

  const slots = FILTERED_SLOTS.map((time, idx) => {
    let available = occupied[idx] < maxWorkers
    if (available && slotsNeeded > 1) {
      for (let j = 1; j < slotsNeeded; j++) {
        if (idx + j >= FILTERED_SLOTS.length || occupied[idx + j] >= maxWorkers) {
          available = false
          break
        }
      }
    }
    return { time, available }
  })

  return NextResponse.json({ slots })
}
