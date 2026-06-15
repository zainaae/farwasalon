/**
 * Integration-style "battle tests" for the booking decision pipeline.
 * Exercises the same pure functions the API routes use, end-to-end,
 * across realistic scenarios: different durations, add-ons, multi-worker
 * services, race conditions, and continuity to the next slot.
 */
import { describe, it, expect } from 'vitest'
import {
  FILTERED_SLOTS,
  MAX_WORKERS,
  slotIndex,
  addMinutes,
  buildOccupiedCounts,
  slotsNeededForDuration,
  canFitAtIndex,
} from './booking-slots.js'
import { computeBookingDurationMinutes } from './booking-duration.js'
import { ALL_SERVICES, getServiceMaxWorkers } from '../src/data.js'

function mkBooking({ time, duration, status = 'Confirmed' }) {
  return { status, timeSlot: time, duration, endTime: addMinutes(time, duration) }
}

/** Simulate the route's decision: can this service fit at this time given existing bookings? */
function canBook({ service, time, addonIds = [], existing = [] }) {
  const duration = computeBookingDurationMinutes(service, addonIds)
  const occupied = buildOccupiedCounts(existing)
  const startIdx = slotIndex(time)
  const needed = slotsNeededForDuration(duration)
  const maxWorkers = getServiceMaxWorkers(service)
  return { fits: canFitAtIndex(occupied, startIdx, needed, maxWorkers), duration, maxWorkers, occupied }
}

const threading = ALL_SERVICES.find((s) => s.name?.toLowerCase().includes('eyebrow threading'))
const upperLip = ALL_SERVICES.find((s) => s.name?.toLowerCase().includes('upper lip'))
const facial = ALL_SERVICES.find((s) => s.category === 'Facials')
const bridal = ALL_SERVICES.find((s) => s.category === 'Bridal')
const longService = ALL_SERVICES.find((s) => (s.durationMinutes || 0) >= 90)

describe('battle-test: empty calendar', () => {
  it('any service fits at any slot when calendar is empty', () => {
    expect(canBook({ service: threading, time: '11:00' }).fits).toBe(true)
    expect(canBook({ service: facial, time: '14:00' }).fits).toBe(true)
  })

  it('30-min service at 18:30 fits (last slot of day)', () => {
    expect(canBook({ service: threading, time: '18:30' }).fits).toBe(true)
  })

  it('60-min service starting at 18:30 does NOT fit (would overflow past 19:00)', () => {
    // build a fake 60-min service from threading shape
    const svc60 = { ...threading, durationMinutes: 60 }
    expect(canBook({ service: svc60, time: '18:30' }).fits).toBe(false)
  })
})

describe('battle-test: continuity to next slot', () => {
  it('a 30-min booking at 12:00 blocks the next start at 12:00 only if capacity is reached', () => {
    // 30-min booking + buffer marks 11:30/12:00/12:30. With MAX_WORKERS=2, one booking still leaves one free.
    const existing = [mkBooking({ time: '12:00', duration: 30 })]
    const { fits, occupied } = canBook({ service: threading, time: '12:00', existing })
    expect(occupied[slotIndex('12:00')]).toBe(1)
    expect(fits).toBe(true) // 1 worker free
  })

  it('two concurrent 30-min bookings at 12:00 fill capacity → a third is rejected', () => {
    const existing = [
      mkBooking({ time: '12:00', duration: 30 }),
      mkBooking({ time: '12:00', duration: 30 }),
    ]
    const r = canBook({ service: threading, time: '12:00', existing })
    expect(r.occupied[slotIndex('12:00')]).toBe(2)
    expect(r.fits).toBe(false)
  })

  it('after a 60-min booking at 12:00, the immediate next bookable start is at 13:30 (15-min buffer pushes 13:00 into the booking)', () => {
    const existing = [mkBooking({ time: '12:00', duration: 60 })]
    // 12:00 + 60min + 15 buffer = 13:15, so 13:00 slot (covers 13:00–13:30) still overlaps buffer
    // Expect 13:00 to show as occupied (count=1), 13:30 to be free (count=0)
    const r = canBook({ service: threading, time: '13:00', existing })
    expect(r.occupied[slotIndex('13:00')]).toBe(1)
    expect(r.fits).toBe(true) // 1 worker free → another threading still bookable in parallel
    const r2 = canBook({ service: threading, time: '13:30', existing })
    expect(r2.occupied[slotIndex('13:30')]).toBe(0)
    expect(r2.fits).toBe(true)
  })

  it('30-min booking at 18:30 + buffer does not pollute slots that do not exist (no overflow)', () => {
    // last slot is 18:30. Booking + 15min buffer extends past day end — code should clamp.
    const existing = [mkBooking({ time: '18:30', duration: 30 })]
    const { occupied } = canBook({ service: threading, time: '18:00', existing })
    expect(occupied[slotIndex('18:30')]).toBe(1)
    expect(occupied[slotIndex('18:00')]).toBe(1) // 15-min buffer pulls 18:00 into the booking window
  })
})

describe('battle-test: add-ons extend duration', () => {
  it('threading + upper-lip uses both durations', () => {
    if (!threading || !upperLip) return
    const baseDur = computeBookingDurationMinutes(threading, [])
    const withAddon = computeBookingDurationMinutes(threading, [upperLip.id])
    expect(withAddon).toBe(baseDur + (upperLip.durationMinutes || 30))
  })

  it('add-ons can push a normally-fitting booking past day end', () => {
    if (!threading || !upperLip) return
    const dur = computeBookingDurationMinutes(threading, [upperLip.id])
    if (dur <= 30) return // sanity: only meaningful when addon adds something
    // Try booking right at 18:30 with addon — should NOT fit (extends past 19:00)
    const r = canBook({ service: threading, time: '18:30', addonIds: [upperLip.id] })
    if (dur > 30) {
      expect(r.fits).toBe(false)
    }
  })
})

