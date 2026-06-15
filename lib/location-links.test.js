import { describe, it, expect } from 'vitest'
import {
  PRIORITY_LOCATION_SLUGS,
  getPriorityLocationLinks,
} from './location-links.js'

describe('location-links', () => {
  it('exports curated priority slugs', () => {
    expect(PRIORITY_LOCATION_SLUGS.length).toBeGreaterThanOrEqual(12)
    expect(PRIORITY_LOCATION_SLUGS).toContain('threading-in-pechs-karachi')
  })

  it('builds labeled hrefs for priority pages', () => {
    const links = getPriorityLocationLinks()
    expect(links).toHaveLength(PRIORITY_LOCATION_SLUGS.length)
    expect(links[0].href).toMatch(/^\/services\//)
    expect(links[0].label.length).toBeGreaterThan(5)
  })

})
