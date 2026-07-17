import { describe, it, expect } from 'vitest'
import {
  FILTERED_SLOTS,
  MAX_WORKERS,
  BUFFER_MIN,
  slotIndex,
  addMinutes,
  buildOccupiedCounts,
  salonNow,
  isSlotInPast,
  slotsNeededForDuration,
  canFitAtIndex,
} from './booking-slots.js'

describe('FILTERED_SLOTS', () => {
  it('starts at 11:00 and ends at 18:30', () => {
    expect(FILTERED_SLOTS[0]).toBe('11:00')
    expect(FILTERED_SLOTS[FILTERED_SLOTS.length - 1]).toBe('18:30')
  })

  it('has 16 half-hour slots (11:00 through 18:30)', () => {
    expect(FILTERED_SLOTS.length).toBe(16)
  })

  it('contains only HH:00 and HH:30 times', () => {
    for (const slot of FILTERED_SLOTS) {
      expect(slot).toMatch(/^(1[1-8]):(00|30)$/)
    }
  })
})

describe('slotIndex', () => {
  it('returns correct index for valid times', () => {
    expect(slotIndex('11:00')).toBe(0)
    expect(slotIndex('11:30')).toBe(1)
    expect(slotIndex('18:30')).toBe(15)
  })

  it('returns -1 for times outside grid', () => {
    expect(slotIndex('10:00')).toBe(-1)
    expect(slotIndex('19:00')).toBe(-1)
    expect(slotIndex('11:15')).toBe(-1)
  })
})

describe('addMinutes', () => {
  it('adds minutes correctly within same hour', () => {
    expect(addMinutes('11:00', 30)).toBe('11:30')
  })

  it('rolls over hour', () => {
    expect(addMinutes('11:30', 30)).toBe('12:00')
    expect(addMinutes('11:30', 60)).toBe('12:30')
  })

  it('handles long durations', () => {
    expect(addMinutes('11:00', 90)).toBe('12:30')
    expect(addMinutes('11:00', 120)).toBe('13:00')
  })
})

describe('slotsNeededForDuration', () => {
  it('rounds up to nearest half hour', () => {
    expect(slotsNeededForDuration(30)).toBe(1)
    expect(slotsNeededForDuration(45)).toBe(2)
    expect(slotsNeededForDuration(60)).toBe(2)
    expect(slotsNeededForDuration(90)).toBe(3)
    expect(slotsNeededForDuration(120)).toBe(4)
  })

  it('defaults to 1 slot for missing duration', () => {
    expect(slotsNeededForDuration(undefined)).toBe(1)
    expect(slotsNeededForDuration(0)).toBe(1)
  })
})

describe('buildOccupiedCounts', () => {
  it('returns zero occupancy for empty bookings', () => {
    const counts = buildOccupiedCounts([])
    expect(counts.every(c => c === 0)).toBe(true)
    expect(counts.length).toBe(FILTERED_SLOTS.length)
  })

  it('skips cancelled bookings', () => {
    const counts = buildOccupiedCounts([
      { status: 'Cancelled', timeSlot: '11:00', duration: 30, endTime: '11:30' },
    ])
    expect(counts.every(c => c === 0)).toBe(true)
  })

  it('marks 30-min booking + buffer correctly', () => {
    // Booking at 12:00 for 30 min, BUFFER_MIN=15 each side
    // Effective: 11:45–12:45 → marks 11:30 (overlaps 11:45-12:00) and 12:00 (overlaps 12:00-12:30) and 12:30 (overlaps 12:30-12:45)
    const counts = buildOccupiedCounts([
      { status: 'Confirmed', timeSlot: '12:00', duration: 30, endTime: '12:30' },
    ])
    expect(counts[slotIndex('11:30')]).toBe(1)
    expect(counts[slotIndex('12:00')]).toBe(1)
    expect(counts[slotIndex('12:30')]).toBe(1)
    expect(counts[slotIndex('13:00')]).toBe(0)
  })

  it('accumulates two concurrent bookings', () => {
    const counts = buildOccupiedCounts([
      { status: 'Confirmed', timeSlot: '12:00', duration: 30, endTime: '12:30' },
      { status: 'Confirmed', timeSlot: '12:00', duration: 30, endTime: '12:30' },
    ])
    expect(counts[slotIndex('12:00')]).toBe(2)
  })

  it('handles multi-slot booking (60 min) with buffer', () => {
    const counts = buildOccupiedCounts([
      { status: 'Confirmed', timeSlot: '12:00', duration: 60, endTime: '13:00' },
    ])
    // Effective: 11:45–13:15
    expect(counts[slotIndex('11:30')]).toBe(1)
    expect(counts[slotIndex('12:00')]).toBe(1)
    expect(counts[slotIndex('12:30')]).toBe(1)
    expect(counts[slotIndex('13:00')]).toBe(1)
    expect(counts[slotIndex('13:30')]).toBe(0)
  })
})

