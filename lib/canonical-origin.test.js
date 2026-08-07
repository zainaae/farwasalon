import { describe, it, expect } from 'vitest'
import { CANONICAL_ORIGIN, toCanonicalUrl } from './canonical-origin.js'

describe('toCanonicalUrl', () => {
  it('prefixes relative paths with the apex origin', () => {
    expect(toCanonicalUrl('/freedom-deal')).toBe(`${CANONICAL_ORIGIN}/freedom-deal`)
    expect(toCanonicalUrl('about')).toBe(`${CANONICAL_ORIGIN}/about`)
  })

  it('leaves absolute URLs unchanged', () => {
    expect(toCanonicalUrl('https://search.google.com/x')).toBe('https://search.google.com/x')
  })
})
