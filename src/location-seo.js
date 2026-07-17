import { CAT_SLUGS } from './data.js'

export const NEIGHBORHOODS = [
  { slug: 'pechs-karachi', name: 'PECHS, Karachi', detail: 'Our home salon is in PECHS — visit us for all services.' },
  { slug: 'gulshan', name: 'Gulshan-e-Iqbal', detail: 'Many of our regular clients travel from Gulshan — and say it\'s worth every minute.' },
  { slug: 'clifton-karachi', name: 'Clifton, Karachi', detail: 'We welcome clients from Clifton for bridal and special occasion bookings.' },
  { slug: 'bahadurabad', name: 'Bahadurabad', detail: 'A short drive through PECHS brings you to our door from Bahadurabad.' },
  { slug: 'dha', name: 'DHA (Defence)', detail: 'Clients from DHA trust us for premium bridal, hair, and skincare.' },
  { slug: 'tariq-road', name: 'Tariq Road', detail: 'Our nearest shopping neighbours — stop by before or after your errands on Tariq Road.' },
  { slug: 'shahrah-e-faisal', name: 'Shahrah-e-Faisal', detail: 'Just minutes away via the main arterial road.' },
  { slug: 'north-nazimabad', name: 'North Nazimabad', detail: 'Worth the trip — clients from North Nazimabad have been coming for years.' },
  { slug: 'saddar', name: 'Saddar', detail: 'Accessible from Saddar via any main route to PECHS.' },
  { slug: 'korangi', name: 'Korangi', detail: 'We serve clients from across Karachi including Korangi.' },
]

export const TOP_SERVICES = [
  { slug: 'threading', name: 'Threading', category: 'Threading', description: 'Professional eyebrow, lip, and full face threading with precision and care.' },
  { slug: 'bridal-makeup', name: 'Bridal Makeup', category: 'Bridal', description: 'Complete bridal makeup packages — trials, engagement looks, mehndi, and full bridal transformations.' },
  { slug: 'facials', name: 'Facials', category: 'Facials', description: 'Organic, whitening, HD, and anti-ageing facials for every skin type.' },
  { slug: 'hair', name: 'Hair Services', category: 'Hair', description: 'Haircuts, colour, blowdry, styling, and treatments for all hair types.' },
  { slug: 'nails', name: 'Nail Services', category: 'Nails', description: 'Manicures, pedicures, nail art, French tips, and paraffin treatments.' },
  { slug: 'waxing', name: 'Waxing', category: 'Rica Wax', description: 'Rica hot wax, honey wax, and body waxing for smooth, lasting results.' },
]

/**
 * Curated local landing pages (~18 hubs). Sitemap + static generation use this
 * allowlist only — not the full service × neighborhood matrix.
 */
export const PRIORITY_LOCATION_SLUGS = [
  'threading-in-pechs-karachi',
  'bridal-makeup-in-pechs-karachi',
  'facials-in-pechs-karachi',
  'hair-in-pechs-karachi',
  'nails-in-pechs-karachi',
  'threading-in-gulshan',
  'facials-in-gulshan',
  'bridal-makeup-in-gulshan',
  'bridal-makeup-in-clifton-karachi',
  'facials-in-clifton-karachi',
  'hair-in-clifton-karachi',
  'bridal-makeup-in-dha',
  'threading-in-dha',
  'hair-in-dha',
  'facials-in-dha',
  'threading-in-bahadurabad',
  'waxing-in-tariq-road',
  'threading-in-shahrah-e-faisal',
]

export function parseLocationSlug(slug) {
  const inMatch = slug.match(/^(.+)-in-(.+)$/)
  if (inMatch) {
    const [, svcPart, locPart] = inMatch
    const svc = TOP_SERVICES.find(s => s.slug === svcPart)
    const loc = NEIGHBORHOODS.find(n => n.slug === locPart)
    if (svc && loc) return { service: svc, location: loc, prefix: 'in' }
  }

  const nearMatch = slug.match(/^(.+)-near-(.+)$/)
  if (nearMatch) {
    const [, svcPart, locPart] = nearMatch
    const svc = TOP_SERVICES.find(s => s.slug === svcPart)
    const loc = NEIGHBORHOODS.find(n => n.slug === locPart)
    if (svc && loc) return { service: svc, location: loc, prefix: 'near' }
  }

  const bestMatch = slug.match(/^best-(.+)$/)
  if (bestMatch) {
    const rest = bestMatch[1]
    const byLength = [...TOP_SERVICES].sort((a, b) => b.slug.length - a.slug.length)
    for (const svc of byLength) {
      if (rest.startsWith(svc.slug + '-')) {
        const locPart = rest.slice(svc.slug.length + 1)
        const loc = NEIGHBORHOODS.find(n => n.slug === locPart)
        if (loc) return { service: svc, location: loc, prefix: 'best' }
      }
    }
  }

  return null
}

/** Crawlable location landers — priority hubs only. */
export function getAllLocationServiceSlugs() {
  return [...PRIORITY_LOCATION_SLUGS]
}

/**
 * Permanent redirects for legacy `best-*` matrix URLs.
 * Priority hubs → matching `-in-*`; everything else → the service category page
 * (non-priority `-in-*` landers are no longer generated).
 */
export function getBestLocationRedirects() {
  const prioritySet = new Set(PRIORITY_LOCATION_SLUGS)
  const redirects = []
  for (const svc of TOP_SERVICES) {
    const categorySlug = CAT_SLUGS[svc.category] || 'services'
    for (const loc of NEIGHBORHOODS) {
      const inSlug = `${svc.slug}-in-${loc.slug}`
      redirects.push({
        source: `/services/best-${svc.slug}-${loc.slug}`,
        destination: prioritySet.has(inSlug)
          ? `/services/${inSlug}`
          : `/services/${categorySlug}`,
        permanent: true,
      })
    }
  }
  return redirects
}
