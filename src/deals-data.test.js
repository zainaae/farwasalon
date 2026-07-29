import { describe, it, expect } from 'vitest'
import { DEALS, getActiveDeals, getUpcomingDeals, getHeadlineDeal, formatDealRange } from './deals-data.js'

describe('deals data', () => {
  it('every deal has the required fields and valid dates', () => {
    for (const d of DEALS) {
      expect(d.id).toMatch(/^[a-z0-9-]+$/)
      expect(d.title.length).toBeGreaterThan(8)
      expect(d.description.length).toBeGreaterThan(30)
      expect(d.href).toMatch(/^\//)
      if (d.validFrom) expect(d.validFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      if (d.validUntil) expect(d.validUntil).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('filters by validity window', () => {
    const sample = [
      { id: 'past', title: 'x', validFrom: '2026-01-01', validUntil: '2026-02-01' },
      { id: 'open', title: 'y', validFrom: '2026-01-01', validUntil: null },
      { id: 'future', title: 'z', validFrom: '2099-01-01', validUntil: null },
    ]
    const active = getActiveDeals(new Date('2026-07-24T12:00:00Z'))
    expect(active.every((d) => !d.validUntil || d.validUntil >= '2026-07-24')).toBe(true)
    // sanity on the filter logic itself via the DEALS-shaped sample
    const today = '2026-07-24'
    const filtered = sample.filter(
      (d) => (!d.validFrom || d.validFrom <= today) && (!d.validUntil || d.validUntil >= today),
    )
    expect(filtered.map((d) => d.id)).toEqual(['open'])
  })

  it('always has at least one active deal so /deals is never empty', () => {
    expect(getActiveDeals().length).toBeGreaterThanOrEqual(1)
  })
})

describe('Freedom Deal lifecycle', () => {
  const at = (d) => new Date(`${d}T09:00:00Z`)
  const deal = DEALS.find((d) => d.id === 'freedom-deal-2026')

  it('matches the published poster: 20% off Rs 1,400+, 5-14 August', () => {
    expect(deal).toBeDefined()
    expect(deal.validFrom).toBe('2026-08-05')
    expect(deal.validUntil).toBe('2026-08-14')
    expect(deal.title).toMatch(/20%/)
    expect(deal.priceNote).toMatch(/1,400/)
    expect(deal.image).toBe('/freedom-deal-2026.jpg')
  })

  it('teases before it opens, runs during, and disappears after', () => {
    // teaser window: announced, not claimable
    expect(getUpcomingDeals(at('2026-07-30')).map((d) => d.id)).toContain('freedom-deal-2026')
    expect(getActiveDeals(at('2026-07-30')).map((d) => d.id)).not.toContain('freedom-deal-2026')

    // live on Independence Day itself
    expect(getActiveDeals(at('2026-08-14')).map((d) => d.id)).toContain('freedom-deal-2026')
    expect(getUpcomingDeals(at('2026-08-14')).map((d) => d.id)).not.toContain('freedom-deal-2026')

    // gone the day after it ends — no stale banner left up
    expect(getActiveDeals(at('2026-08-15')).map((d) => d.id)).not.toContain('freedom-deal-2026')
    expect(getUpcomingDeals(at('2026-08-15')).map((d) => d.id)).not.toContain('freedom-deal-2026')
    expect(getHeadlineDeal(at('2026-08-15'))).toBeNull()
  })

  it('formats the range for banner copy', () => {
    expect(formatDealRange(deal)).toBe('5–14 August')
  })
})
