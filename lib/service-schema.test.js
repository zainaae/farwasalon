import { describe, it, expect } from 'vitest'
import { buildCategoryOffersSchema } from './service-schema.js'

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
