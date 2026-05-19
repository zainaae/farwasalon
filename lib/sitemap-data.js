import { CAT_SLUGS } from '../src/data.js'
import { BLOG_POSTS } from '../src/blog-data.js'

export const SITEMAP_BASE = 'https://farwasalon.com'
export const SITE_LAUNCH = '2026-05-14'
export const LAST_SERVICE_UPDATE = '2026-05-10'
export const LAST_CONTENT_UPDATE = '2026-05-10'

export function getLatestBlogDate() {
  return BLOG_POSTS.reduce(
    (max, p) => ((p.lastModified || p.date) > max ? p.lastModified || p.date : max),
    BLOG_POSTS[0]?.date ?? LAST_CONTENT_UPDATE,
  )
}

export function getStaticSitemapEntries() {
  const latestBlogDate = getLatestBlogDate()
  return [
    { url: `${SITEMAP_BASE}/`, lastModified: LAST_CONTENT_UPDATE, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITEMAP_BASE}/services`, lastModified: LAST_SERVICE_UPDATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITEMAP_BASE}/gallery`, lastModified: SITE_LAUNCH, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITEMAP_BASE}/about`, lastModified: SITE_LAUNCH, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITEMAP_BASE}/contact`, lastModified: SITE_LAUNCH, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITEMAP_BASE}/team`, lastModified: SITE_LAUNCH, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITEMAP_BASE}/faq`, lastModified: LAST_CONTENT_UPDATE, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITEMAP_BASE}/book`, lastModified: SITE_LAUNCH, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITEMAP_BASE}/blog`, lastModified: latestBlogDate, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITEMAP_BASE}/privacy`, lastModified: '2026-05-14', changeFrequency: 'yearly', priority: 0.3 },
  ]
}

export function getServiceCategorySitemapEntries() {
  return Object.values(CAT_SLUGS).map((slug) => ({
    url: `${SITEMAP_BASE}/services/${slug}`,
    lastModified: LAST_SERVICE_UPDATE,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))
}

export function getBlogSitemapEntries() {
  return BLOG_POSTS.map(({ slug, date, lastModified }) => ({
    url: `${SITEMAP_BASE}/blog/${slug}`,
    lastModified: lastModified || date,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))
}

export function getLocationSitemapEntries() {
  const neighborhoods = [
    'pechs-karachi',
    'gulshan',
    'clifton-karachi',
    'bahadurabad',
    'dha',
    'tariq-road',
    'shahrah-e-faisal',
    'north-nazimabad',
    'saddar',
    'korangi',
  ]
  const topServices = ['threading', 'bridal-makeup', 'facials', 'hair', 'nails', 'waxing']
  const entries = []
  for (const svc of topServices) {
    for (const loc of neighborhoods) {
      entries.push({
        url: `${SITEMAP_BASE}/services/${svc}-in-${loc}`,
        lastModified: LAST_SERVICE_UPDATE,
        changeFrequency: 'monthly',
        priority: 0.5,
      })
      entries.push({
        url: `${SITEMAP_BASE}/services/best-${svc}-${loc}`,
        lastModified: LAST_SERVICE_UPDATE,
        changeFrequency: 'monthly',
        priority: 0.5,
      })
    }
  }
  return entries
}

export function getSitemapIndexEntries() {
  const lastmod = LAST_CONTENT_UPDATE
  return [
    { loc: `${SITEMAP_BASE}/sitemap-static.xml`, lastModified: lastmod },
    { loc: `${SITEMAP_BASE}/sitemap-services.xml`, lastModified: LAST_SERVICE_UPDATE },
    { loc: `${SITEMAP_BASE}/sitemap-blog.xml`, lastModified: getLatestBlogDate() },
    { loc: `${SITEMAP_BASE}/sitemap-locations.xml`, lastModified: LAST_SERVICE_UPDATE },
  ]
}
