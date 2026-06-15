import { describe, it, expect } from 'vitest'
import { isSunday, isDateBlocked, getBlockedReason, BLOCKED_DATES } from './blocked-dates.js'

describe('isSunday', () => {
  it('detects Sundays', () => {
    // 2026-05-17 is a Sunday
    expect(isSunday('2026-05-17')).toBe(true)
    expect(isSunday('2026-05-24')).toBe(true)
  })

  it('returns false for non-Sundays', () => {
    expect(isSunday('2026-05-18')).toBe(false) // Mon
    expect(isSunday('2026-05-19')).toBe(false) // Tue
    expect(isSunday('2026-05-23')).toBe(false) // Sat
  })
})

describe('isDateBlocked', () => {
  it('blocks Sundays automatically', () => {
    expect(isDateBlocked('2026-05-17')).toBe(true)
  })

  it('allows weekdays (when not in BLOCKED_DATES)', () => {
    expect(isDateBlocked('2026-05-18')).toBe(false)
    expect(isDateBlocked('2026-05-19')).toBe(false)
  })

  it('handles missing input', () => {
    expect(isDateBlocked('')).toBe(false)
    expect(isDateBlocked(null)).toBe(false)
    expect(isDateBlocked(undefined)).toBe(false)
  })
})

describe('getBlockedReason', () => {
  it('returns Sunday reason for Sundays', () => {
    expect(getBlockedReason('2026-05-17')).toMatch(/Sunday/i)
  })

  it('returns null for unblocked dates', () => {
    expect(getBlockedReason('2026-05-18')).toBe(null)
  })

  it('returns null for missing input', () => {
    expect(getBlockedReason('')).toBe(null)
    expect(getBlockedReason(null)).toBe(null)
  })
})

describe('BLOCKED_DATES', () => {
  it('is an object that can be safely iterated', () => {
    expect(typeof BLOCKED_DATES).toBe('object')
    expect(BLOCKED_DATES).not.toBeNull()
  })
})
