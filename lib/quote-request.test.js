import { describe, it, expect } from 'vitest'
import { ALL_SERVICES, SERVICES, getServiceIdByName } from '../src/data.js'
import {
  HAIR_QUOTE_CATEGORIES,
  QUOTE_DENSITIES,
  QUOTE_LENGTHS,
  buildQuoteWaText,
  buildQuoteWaHref,
  getHairQuoteServices,
  getQuoteServiceById,
  hairQuotePath,
  isHairQuoteCategory,
  isHairQuoteService,
  quoteFloorLabel,
} from './quote-request.js'

describe('hair quote request helpers', () => {
  it('limits quote categories to Hair + Hair Treatments (not Bridal)', () => {
    expect([...HAIR_QUOTE_CATEGORIES].sort()).toEqual(['Hair', 'Hair Treatments'])
    expect(isHairQuoteCategory('Hair')).toBe(true)
    expect(isHairQuoteCategory('Hair Treatments')).toBe(true)
    expect(isHairQuoteCategory('Bridal')).toBe(false)
    expect(isHairQuoteCategory('Facials')).toBe(false)
  })

  it('marks only fromPrice Hair / Hair Treatments services as quoteable', () => {
    const colour = getQuoteServiceById(getServiceIdByName('Hair Colour'))
    const protein = getQuoteServiceById(getServiceIdByName('Normal Protein Treatment'))
    const threading = getQuoteServiceById(getServiceIdByName('Eyebrow Threading'))
    const bridal = getQuoteServiceById(getServiceIdByName('Full Bridal Package'))
    expect(isHairQuoteService(colour)).toBe(true)
    expect(isHairQuoteService(protein)).toBe(true)
    expect(isHairQuoteService(threading)).toBe(false)
    /* Bridal prints floors via Book — not the /prices hair quote builder. */
    expect(bridal?.fromPrice).toBe(true)
    expect(isHairQuoteService(bridal)).toBe(false)
  })

  it('includes every catalog Hair + Hair Treatments SKU in the quote menu', () => {
    const expected = [
      ...(SERVICES.Hair || []),
      ...(SERVICES['Hair Treatments'] || []),
    ].filter((s) => s.fromPrice)
    const got = getHairQuoteServices()
    expect(got.map((s) => s.id).sort()).toEqual(expected.map((s) => s.id).sort())
    expect(got.some((s) => s.category === 'Hair')).toBe(true)
    expect(got.some((s) => s.category === 'Hair Treatments')).toBe(true)
    expect(got.length).toBeGreaterThanOrEqual(5)
    /* Every quoteable service must resolve by id and expose a floor label. */
    for (const s of got) {
      expect(getQuoteServiceById(s.id)?.id).toBe(s.id)
      expect(quoteFloorLabel(s)).toMatch(/^from Rs /)
    }
  })

  it('quoteFloorLabel is fromPrice-only and null outside hair quote set', () => {
    const colour = getQuoteServiceById(getServiceIdByName('Hair Colour'))
    const bridal = getQuoteServiceById(getServiceIdByName('Full Bridal Package'))
    const threading = getQuoteServiceById(getServiceIdByName('Eyebrow Threading'))
    expect(quoteFloorLabel(colour)).toBe('from Rs 4,000')
    expect(quoteFloorLabel(bridal)).toBeNull()
    expect(quoteFloorLabel(threading)).toBeNull()
    expect(quoteFloorLabel(null)).toBeNull()
  })

  it('builds deep-link path with quote=1, serviceId, and #quote', () => {
    const id = getServiceIdByName('Hair Colour')
    expect(hairQuotePath(id)).toBe(`/prices?quote=1&serviceId=${id}#quote`)
    expect(hairQuotePath('12')).toBe('/prices?quote=1&serviceId=12#quote')
  })

  it('getQuoteServiceById rejects non-finite ids', () => {
    expect(getQuoteServiceById(undefined)).toBeNull()
    expect(getQuoteServiceById('')).toBeNull()
    expect(getQuoteServiceById('nope')).toBeNull()
    const any = ALL_SERVICES[0]
    expect(getQuoteServiceById(any.id)?.id).toBe(any.id)
  })

  it('WA text includes service, from floor, length, density — never a locked total', () => {
    const colour = getQuoteServiceById(getServiceIdByName('Hair Colour'))
    const floor = quoteFloorLabel(colour)
    expect(floor).toBe('from Rs 4,000')

    const text = buildQuoteWaText({
      label: colour.name,
      floorLabel: floor,
      length: 'Long',
      density: 'Thick',
      note: 'roots only',
    })
    expect(text).toBe(
      'Quote please — Hair Colour, from Rs 4,000, length: Long, density: Thick, note: roots only (via farwasalon.com/prices)',
    )
    expect(text).not.toMatch(/Total\s*Rs/i)
    expect(text).not.toMatch(/(?<!from )Rs 4,000/)

    const href = buildQuoteWaHref({
      label: colour.name,
      floorLabel: floor,
      length: 'Long',
      density: 'Thick',
    })
    expect(href).toMatch(/^https:\/\/wa\.me\/923222782254\?text=/)
    expect(decodeURIComponent(href)).toContain('from Rs 4,000')
    expect(decodeURIComponent(href)).toContain('density: Thick')
  })

  it('omits empty optional look/length/density/date/note from WA text', () => {
    const text = buildQuoteWaText({
      label: 'Hair Colour',
      floorLabel: 'from Rs 4,000',
      look: '',
      length: '',
      density: '',
      date: '',
      note: '',
    })
    expect(text).toBe('Quote please — Hair Colour, from Rs 4,000 (via farwasalon.com/prices)')
    expect(text).not.toMatch(/look:|length:|density:|date:|note:/)
  })

  it('exposes stable length and density option lists for the builder', () => {
    expect(QUOTE_LENGTHS).toEqual(['Short', 'Shoulder length', 'Long', 'Very long'])
    expect(QUOTE_DENSITIES).toEqual(['Fine', 'Medium', 'Thick'])
  })

  it('special-works quotes omit floor and can include look', () => {
    const text = buildQuoteWaText({
      label: 'Party Makeup',
      look: 'Soft glam',
      date: '2026-09-01',
    })
    expect(text).toBe(
      'Quote please — Party Makeup, look: Soft glam, date: 2026-09-01 (via farwasalon.com/prices)',
    )
    expect(text).not.toMatch(/from Rs/)
  })
})
