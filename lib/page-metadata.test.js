import { describe, it, expect } from 'vitest'
import { pageSocialMeta } from './page-metadata.js'

describe('pageSocialMeta', () => {
  it('mirrors title and description into Open Graph and Twitter', () => {
    const meta = pageSocialMeta({
      title: 'Threading PECHS — From Rs 100 | Farwa',
      description: 'Eyebrow threading from Rs 100 in PECHS Karachi.',
      path: '/services/threading',
      image: '/threading.jpg',
    })

    expect(meta.openGraph.title).toBe('Threading PECHS — From Rs 100 | Farwa')
    expect(meta.openGraph.description).toBe('Eyebrow threading from Rs 100 in PECHS Karachi.')
    expect(meta.openGraph.url).toContain('/services/threading')
    expect(meta.openGraph.type).toBe('website')
    expect(meta.twitter.title).toBe(meta.openGraph.title)
    expect(meta.twitter.description).toBe(meta.openGraph.description)
  })

  it('supports article Open Graph type for blog posts', () => {
    const meta = pageSocialMeta({
      title: 'Microblading Karachi Cost — From Rs 20,000 | Farwa',
      description: 'Cost and healing guide.',
      path: '/blog/eyebrow-microblading-karachi-guide',
      type: 'article',
    })
    expect(meta.openGraph.type).toBe('article')
  })
})
