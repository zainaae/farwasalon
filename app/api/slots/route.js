import { NextResponse } from 'next/server'
import { getSheetRows, isConfigured } from '../../../lib/google-sheets.js'
import { checkRateLimit } from '../../../lib/rate-limit.js'
import {
  FILTERED_SLOTS,
  MAX_WORKERS,
  buildOccupiedCounts,
  slotsNeededForDuration,
  isSlotInPast,
} from '../../../lib/booking-slots.js'
import { validateBookingDate } from '../../../lib/booking-date-rules.js'
import {
  computeServicesDurationMinutes,
  getBookingMaxWorkers,
  parseAddonIdsParam,
  resolveBookingServices,
} from '../../../lib/booking-duration.js'
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
  const serviceIdsParam = searchParams.get('serviceIds')
  const addonIdsParam = searchParams.get('addonIds')

  if (!date) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
  }

  const dateCheck = validateBookingDate(date)
  if (!dateCheck.ok) {
    if (dateCheck.closed) {
      return NextResponse.json(
        { slots: [], closed: true, reason: dateCheck.message },
        {
          headers: {
            // Closed-day answers are stable; CDN can hold them briefly.
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        },
      )
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
  const resolved = resolveBookingServices({
    serviceId: serviceIdParam || undefined,
    serviceIds: serviceIdsParam || undefined,
  })
  if (resolved.services?.length) {
    const addonIds =
      resolved.services.length === 1 ? parseAddonIdsParam(addonIdsParam) : []
    serviceDuration = computeServicesDurationMinutes(resolved.services, addonIds)
    maxWorkers = getBookingMaxWorkers(resolved.services)
  }

  const slotsNeeded = slotsNeededForDuration(serviceDuration)

  const slots = FILTERED_SLOTS.map((time, idx) => {
    let available = occupied[idx] < maxWorkers && !isSlotInPast(date, time)
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

  // Edge cache collapses concurrent date polls (services widget + book UI).
  // Book writes invalidate the in-process Sheets cache; 15s CDN staleness is acceptable.
  return NextResponse.json(
    { slots },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=45',
      },
    },
  )
}
