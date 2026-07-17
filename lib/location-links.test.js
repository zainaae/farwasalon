import { describe, it, expect } from 'vitest'
import {
  PRIORITY_LOCATION_SLUGS,
  getPriorityLocationLinks,
  getNearbyPriorityLocationLinks,
  getPriorityLocationLinksForCategory,
} from './location-links.js'
import { getAllLocationServiceSlugs, getBestLocationRedirects } from '../src/location-seo.js'
import { getLocationSitemapEntries } from './sitemap-data.js'

describe('location-links', () => {
  it('exports curated priority hubs (~18), all canonical -in- slugs', () => {
    expect(PRIORITY_LOCATION_SLUGS).toHaveLength(18)
    expect(PRIORITY_LOCATION_SLUGS).toContain('threading-in-pechs-karachi')
    expect(PRIORITY_LOCATION_SLUGS.every((slug) => slug.includes('-in-'))).toBe(true)
    expect(PRIORITY_LOCATION_SLUGS.some((slug) => slug.startsWith('best-'))).toBe(false)
  })

  it('builds labeled hrefs for priority pages', () => {
    const links = getPriorityLocationLinks()
    expect(links).toHaveLength(PRIORITY_LOCATION_SLUGS.length)
    expect(links[0].href).toMatch(/^\/services\//)
    expect(links[0].label.length).toBeGreaterThan(5)
  })

  it('returns nearby priority links for the same service', () => {
    const nearby = getNearbyPriorityLocationLinks('threading-in-pechs-karachi')
    expect(nearby.length).toBeGreaterThan(0)
    expect(nearby.every((l) => l.slug.includes('threading-in-'))).toBe(true)
    expect(nearby.some((l) => l.slug === 'threading-in-pechs-karachi')).toBe(false)
  })

  it('filters priority links by service category', () => {
    const bridal = getPriorityLocationLinksForCategory('Bridal')
    expect(bridal.length).toBeGreaterThan(0)
    expect(bridal.every((l) => l.slug.includes('bridal-makeup'))).toBe(true)
  })
})

describe('location sitemap + static generation allowlist', () => {
  it('caps crawlable location URLs to priority hubs', () => {
    expect(getAllLocationServiceSlugs()).toEqual([...PRIORITY_LOCATION_SLUGS])
    expect(getLocationSitemapEntries()).toHaveLength(18)
    expect(
      getLocationSitemapEntries().every((e) => e.url.includes('-in-') && !e.url.includes('/best-')),
    ).toBe(true)
  })

  it('emits 301 redirects for every legacy best-* matrix URL', () => {
    const redirects = getBestLocationRedirects()
    expect(redirects).toHaveLength(60)
    expect(redirects.every((r) => r.permanent && r.source.startsWith('/services/best-'))).toBe(true)
    const dhaBridal = redirects.find((r) => r.source === '/services/best-bridal-makeup-dha')
    expect(dhaBridal?.destination).toBe('/services/bridal-makeup-in-dha')
  })
})
