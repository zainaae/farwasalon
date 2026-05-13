import { CAT_SLUGS } from '../src/data.js'

// TODO: change back to https://farwasalon.com once custom domain is connected
const BASE = 'https://farwasalon.vercel.app'

export default function sitemap() {
  const staticPages = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/gallery`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/team`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const servicePages = Object.values(CAT_SLUGS).map(slug => ({
    url: `${BASE}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const blogSlugs = ['bridal-beauty-timeline', 'skincare-mistakes-karachi-summer', 'threading-vs-waxing', 'make-manicure-last-two-weeks']
  const blogPages = blogSlugs.map(slug => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: new Date(),
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
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      })
      programmaticPages.push({
        url: `${BASE}/services/best-${svc}-${loc}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      })
    }
  }

  return [...staticPages, ...servicePages, ...blogPages, ...programmaticPages]
}
