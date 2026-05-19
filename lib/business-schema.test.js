import { describe, it, expect, afterEach } from 'vitest'
import {
  getAggregateRating,
  SALON_PHONE,
  SALON_NAME,
  SAME_AS,
  buildBeautySalonSchema,
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
    expect(String(s['@type'])).toMatch(/BeautySalon/)
    expect(s.telephone).toBe(SALON_PHONE)
    expect(s.aggregateRating).toBeDefined()
  })
})
