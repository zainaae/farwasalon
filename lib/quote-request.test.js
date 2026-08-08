import { describe, it, expect } from 'vitest'
import { getServiceIdByName } from '../src/data.js'
import {
  buildQuoteWaText,
  buildQuoteWaHref,
  getHairQuoteServices,
  getQuoteServiceById,
  hairQuotePath,
  isHairQuoteService,
  quoteFloorLabel,
} from './quote-request.js'

describe('hair quote request helpers', () => {
  it('marks Hair / Hair Treatments fromPrice services as quoteable', () => {
    const colour = getQuoteServiceById(getServiceIdByName('Hair Colour'))
    const protein = getQuoteServiceById(getServiceIdByName('Normal Protein Treatment'))
    const threading = getQuoteServiceById(getServiceIdByName('Eyebrow Threading'))
    expect(isHairQuoteService(colour)).toBe(true)
    expect(isHairQuoteService(protein)).toBe(true)
    expect(isHairQuoteService(threading)).toBe(false)
    expect(getHairQuoteServices().length).toBeGreaterThanOrEqual(5)
  })

  it('builds deep-link path with quote=1, serviceId, and #quote', () => {
    const id = getServiceIdByName('Hair Colour')
    expect(hairQuotePath(id)).toBe(`/prices?quote=1&serviceId=${id}#quote`)
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
