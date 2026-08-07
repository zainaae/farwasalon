/**
 * Every number the site states must be true.
 *
 * This site's entire position is that its figures are checkable — competitors
 * are call-for-price, and the published menu is the differentiator. That only
 * holds if the numbers are right. One day of auditing turned up a Gold Facial
 * priced at Rs 2,500 that did not exist, full-face threading advertised at
 * Rs 500 against a menu price of Rs 1,200, a haircut sold at Rs 1,500 that was
 * actually a blowdry, "19+" printed for exactly 19 reviews, "102+" for exactly
 * 102 services, and a competitor rate of "Rs 80,000+" that verified research
 * put at Rs 30,000–45,000.
 *
 * These tests exist so the next one fails in CI instead of at the counter.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SERVICES, YEARS_ACTIVE, FOUNDING_YEAR, MONTHLY_APPOINTMENTS } from './data.js'
import { CAT_SEO } from './cat-seo-content.js'
import { CAT_META_DESC } from './cat-meta-desc.js'
import { FAQS } from './faq-data.js'
import { AREA_CONTENT } from './area-content.js'
import { DEALS } from './deals-data.js'
import { BLOG_POSTS } from './blog-data.js'
import { GOOGLE_GBP_STATS } from './google-reviews-data.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const ALL = Object.values(SERVICES).flat()
const MENU_PRICES = new Set(ALL.map((s) => s.pricePkr).filter(Boolean))

/** Prices that are deliberately not ours — market context, hedged in the copy.
 *  Anything here must be a range or an "around", never a flat assertion about a
 *  named business, and must be traceable to research rather than invented. */
const MARKET_CONTEXT_PRICES = new Set([
  4999, 6999, // at-home full-body waxing services, quoted "around" in the honey wax body copy
  30000, 45000, // verified premium Karachi bridal band, stated unnamed
  23000, 33000, 48000, // best-known-parlour bridal bands from published price-tracker lists
  50000, 150000, // top-end celebrity range, hedged with "can run"
  12000, 6000, 3500, // market entry points quoted as ranges, not as our prices
])

/** Figures derived by arithmetic in the copy rather than taken from the menu. */
const DERIVED_PRICES = new Set([
  14400, // 12 months x the Rs 1,200 gap between honey and Rica full body
  3200, // the split honey/Rica combination, stated as "around"
])

/* Two traps. "Rs 8k" is shorthand used in titles — without excluding the k
   suffix the regex reads it as Rs 8. And a case-insensitive match on "Rs"
   hits the "rs" inside words like "shoulders," where the trailing comma
   satisfies a digit-or-comma class and yields a phantom Rs 0. Hence the word
   boundary, a required leading digit, and no /i flag. */
const pricesIn = (text) =>
  [...String(text).matchAll(/Rs\s?(\d[\d,]*)(k)?/g)].flatMap((m) =>
    m[2] ? [] : [Number(m[1].replace(/,/g, ''))],
  )

describe('every price the site quotes exists on the menu', () => {
  const sources = {
    'CAT_SEO titles': Object.values(CAT_SEO).map((e) => e.title).join(' '),
    'CAT_SEO descriptions': Object.values(CAT_SEO).map((e) => e.metaDesc).join(' '),
    'category long descriptions': Object.values(CAT_META_DESC ?? {}).join(' '),
    FAQs: JSON.stringify(FAQS),
    'area pages': JSON.stringify(AREA_CONTENT),
    deals: JSON.stringify(DEALS),
    'blog posts': JSON.stringify(BLOG_POSTS),
  }

  for (const [label, text] of Object.entries(sources)) {
    it(`${label} quote only real prices`, () => {
      const unknown = [...new Set(pricesIn(text))].filter(
        (p) => !MENU_PRICES.has(p) && !MARKET_CONTEXT_PRICES.has(p) && !DERIVED_PRICES.has(p),
      )
      expect(unknown, `not on the menu: ${unknown.map((p) => `Rs ${p.toLocaleString()}`).join(', ')}`).toEqual([])
    })
  }
})

