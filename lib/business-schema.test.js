import { describe, it, expect, afterEach } from 'vitest'
import { getAggregateRating, SALON_PHONE, SALON_NAME, SAME_AS, buildBeautySalonSchema, buildFaqPageSchema, buildFounderSchema, buildArticleSchema } from './business-schema.js'

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
    // Self-serving aggregateRating earns no LocalBusiness rich result and has
    // triggered Search Console "multiple aggregate ratings" — keep it out of JSON-LD.
    // Visible "4.6★ Google" copy still uses getAggregateRating().
    expect(s.aggregateRating).toBeUndefined()
    expect(s.paymentAccepted).toContain('JazzCash')
  })

  it('omits OfferCatalog from the global entity (kept lean for every-page HTML)', async () => {
    const s = buildBeautySalonSchema()
    expect(s.hasOfferCatalog).toBeUndefined()
    // hasMenu points at /prices (the priced menu), not /services (category explainers).
    expect(s.hasMenu).toContain('/prices')
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

describe('founder entity resolution', () => {
  it('is a single node with a resolvable id and url', () => {
    const f = buildFounderSchema()
    expect(f['@id']).toBe('https://farwasalon.com/about#rubina')
    expect(f.url).toBe('https://farwasalon.com/about')
    expect(f['@type']).toBe('Person')
  })

  it('states what she is an authority on — the part that makes her citable', () => {
    const f = buildFounderSchema()
    expect(f.knowsAbout).toContain('Bridal makeup')
    expect(f.knowsAbout.length).toBeGreaterThan(3)
  })

  it('links her to the salon by id rather than by a duplicate inline node', () => {
    const f = buildFounderSchema()
    expect(f.worksFor).toEqual({ '@id': 'https://farwasalon.com/#salon' })
  })

  it('article bylines point at that same node so every post resolves to one person', () => {
    const post = { slug: 's', title: 't', description: 'd', date: '2026-07-01', category: 'Hair' }
    const article = buildArticleSchema(post, { wordCount: 500 })
    expect(article.author['@id']).toBe(buildFounderSchema()['@id'])
    expect(article.author.url).toBe('https://farwasalon.com/about')
  })

  it('respects a per-post author override while keeping the entity id', () => {
    const article = buildArticleSchema(
      { slug: 's', title: 't', description: 'd', date: '2026-07-01', author: 'Farwa Team' },
      { wordCount: 100 },
    )
    expect(article.author.name).toBe('Farwa Team')
  })
})
