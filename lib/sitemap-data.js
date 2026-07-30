import { CAT_SLUGS, CAT_META } from '../src/data.js'
import { BLOG_POSTS } from '../src/blog-data.js'
import { DEALS } from '../src/deals-data.js'
import { PRIORITY_LOCATION_SLUGS } from '../src/location-seo.js'

export const SITEMAP_BASE = 'https://farwasalon.com'
export const SITE_LAUNCH = '2026-05-14'

/* Real content-modification dates, not build timestamps.
 *
 * These used to be `new Date()` at build time, which stamped every deploy as a
 * fresh edit. Google's guidance is explicit that <lastmod> must be the actual
 * last modification date, and that a sitemap whose lastmod is not trustworthy
 * gets its lastmod ignored for the whole site. So the rolling date was not a
 * neutral white lie — it was spending the one signal that tells Google to come
 * back when the price list genuinely changes.
 *
 * Seeded from git history of the files that own each surface. Bump the constant
 * in the same commit that changes the content it describes. */
export const LAST_SERVICE_UPDATE = '2026-07-17' // src/data.js — menu + prices
export const LAST_CONTENT_UPDATE = '2026-07-28' // src/faq-data.js — FAQ copy

const nextDay = (ymd) => {
  const d = new Date(`${ymd}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

const latestPast = (dates, today, fallback) => {
  const past = dates.filter((d) => d && d <= today).sort()
  return past.length ? past[past.length - 1] : fallback
}

/** The deals surfaces genuinely change on the days the deal set changes — when
 *  an offer starts teasing, opens, or stops being claimable. The most recent of
 *  those that has already happened is the honest lastmod, and it needs no
 *  manual bumping because the dates are already in the deal data. */
export function getDealsLastModified(now = new Date()) {
  const today = now.toISOString().slice(0, 10)
  const events = []
  for (const d of DEALS) {
    if (d.teaseFrom) events.push(d.teaseFrom)
    if (d.validFrom) events.push(d.validFrom)
    if (d.validUntil) events.push(nextDay(d.validUntil))
  }
  return latestPast(events, today, SITE_LAUNCH)
}

export function getLatestBlogDate() {
  return BLOG_POSTS.reduce(
    (max, p) => ((p.lastModified || p.date) > max ? p.lastModified || p.date : max),
    BLOG_POSTS[0]?.date ?? LAST_CONTENT_UPDATE,
  )
}

/** Newest date across everything the homepage actually surfaces. */
export function getHomeLastModified(now = new Date()) {
  return [LAST_SERVICE_UPDATE, getDealsLastModified(now), getLatestBlogDate()].sort().pop()
}

export function getStaticSitemapEntries(now = new Date()) {
  const latestBlogDate = getLatestBlogDate()
  const deals = getDealsLastModified(now)
  const home = getHomeLastModified(now)
  return [
    { url: `${SITEMAP_BASE}/`, lastModified: home, changeFrequency: 'weekly', priority: 1.0 },
    {
      url: `${SITEMAP_BASE}/beauty-salon-karachi`,
      lastModified: LAST_SERVICE_UPDATE,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${SITEMAP_BASE}/bridal`,
      lastModified: LAST_SERVICE_UPDATE,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    { url: `${SITEMAP_BASE}/services`, lastModified: LAST_SERVICE_UPDATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITEMAP_BASE}/prices`, lastModified: LAST_SERVICE_UPDATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITEMAP_BASE}/deals`, lastModified: deals, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITEMAP_BASE}/freedom-deal`, lastModified: deals, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITEMAP_BASE}/gallery`, lastModified: SITE_LAUNCH, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITEMAP_BASE}/about`, lastModified: SITE_LAUNCH, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITEMAP_BASE}/contact`, lastModified: SITE_LAUNCH, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITEMAP_BASE}/faq`, lastModified: LAST_CONTENT_UPDATE, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITEMAP_BASE}/book`, lastModified: SITE_LAUNCH, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITEMAP_BASE}/blog`, lastModified: latestBlogDate, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITEMAP_BASE}/privacy`, lastModified: '2026-05-14', changeFrequency: 'yearly', priority: 0.3 },
  ]
}

export function getServiceCategorySitemapEntries() {
  return Object.entries(CAT_SLUGS).map(([category, slug]) => {
    const img = CAT_META[category]?.img
    return {
      url: `${SITEMAP_BASE}/services/${slug}`,
      lastModified: LAST_SERVICE_UPDATE,
      changeFrequency: 'weekly',
      priority: 0.8,
      /* Service photography is the only original imagery on the site — worth
         declaring so it can surface in Google Images for "<service> Karachi". */
      images: img
        ? [{ url: `${SITEMAP_BASE}${img}`, caption: `${category} at Farwa Beauty Salon, PECHS Karachi` }]
        : undefined,
    }
  })
}

export function getBlogSitemapEntries() {
  return BLOG_POSTS.map(({ slug, date, lastModified, featuredImage, title }) => ({
    url: `${SITEMAP_BASE}/blog/${slug}`,
    lastModified: lastModified || date,
    changeFrequency: 'monthly',
    priority: 0.6,
    images: featuredImage ? [{ url: `${SITEMAP_BASE}${featuredImage}`, caption: title }] : undefined,
  }))
}

export function getLocationSitemapEntries() {
  return PRIORITY_LOCATION_SLUGS.map((slug) => ({
    url: `${SITEMAP_BASE}/services/${slug}`,
    lastModified: LAST_SERVICE_UPDATE,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))
}

/** Each child sitemap's lastmod is the newest lastmod inside it — anything else
 *  would tell Google to skip a sitemap that does contain fresh URLs. */
export function getSitemapIndexEntries(now = new Date()) {
  const newest = (entries) => entries.map((e) => e.lastModified).sort().pop()
  return [
    { loc: `${SITEMAP_BASE}/sitemap-static.xml`, lastModified: newest(getStaticSitemapEntries(now)) },
    { loc: `${SITEMAP_BASE}/sitemap-services.xml`, lastModified: newest(getServiceCategorySitemapEntries()) },
    { loc: `${SITEMAP_BASE}/sitemap-blog.xml`, lastModified: getLatestBlogDate() },
    { loc: `${SITEMAP_BASE}/sitemap-locations.xml`, lastModified: LAST_SERVICE_UPDATE },
  ]
}
