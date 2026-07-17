import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import {
  WA_NUMBER, waLink, waLinkBooking,
  formatPrice, formatDuration,
  CAT_SLUGS, slugToCategory,
  SERVICES, CATEGORIES, GALLERY_PHOTOS,
  CAT_META, GALLERY_SHOWCASE_ITEMS,
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

  it('formats 1000 as Rs 1k', () => {
    expect(formatPrice(1000)).toBe('Rs 1k')
  })

  it('formats prices over 1000 with decimal when needed', () => {
    expect(formatPrice(1500)).toBe('Rs 1.5k')
    expect(formatPrice(2800)).toBe('Rs 2.8k')
    expect(formatPrice(5500)).toBe('Rs 5.5k')
  })

  it('formats even thousands without decimal', () => {
    expect(formatPrice(2000)).toBe('Rs 2k')
    expect(formatPrice(4000)).toBe('Rs 4k')
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
