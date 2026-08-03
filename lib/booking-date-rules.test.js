import { describe, it, expect } from 'vitest'
import { validateBookingDate, validateTimeInGrid, dayLabel, BOOKING_WINDOW_DAYS } from './booking-date-rules.js'

// Anchor "today" for deterministic tests. 2026-05-19 is a Tuesday.
const TODAY = new Date('2026-05-19T08:00:00') // local Karachi-ish morning

describe('validateBookingDate — format', () => {
  it('rejects empty / null / undefined', () => {
    expect(validateBookingDate('', TODAY).ok).toBe(false)
    expect(validateBookingDate(null, TODAY).ok).toBe(false)
    expect(validateBookingDate(undefined, TODAY).ok).toBe(false)
  })

  it('rejects malformed strings', () => {
    expect(validateBookingDate('not-a-date', TODAY).code).toBe('invalid_format')
    expect(validateBookingDate('2026/05/20', TODAY).code).toBe('invalid_format')
    expect(validateBookingDate('26-05-20', TODAY).code).toBe('invalid_format')
    expect(validateBookingDate('2026-5-20', TODAY).code).toBe('invalid_format')
  })

  it('rejects impossible dates instead of silently rolling them forward', () => {
    // 2026-02-30 does not exist. The old code let JS coerce it to 2026-03-02
    // and book a visit that never could be. It must be invalid_format now.
    const r = validateBookingDate('2026-02-30', TODAY)
    expect(r.ok).toBe(false)
    expect(r.code).toBe('invalid_format')
    expect(validateBookingDate('2026-13-01', TODAY).code).toBe('invalid_format')
    expect(validateBookingDate('2026-00-10', TODAY).code).toBe('invalid_format')
  })
})

describe('validateBookingDate — boundaries', () => {
  it('accepts today (today is Tuesday 2026-05-19)', () => {
    const r = validateBookingDate('2026-05-19', TODAY)
    expect(r.ok).toBe(true)
    expect(r.dayOfWeek).toBe(2) // Tue
  })

  it('rejects yesterday', () => {
    const r = validateBookingDate('2026-05-18', TODAY)
    expect(r.ok).toBe(false)
    expect(r.code).toBe('past')
  })

  it('accepts exactly +14 days', () => {
    const r = validateBookingDate('2026-06-02', TODAY)
    expect(r.ok).toBe(true)
  })

  it('rejects +15 days as too_far', () => {
    const r = validateBookingDate('2026-06-03', TODAY)
    expect(r.ok).toBe(false)
    expect(r.code).toBe('too_far')
  })

  it('BOOKING_WINDOW_DAYS is 14', () => {
    expect(BOOKING_WINDOW_DAYS).toBe(14)
  })
})

describe('validateBookingDate — Sunday auto-block', () => {
  it('blocks Sunday inside the window', () => {
    // 2026-05-24 is a Sunday
    const r = validateBookingDate('2026-05-24', TODAY)
    expect(r.ok).toBe(false)
    expect(r.code).toBe('closed')
    expect(r.closed).toBe(true)
    expect(r.message).toMatch(/sunday/i)
  })

  it('allows Saturday and Monday', () => {
    // Sat 2026-05-23
    expect(validateBookingDate('2026-05-23', TODAY).ok).toBe(true)
    // Mon 2026-05-25
    expect(validateBookingDate('2026-05-25', TODAY).ok).toBe(true)
  })
})

describe('validateTimeInGrid', () => {
  it('accepts canonical slots', () => {
    expect(validateTimeInGrid('11:00').ok).toBe(true)
    expect(validateTimeInGrid('11:30').ok).toBe(true)
    expect(validateTimeInGrid('18:30').ok).toBe(true)
  })

  it('rejects times outside the grid', () => {
    expect(validateTimeInGrid('10:30').ok).toBe(false)
    expect(validateTimeInGrid('19:00').ok).toBe(false)
    expect(validateTimeInGrid('11:15').ok).toBe(false)
    expect(validateTimeInGrid('11:45').ok).toBe(false)
  })

  it('rejects bad formats', () => {
    expect(validateTimeInGrid('').ok).toBe(false)
    expect(validateTimeInGrid('11:0').ok).toBe(false)
    expect(validateTimeInGrid('aa:bb').ok).toBe(false)
    expect(validateTimeInGrid(null).ok).toBe(false)
  })
})

describe('dayLabel', () => {
  it('returns short weekday name', () => {
    expect(dayLabel('2026-05-17')).toBe('Sun')
    expect(dayLabel('2026-05-18')).toBe('Mon')
    expect(dayLabel('2026-05-19')).toBe('Tue')
    expect(dayLabel('2026-05-23')).toBe('Sat')
  })
})
