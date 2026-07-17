import { describe, it, expect } from 'vitest'
import { CAT_SEO, CAT_FAQS, CAT_RELATED } from './cat-seo-content.js'
import { SERVICES } from './data.js'

describe('CAT_SEO', () => {
  it('covers every service category with unique title, h1, and metaDesc', () => {
    const categories = Object.keys(SERVICES)
    const titles = new Set()
    const descs = new Set()
    const h1s = new Set()

    for (const cat of categories) {
      const seo = CAT_SEO[cat]
      expect(seo, `missing CAT_SEO for ${cat}`).toBeTruthy()
      expect(seo.title?.length).toBeGreaterThan(20)
      expect(seo.title.length).toBeLessThanOrEqual(55)
      expect(seo.h1?.length).toBeGreaterThan(15)
      expect(seo.h1).toMatch(/Karachi|PECHS/)
      expect(seo.metaDesc?.length).toBeGreaterThan(80)
      expect(seo.metaDesc.length).toBeLessThanOrEqual(170)
      expect(titles.has(seo.title)).toBe(false)
      expect(descs.has(seo.metaDesc)).toBe(false)
      expect(h1s.has(seo.h1)).toBe(false)
      titles.add(seo.title)
      descs.add(seo.metaDesc)
      h1s.add(seo.h1)
    }
  })

  it('includes a price floor cue in every title', () => {
    for (const seo of Object.values(CAT_SEO)) {
      expect(seo.title).toMatch(/Rs\s/i)
    }
  })

  it('defines related Tier-A links for every category', () => {
    for (const cat of Object.keys(SERVICES)) {
      expect(CAT_RELATED[cat]?.length).toBeGreaterThanOrEqual(3)
      for (const related of CAT_RELATED[cat]) {
        expect(SERVICES[related], `bad related ${related} for ${cat}`).toBeTruthy()
      }
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
