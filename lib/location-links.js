import {
  parseLocationSlug,
  PRIORITY_LOCATION_SLUGS,
} from '../src/location-seo.js'

export { PRIORITY_LOCATION_SLUGS }

function labelForSlug(slug) {
  const data = parseLocationSlug(slug)
  if (!data) return slug.replace(/-/g, ' ')
  const { service, location, prefix } = data
  if (prefix === 'best') return `Best ${service.name} in ${location.name}`
  return `${service.name} in ${location.name}`
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
 * @param {string} category
 * @returns {{ slug: string, href: string, label: string }[]}
 */
export function getPriorityLocationLinksForCategory(category) {
  return getPriorityLocationLinks().filter(({ slug }) => {
    const data = parseLocationSlug(slug)
    return data?.service.category === category
  })
}
