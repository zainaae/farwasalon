import { parseLocationSlug } from '../src/location-seo.js'

/** Curated local landing pages — home, footer, IndexNow. */
export const PRIORITY_LOCATION_SLUGS = [
  'threading-in-pechs-karachi',
  'bridal-makeup-in-pechs-karachi',
  'facials-in-pechs-karachi',
  'hair-in-pechs-karachi',
  'threading-in-gulshan',
  'bridal-makeup-in-clifton-karachi',
  'facials-in-clifton-karachi',
  'best-bridal-makeup-dha',
  'best-threading-dha',
  'threading-in-bahadurabad',
  'facials-in-gulshan',
  'nails-in-pechs-karachi',
  'waxing-in-tariq-road',
  'best-facials-clifton-karachi',
  'hair-in-dha',
  'threading-in-shahrah-e-faisal',
  'bridal-makeup-in-gulshan',
  'facials-in-dha',
]

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

/** Compact footer row: one flagship service per neighborhood. */
export function getFooterLocalLinks() {
  return [
    { slug: 'threading-in-pechs-karachi', label: 'PECHS' },
    { slug: 'threading-in-gulshan', label: 'Gulshan' },
    { slug: 'facials-in-clifton-karachi', label: 'Clifton' },
    { slug: 'best-bridal-makeup-dha', label: 'DHA' },
    { slug: 'threading-in-bahadurabad', label: 'Bahadurabad' },
    { slug: 'hair-in-tariq-road', label: 'Tariq Road' },
  ].map(({ slug, label }) => ({
    slug,
    href: `/services/${slug}`,
    label: `Threading near ${label}`,
  }))
}
