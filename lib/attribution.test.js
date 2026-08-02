import { describe, it, expect } from 'vitest'
import { readAttribution, inferChannel, formatAttributionCell } from './attribution.js'

describe('inferChannel', () => {
  it('recognises the channels that matter for this business', () => {
    expect(inferChannel('https://l.facebook.com/x', 'farwasalon.com')).toBe('meta-organic')
    expect(inferChannel('https://www.instagram.com/', 'farwasalon.com')).toBe('meta-organic')
    expect(inferChannel('https://wa.me/', 'farwasalon.com')).toBe('whatsapp')
    expect(inferChannel('https://www.google.com/search?q=x', 'farwasalon.com')).toBe('search')
    expect(inferChannel('', 'farwasalon.com')).toBe('direct')
  })

  it('treats same-host referrers as internal so they never overwrite first touch', () => {
    expect(inferChannel('https://farwasalon.com/prices', 'www.farwasalon.com')).toBe('internal')
    expect(inferChannel('https://www.farwasalon.com/prices', 'farwasalon.com')).toBe('internal')
  })
})

describe('readAttribution', () => {
  it('captures the Meta ad case end to end', () => {
    const a = readAttribution({
      search: '?utm_source=meta&utm_medium=paid&utm_campaign=freedom-deal-2026&fbclid=ABC123',
      referrer: 'https://l.facebook.com/',
      host: 'farwasalon.com',
      landing: '/freedom-deal',
    })
    expect(a.utm_source).toBe('meta')
    expect(a.utm_campaign).toBe('freedom-deal-2026')
    expect(a.fbclid).toBe('ABC123')
    expect(a.channel).toBe('meta/paid')
    expect(a.landing).toBe('/freedom-deal')
    expect(formatAttributionCell(a)).toBe('meta/paid · freedom-deal-2026 · /freedom-deal · fbclid')
  })

  it('falls back to the referrer when there are no UTMs', () => {
    const a = readAttribution({
      search: '',
      referrer: 'https://www.google.com/search?q=salon',
      host: 'farwasalon.com',
      landing: '/prices',
    })
    expect(a.channel).toBe('search')
    expect(formatAttributionCell(a)).toBe('search · /prices')
  })

  it('returns null for plain internal navigation — nothing worth recording', () => {
    expect(
      readAttribution({
        search: '',
        referrer: 'https://farwasalon.com/services',
        host: 'farwasalon.com',
        landing: '/book',
      }),
    ).toBeNull()
  })

  it('truncates hostile input rather than writing it to the sheet', () => {
    const a = readAttribution({ search: `?utm_source=${'x'.repeat(500)}`, referrer: '', host: 'h', landing: '/' })
    expect(a.utm_source.length).toBeLessThanOrEqual(120)
  })

  it('formats an empty attribution safely', () => {
    expect(formatAttributionCell(null)).toBe('')
  })
})
