import { describe, it, expect } from 'vitest'
import { CAT_SEO, CAT_FAQS, CAT_RELATED, CAT_PAGE_BLOCKS } from './cat-seo-content.js'
import { SERVICES, CAT_SLUGS } from './data.js'

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

  /* A price in the SERP title lifts CTR, so it is the default. Bridal is a
     documented exception: its cheapest item is the Rs 8,000 trial while the
     package is Rs 25,000, so a "from Rs 8,000" title advertised a number the
     page does not sell. Accuracy wins over the tactic. Any future exemption
     needs a reason here, not a quiet deletion of the assertion. */
  const PRICE_CUE_EXEMPT = {
    Bridal: 'cheapest item is the trial, not the package — "from" would mislead',
  }

  it('includes a price floor cue in every title, or a documented reason not to', () => {
    for (const [category, seo] of Object.entries(CAT_SEO)) {
      if (PRICE_CUE_EXEMPT[category]) {
        expect(seo.title, `${category} is exempt but still shows a price`).not.toMatch(/Rs\s/i)
        continue
      }
      expect(seo.title, category).toMatch(/Rs\s/i)
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
    for (const key of ['Threading', 'Facials', 'Bridal', 'Eyebrow Tattoo', 'Honey Wax', 'Rica Wax']) {
      expect(CAT_FAQS[key]?.length).toBeGreaterThan(2)
    }
  })
})

/* "Hygiene block" shipped as a visible <h2> on /services/threading — an
   internal editorial label rendered to users on a page earning 106 impressions.
   Headings are user-facing copy, so they have to read like it. */
describe('CAT_PAGE_BLOCKS headings are copy, not editorial labels', () => {
  const LABEL_WORDS = /\b(block|section|placeholder|tbd|todo|draft|wip|lorem)\b/i

  it('covers every service category', () => {
    for (const category of Object.keys(CAT_SLUGS)) {
      expect(
        CAT_PAGE_BLOCKS[category]?.length,
        `${category} is missing CAT_PAGE_BLOCKS`,
      ).toBeGreaterThan(0)
    }
  })

  it('no heading contains an editorial label word', () => {
    for (const [category, blocks] of Object.entries(CAT_PAGE_BLOCKS)) {
      for (const b of blocks) {
        if (!/^h[23]$/.test(b.type)) continue
        expect(b.text, `${category}: "${b.text}" reads like an internal label`).not.toMatch(LABEL_WORDS)
        expect(b.text.length, `${category}: "${b.text}" is too short to be a real heading`).toBeGreaterThan(8)
      }
    }
  })
})

/* Titles quote prices; a wrong one sends a customer in expecting the wrong bill.
   "Face Rs 100" shipped on the threading title while Full Face Threading is
   Rs 1,200 — Rs 100 is chin/lower-lip. Every price in a title must exist on the
   menu for that category. */
describe('prices quoted in SERP titles exist on the menu', () => {
  it('every Rs figure in a title matches a real service price in that category', () => {
    for (const [category, seo] of Object.entries(CAT_SEO)) {
      const quoted = [...seo.title.matchAll(/Rs\s?([\d,]+)/gi)].map((m) => Number(m[1].replace(/,/g, '')))
      if (!quoted.length) continue
      const menu = new Set((SERVICES[category] ?? []).map((s) => s.pricePkr))
      for (const price of quoted) {
        expect(menu.has(price), `${category} title quotes Rs ${price}, absent from its menu`).toBe(true)
      }
    }
  })
})
