/** Extract FAQ pairs from blog post content blocks.
 *  Posts write FAQs as `h3` items starting "Q:" followed by a `p` starting
 *  "A:" — this mirrors them into FAQPage JSON-LD so question searches can
 *  land on the article. Markdown links are flattened to plain text. */

const stripMd = (text) =>
  text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()

export function extractFaqPairs(content = []) {
  const pairs = []
  for (let i = 0; i < content.length - 1; i++) {
    const q = content[i]
    const a = content[i + 1]
    if (
      q?.type === 'h3' && /^Q:/.test(q.text || '') &&
      a?.type === 'p' && /^A:/.test(a.text || '')
    ) {
      pairs.push({
        question: stripMd(q.text.replace(/^Q:\s*/, '')),
        answer: stripMd(a.text.replace(/^A:\s*/, '')),
      })
    }
  }
  return pairs
}

/** FAQPage schema for a post, or null when it has fewer than 2 Q&As. */
export function buildBlogFaqSchema(post) {
  const pairs = extractFaqPairs(post?.content)
  if (pairs.length < 2) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pairs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }
}
