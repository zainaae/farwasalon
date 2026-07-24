import { describe, it, expect, afterEach } from 'vitest'
import {
  getAggregateRating,
  SALON_PHONE,
  SALON_NAME,
  SAME_AS,
  buildBeautySalonSchema,
  buildFaqPageSchema,
} from './business-schema.js'

describe('getAggregateRating', () => {
  afterEach(() => {
    delete process.env.SALON_GBP_RATING
    delete process.env.SALON_GBP_REVIEW_COUNT
    delete process.env.NEXT_PUBLIC_SALON_GBP_RATING
    delete process.env.NEXT_PUBLIC_SALON_GBP_REVIEW_COUNT
  })

  it('returns default rating when no env is set', () => {
    const r = getAggregateRating()
    expect(r['@type']).toBe('AggregateRating')
    expect(r.bestRating).toBe('5')
    expect(r.worstRating).toBe('1')
    expect(Number(r.ratingValue)).toBeGreaterThanOrEqual(1)
    expect(Number(r.ratingValue)).toBeLessThanOrEqual(5)
  })

  it('uses SALON_GBP_RATING env override', () => {
    process.env.SALON_GBP_RATING = '4.7'
    process.env.SALON_GBP_REVIEW_COUNT = '42'
    const r = getAggregateRating()
    expect(r.ratingValue).toBe('4.7')
    expect(r.reviewCount).toBe('42')
    expect(r.ratingCount).toBe('42')
  })
})

describe('salon schema constants', () => {
  it('exposes phone and name', () => {
    expect(SALON_PHONE).toMatch(/^\+/)
    expect(SALON_NAME.length).toBeGreaterThan(3)
    expect(SAME_AS.length).toBeGreaterThan(0)
  })
})

describe('buildBeautySalonSchema', () => {
  it('builds BeautySalon JSON-LD', () => {
    const s = buildBeautySalonSchema()
    expect(s['@context']).toBe('https://schema.org')
    expect(s['@type']).toEqual(['BeautySalon', 'HairSalon', 'LocalBusiness'])
    expect(s.telephone).toBe(SALON_PHONE)
    expect(s.aggregateRating).toBeDefined()
    expect(s.paymentAccepted).toContain('JazzCash')
  })

  it('omits OfferCatalog from the global entity (kept lean for every-page HTML)', async () => {
    const s = buildBeautySalonSchema()
    expect(s.hasOfferCatalog).toBeUndefined()
    expect(s.hasMenu).toContain('/services')
  })
})

describe('buildFaqPageSchema', () => {
  it('returns null for fewer than 2 FAQs', () => {
    expect(buildFaqPageSchema([])).toBeNull()
    expect(buildFaqPageSchema([{ q: 'Only one?', a: 'Yes' }])).toBeNull()
  })

  it('builds FAQPage JSON-LD', () => {
    const schema = buildFaqPageSchema([
      { q: 'Hours?', a: 'Mon–Sat 11–7' },
      { q: 'Parking?', a: 'Street parking nearby' },
    ])
    expect(schema['@type']).toBe('FAQPage')
    expect(schema.mainEntity).toHaveLength(2)
    expect(schema.mainEntity[0]['@type']).toBe('Question')
  })
})
