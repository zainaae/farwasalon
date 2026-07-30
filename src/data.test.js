import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import {
  WA_NUMBER, waLink, waLinkBooking,
  formatPrice, formatDuration,
  CAT_SLUGS, slugToCategory,
  SERVICES, CATEGORIES, GALLERY_PHOTOS,
  CAT_META, GALLERY_SHOWCASE_ITEMS,
  filterServiceCategories,
  getDefaultServiceIdForCategory,
  getServiceIdByName,
} from './data.js'
import { BLOG_POSTS } from './blog-data.js'

describe('CAT_META media files', () => {
  const publicDir = join(__dirname, '..', 'public')
  const entries = [
    ...Object.entries(CAT_META).map(([cat, meta]) => ({ name: cat, ...meta })),
    ...GALLERY_SHOWCASE_ITEMS.map((item) => ({ name: item.label, img: item.src, video: item.video })),
  ]

  it.each(entries.filter((e) => e.video))('$name video file exists and is mp4', ({ video }) => {
    expect(video).toMatch(/\.mp4$/)
    expect(existsSync(join(publicDir, video))).toBe(true)
  })

  it.each(entries)('$name poster image exists', ({ img }) => {
    expect(existsSync(join(publicDir, img))).toBe(true)
  })
})

describe('waLink', () => {
  it('uses default message when service is omitted or empty', () => {
    expect(waLink()).toContain(WA_NUMBER)
    expect(waLink('')).toContain(WA_NUMBER)
  })

  it('encodes service name in the prefilled text', () => {
    const u = waLink('Eyebrow Threading')
    expect(u).toContain(`wa.me/${WA_NUMBER}`)
    const textParam = new URL(u).searchParams.get('text')
    expect(textParam).toBeTruthy()
    expect(decodeURIComponent(textParam)).toContain('Eyebrow Threading')
  })
})

describe('waLinkBooking', () => {
  it('includes services and optional meta in the message', () => {
    const u = waLinkBooking(['Cut', 'Colour'], { name: 'Sana', date: 'Jan 1', time: '11:00' })
    const text = decodeURIComponent(new URL(u).searchParams.get('text') ?? '')
    expect(text).toContain('Cut')
    expect(text).toContain('Colour')
    expect(text).toContain('Name: Sana')
    expect(text).toContain('Preferred date: Jan 1')
    expect(text).toContain('Preferred time: 11:00')
    expect(u).toContain(`wa.me/${WA_NUMBER}`)
  })
})

describe('formatPrice', () => {
  it('returns null for null/undefined input', () => {
    expect(formatPrice(null)).toBeNull()
    expect(formatPrice(undefined)).toBeNull()
  })

  it('formats prices under 1000 without k suffix', () => {
    expect(formatPrice(200)).toBe('Rs 200')
    expect(formatPrice(999)).toBe('Rs 999')
  })

  it('formats 1000 as Rs 1,000', () => {
    expect(formatPrice(1000)).toBe('Rs 1,000')
  })

  it('formats prices over 1000 with decimal when needed', () => {
    expect(formatPrice(1500)).toBe('Rs 1,500')
    expect(formatPrice(2800)).toBe('Rs 2,800')
    expect(formatPrice(5500)).toBe('Rs 5,500')
  })

  it('formats even thousands without decimal', () => {
    expect(formatPrice(2000)).toBe('Rs 2,000')
    expect(formatPrice(4000)).toBe('Rs 4,000')
  })
})

describe('formatDuration', () => {
  it('returns null for null/undefined input', () => {
    expect(formatDuration(null)).toBeNull()
    expect(formatDuration(undefined)).toBeNull()
  })

  it('formats minutes under 60 as min', () => {
    expect(formatDuration(10)).toBe('10 min')
    expect(formatDuration(45)).toBe('45 min')
  })

  it('formats exact hours without remainder', () => {
    expect(formatDuration(60)).toBe('1h')
    expect(formatDuration(120)).toBe('2h')
  })

  it('formats hours with remaining minutes', () => {
    expect(formatDuration(90)).toBe('1h 30m')
    expect(formatDuration(75)).toBe('1h 15m')
  })
})

