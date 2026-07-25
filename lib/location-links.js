import {
  parseLocationSlug,
  PRIORITY_LOCATION_SLUGS,
} from '../src/location-seo.js'

export { PRIORITY_LOCATION_SLUGS }

/** Short curated hubs for chrome / money pages — not the full SEO allowlist. */
export const CLIENT_FACING_AREA_SLUGS = [
  'bridal-makeup-in-pechs-karachi',
  'threading-in-gulshan',
  'bridal-makeup-in-clifton-karachi',
  'threading-in-dha',
  'facials-in-bahadurabad',
  'threading-in-tariq-road',
]

export const AREAS_HUB_HREF = '/beauty-salon-karachi'

function labelForSlug(slug) {
  const data = parseLocationSlug(slug)
  if (!data) return slug.replace(/-/g, ' ')
  const { service, location, prefix } = data
  if (prefix === 'best') return `Best ${service.name} in ${location.name}`
  return `${service.name} in ${location.name}`
}

function clientAreaLabelForSlug(slug) {
  const data = parseLocationSlug(slug)
  return data?.location?.name || labelForSlug(slug)
}

/** @returns {{ slug: string, href: string, label: string }[]} */
export function getPriorityLocationLinks() {
  return PRIORITY_LOCATION_SLUGS.map((slug) => ({
    slug,
    href: `/services/${slug}`,
    label: labelForSlug(slug),
  }))
}

/**
 * Lean area list for client-facing chrome (footer, services menu).
 * Full hub dump lives on /beauty-salon-karachi + sitemap only.
 * @returns {{ slug: string, href: string, label: string }[]}
 */
export function getClientFacingAreaLinks() {
  return CLIENT_FACING_AREA_SLUGS.map((slug) => ({
    slug,
    href: `/services/${slug}`,
    label: clientAreaLabelForSlug(slug),
  }))
}

/**
 * At most a few area hubs for a category page — not every priority slug.
 * @param {string} category
 * @param {number} [limit=5]
 * @returns {{ slug: string, href: string, label: string }[]}
 */
export function getClientFacingAreaLinksForCategory(category, limit = 5) {
  return getPriorityLocationLinksForCategory(category)
    .slice(0, limit)
    .map(({ slug, href, label }) => ({
      slug,
      href,
      label: clientAreaLabelForSlug(slug) || label,
    }))
}

/**
 * Same service, other priority areas — for cross-links on location landers.
 * @param {string} currentSlug
 * @returns {{ slug: string, href: string, label: string }[]}
 */
export function getNearbyPriorityLocationLinks(currentSlug) {
  const current = parseLocationSlug(currentSlug)
  if (!current) return []
  return getPriorityLocationLinks().filter(({ slug }) => {
    if (slug === currentSlug) return false
    const data = parseLocationSlug(slug)
    return data?.service.slug === current.service.slug
  })
}

/**
 * Priority landers for a service category (e.g. Threading, Bridal).
 * Full list for sitemap / hub pages — not for chrome dumps.
 * @param {string} category
 * @returns {{ slug: string, href: string, label: string }[]}
 */
export function getPriorityLocationLinksForCategory(category) {
  return getPriorityLocationLinks().filter(({ slug }) => {
    const data = parseLocationSlug(slug)
    return data?.service.category === category
  })
}
