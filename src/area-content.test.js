import { describe, it, expect } from 'vitest'
import { AREA_CONTENT } from './area-content.js'
import { NEIGHBORHOODS } from './location-seo.js'

/* The retired service x area matrix failed because ten pages shared one
   template — 84-91% identical, and Google folded 48 of them. These pages only
   work if each one is genuinely about its own area, so the tests check for
   distinctness rather than presence. */
describe('AREA_CONTENT', () => {
  const entries = Object.entries(AREA_CONTENT)

  it('covers a real neighbourhood for every entry', () => {
    const slugs = new Set(NEIGHBORHOODS.map((n) => n.slug))
    for (const [slug] of entries) expect(slugs.has(slug), `unknown area ${slug}`).toBe(true)
  })

  it('has every prose field filled with something substantial', () => {
    for (const [slug, c] of entries) {
      for (const field of ['gettingHere', 'worthTheTrip', 'timing']) {
        expect(c[field]?.length, `${slug}.${field}`).toBeGreaterThan(120)
      }
      for (const field of ['distanceKm', 'driveTime', 'route']) {
        expect(c[field]?.length, `${slug}.${field}`).toBeGreaterThan(3)
      }
    }
  })

  it('shares no duplicated sentence between any two areas', () => {
    const seen = new Map()
    for (const [slug, c] of entries) {
      for (const field of ['gettingHere', 'worthTheTrip', 'timing', 'route']) {
        for (const sentence of String(c[field]).split(/(?<=\.)\s+/)) {
          const key = sentence.trim().toLowerCase()
          if (key.length < 30) continue
          expect(seen.has(key), `"${key.slice(0, 50)}…" appears in ${seen.get(key)} and ${slug}`).toBe(false)
          seen.set(key, slug)
        }
      }
    }
  })

  it('keeps prose overlap between any two areas below the level that got folded', () => {
    const words = (c) =>
      new Set(`${c.gettingHere} ${c.worthTheTrip} ${c.timing}`.toLowerCase().match(/[a-z]+/g))
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const a = words(entries[i][1])
        const b = words(entries[j][1])
        const overlap = [...a].filter((w) => b.has(w)).length / new Set([...a, ...b]).size
        expect(overlap, `${entries[i][0]} vs ${entries[j][0]}`).toBeLessThan(0.45)
      }
    }
  })
})
