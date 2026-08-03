import { describe, it, expect } from 'vitest'
import {
  computeBookingDurationMinutes,
  computeServicesDurationMinutes,
  computeServicesPricePkr,
  filterAllowedAddonIds,
  formatCombinedCategory,
  formatCombinedServiceName,
  getBookingMaxWorkers,
  MAX_BOOKING_SERVICES,
  parseAddonIdsParam,
  parseServiceIdsParam,
  resolveBookingServices,
  CANCELLATION_MIN_HOURS,
} from './booking-duration.js'
import { ALL_SERVICES } from '../src/data.js'

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

describe('multi-service booking helpers', () => {
  const eyebrow = ALL_SERVICES.find((s) => s.id === 1)
  const upperLip = ALL_SERVICES.find((s) => s.id === 2)
  const facial = ALL_SERVICES.find((s) => s.category === 'Facials' && s.pricePkr)

  it('parseServiceIdsParam mirrors addon CSV parsing', () => {
    expect(parseServiceIdsParam('1,2,7')).toEqual([1, 2, 7])
    expect(parseServiceIdsParam([1, '2'])).toEqual([1, 2])
  })

  it('resolveBookingServices accepts serviceId alone (legacy)', () => {
    const { services } = resolveBookingServices({ serviceId: 1 })
    expect(services).toHaveLength(1)
    expect(services[0].id).toBe(1)
  })

  it('resolveBookingServices merges serviceIds and keeps order', () => {
    const { services } = resolveBookingServices({ serviceIds: [1, 2] })
    expect(services.map((s) => s.id)).toEqual([1, 2])
  })

  it('resolveBookingServices rejects unknown and oversized carts', () => {
    expect(resolveBookingServices({ serviceId: 999999 }).status).toBe(404)
    const catalogIds = ALL_SERVICES.map((s) => s.id).slice(0, MAX_BOOKING_SERVICES + 1)
    expect(catalogIds.length).toBeGreaterThan(MAX_BOOKING_SERVICES)
    expect(resolveBookingServices({ serviceIds: catalogIds }).status).toBe(400)
  })

  it('sums multi-service duration and price without inventing rates', () => {
    expect(eyebrow && upperLip && facial).toBeTruthy()
    const pair = [eyebrow, upperLip]
    expect(computeServicesDurationMinutes(pair)).toBe(
      (eyebrow.durationMinutes || 30) + (upperLip.durationMinutes || 30),
    )
    expect(computeServicesPricePkr(pair)).toBe(
      (eyebrow.pricePkr || 0) + (upperLip.pricePkr || 0),
    )
    expect(formatCombinedServiceName(pair)).toBe(`${eyebrow.name} + ${upperLip.name}`)
    expect(formatCombinedCategory(pair)).toBe(
      eyebrow.category === upperLip.category ? eyebrow.category : 'Combined',
    )
  })

  it('multi-service ignores addon ids (no double-count)', () => {
    const pair = [eyebrow, upperLip]
    expect(computeServicesDurationMinutes(pair, [2])).toBe(
      computeServicesDurationMinutes(pair, []),
    )
  })

  it('getBookingMaxWorkers uses the most restrictive station cap', () => {
    expect(getBookingMaxWorkers([eyebrow])).toBeGreaterThan(0)
    expect(getBookingMaxWorkers([])).toBe(2)
  })

  it('getBookingMaxWorkers never exceeds the salon station count (2)', () => {
    const bridal = ALL_SERVICES.find((s) => s.category === 'Bridal')
    expect(bridal).toBeTruthy()
    expect(getBookingMaxWorkers([bridal])).toBe(2)
    // Catalog typo / legacy maxWorkers: 3 must still clamp
    expect(getBookingMaxWorkers([{ ...bridal, maxWorkers: 3 }])).toBe(2)
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

  it('duplicate addon ids are deduplicated so repeats cannot inflate the duration', () => {
    expect(filterAllowedAddonIds(1, [2, 2, 2])).toEqual([2])
    expect(computeBookingDurationMinutes({ id: 1, durationMinutes: 10 }, [2, 2, 2])).toBe(15)
  })
})
