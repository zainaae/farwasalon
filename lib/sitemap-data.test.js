import { describe, it, expect } from 'vitest'
import {
  getStaticSitemapEntries,
  getDealsLastModified,
  getSitemapIndexEntries,
  getServiceCategorySitemapEntries,
  getBlogSitemapEntries,
} from './sitemap-data.js'

describe('lastmod is a real modification date, not a build timestamp', () => {
  /* The regression this guards: lastmod used to be `new Date()` at build time,
     so every deploy claimed every page had just changed. Google responds to an
     untrustworthy lastmod by ignoring lastmod for the whole site — which costs
     the recrawl that a genuine price change actually needs. */
  it('does not drift when the clock moves but content does not', () => {
    const a = getStaticSitemapEntries(new Date('2026-09-01T00:00:00Z'))
    const b = getStaticSitemapEntries(new Date('2026-11-15T00:00:00Z'))
    expect(a).toEqual(b)
  })

  it('never reports a date in the future', () => {
    const now = new Date('2026-08-03T12:00:00Z')
    const today = '2026-08-03'
    for (const e of getStaticSitemapEntries(now)) {
      expect(e.lastModified <= today, `${e.url} claims ${e.lastModified}`).toBe(true)
    }
  })

  it('moves the deals lastmod when an offer teases, opens, and expires', () => {
    const beforeTease = getDealsLastModified(new Date('2026-07-20T12:00:00Z'))
    expect(getDealsLastModified(new Date('2026-07-29T12:00:00Z'))).toBe('2026-07-29') // teaseFrom
    expect(getDealsLastModified(new Date('2026-08-05T12:00:00Z'))).toBe('2026-08-05') // validFrom
    expect(getDealsLastModified(new Date('2026-08-15T12:00:00Z'))).toBe('2026-08-15') // day after end
    expect(beforeTease < '2026-07-29').toBe(true)
  })

  it('gives each child sitemap the newest lastmod it actually contains', () => {
    const now = new Date('2026-08-06T12:00:00Z')
    const idx = getSitemapIndexEntries(now)
    const staticNewest = getStaticSitemapEntries(now)
      .map((e) => e.lastModified)
      .sort()
      .pop()
    expect(idx.find((s) => s.loc.endsWith('sitemap-static.xml')).lastModified).toBe(staticNewest)
    expect(idx.every((s) => s.lastModified)).toBe(true)
  })
})

describe('sitemap image declarations', () => {
  it('gives every service category an absolute image url with a local caption', () => {
    for (const e of getServiceCategorySitemapEntries()) {
      expect(e.images?.[0].url).toMatch(/^https:\/\/farwasalon\.com\//)
      expect(e.images[0].caption).toMatch(/PECHS Karachi/)
    }
  })

  it('gives every blog post an absolute featured-image url', () => {
    for (const e of getBlogSitemapEntries()) {
      if (!e.images) continue
      expect(e.images[0].url).toMatch(/^https:\/\/farwasalon\.com\//)
      expect(e.images[0].caption.length).toBeGreaterThan(10)
    }
  })
})
