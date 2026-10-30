import { describe, it, expect } from 'vitest'
import { SERVICES, formatPrice } from './data.js'
import { TOP_SERVICES, parseLocationSlug } from './location-seo.js'

function floorForService(service) {
  const keys = service.categories?.length ? service.categories : [service.category]
  const prices = keys.flatMap((k) => SERVICES[k] || []).map((s) => s.pricePkr).filter(Boolean)
  return prices.length ? Math.min(...prices) : null
}

describe('waxing location hubs advertise the true menu floor', () => {
  it('waxing TOP_SERVICE spans hot / honey / body so floor is Rs 150', () => {
    const waxing = TOP_SERVICES.find((s) => s.slug === 'waxing')
    expect(waxing.categories).toEqual(['Rica Wax', 'Honey Wax', 'Rica Hot Wax'])
    expect(floorForService(waxing)).toBe(150)
    expect(formatPrice(floorForService(waxing))).toBe('Rs 150')
  })

  it('parsed waxing-in-* slug uses the same multi-category floor (not Rica-only Rs 600)', () => {
    const data = parseLocationSlug('waxing-in-pechs-karachi')
    expect(data).toBeTruthy()
    expect(floorForService(data.service)).toBe(150)
    /* Rica body alone still starts at 600 — do not change that category page. */
    const ricaOnly = Math.min(...SERVICES['Rica Wax'].map((s) => s.pricePkr))
    expect(ricaOnly).toBe(600)
  })
})
