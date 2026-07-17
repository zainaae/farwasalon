import { describe, it, expect } from 'vitest'
import { CAT_SEO, CAT_FAQS } from './cat-seo-content.js'
import { SERVICES } from './data.js'

describe('CAT_SEO', () => {
  it('covers every service category with unique title and metaDesc', () => {
    const categories = Object.keys(SERVICES)
    const titles = new Set()
    const descs = new Set()

    for (const cat of categories) {
      const seo = CAT_SEO[cat]
      expect(seo, `missing CAT_SEO for ${cat}`).toBeTruthy()
      expect(seo.title?.length).toBeGreaterThan(20)
      expect(seo.title.length).toBeLessThanOrEqual(55)
      expect(seo.metaDesc?.length).toBeGreaterThan(80)
      expect(seo.metaDesc.length).toBeLessThanOrEqual(170)
      expect(titles.has(seo.title)).toBe(false)
      expect(descs.has(seo.metaDesc)).toBe(false)
      titles.add(seo.title)
      descs.add(seo.metaDesc)
    }
  })

  it('includes a price floor cue in every title', () => {
    for (const seo of Object.values(CAT_SEO)) {
      expect(seo.title).toMatch(/Rs\s/i)
    }
  })
})

describe('CAT_FAQS', () => {
  it('keeps FAQ answers for high-intent categories', () => {
    for (const key of ['Threading', 'Facials', 'Bridal', 'Eyebrow Tattoo']) {
      expect(CAT_FAQS[key]?.length).toBeGreaterThan(2)
    }
  })
})
