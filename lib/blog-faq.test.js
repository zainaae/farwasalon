import { describe, it, expect } from 'vitest'
import { extractFaqPairs, buildBlogFaqSchema } from './blog-faq.js'
import { BLOG_POSTS } from '../src/blog-data.js'

describe('extractFaqPairs', () => {
  it('pairs Q: h3 blocks with the following A: paragraph and strips markdown', () => {
    const content = [
      { type: 'h2', text: 'Frequently Asked Questions' },
      { type: 'h3', text: 'Q: How much is threading?' },
      { type: 'p', text: 'A: From Rs 200 — see our [threading page](/services/threading).' },
      { type: 'h3', text: 'Q: Do you take walk-ins?' },
      { type: 'p', text: 'A: Yes, when slots are available.' },
    ]
    expect(extractFaqPairs(content)).toEqual([
      { question: 'How much is threading?', answer: 'From Rs 200 — see our threading page.' },
      { question: 'Do you take walk-ins?', answer: 'Yes, when slots are available.' },
    ])
  })

  it('ignores non-FAQ headings and unpaired blocks', () => {
    expect(extractFaqPairs([{ type: 'h3', text: 'Q: Orphan?' }])).toEqual([])
    expect(extractFaqPairs([{ type: 'h3', text: 'Not a question' }, { type: 'p', text: 'A: stray' }])).toEqual([])
    expect(extractFaqPairs()).toEqual([])
  })
})

describe('buildBlogFaqSchema', () => {
  it('returns null for posts with fewer than 2 Q&As', () => {
    expect(buildBlogFaqSchema({ content: [] })).toBeNull()
  })

  it('builds valid FAQPage schema for every blog post that has Q&As', () => {
    let postsWithFaq = 0
    for (const post of BLOG_POSTS) {
      const schema = buildBlogFaqSchema(post)
      if (!schema) continue
      postsWithFaq++
      expect(schema['@type']).toBe('FAQPage')
      for (const entity of schema.mainEntity) {
        expect(entity.name.length).toBeGreaterThan(8)
        expect(entity.acceptedAnswer.text.length).toBeGreaterThan(20)
        expect(entity.name).not.toMatch(/^Q:/)
        expect(entity.acceptedAnswer.text).not.toMatch(/^A:/)
        expect(entity.acceptedAnswer.text).not.toMatch(/\]\(/)
      }
    }
    // Most posts carry an FAQ section — regression-guard the coverage.
    expect(postsWithFaq).toBeGreaterThanOrEqual(2)
  })
})
