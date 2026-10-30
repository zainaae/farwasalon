import { CAT_SLUGS } from '../src/data.js'
import { describe, it, expect } from 'vitest'
import {
  PRIORITY_LOCATION_SLUGS,
  CLIENT_FACING_AREA_SLUGS,
  KEPT_AREA_SLUGS,
  AREAS_HUB_HREF,
  getPriorityLocationLinks,
  getClientFacingAreaLinks,
  getClientFacingAreaLinksForCategory,
  getNearbyPriorityLocationLinks,
  getPriorityLocationLinksForCategory,
  getFooterAreaLinks,
  getKeptNeighborhoods,
} from './location-links.js'
import {
  TOP_SERVICES,
  getAllLocationServiceSlugs,
  getBestLocationRedirects,
  getServiceAreaRedirects,
  getRetiredAreaRedirects,
  SERVICE_AREA_MATRIX_SLUGS,
  NEIGHBORHOODS,
  parseLocationSlug,
  categoryPathForTopService,
} from '../src/location-seo.js'
import { getLocationSitemapEntries } from './sitemap-data.js'
import { AREA_CONTENT } from '../src/area-content.js'

describe('location-links after doorway retirement', () => {
  it('no longer generates service×area landers', () => {
    expect(PRIORITY_LOCATION_SLUGS).toHaveLength(0)
    expect(getAllLocationServiceSlugs()).toEqual([])
    expect(getPriorityLocationLinks()).toHaveLength(0)
    expect(SERVICE_AREA_MATRIX_SLUGS).toHaveLength(60)
  })

  it('keeps four area hubs for chrome', () => {
    expect(KEPT_AREA_SLUGS).toEqual([
      'pechs-karachi',
      'tariq-road',
      'bahadurabad',
      'gulshan',
    ])
    expect(CLIENT_FACING_AREA_SLUGS).toEqual(KEPT_AREA_SLUGS)
    expect(AREAS_HUB_HREF).toBe('/areas')
    const links = getClientFacingAreaLinks()
    expect(links).toHaveLength(4)
    expect(links.every((l) => l.href.startsWith('/areas/'))).toBe(true)
    expect(links[0].label).toMatch(/PECHS/i)
    const bridalShort = getClientFacingAreaLinksForCategory('Bridal', 5)
    expect(bridalShort.length).toBeLessThanOrEqual(5)
    expect(bridalShort.length).toBe(4)
  })

  it('nearby / category priority helpers return empty', () => {
    expect(getNearbyPriorityLocationLinks('threading-in-pechs-karachi')).toHaveLength(0)
    expect(getPriorityLocationLinksForCategory('Bridal')).toHaveLength(0)
  })
})

describe('location sitemap + redirects', () => {
  it('sitemaps only /areas hub + 4 kept hubs (no service×area SKUs)', () => {
    const entries = getLocationSitemapEntries()
    expect(entries).toHaveLength(5)
    expect(entries[0].url).toBe('https://farwasalon.com/areas')
    expect(entries.filter((e) => e.url.includes('/services/'))).toHaveLength(0)
    expect(entries.filter((e) => /\/areas\/[^/]+$/.test(e.url))).toHaveLength(4)
    expect(entries.map((e) => e.url)).toEqual([
      'https://farwasalon.com/areas',
      'https://farwasalon.com/areas/pechs-karachi',
      'https://farwasalon.com/areas/tariq-road',
      'https://farwasalon.com/areas/bahadurabad',
      'https://farwasalon.com/areas/gulshan',
    ])
  })

  it('301s every service×area SKU to the parent category page', () => {
    const redirects = getServiceAreaRedirects()
    expect(redirects).toHaveLength(60)
    expect(redirects.every((r) => r.permanent && r.source.includes('-in-'))).toBe(true)
    expect(redirects.every((r) => r.destination.startsWith('https://farwasalon.com/services/'))).toBe(
      true,
    )
    const pechsThread = redirects.find((r) => r.source === '/services/threading-in-pechs-karachi')
    expect(pechsThread?.destination).toBe('https://farwasalon.com/services/threading')
    const bridal = redirects.find((r) => r.source === '/services/bridal-makeup-in-tariq-road')
    expect(bridal?.destination).toBe('https://farwasalon.com/services/bridal')
    const wax = redirects.find((r) => r.source === '/services/waxing-in-gulshan')
    expect(wax?.destination).toBe('https://farwasalon.com/services/rica-wax')
  })

  it('301s legacy best-* matrix URLs straight to category pages', () => {
    const redirects = getBestLocationRedirects()
    expect(redirects).toHaveLength(60)
    expect(redirects.every((r) => r.permanent && r.source.startsWith('/services/best-'))).toBe(true)
    const dhaBridal = redirects.find((r) => r.source === '/services/best-bridal-makeup-dha')
    expect(dhaBridal?.destination).toBe('https://farwasalon.com/services/bridal')
    const categoryPages = new Set(
      Object.values(CAT_SLUGS).map((slug) => `https://farwasalon.com/services/${slug}`),
    )
    for (const r of redirects) {
      expect(categoryPages.has(r.destination), `${r.source} → ${r.destination}`).toBe(true)
    }
  })

  it('301s non-kept /areas hubs to /areas', () => {
    const redirects = getRetiredAreaRedirects()
    expect(redirects).toHaveLength(NEIGHBORHOODS.length - KEPT_AREA_SLUGS.length)
    expect(redirects.every((r) => r.destination === 'https://farwasalon.com/areas')).toBe(true)
    expect(redirects.some((r) => r.source === '/areas/dha')).toBe(true)
    expect(redirects.some((r) => r.source === '/areas/korangi')).toBe(true)
    expect(redirects.some((r) => r.source === '/areas/pechs-karachi')).toBe(false)
    expect(redirects.some((r) => r.source === '/areas/gulshan')).toBe(false)
  })
})

describe('kept area content + chrome integrity', () => {
  it('every kept area has unique rich content', () => {
    for (const n of getKeptNeighborhoods()) {
      const c = AREA_CONTENT[n.slug]
      expect(c.gettingHere.length, n.slug).toBeGreaterThan(80)
      expect(c.worthTheTrip.length, n.slug).toBeGreaterThan(40)
      expect(n.blurb?.length, n.slug).toBeGreaterThan(80)
    }
  })

  it('footer area links point only at kept /areas pages', () => {
    const built = new Set(getKeptNeighborhoods().map((n) => `/areas/${n.slug}`))
    for (const link of getFooterAreaLinks()) {
      expect(built.has(link.href), `${link.href} is linked but not generated`).toBe(true)
    }
  })

  it('categoryPathForTopService matches live CAT_SLUGS routes', () => {
    for (const svc of TOP_SERVICES) {
      const path = categoryPathForTopService(svc)
      expect(Object.values(CAT_SLUGS)).toContain(path.replace('/services/', ''))
    }
  })

  it('matrix slugs still parse for redirect generation', () => {
    for (const slug of SERVICE_AREA_MATRIX_SLUGS) {
      expect(parseLocationSlug(slug), slug).toBeTruthy()
    }
  })
})
