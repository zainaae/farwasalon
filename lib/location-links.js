import {
  parseLocationSlug,
  PRIORITY_LOCATION_SLUGS,
  KEPT_AREA_SLUGS,
  NEIGHBORHOODS,
  TOP_SERVICES,
} from '../src/location-seo.js'
import { AREA_CONTENT } from '../src/area-content.js'

export { PRIORITY_LOCATION_SLUGS, KEPT_AREA_SLUGS }

/** Kept /areas hubs for chrome / money pages — not the retired service×area matrix. */
export const CLIENT_FACING_AREA_SLUGS = [...KEPT_AREA_SLUGS]

/** Kept neighbourhood records with AREA_CONTENT (for hubs / sitemaps). */
export function getKeptNeighborhoods() {
  const bySlug = new Map(
    NEIGHBORHOODS.filter((n) => AREA_CONTENT[n.slug]).map((n) => [n.slug, n]),
  )
  return KEPT_AREA_SLUGS.map((slug) => bySlug.get(slug)).filter(Boolean)
}

/** Area pages for the footer — only hubs that still render. */
export function getFooterAreaLinks(limit = 6) {
  return getKeptNeighborhoods()
    .slice(0, limit)
    .map((n) => ({ slug: n.slug, href: `/areas/${n.slug}`, label: n.name }))
}

export const AREAS_HUB_HREF = '/areas'

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
 * Lean area list for client-facing chrome (footer, services menu).
 * @returns {{ slug: string, href: string, label: string }[]}
 */
export function getClientFacingAreaLinks() {
  return getFooterAreaLinks(CLIENT_FACING_AREA_SLUGS.length)
}

/**
 * Kept area hubs for a category page — link to /areas, not retired -in- SKUs.
 * @param {string} _category
 * @param {number} [limit=5]
 * @returns {{ slug: string, href: string, label: string }[]}
 */
export function getClientFacingAreaLinksForCategory(_category, limit = 5) {
  return getClientFacingAreaLinks().slice(0, limit)
}

/**
 * Same service, other priority areas — empty after doorway retirement.
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
 * Priority landers for a service category — empty after doorway retirement.
 * @param {string} category
 * @returns {{ slug: string, href: string, label: string }[]}
 */
export function getPriorityLocationLinksForCategory(category) {
  return getPriorityLocationLinks().filter(({ slug }) => {
    const data = parseLocationSlug(slug)
    return data?.service.category === category
  })
}

/** @returns {typeof TOP_SERVICES} */
export function getTopServices() {
  return TOP_SERVICES
}
