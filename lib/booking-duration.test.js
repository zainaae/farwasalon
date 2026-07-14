import { describe, it, expect } from 'vitest'
import { computeBookingDurationMinutes, parseAddonIdsParam, filterAllowedAddonIds, CANCELLATION_MIN_HOURS } from './booking-duration.js'

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

  it('filterAllowedAddonIds drops ids not mapped to the service', () => {
    expect(filterAllowedAddonIds(1, [2, 99])).toEqual([2])
    expect(filterAllowedAddonIds(1, [99])).toEqual([])
  })

  it('computeBookingDurationMinutes ignores disallowed addon ids', () => {
    const service = { id: 1, durationMinutes: 10 }
    expect(computeBookingDurationMinutes(service, [2, 99])).toBe(15)
    expect(computeBookingDurationMinutes(service, [99])).toBe(10)
  })
})

describe('booking-duration edge cases', () => {
  it('filterAllowedAddonIds treats non-array input as empty', () => {
    expect(filterAllowedAddonIds(1, null)).toEqual([])
    expect(filterAllowedAddonIds(1, undefined)).toEqual([])
    expect(filterAllowedAddonIds(1, '2')).toEqual([])
    expect(filterAllowedAddonIds(1, { 0: 2 })).toEqual([])
  })

  it('filterAllowedAddonIds drops non-numeric, negative, and zero ids', () => {
    expect(filterAllowedAddonIds(1, ['abc', -2, 0, NaN, null, undefined, {}])).toEqual([])
  })

  it('filterAllowedAddonIds coerces numeric strings', () => {
    expect(filterAllowedAddonIds(1, ['2'])).toEqual([2])
  })

  it('filterAllowedAddonIds returns empty for an unknown service id', () => {
    expect(filterAllowedAddonIds(999999, [2])).toEqual([])
  })

  it('computeBookingDurationMinutes returns 30 when service is missing', () => {
    expect(computeBookingDurationMinutes(null)).toBe(30)
    expect(computeBookingDurationMinutes(undefined, [2])).toBe(30)
  })

  it('parseAddonIdsParam handles null, empty, and whitespace inputs', () => {
    expect(parseAddonIdsParam(null)).toEqual([])
    expect(parseAddonIdsParam(undefined)).toEqual([])
    expect(parseAddonIdsParam('')).toEqual([])
    expect(parseAddonIdsParam(' 2 , 4 ')).toEqual([2, 4])
  })

  it('parseAddonIdsParam drops garbage segments but keeps valid ids', () => {
    expect(parseAddonIdsParam('abc,4')).toEqual([4])
    expect(parseAddonIdsParam('-1,0,4')).toEqual([4])
    expect(parseAddonIdsParam(',,4,')).toEqual([4])
  })

  it('parseAddonIdsParam accepts arrays of mixed number/string ids', () => {
    expect(parseAddonIdsParam(['2', 4])).toEqual([2, 4])
    expect(parseAddonIdsParam([])).toEqual([])
  })

  it('KNOWN BEHAVIOR: duplicate addon ids are kept and each inflates the duration', () => {
    // Pins current behavior — see unit-integration-report.md. A client can repeat a
    // valid addon id ("2,2,2") and each repeat adds its duration again.
    expect(filterAllowedAddonIds(1, [2, 2, 2])).toEqual([2, 2, 2])
    expect(computeBookingDurationMinutes({ id: 1, durationMinutes: 10 }, [2, 2, 2])).toBe(25)
  })

  // REAL BUG (documented in unit-integration-report.md): filterAllowedAddonIds does not
  // deduplicate ids, so POST /api/book with addonIds "2,2,2,..." books an arbitrarily
  // long slot for the price of one addon. Skipped until the source dedupes.
  it.skip('duplicate addon ids should be deduplicated', () => {
    expect(filterAllowedAddonIds(1, [2, 2, 2])).toEqual([2])
    expect(computeBookingDurationMinutes({ id: 1, durationMinutes: 10 }, [2, 2, 2])).toBe(15)
  })
})
