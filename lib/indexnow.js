import { SITEMAP_BASE } from './sitemap-data.js'
import { CAT_SLUGS } from '../src/data.js'
import { BLOG_POSTS } from '../src/blog-data.js'
import { PRIORITY_LOCATION_SLUGS } from './location-links.js'

export const INDEXNOW_HOST = 'farwasalon.com'
export const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'farwa-salon-indexnow'
export const INDEXNOW_KEY_LOCATION = `${SITEMAP_BASE}/${INDEXNOW_KEY}.txt`

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

/** Top URLs to ping after deploy (cap 50). */
export function getIndexNowUrls() {
  /* Order matters under the 50-URL cap: AI / Azadi / money hubs + blogs before
     location fill so Freedom Deal / nails / money posts are never crowded out
     (GSC AI Features was still attributing impressions to /azadi-sale). */
  const hubs = [
    `${SITEMAP_BASE}/freedom-deal`,
    `${SITEMAP_BASE}/deals`,
    `${SITEMAP_BASE}/`,
    `${SITEMAP_BASE}/prices`,
    `${SITEMAP_BASE}/services/nails`,
    `${SITEMAP_BASE}/services/eyebrow-tattoo`,
    `${SITEMAP_BASE}/bridal`,
    `${SITEMAP_BASE}/services/bridal`,
    `${SITEMAP_BASE}/beauty-salon-karachi`,
    `${SITEMAP_BASE}/services`,
    `${SITEMAP_BASE}/book`,
    `${SITEMAP_BASE}/contact`,
    `${SITEMAP_BASE}/gallery`,
    `${SITEMAP_BASE}/faq`,
  ]

  /* Most-recently-changed posts first. Money blogs stay in the ping even when
     lastModified falls outside the top-12 window. */
  const byRecency = [...BLOG_POSTS].sort((a, b) =>
    (b.lastModified || b.date).localeCompare(a.lastModified || a.date),
  )
  const MONEY_BLOG_SLUGS = [
    'eyebrow-microblading-karachi-guide',
    'manicure-pedicure-price-list-karachi',
    'best-bridal-makeup-packages-karachi-2026',
    'haircut-blowdry-hair-colour-cost-karachi',
  ]
  const forcedMoney = MONEY_BLOG_SLUGS.map((slug) =>
    BLOG_POSTS.find((p) => p.slug === slug),
  ).filter(Boolean)
  const seen = new Set()
  let blogBatch = []
  for (const post of [...forcedMoney, ...byRecency]) {
    if (seen.has(post.slug)) continue
    seen.add(post.slug)
    blogBatch.push(post)
    if (blogBatch.length >= 12 + forcedMoney.length) break
  }
  blogBatch = blogBatch
    .slice(0, 14)
    .sort((a, b) => (b.lastModified || b.date).localeCompare(a.lastModified || a.date))

  const urls = [
    ...hubs,
    ...blogBatch.map((p) => `${SITEMAP_BASE}/blog/${p.slug}`),
  ]
  for (const slug of Object.values(CAT_SLUGS)) {
    urls.push(`${SITEMAP_BASE}/services/${slug}`)
  }
  for (const slug of PRIORITY_LOCATION_SLUGS) {
    urls.push(`${SITEMAP_BASE}/services/${slug}`)
  }
  return [...new Set(urls)].slice(0, 50)
}

/**
 * Submit URLs to Bing IndexNow.
 * @returns {Promise<{ ok: boolean, status: number, body: string }>}
 */
export async function submitIndexNow(urlList = getIndexNowUrls()) {
  const payload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList,
  }
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  })
  const body = await res.text()
  return { ok: res.ok, status: res.status, body }
}
