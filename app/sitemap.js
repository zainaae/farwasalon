import { CAT_SLUGS } from '../src/data.js'
import { BLOG_POSTS } from '../src/blog-data.js'

const BASE = 'https://farwasalon.com'
const SITE_LAUNCH = '2025-06-01'
const LAST_SERVICE_UPDATE = '2026-05-10'
const LAST_CONTENT_UPDATE = '2026-05-10'

export default function sitemap() {
  const latestBlogDate = BLOG_POSTS.reduce(
    (max, p) => (p.lastModified || p.date) > max ? (p.lastModified || p.date) : max,
    BLOG_POSTS[0]?.date ?? LAST_CONTENT_UPDATE,
  )

  const staticPages = [
    { url: BASE, lastModified: LAST_CONTENT_UPDATE, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/services`, lastModified: LAST_SERVICE_UPDATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/gallery`, lastModified: SITE_LAUNCH, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/about`, lastModified: SITE_LAUNCH, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: SITE_LAUNCH, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/team`, lastModified: SITE_LAUNCH, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/faq`, lastModified: LAST_CONTENT_UPDATE, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/blog`, lastModified: latestBlogDate, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/privacy`, lastModified: '2026-05-14', changeFrequency: 'yearly', priority: 0.3 },
  ]

  const servicePages = Object.values(CAT_SLUGS).map(slug => ({
    url: `${BASE}/services/${slug}`,
    lastModified: LAST_SERVICE_UPDATE,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const blogPages = BLOG_POSTS.map(({ slug, date, lastModified }) => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: lastModified || date,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const neighborhoods = ['pechs-karachi', 'gulshan', 'clifton-karachi', 'bahadurabad', 'dha', 'tariq-road', 'shahrah-e-faisal', 'north-nazimabad', 'saddar', 'korangi']
  const topServices = ['threading', 'bridal-makeup', 'facials', 'hair', 'nails', 'waxing']
  const programmaticPages = []
  for (const svc of topServices) {
    for (const loc of neighborhoods) {
      programmaticPages.push({
        url: `${BASE}/services/${svc}-in-${loc}`,
        lastModified: LAST_SERVICE_UPDATE,
        changeFrequency: 'monthly',
        priority: 0.5,
      })
      programmaticPages.push({
        url: `${BASE}/services/best-${svc}-${loc}`,
        lastModified: LAST_SERVICE_UPDATE,
        changeFrequency: 'monthly',
        priority: 0.5,
      })
    }
  }

  return [...staticPages, ...servicePages, ...blogPages, ...programmaticPages]
}
