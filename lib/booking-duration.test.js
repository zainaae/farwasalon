import { describe, it, expect } from 'vitest'
import { computeBookingDurationMinutes, parseAddonIdsParam, CANCELLATION_MIN_HOURS } from './booking-duration.js'

describe('booking-duration', () => {
  it('CANCELLATION_MIN_HOURS is 2', () => {
    expect(CANCELLATION_MIN_HOURS).toBe(2)
  })

  it('sums service and addon durations', () => {
    const service = { id: 1, durationMinutes: 10 }
    expect(computeBookingDurationMinutes(service, [2])).toBe(15) // eyebrow 10 + upper lip 5
  })

  it('defaults service without duration to 30', () => {
    expect(computeBookingDurationMinutes({ id: 99 }, [])).toBe(30)
  })

  it('parseAddonIdsParam from comma string', () => {
    expect(parseAddonIdsParam('2,4')).toEqual([2, 4])
  })
})