describe('counts the site displays match what it actually has', () => {
  it('102 services across 13 categories', () => {
    expect(ALL).toHaveLength(102)
    expect(Object.keys(SERVICES)).toHaveLength(13)
  })

  it('every service carries a price — the published-menu claim depends on it', () => {
    for (const s of ALL) expect(s.pricePkr, s.name).toBeTruthy()
  })

  it('category counts named in copy are real', () => {
    // "11 professional facials" — CAT_SEO Facials description
    expect(SERVICES['Facials']).toHaveLength(11)
    // "18 Options" — CAT_SEO Nails title
    expect(SERVICES['Nails']).toHaveLength(18)
  })

  it('years active is computed, never hardcoded, and matches the founding year', () => {
    expect(YEARS_ACTIVE).toBe(new Date().getFullYear() - FOUNDING_YEAR)
    expect(FOUNDING_YEAR).toBe(2008)
  })

  it('review figures come from the GBP data, not from prose', () => {
    expect(GOOGLE_GBP_STATS.reviewCount).toBeGreaterThan(0)
    expect(GOOGLE_GBP_STATS.rating).toBeGreaterThan(0)
    expect(GOOGLE_GBP_STATS.rating).toBeLessThanOrEqual(5)
  })

  it('the monthly appointment figure is a round owner-supplied number, stated with a +', () => {
    expect(MONTHLY_APPOINTMENTS).toBeGreaterThan(0)
    expect(MONTHLY_APPOINTMENTS % 100).toBe(0)
  })
})

describe('no exact count is inflated with a plus sign', () => {
  /* "19+ reviews" for exactly 19, and "102+" for exactly 102, both shipped —
     inside sentences promising honest figures. A "+" belongs on an estimate,
     never on a number the code counts. */
  it('copy does not add "+" to the service or review counts', () => {
    const root = join(__dirname, '..')
    const surfaceFiles = [
      'app/components/salon-local-block.jsx',
      'app/bridal/page.jsx',
      'app/beauty-salon-karachi/page.jsx',
    ].map((rel) => readFileSync(join(root, rel), 'utf8'))

    const copy = [
      Object.values(CAT_SEO).map((e) => `${e.title} ${e.metaDesc}`).join(' '),
      Object.values(CAT_META_DESC ?? {}).join(' '),
      JSON.stringify(FAQS),
      ...surfaceFiles,
    ].join(' ')
    expect(copy, 'says "102+" for exactly 102 services').not.toMatch(/\b102\s*\+/)
    expect(copy, `says "${GOOGLE_GBP_STATS.reviewCount}+" for an exact review count`).not.toMatch(
      new RegExp(`\\b${GOOGLE_GBP_STATS.reviewCount}\\s*\\+\\s*(google\\s*)?review`, 'i'),
    )
    /* Template form that appends "+" after the live GBP count. */
    expect(copy, 'appends "+" to rating.reviewCount').not.toMatch(
      /reviewCount\}\s*\+\s*reviews/i,
    )
  })
})

describe('hard-numbers band uses live stated figures', () => {
  it('home HardNumbersBand references enforceable sources, not invented percents', () => {
    const home = readFileSync(join(__dirname, '..', 'app', 'home-below-fold.jsx'), 'utf8')
    expect(home).toMatch(/hard-numbers-band|HardNumbersBand/)
    expect(home).toMatch(/ALL_SERVICES\.length/)
    expect(home).toMatch(/GOOGLE_GBP_STATS/)
    expect(home).toMatch(/YEARS_ACTIVE/)
    expect(home).toMatch(/MONTHLY_APPOINTMENTS/)
    expect(home).toMatch(/SALON_HOURS/)
    expect(home, 'must not invent Quoti-style outside-hours %').not.toMatch(/40\s*%/)
  })
})

describe('category price floors quoted in copy are honest', () => {
  /* A floor may legitimately describe one named service ("polish from Rs 900")
     rather than the whole category. What it may never do is claim a floor lower
     than anything on the menu — that is the bait that sends someone in
     expecting a price that does not exist. */
  it('no quoted floor undercuts the real cheapest price in its category', () => {
    for (const [category, entry] of Object.entries(CAT_SEO)) {
      const menuMin = Math.min(...SERVICES[category].map((s) => s.pricePkr))
      for (const text of [entry.title, entry.metaDesc]) {
        for (const [, raw] of String(text).matchAll(/from Rs ([\d,]+)/gi)) {
          const claimed = Number(raw.replace(/,/g, ''))
          expect(
            claimed >= menuMin,
            `${category} advertises "from Rs ${claimed.toLocaleString()}" but its cheapest is Rs ${menuMin.toLocaleString()}`,
          ).toBe(true)
        }
      }
    }
  })
})
