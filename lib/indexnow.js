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
  const urls = [
    `${SITEMAP_BASE}/`,
    `${SITEMAP_BASE}/beauty-salon-karachi`,
    `${SITEMAP_BASE}/bridal`,
    `${SITEMAP_BASE}/prices`,
    `${SITEMAP_BASE}/services`,
    `${SITEMAP_BASE}/book`,
    `${SITEMAP_BASE}/contact`,
    `${SITEMAP_BASE}/gallery`,
    `${SITEMAP_BASE}/faq`,
  ]
  for (const slug of Object.values(CAT_SLUGS)) {
    urls.push(`${SITEMAP_BASE}/services/${slug}`)
  }
  /* Most-recently-changed posts first, not whatever sits at the top of the
     array. Position ordering meant a post could be rewritten and still miss the
     50-URL cap because newer files happened to be prepended ahead of it — which
     is exactly what happened to the consolidated wax guide. Sorting by real
     modification date means whatever you actually edited is what gets pinged. */
  const byRecency = [...BLOG_POSTS].sort((a, b) =>
    (b.lastModified || b.date).localeCompare(a.lastModified || a.date),
  )
  for (const post of byRecency.slice(0, 12)) {
    urls.push(`${SITEMAP_BASE}/blog/${post.slug}`)
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
