import { describe, it, expect } from 'vitest'
import { toLocalDateString } from './date-local.js'

describe('toLocalDateString', () => {
  it('formats a local Date to YYYY-MM-DD', () => {
    expect(toLocalDateString(new Date(2026, 6, 15))).toBe('2026-07-15')
  })

  it('pads single-digit month and day', () => {
    expect(toLocalDateString(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(toLocalDateString(new Date(2026, 8, 9))).toBe('2026-09-09')
  })

  it('does not shift date for late-evening local times (unlike toISOString)', () => {
    expect(toLocalDateString(new Date(2026, 6, 15, 23, 59, 59))).toBe('2026-07-15')
  })

  it('does not shift date for just-after-midnight local times', () => {
    expect(toLocalDateString(new Date(2026, 6, 15, 0, 0, 1))).toBe('2026-07-15')
  })

  it('handles month boundaries in local time', () => {
    expect(toLocalDateString(new Date(2026, 6, 31, 23, 30))).toBe('2026-07-31')
    expect(toLocalDateString(new Date(2026, 7, 1, 0, 30))).toBe('2026-08-01')
  })

  it('handles year boundaries in local time', () => {
    expect(toLocalDateString(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31')
    expect(toLocalDateString(new Date(2027, 0, 1, 0, 1))).toBe('2027-01-01')
  })

  it('accepts a local datetime string', () => {
    expect(toLocalDateString('2026-07-15T10:30:00')).toBe('2026-07-15')
  })

  it('accepts a timestamp number', () => {
    const ts = new Date(2026, 6, 15, 12).getTime()
    expect(toLocalDateString(ts)).toBe('2026-07-15')
  })
})
