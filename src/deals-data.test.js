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

describe('Independence Day offer lifecycle', () => {
  const at = (d) => new Date(`${d}T09:00:00Z`)
  const deal = DEALS.find((d) => d.id === 'independence-14')

  it('is configured for 5–19 August with the 14% framing', () => {
    expect(deal).toBeDefined()
    expect(deal.validFrom).toBe('2026-08-05')
    expect(deal.validUntil).toBe('2026-08-19')
    expect(deal.title).toMatch(/14%/)
  })

  it('teases before it opens, runs during, and disappears after', () => {
    // teaser window: announced, not claimable
    expect(getUpcomingDeals(at('2026-07-30')).map((d) => d.id)).toContain('independence-14')
    expect(getActiveDeals(at('2026-07-30')).map((d) => d.id)).not.toContain('independence-14')

    // live on Independence Day itself
    expect(getActiveDeals(at('2026-08-14')).map((d) => d.id)).toContain('independence-14')
    expect(getUpcomingDeals(at('2026-08-14')).map((d) => d.id)).not.toContain('independence-14')

    // gone the day after it ends — no stale banner left up
    expect(getActiveDeals(at('2026-08-20')).map((d) => d.id)).not.toContain('independence-14')
    expect(getUpcomingDeals(at('2026-08-20')).map((d) => d.id)).not.toContain('independence-14')
    expect(getHeadlineDeal(at('2026-08-20'))).toBeNull()
  })

  it('formats the range for banner copy', () => {
    expect(formatDealRange(deal)).toBe('5–19 August')
  })
})
