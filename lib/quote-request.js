import { ALL_SERVICES, SERVICES } from '../src/data.js'
import { WA_NUMBER, formatServicePrice } from '../src/site-config.js'

/** Categories whose printed rates are floors — length/density change the work. */
export const HAIR_QUOTE_CATEGORIES = new Set(['Hair', 'Hair Treatments'])

export const QUOTE_LENGTHS = ['Short', 'Shoulder length', 'Long', 'Very long']
export const QUOTE_DENSITIES = ['Fine', 'Medium', 'Thick']

export function isHairQuoteCategory(category) {
  return HAIR_QUOTE_CATEGORIES.has(category)
}

export function isHairQuoteService(service) {
  return Boolean(service?.fromPrice && isHairQuoteCategory(service.category))
}

export function getHairQuoteServices() {
  return [...(SERVICES.Hair || []), ...(SERVICES['Hair Treatments'] || [])].filter(isHairQuoteService)
}

export function getQuoteServiceById(serviceId) {
  const id = Number(serviceId)
  if (!Number.isFinite(id)) return null
  return ALL_SERVICES.find((s) => s.id === id) ?? null
}

/** Deep-link into /prices quote builder prefilled with a catalog hair service. */
export function hairQuotePath(serviceId) {
  return `/prices?quote=1&serviceId=${encodeURIComponent(String(serviceId))}#quote`
}

/**
 * Structured WhatsApp quote request — floors only, never a locked total.
 * @param {{
 *   label: string,
 *   floorLabel?: string | null,
 *   look?: string,
 *   length?: string,
 *   density?: string,
 *   date?: string,
 *   note?: string,
 *   source?: string,
 * }} opts
 */
export function buildQuoteWaText({
  label,
  floorLabel = null,
  look = '',
  length = '',
  density = '',
  date = '',
  note = '',
  source = 'farwasalon.com/prices',
}) {
  const parts = [
    `Quote please — ${label}`,
    floorLabel || null,
    look ? `look: ${look}` : null,
    length ? `length: ${length}` : null,
    density ? `density: ${density}` : null,
    date ? `date: ${date}` : null,
    note ? `note: ${note}` : null,
  ].filter(Boolean)
  return `${parts.join(', ')} (via ${source})`
}

export function buildQuoteWaHref(opts) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(buildQuoteWaText(opts))}`
}

/** Floor label for catalog hair services (`from Rs …`); null for special works. */
export function quoteFloorLabel(service) {
  if (!isHairQuoteService(service)) return null
  return formatServicePrice(service)
}
