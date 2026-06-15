import { describe, it, expect } from 'vitest'
import { validateBookingDate, validateTimeInGrid, BOOKING_WINDOW_DAYS } from './booking-date-rules.js'
import { isDateBlocked } from './blocked-dates.js'
import {
  FILTERED_SLOTS,
  buildOccupiedCounts,
  canFitAtIndex,
  slotIndex,
  slotsNeededForDuration,
} from './booking-slots.js'
import { computeBookingDurationMinutes } from './booking-duration.js'
import { ALL_SERVICES } from '../src/data.js'

const REF_MONDAY = new Date('2026-05-18T10:00:00') // Monday

function isoOffset(days, ref = REF_MONDAY) {
  const d = new Date(ref)
  d.setHours(12, 0, 0, 0) // noon avoids DST + UTC-rollback edge cases
  d.setDate(d.getDate() + days)
  // Use local-date components, not toISOString() (which shifts to UTC).
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

describe('validateBookingDate — calendar matrix', () => {
  it('accepts today through +14 days on weekdays', () => {
    for (let i = 0; i <= BOOKING_WINDOW_DAYS; i++) {
      const iso = isoOffset(i)
      if (isDateBlocked(iso)) continue
      const r = validateBookingDate(iso, REF_MONDAY)
      expect(r.ok, `day +${i} ${iso}`).toBe(true)
    }
  })

  it('rejects yesterday', () => {
    const r = validateBookingDate(isoOffset(-1), REF_MONDAY)
    expect(r.ok).toBe(false)
    // From REF_MONDAY, yesterday is Sunday — which the lib catches as 'closed' before 'past'.
    // Either rejection reason is acceptable; we just want the booking refused.
    expect(['past', 'closed']).toContain(r.code)
  })

  it('rejects 2 days ago as past (Saturday is not blocked)', () => {
    const r = validateBookingDate(isoOffset(-2), REF_MONDAY)
    expect(r.ok).toBe(false)
    expect(r.code).toBe('past')
  })

  it('rejects day +15', () => {
    const r = validateBookingDate(isoOffset(15), REF_MONDAY)
    expect(r.ok).toBe(false)
    expect(r.code).toBe('too_far')
  })

  it('rejects Sundays in window', () => {
    // 2026-05-18 Mon → 2026-05-24 Sun
    const sunday = '2026-05-24'
    const r = validateBookingDate(sunday, REF_MONDAY)
    expect(r.ok).toBe(false)
    expect(r.code).toBe('closed')
    expect(r.message).toMatch(/Sunday/i)
  })

  it('accepts Saturday in window', () => {
    const sat = '2026-05-23'
    const r = validateBookingDate(sat, REF_MONDAY)
    expect(r.ok).toBe(true)
  })
})

describe('validateTimeInGrid', () => {
  it('accepts all salon grid times', () => {
    for (const t of FILTERED_SLOTS) {
      expect(validateTimeInGrid(t).ok).toBe(true)
    }
  })

  it('rejects before open and after close', () => {
    expect(validateTimeInGrid('10:00').ok).toBe(false)
    expect(validateTimeInGrid('19:00').ok).toBe(false)
  })
})

describe('occupancy — same day different times', () => {
  const empty = buildOccupiedCounts([])

  it('morning and evening can both fit when empty', () => {
    expect(canFitAtIndex(empty, slotIndex('11:00'), 1)).toBe(true)
    expect(canFitAtIndex(empty, slotIndex('17:30'), 1)).toBe(true)
  })

  it('two bookings at same time fill capacity (max 2 workers)', () => {
    const occupied = buildOccupiedCounts([
      { status: 'Confirmed', timeSlot: '14:00', duration: 30, endTime: '14:30' },
      { status: 'Confirmed', timeSlot: '14:00', duration: 30, endTime: '14:30' },
    ])
    expect(canFitAtIndex(occupied, slotIndex('14:00'), 1)).toBe(false)
  })

  it('cancelled booking frees slot', () => {
    const occupied = buildOccupiedCounts([
      { status: 'Cancelled', timeSlot: '14:00', duration: 30, endTime: '14:30' },
      { status: 'Confirmed', timeSlot: '14:00', duration: 30, endTime: '14:30' },
    ])
    expect(canFitAtIndex(occupied, slotIndex('14:00'), 1)).toBe(true)
  })
})

describe('duration — services and add-ons', () => {
  const eyebrow = ALL_SERVICES.find((s) => s.id === 1)
  const fullFace = ALL_SERVICES.find((s) => s.id === 7)
  const bridal = ALL_SERVICES.find((s) => s.name === 'Bridal Trial')

  it('eyebrow + upper lip addon extends minutes', () => {
    const mins = computeBookingDurationMinutes(eyebrow, [2])
    expect(mins).toBe(15)
    expect(slotsNeededForDuration(mins)).toBe(1)
  })

  it('full face + addons needs multiple slots', () => {
    const mins = computeBookingDurationMinutes(fullFace, [2, 4])
    expect(mins).toBeGreaterThan(30)
    expect(slotsNeededForDuration(mins)).toBeGreaterThan(1)
  })

  it('75-minute booking blocks overlapping slot starts', () => {
    const mins = 75
    expect(slotsNeededForDuration(mins)).toBe(3)
    const occupied = buildOccupiedCounts([
      { status: 'Confirmed', timeSlot: '11:00', duration: mins, endTime: '12:15' },
    ])
    expect(canFitAtIndex(occupied, slotIndex('11:00'), 3, 1)).toBe(false)
    expect(canFitAtIndex(occupied, slotIndex('11:30'), 1, 1)).toBe(false)
    expect(canFitAtIndex(occupied, slotIndex('12:30'), 1, 1)).toBe(true)
  })

  it('long bridal near end of day may not fit', () => {
    if (!bridal?.durationMinutes) return
    const needed = slotsNeededForDuration(bridal.durationMinutes)
    const lastStart = FILTERED_SLOTS.length - needed
    expect(canFitAtIndex(buildOccupiedCounts([]), lastStart, needed, 3)).toBe(
      lastStart >= 0,
    )
    expect(canFitAtIndex(buildOccupiedCounts([]), FILTERED_SLOTS.length - 1, needed)).toBe(false)
  })
})

describe('network / race scenarios (logic only)', () => {
  it('double-book race: second book fails after two confirms at same slot', () => {
    const bookings = [
      { status: 'Confirmed', timeSlot: '12:00', duration: 30, endTime: '12:30' },
      { status: 'Confirmed', timeSlot: '12:00', duration: 30, endTime: '12:30' },
    ]
    const occupied = buildOccupiedCounts(bookings)
    expect(canFitAtIndex(occupied, slotIndex('12:00'), 1)).toBe(false)
  })

  it('buffer blocks adjacent slot after 12:00 booking', () => {
    const occupied = buildOccupiedCounts([
      { status: 'Confirmed', timeSlot: '12:00', duration: 30, endTime: '12:30' },
    ])
    // 11:30 overlaps buffer before 12:00
    expect(occupied[slotIndex('11:30')]).toBeGreaterThan(0)
  })
})
