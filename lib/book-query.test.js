import { describe, it, expect } from 'vitest'
import { resolveServiceFromNameParam } from './book-query.js'
import { SERVICES } from '../src/data.js'

describe('resolveServiceFromNameParam (/prices ?service= links)', () => {
  it('selects Eyebrow Threading when category is Threading', () => {
    const svc = resolveServiceFromNameParam('Eyebrow Threading', 'Threading')
    expect(svc?.name).toBe('Eyebrow Threading')
    expect(svc?.category).toBe('Threading')
  })

  it('selects Full Bridal Package by name alone', () => {
    const svc = resolveServiceFromNameParam('Full Bridal Package', null)
    expect(svc?.name).toBe('Full Bridal Package')
    expect(svc?.fromPrice).toBe(true)
  })

  it('is case-insensitive and trims whitespace', () => {
    const svc = resolveServiceFromNameParam('  hair colour  ', 'Hair')
    expect(svc?.name).toBe('Hair Colour')
  })

  it('falls back to global name match if category misses', () => {
    const svc = resolveServiceFromNameParam('Normal Facial', 'Threading')
    expect(svc?.name).toBe('Normal Facial')
    expect(svc?.category).toBe('Facials')
  })

  it('returns null for unknown names', () => {
    expect(resolveServiceFromNameParam('Not A Real Service', 'Hair')).toBeNull()
    expect(resolveServiceFromNameParam('', 'Hair')).toBeNull()
    expect(resolveServiceFromNameParam(null, null)).toBeNull()
  })

  it('covers every prices-row service name in catalog', () => {
    for (const [cat, list] of Object.entries(SERVICES)) {
      for (const s of list) {
        expect(resolveServiceFromNameParam(s.name, cat)?.id).toBe(s.id)
      }
    }
  })
})
