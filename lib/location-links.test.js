import { describe, it, expect } from 'vitest'
import {
  PRIORITY_LOCATION_SLUGS,
  CLIENT_FACING_AREA_SLUGS,
  AREAS_HUB_HREF,
  getPriorityLocationLinks,
  getClientFacingAreaLinks,
  getClientFacingAreaLinksForCategory,
  getNearbyPriorityLocationLinks,
  getPriorityLocationLinksForCategory,
} from './location-links.js'
import {
  getAllLocationServiceSlugs,
  getBestLocationRedirects,
  NEIGHBORHOODS,
  parseLocationSlug,
} from '../src/location-seo.js'
import { getLocationSitemapEntries } from './sitemap-data.js'
import { getRetiredLocationRedirects } from '../src/location-seo.js'

describe('location-links', () => {
  /* Was 54 hubs across ten neighbourhoods. Pages sharing a service measured
     84–91% identical to each other and Google folded 48 of them under its own
     canonical. Only PECHS survives, where the six pages differ by service
     (58% similarity) rather than by a swapped area name. */
  it('keeps one hub per service, PECHS only', () => {
    expect(PRIORITY_LOCATION_SLUGS).toHaveLength(6)
    expect(PRIORITY_LOCATION_SLUGS.every((s) => s.endsWith('-in-pechs-karachi'))).toBe(true)
    expect(PRIORITY_LOCATION_SLUGS).toContain('threading-in-pechs-karachi')
    expect(PRIORITY_LOCATION_SLUGS).toContain('bridal-makeup-in-pechs-karachi')
    expect(PRIORITY_LOCATION_SLUGS.every((slug) => slug.includes('-in-'))).toBe(true)
    expect(PRIORITY_LOCATION_SLUGS.some((slug) => slug.startsWith('best-'))).toBe(false)
  })

  it('builds labeled hrefs for priority pages', () => {
    const links = getPriorityLocationLinks()
    expect(links).toHaveLength(PRIORITY_LOCATION_SLUGS.length)
    expect(links[0].href).toMatch(/^\/services\//)
    expect(links[0].label.length).toBeGreaterThan(5)
  })

  it('has no nearby-area links to offer now that only PECHS remains', () => {
    const nearby = getNearbyPriorityLocationLinks('threading-in-pechs-karachi')
    expect(nearby).toEqual([])
    // location-service-page.jsx guards on length, so nothing renders empty.
  })

  it('filters priority links by service category', () => {
    const bridal = getPriorityLocationLinksForCategory('Bridal')
    expect(bridal.length).toBeGreaterThan(0)
    expect(bridal.every((l) => l.slug.includes('bridal-makeup'))).toBe(true)
  })

  it('keeps client-facing chrome to a short curated area set', () => {
    expect(CLIENT_FACING_AREA_SLUGS).toHaveLength(6)
    expect(AREAS_HUB_HREF).toBe('/beauty-salon-karachi')
    const links = getClientFacingAreaLinks()
    expect(links).toHaveLength(6)
    expect(links.every((l) => CLIENT_FACING_AREA_SLUGS.includes(l.slug))).toBe(true)
    expect(links[0].label).toMatch(/PECHS/i)
    const bridalShort = getClientFacingAreaLinksForCategory('Bridal', 5)
    expect(bridalShort.length).toBeLessThanOrEqual(5)
    expect(bridalShort.length).toBeGreaterThan(0)
  })
})

describe('location sitemap + static generation allowlist', () => {
  it('caps crawlable location URLs to priority hubs', () => {
    expect(getAllLocationServiceSlugs()).toEqual([...PRIORITY_LOCATION_SLUGS])
    const entries = getLocationSitemapEntries()
    // 6 PECHS service hubs + 10 per-area pages
    expect(entries).toHaveLength(16)
    expect(entries.filter((e) => e.url.includes('/services/'))).toHaveLength(6)
    expect(entries.filter((e) => e.url.includes('/areas/'))).toHaveLength(10)
    expect(entries.every((e) => !e.url.includes('/best-'))).toBe(true)
    expect(
      entries.filter((e) => e.url.includes('/services/')).every((e) => e.url.endsWith('-in-pechs-karachi')),
    ).toBe(true)
  })

  it('emits 301 redirects for every legacy best-* matrix URL', () => {
    const redirects = getBestLocationRedirects()
    expect(redirects).toHaveLength(60)
    expect(redirects.every((r) => r.permanent && r.source.startsWith('/services/best-'))).toBe(true)
    // DHA is retired, so its legacy best-* URL now lands on the category page.
    const dhaBridal = redirects.find((r) => r.source === '/services/best-bridal-makeup-dha')
    expect(dhaBridal?.destination).toBe('/services/bridal')
    const pechsThreading = redirects.find((r) => r.source === '/services/best-threading-pechs-karachi')
    expect(pechsThreading?.destination).toBe('/services/threading-in-pechs-karachi')
  })

  it('301s every retired hub — none may 404', () => {
    const retired = getRetiredLocationRedirects()
    const kept = new Set(PRIORITY_LOCATION_SLUGS)
    expect(retired.every((r) => r.permanent)).toBe(true)
    expect(retired.every((r) => !kept.has(r.source.replace('/services/', '')))).toBe(true)
    // every retired hub points at a real service category, never at another hub
    expect(retired.every((r) => !r.destination.includes('-in-'))).toBe(true)
    expect(retired.length).toBeGreaterThanOrEqual(48)
  })
})

describe('location unique blurbs', () => {
  it('gives every neighborhood a unique blurb beyond the short detail line', () => {
    const blurbs = NEIGHBORHOODS.map((n) => n.blurb)
    expect(new Set(blurbs).size).toBe(NEIGHBORHOODS.length)
    for (const n of NEIGHBORHOODS) {
      expect(n.blurb?.length, n.slug).toBeGreaterThan(80)
      expect(n.blurb).toMatch(/PECHS|price|book|bridal|threading|facial|wax/i)
    }
  })

  it('every priority hub resolves to a service + neighborhood with a blurb', () => {
    for (const slug of PRIORITY_LOCATION_SLUGS) {
      const parsed = parseLocationSlug(slug)
      expect(parsed, slug).toBeTruthy()
      expect(parsed.location.blurb?.length, slug).toBeGreaterThan(80)
    }
  })
})
