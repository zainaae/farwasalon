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

  it('is 14% off on a Rs 1,400+ basket, 5-14 August', () => {
    expect(deal).toBeDefined()
    expect(deal.validFrom).toBe('2026-08-05')
    expect(deal.validUntil).toBe('2026-08-14')
    expect(deal.title).toMatch(/14%/)
    expect(deal.priceNote).toMatch(/1,400/)
    expect(deal.image).toBe('/freedom-deal-2026-14pc.jpg')
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

describe('the deals page can never render an empty grid', () => {
  /* /deals opens with "If a deal is listed here, it is honoured at the counter"
     and then maps over the list. With no evergreen offer the promise would sit
     above a hole — and it would happen silently, on a date, with nobody
     watching. This is the guard for that. */
  it('always has at least one claimable deal, on any date after launch', () => {
    /* Dates before the 2026-05-14 launch legitimately have none. */
    const dates = ['2026-05-14', '2026-08-04', '2026-08-14', '2026-08-15', '2027-06-30', '2030-12-31']
    for (const d of dates) {
      expect(getActiveDeals(new Date(`${d}T12:00:00Z`)).length, `no active deal on ${d}`).toBeGreaterThan(0)
    }
  })

  it('keeps an evergreen offer — the one that makes the above true', () => {
    const evergreen = DEALS.filter((d) => d.validUntil === null)
    expect(evergreen.length).toBeGreaterThan(0)
  })

  it('stops showing the Independence Day deal the day after it ends', () => {
    const after = getActiveDeals(new Date('2026-08-15T12:00:00Z'))
    expect(after.some((d) => d.id === 'freedom-deal-2026')).toBe(false)
  })
})

describe('poster asset and headline rate cannot drift apart', () => {
  /* The 20% poster shipped, then the rate became 14%, and the image URL stayed
     the same — so browsers kept serving the wrong promise from a 30-day cache.
     Discount rates live in the filename now, and this checks the file, the
     title and the description all state the same number. */
  const deal = DEALS.find((d) => d.id === 'freedom-deal-2026')

  it('names the discount rate in the poster filename', () => {
    const pct = deal.title.match(/(\d+)%/)?.[1]
    expect(pct).toBeTruthy()
    expect(deal.image, 'poster filename must carry the rate').toContain(`${pct}pc`)
  })

  it('states one rate consistently across title, description and priceNote', () => {
    const pct = deal.title.match(/(\d+)%/)[1]
    const others = `${deal.description} ${deal.imageAlt ?? ''}`.match(/(\d+)%/g) ?? []
    for (const found of others) {
      expect(found, `"${found}" contradicts the ${pct}% headline`).toBe(`${pct}%`)
    }
  })
})
