import { CAT_SLUGS } from '../src/data.js'
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
  TOP_SERVICES,
  getAllLocationServiceSlugs,
  getBestLocationRedirects,
  NEIGHBORHOODS,
  parseLocationSlug,
} from '../src/location-seo.js'
import { getLocationSitemapEntries } from './sitemap-data.js'
import { AREA_CONTENT } from '../src/area-content.js'
import { getFooterAreaLinks } from './location-links.js'

describe('location-links', () => {
  it('exports curated priority hubs (54), all canonical -in- slugs', () => {
    expect(PRIORITY_LOCATION_SLUGS).toHaveLength(60)
    expect(PRIORITY_LOCATION_SLUGS).toContain('threading-in-pechs-karachi')
    expect(PRIORITY_LOCATION_SLUGS).toContain('waxing-in-pechs-karachi')
    expect(PRIORITY_LOCATION_SLUGS).toContain('bridal-makeup-in-tariq-road')
    expect(PRIORITY_LOCATION_SLUGS).toContain('facials-in-saddar')
    expect(PRIORITY_LOCATION_SLUGS).toContain('waxing-in-gulshan')
    expect(PRIORITY_LOCATION_SLUGS).toContain('nails-in-tariq-road')
    expect(PRIORITY_LOCATION_SLUGS).toContain('hair-in-bahadurabad')
    expect(PRIORITY_LOCATION_SLUGS).toContain('bridal-makeup-in-shahrah-e-faisal')
    expect(PRIORITY_LOCATION_SLUGS).toContain('threading-in-korangi')
    expect(PRIORITY_LOCATION_SLUGS).toContain('facials-in-korangi')
    expect(PRIORITY_LOCATION_SLUGS).toContain('bridal-makeup-in-korangi')
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

  it('keeps client-facing chrome to a short curated area set', () => {
    expect(CLIENT_FACING_AREA_SLUGS).toHaveLength(4)
    expect(AREAS_HUB_HREF).toBe('/beauty-salon-karachi')
    const links = getClientFacingAreaLinks()
    expect(links).toHaveLength(4)
    expect(links.every((l) => CLIENT_FACING_AREA_SLUGS.includes(l.slug))).toBe(true)
    expect(links[0].label).toMatch(/PECHS/i)
    const labels = links.map((l) => l.label)
    expect(new Set(labels).size).toBe(labels.length)
    const bridalShort = getClientFacingAreaLinksForCategory('Bridal', 5)
    expect(bridalShort.length).toBeLessThanOrEqual(5)
    expect(bridalShort.length).toBeGreaterThan(0)
  })
})

describe('location sitemap + static generation allowlist', () => {
  it('caps crawlable location URLs to priority hubs', () => {
    expect(getAllLocationServiceSlugs()).toEqual([...PRIORITY_LOCATION_SLUGS])
    const entries = getLocationSitemapEntries()
    // 60 service hubs (full matrix) + 10 per-area pages
    expect(entries).toHaveLength(70)
    expect(entries.filter((e) => e.url.includes('/services/'))).toHaveLength(60)
    expect(entries.filter((e) => e.url.includes('/areas/'))).toHaveLength(10)
    expect(entries.every((e) => !e.url.includes('/best-'))).toBe(true)
  })

  it('emits permanent redirects for every legacy best-* matrix URL to apex', () => {
    const redirects = getBestLocationRedirects()
    expect(redirects).toHaveLength(60)
    expect(redirects.every((r) => r.permanent && r.source.startsWith('/services/best-'))).toBe(true)
    expect(redirects.every((r) => r.destination.startsWith('https://farwasalon.com/'))).toBe(true)
    const dhaBridal = redirects.find((r) => r.source === '/services/best-bridal-makeup-dha')
    expect(dhaBridal?.destination).toBe('https://farwasalon.com/services/bridal-makeup-in-dha')
  })

  it('never redirects best-* to a path that is not generated or a category page', () => {
    const liveHubs = new Set(
      [...PRIORITY_LOCATION_SLUGS].map((slug) => `https://farwasalon.com/services/${slug}`),
    )
    const categoryPages = new Set(
      Object.values(CAT_SLUGS).map((slug) => `https://farwasalon.com/services/${slug}`),
    )
    for (const r of getBestLocationRedirects()) {
      const ok = liveHubs.has(r.destination) || categoryPages.has(r.destination)
      expect(ok, `${r.source} → ${r.destination}`).toBe(true)
    }
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

/* Restored 2026-07-31 after the Performance export showed the retired hubs
   earning 13.5% of impressions and 19.7% of clicks at an average position of
   6.4. This guards the thing that actually went wrong: chrome links must point
   at pages that exist, which is what silently rotted last time. */
describe('chrome links resolve to real pages', () => {
  it('every client-facing area slug is a live hub', () => {
    const live = new Set(PRIORITY_LOCATION_SLUGS)
    for (const slug of CLIENT_FACING_AREA_SLUGS) {
      expect(live.has(slug), `${slug} is linked in chrome but not generated`).toBe(true)
    }
  })

  it('footer area links point at generated /areas pages', () => {
    const built = new Set(NEIGHBORHOODS.filter((n) => AREA_CONTENT[n.slug]).map((n) => `/areas/${n.slug}`))
    for (const link of getFooterAreaLinks()) {
      expect(built.has(link.href), `${link.href} is linked but not generated`).toBe(true)
    }
  })
})

/* The hand-maintained allowlist silently dropped six combinations that were
   live in Google's index and earning clicks, so they served 404s. Deriving from
   the matrix prevents that; this asserts it stays derived. */
describe('every service x neighbourhood combination is generated', () => {
  it('covers the full matrix with no gaps', () => {
    const live = new Set(PRIORITY_LOCATION_SLUGS)
    for (const svc of TOP_SERVICES) {
      for (const loc of NEIGHBORHOODS) {
        const slug = `${svc.slug}-in-${loc.slug}`
        expect(live.has(slug), `${slug} would 404`).toBe(true)
      }
    }
  })

  it('generates the six that were 404ing while ranking', () => {
    const live = new Set(PRIORITY_LOCATION_SLUGS)
    for (const slug of [
      'nails-in-korangi',
      'waxing-in-shahrah-e-faisal',
      'nails-in-north-nazimabad',
      'nails-in-shahrah-e-faisal',
      'waxing-in-korangi',
      'hair-in-korangi',
    ]) {
      expect(live.has(slug), slug).toBe(true)
    }
  })
})