describe('slugToCategory / CAT_SLUGS', () => {
  it('maps every category to a valid slug', () => {
    for (const [category, slug] of Object.entries(CAT_SLUGS)) {
      expect(slug).toMatch(/^[a-z0-9-]+$/)
      expect(category).toBeTruthy()
    }
  })

  it('reverse-maps every slug back to its category', () => {
    for (const [category, slug] of Object.entries(CAT_SLUGS)) {
      expect(slugToCategory(slug)).toBe(category)
    }
  })

  it('returns null for unknown slugs', () => {
    expect(slugToCategory('nonexistent')).toBeNull()
    expect(slugToCategory('')).toBeNull()
  })

  it('has a slug for every service category', () => {
    const serviceCategories = Object.keys(SERVICES)
    for (const cat of serviceCategories) {
      expect(CAT_SLUGS[cat]).toBeDefined()
    }
  })
})

describe('BLOG_POSTS', () => {
  it('every article has a valid slug (lowercase, hyphens, no spaces)', () => {
    for (const post of BLOG_POSTS) {
      expect(post.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    }
  })

  it('every article has required fields', () => {
    for (const post of BLOG_POSTS) {
      expect(post.title).toBeTruthy()
      expect(post.description).toBeTruthy()
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(post.content).toBeInstanceOf(Array)
      expect(post.content.length).toBeGreaterThan(0)
    }
  })

  it('no duplicate slugs', () => {
    const slugs = BLOG_POSTS.map(p => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  /* Nine posts once shipped at 108–236 words. Thin content is the leading cause
     of "Crawled - currently not indexed", it drags quality signals across the
     whole domain, and it is invisible in review because the page looks fine.
     This is the floor that keeps stubs from shipping again. */
  const wordsIn = (post) =>
    post.content.reduce((n, b) => {
      if (b.text) n += b.text.split(/\s+/).filter(Boolean).length
      if (b.items) for (const i of b.items) n += String(i).split(/\s+/).filter(Boolean).length
      return n
    }, 0)

  it('no post is thin enough to be a stub', () => {
    for (const post of BLOG_POSTS) {
      expect(wordsIn(post), `${post.slug} is only ${wordsIn(post)} words`).toBeGreaterThan(380)
    }
  })

  it('readTime is consistent with the actual length', () => {
    for (const post of BLOG_POSTS) {
      const claimed = Number(String(post.readTime).match(/\d+/)?.[0])
      const actual = Math.ceil(wordsIn(post) / 200)
      expect(Math.abs(claimed - actual), `${post.slug} claims ${claimed} min, reads ~${actual}`).toBeLessThanOrEqual(2)
    }
  })

  it('lastModified is never before the publish date', () => {
    for (const post of BLOG_POSTS) {
      if (!post.lastModified) continue
      expect(post.lastModified >= post.date, `${post.slug}`).toBe(true)
    }
  })
})

describe('GALLERY_PHOTOS', () => {
  it('has at least one entry', () => {
    expect(GALLERY_PHOTOS.length).toBeGreaterThan(0)
  })

  it('every entry has src and label fields', () => {
    for (const photo of GALLERY_PHOTOS) {
      expect(photo.src).toBeTruthy()
      expect(photo.label).toBeTruthy()
    }
  })

  it('every src starts with / (relative path)', () => {
    for (const photo of GALLERY_PHOTOS) {
      expect(photo.src).toMatch(/^\//)
    }
  })

  it('every src has an image extension', () => {
    for (const photo of GALLERY_PHOTOS) {
      expect(photo.src).toMatch(/\.(jpg|jpeg|png|gif|webp|svg)$/)
    }
  })
})

describe('filterServiceCategories', () => {
  const cats = Object.keys(SERVICES)

  it('returns all categories for All', () => {
    expect(filterServiceCategories(cats, 'All')).toEqual(cats)
  })

  it('filters to a single matching category', () => {
    expect(filterServiceCategories(cats, 'Threading')).toEqual(['Threading'])
  })

  it('groups waxing categories under Waxing', () => {
    const wax = filterServiceCategories(cats, 'Waxing')
    expect(wax.length).toBeGreaterThan(1)
    expect(wax.every((c) => /wax/i.test(c))).toBe(true)
  })
})

describe('service id helpers', () => {
  it('getDefaultServiceIdForCategory returns the first bookable id', () => {
    const id = getDefaultServiceIdForCategory('Threading')
    expect(id).toBe(SERVICES.Threading[0].id)
  })

  it('getServiceIdByName finds a known service', () => {
    const id = getServiceIdByName('Eyebrow Threading')
    expect(id).toBeTruthy()
    expect(SERVICES.Threading.some((s) => s.id === id)).toBe(true)
  })

  it('getServiceIdByName returns null for unknown names', () => {
    expect(getServiceIdByName('Not A Real Service')).toBeNull()
  })
})
