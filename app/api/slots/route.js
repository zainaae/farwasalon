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
import { isDateBlocked, getBlockedReason } from '../../../lib/blocked-dates.js'

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

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const reqDate = new Date(date + 'T00:00:00')
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + 14)

  if (reqDate < today || reqDate > maxDate) {
    return NextResponse.json({ error: 'Date must be today or within the next 14 days' }, { status: 400 })
  }

  if (isDateBlocked(date)) {
    return NextResponse.json({ slots: [], closed: true, reason: getBlockedReason(date) })
  }

  if (!isConfigured()) {
    console.error('[slots] Google Sheets credentials not configured')
    return NextResponse.json(
      { error: 'Booking system is not configured.' },
      { status: 503 }
    )
  }

  let bookings = []
  try {
    bookings = await getSheetRows(date)
  } catch (err) {
    console.error('[slots] Google Sheets fetch failed:', err?.message || err)
    return NextResponse.json(
      { error: 'Unable to load availability. Please try again.' },
      { status: 502 }
    )
  }

  const occupied = buildOccupiedCounts(bookings)

  let serviceDuration = 30
  let maxWorkers = MAX_WORKERS
  if (serviceIdParam) {
    const svc = ALL_SERVICES.find(s => s.id === parseInt(serviceIdParam, 10))
    if (svc?.durationMinutes) serviceDuration = svc.durationMinutes
    if (svc) maxWorkers = getServiceMaxWorkers(svc)
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
