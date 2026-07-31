import {
  parseLocationSlug,
  PRIORITY_LOCATION_SLUGS,
  NEIGHBORHOODS,
} from '../src/location-seo.js'
import { AREA_CONTENT } from '../src/area-content.js'

export { PRIORITY_LOCATION_SLUGS }

/** Short curated hubs for chrome / money pages — not the full SEO allowlist.
 *
 *  This list kept five slugs after the 48 near-duplicate hubs were retired, so
 *  the footer pushed five 301s from every page on the site while the ten pages
 *  built to capture area intent had one entry point between them. Only slugs
 *  that still resolve belong here — the test enforces it. */
/* Chosen from the hubs the Performance export shows actually earning, rather
 *  than the first six in the array. Every entry is asserted against
 *  PRIORITY_LOCATION_SLUGS in the tests — this list went stale once when the
 *  hubs were retired, and pushed five 301s from every page on the site. */
export const CLIENT_FACING_AREA_SLUGS = [
  'bridal-makeup-in-pechs-karachi',
  'nails-in-tariq-road',
  'waxing-in-tariq-road',
  'nails-in-dha',
  'facials-in-dha',
  'bridal-makeup-in-gulshan',
]

/** Area pages for the footer. These are the pages built to carry local intent,
 *  and until now the only route into them was a single link on one page. */
export function getFooterAreaLinks(limit = 6) {
  return NEIGHBORHOODS.filter((n) => AREA_CONTENT[n.slug])
    .slice(0, limit)
    .map((n) => ({ slug: n.slug, href: `/areas/${n.slug}`, label: n.name }))
}

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