describe('canFitAtIndex', () => {
  const empty = new Array(FILTERED_SLOTS.length).fill(0)
  const full = new Array(FILTERED_SLOTS.length).fill(MAX_WORKERS)

  it('returns false for invalid index', () => {
    expect(canFitAtIndex(empty, -1, 1)).toBe(false)
  })

  it('returns true on empty grid', () => {
    expect(canFitAtIndex(empty, 0, 1)).toBe(true)
    expect(canFitAtIndex(empty, 5, 2)).toBe(true)
  })

  it('returns false when capacity reached', () => {
    expect(canFitAtIndex(full, 0, 1)).toBe(false)
  })

  it('returns false when booking would overflow end of day', () => {
    // Booking needs 2 slots starting at last slot index = overflow
    expect(canFitAtIndex(empty, FILTERED_SLOTS.length - 1, 2)).toBe(false)
  })

  it('partial occupancy still allows one more', () => {
    const partial = [...empty]
    partial[0] = 1 // 1 worker used, 1 free
    expect(canFitAtIndex(partial, 0, 1)).toBe(true)
  })

  it('respects per-service maxWorkers override', () => {
    const partial = [...empty]
    partial[0] = 2
    expect(canFitAtIndex(partial, 0, 1, 2)).toBe(false)
    expect(canFitAtIndex(partial, 0, 1, 3)).toBe(true)
  })
})

describe('constants', () => {
  it('BUFFER_MIN is a positive integer', () => {
    expect(BUFFER_MIN).toBeGreaterThan(0)
    expect(Number.isInteger(BUFFER_MIN)).toBe(true)
  })

  it('MAX_WORKERS is at least 1', () => {
    expect(MAX_WORKERS).toBeGreaterThanOrEqual(1)
  })
})

describe('isSlotInPast (salon timezone = Asia/Karachi, UTC+5)', () => {
  // 2026-07-15 06:00 UTC == 11:00 PKT
  const ref = new Date('2026-07-15T06:00:00Z')

  it('reports salon-local now correctly from a UTC instant', () => {
    expect(salonNow(ref)).toEqual({ date: '2026-07-15', minutes: 11 * 60 })
  })

  it('future dates are never past', () => {
    expect(isSlotInPast('2026-07-16', '11:00', ref)).toBe(false)
  })

  it('earlier dates are always past', () => {
    expect(isSlotInPast('2026-07-14', '18:30', ref)).toBe(true)
  })

  it('today: an earlier time is past (the live-QA bug: 11:00 booked at 11:18)', () => {
    const late = new Date('2026-07-15T06:18:00Z') // 11:18 PKT
    expect(isSlotInPast('2026-07-15', '11:00', late)).toBe(true)
  })

  it('today: a slot inside the lead window is blocked', () => {
    // 11:15 PKT slot at 11:00 PKT now, lead 30 min -> blocked
    expect(isSlotInPast('2026-07-15', '11:15', ref)).toBe(true)
  })

  it('today: a slot beyond the lead window is bookable', () => {
    expect(isSlotInPast('2026-07-15', '11:30', ref)).toBe(false)
    expect(isSlotInPast('2026-07-15', '18:30', ref)).toBe(false)
  })

  it('UTC evening maps to next PKT day (Vercel server clock)', () => {
    // 2026-07-15 22:00 UTC == 2026-07-16 03:00 PKT: all of the 15th is past
    const utcEvening = new Date('2026-07-15T22:00:00Z')
    expect(isSlotInPast('2026-07-15', '18:30', utcEvening)).toBe(true)
    expect(isSlotInPast('2026-07-16', '11:00', utcEvening)).toBe(false)
  })

  it('malformed time is treated as past (fail closed)', () => {
    expect(isSlotInPast('2026-07-15', 'garbage', ref)).toBe(true)
  })
})