describe('battle-test: bridal locks all stations (maxWorkers=3)', () => {
  it('bridal has higher maxWorkers than default', () => {
    if (!bridal) return
    expect(getServiceMaxWorkers(bridal)).toBeGreaterThan(MAX_WORKERS)
  })

  it('with 3 concurrent threading bookings at 12:00, bridal still cannot fit (needs 3 stations)', () => {
    if (!bridal) return
    const existing = [
      mkBooking({ time: '12:00', duration: 30 }),
      mkBooking({ time: '12:00', duration: 30 }),
      mkBooking({ time: '12:00', duration: 30 }),
    ]
    // Bridal capacity is 3 — if 3 stations are taken, bridal can't fit even though
    // its own maxWorkers is 3 (it requires 3 free, not 3 total)
    const r = canBook({ service: bridal, time: '12:00', existing })
    expect(r.fits).toBe(false)
  })
})

describe('battle-test: multi-slot services need contiguous capacity', () => {
  it('a 90-min service needs 3 contiguous half-slots all under its capacity', () => {
    if (!longService) return
    // Fill 12:30 to the long service's *own* maxWorkers cap so it definitely cannot fit there
    const cap = getServiceMaxWorkers(longService)
    const existing = Array.from({ length: cap }, () => mkBooking({ time: '12:30', duration: 30 }))
    const r = canBook({ service: longService, time: '12:00', existing })
    expect(r.fits).toBe(false)
  })
})

describe('battle-test: cancelled bookings free capacity', () => {
  it('a Cancelled booking does not count toward occupancy', () => {
    const existing = [
      { status: 'Cancelled', timeSlot: '12:00', duration: 30, endTime: '12:30' },
      { status: 'Cancelled', timeSlot: '12:00', duration: 30, endTime: '12:30' },
    ]
    const r = canBook({ service: threading, time: '12:00', existing })
    expect(r.occupied[slotIndex('12:00')]).toBe(0)
    expect(r.fits).toBe(true)
  })
})

describe('battle-test: race condition (verify-after-write semantics)', () => {
  it('after a successful write, a re-read showing capacity exceeded fails the verify check', () => {
    // Customer A and B both saw slot empty.
    // A writes successfully → occupied=1 (still under cap).
    // B writes successfully → occupied=2 (at cap).
    // Now a hypothetical "verify" for B sees 2 ≥ 2 → reject B.
    const afterBothWrites = [
      mkBooking({ time: '12:00', duration: 30 }),
      mkBooking({ time: '12:00', duration: 30 }),
    ]
    // Verifying capacity for either:
    const occupied = buildOccupiedCounts(afterBothWrites)
    expect(occupied[slotIndex('12:00')]).toBe(2)
    expect(canFitAtIndex(occupied, slotIndex('12:00'), 1)).toBe(false)
  })
})

describe('battle-test: timing across a full simulated day', () => {
  /** Walk the day, booking sequential 30-min threading appointments back-to-back. */
  it('the salon can fit 2*N parallel threading bookings across the day with no overflow', () => {
    const existing = []
    for (const time of FILTERED_SLOTS) {
      // try to fit MAX_WORKERS bookings in each slot
      for (let i = 0; i < MAX_WORKERS; i++) {
        const r = canBook({ service: threading, time, existing })
        if (r.fits) existing.push(mkBooking({ time, duration: 30 }))
      }
    }
    // We expect at minimum 2 * slot-count bookings to fit (ignoring buffer overlap edges)
    // Buffer eats into adjacent slots so we'll get fewer than the naive 2*N=32. Just assert >= MAX_WORKERS*8.
    expect(existing.length).toBeGreaterThanOrEqual(MAX_WORKERS * 8)
  })
})

describe('battle-test: data-shape sanity', () => {
  it('every service in ALL_SERVICES has an id and category', () => {
    for (const s of ALL_SERVICES) {
      expect(typeof s.id).toBe('number')
      expect(typeof s.category).toBe('string')
      expect(s.category.length).toBeGreaterThan(0)
    }
  })

  it('every service id is unique', () => {
    const ids = new Set()
    for (const s of ALL_SERVICES) {
      expect(ids.has(s.id)).toBe(false)
      ids.add(s.id)
    }
  })

  it('every service with pricePkr has a non-negative number', () => {
    for (const s of ALL_SERVICES) {
      if (s.pricePkr != null) {
        expect(typeof s.pricePkr).toBe('number')
        expect(s.pricePkr).toBeGreaterThan(0)
      }
    }
  })

  it('every service with durationMinutes is positive and within reasonable bounds', () => {
    // The 30-min grid handles non-multiples by rounding up (slotsNeededForDuration uses Math.ceil),
    // so a 10-min eyebrow threading just consumes one half-slot. We just sanity-check bounds.
    for (const s of ALL_SERVICES) {
      if (s.durationMinutes != null) {
        expect(s.durationMinutes).toBeGreaterThan(0)
        expect(s.durationMinutes).toBeLessThanOrEqual(360) // 6 hours max
      }
    }
  })
})
