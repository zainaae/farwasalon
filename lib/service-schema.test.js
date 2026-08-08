import { describe, it, expect } from 'vitest'
import { buildCategoryOffersSchema, buildServiceOffer, getMenuStats } from './service-schema.js'
import { SERVICES } from '../src/data.js'

describe('buildCategoryOffersSchema', () => {
  it('returns Offer graph for priced services', () => {
    const schema = buildCategoryOffersSchema(
      'Threading',
      [
        { id: 1, name: 'Eyebrows', pricePkr: 200, durationMinutes: 10 },
        { id: 2, name: 'Full face', pricePkr: 500, durationMinutes: 25 },
      ],
      'threading',
    )
    expect(schema['@graph'][0].offers).toHaveLength(2)
    expect(schema['@graph'][0].offers[0].price).toBe('200')
    expect(schema['@graph'][0].offers[0].url).toMatch(/serviceId=1/)
  })

  it('returns null when no priced services', () => {
    expect(buildCategoryOffersSchema('Test', [{ id: 1, name: 'X' }], 'test')).toBeNull()
  })
})

describe('fromPrice offers publish floors, not locked prices', () => {
  it('emits minPrice PriceSpecification without a fixed price field', () => {
    const hair = SERVICES.Hair.find((s) => s.name === 'Hair Colour')
    const bridal = SERVICES.Bridal.find((s) => s.name === 'Full Bridal Package')
    expect(hair?.fromPrice).toBe(true)
    expect(bridal?.fromPrice).toBe(true)

    const hairOffer = buildServiceOffer(hair)
    expect(hairOffer.price).toBeUndefined()
    expect(hairOffer.priceSpecification.minPrice).toBe(String(hair.pricePkr))
    expect(hairOffer.description).toMatch(/Starting price|quote floor/i)

    const bridalOffer = buildServiceOffer(bridal)
    expect(bridalOffer.price).toBeUndefined()
    expect(bridalOffer.priceSpecification.minPrice).toBe(String(bridal.pricePkr))
  })

  it('counts bridal among startingFrom menu stats', () => {
    const stats = getMenuStats()
    const bridalFrom = SERVICES.Bridal.filter((s) => s.fromPrice).length
    const hairFrom = [...SERVICES.Hair, ...SERVICES['Hair Treatments']].filter((s) => s.fromPrice).length
    expect(bridalFrom).toBeGreaterThan(0)
    expect(stats.startingFrom).toBe(hairFrom + bridalFrom)
  })
})
