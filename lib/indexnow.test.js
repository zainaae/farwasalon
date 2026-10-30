import { describe, it, expect } from 'vitest'
import { BLOG_POSTS } from '../src/blog-data.js'
import { getIndexNowUrls, INDEXNOW_KEY_LOCATION } from './indexnow.js'

describe('indexnow', () => {
  it('includes hub and home URLs', () => {
    const urls = getIndexNowUrls(new Date('2026-10-30T12:00:00Z'))
    expect(urls).toContain('https://farwasalon.com/')
    expect(urls).toContain('https://farwasalon.com/beauty-salon-karachi')
    expect(urls).toContain('https://farwasalon.com/bridal')
    expect(urls).toContain('https://farwasalon.com/prices')
    expect(urls).toContain('https://farwasalon.com/services/eyebrow-tattoo')
    expect(urls).toContain('https://farwasalon.com/blog/eyebrow-microblading-karachi-guide')
    expect(urls).toContain('https://farwasalon.com/blog/manicure-pedicure-price-list-karachi')
    expect(urls).not.toContain('https://farwasalon.com/freedom-deal')
    expect(urls).not.toContain('https://farwasalon.com/deals')
    expect(urls).toContain('https://farwasalon.com/services/nails')
    expect(urls).toContain('https://farwasalon.com/faq')
    expect(urls.length).toBeLessThanOrEqual(50)
  })

  it('includes /deals in the ping only while offers are live or teased', () => {
    const live = getIndexNowUrls(new Date('2026-08-10T12:00:00Z'))
    const ended = getIndexNowUrls(new Date('2026-10-30T12:00:00Z'))
    expect(live).toContain('https://farwasalon.com/deals')
    expect(live.indexOf('https://farwasalon.com/deals')).toBeLessThan(
      live.indexOf('https://farwasalon.com/services'),
    )
    expect(ended).not.toContain('https://farwasalon.com/deals')
  })

  it('key location matches public file path', () => {
    expect(INDEXNOW_KEY_LOCATION).toBe('https://farwasalon.com/farwa-salon-indexnow.txt')
  })
})

describe('recently-changed posts are always in the ping', () => {
  /* Position ordering once dropped a rewritten post below the 50-URL cap
     because newer entries were prepended ahead of it. Recency ordering is the
     thing that makes "edit a post, it gets pinged" reliably true. */
  it('orders blog URLs by modification date, newest first', () => {
    const urls = getIndexNowUrls()
    const slugs = urls.filter((u) => u.includes('/blog/')).map((u) => u.split('/blog/')[1])
    const dateOf = (slug) => {
      const p = BLOG_POSTS.find((b) => b.slug === slug)
      return p.lastModified || p.date
    }
    const dates = slugs.map(dateOf)
    expect([...dates].sort().reverse()).toEqual(dates)
  })

  it('includes every post modified on the most recent edit date', () => {
    const newest = BLOG_POSTS.map((p) => p.lastModified || p.date).sort().pop()
    const justEdited = BLOG_POSTS.filter((p) => (p.lastModified || p.date) === newest)
    const urls = getIndexNowUrls()
    for (const p of justEdited) {
      expect(urls, `${p.slug} missing from ping`).toContain(`https://farwasalon.com/blog/${p.slug}`)
    }
  })
})
