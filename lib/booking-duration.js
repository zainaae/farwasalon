import { ALL_SERVICES, getAddonsForService, getServiceMaxWorkers, DEFAULT_MAX_WORKERS } from '../src/data.js'

/** Salon policy: online cancel at least this many hours before appointment. */
export const CANCELLATION_MIN_HOURS = 2

/** Cap so a single sheet row stays readable and slot math stays sane. */
export const MAX_BOOKING_SERVICES = 8

/** Keep only add-on IDs permitted for this primary service. */
export function filterAllowedAddonIds(serviceId, addonIds) {
  const allowed = new Set(getAddonsForService(serviceId).map((a) => a.id))
  const ids = Array.isArray(addonIds) ? addonIds : []
  const parsed = ids
    .map((v) => parseInt(String(v), 10))
    .filter((n) => Number.isFinite(n) && n > 0 && allowed.has(n))
  // Dedupe: repeated IDs must not inflate the booked duration
  return [...new Set(parsed)]
}

/**
 * Total bookable minutes = primary service + selected add-ons (each add-on's durationMinutes).
 * Only add-ons from getAddonsForService(service.id) are counted.
 */
export function computeBookingDurationMinutes(service, addonIds = []) {
  if (!service) return 30
  let total = service.durationMinutes || 30
  const ids = filterAllowedAddonIds(service.id, addonIds)
  for (const id of ids) {
    const addon = ALL_SERVICES.find((s) => s.id === id)
    if (addon?.durationMinutes) total += addon.durationMinutes
  }
  return total
}

export function parseAddonIdsParam(value) {
  if (value == null || value === '') return []
  if (Array.isArray(value)) {
    return value.map((v) => parseInt(String(v), 10)).filter((n) => Number.isFinite(n) && n > 0)
  }
  return String(value)
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0)
}

/** Same shape as parseAddonIdsParam — serviceIds query/body may be array or CSV. */
export function parseServiceIdsParam(value) {
  return parseAddonIdsParam(value)
}

/**
 * Resolve ordered unique catalog services from serviceId and/or serviceIds.
 * Prefers serviceIds when present; always includes serviceId first if it was
 * sent and missing from the list (deep-link / legacy clients).
 */
export function resolveBookingServices({ serviceId, serviceIds } = {}) {
  const fromList = parseServiceIdsParam(serviceIds)
  const primaryRaw =
    serviceId == null || serviceId === ''
      ? NaN
      : parseInt(String(serviceId), 10)
  const primaryOk = Number.isFinite(primaryRaw) && primaryRaw > 0

  let ids = fromList.length > 0 ? [...fromList] : []
  if (primaryOk && !ids.includes(primaryRaw)) {
    ids = [primaryRaw, ...ids]
  }
  ids = [...new Set(ids)]

  if (ids.length === 0) {
    return { error: 'Invalid serviceId', status: 400 }
  }
  if (ids.length > MAX_BOOKING_SERVICES) {
    return {
      error: `You can book up to ${MAX_BOOKING_SERVICES} services in one visit.`,
      status: 400,
    }
  }

  const services = []
  for (const id of ids) {
    const svc = ALL_SERVICES.find((s) => s.id === id)
    if (!svc) return { error: 'Service not found', status: 404 }
    services.push(svc)
  }
  return { services }
}

/**
 * Combined visit duration. Multi-service: sum each menu duration.
 * Single primary: keep whitelist add-on minutes (legacy path).
 */
export function computeServicesDurationMinutes(services, addonIds = []) {
  if (!services?.length) return 30
  if (services.length === 1) {
    return computeBookingDurationMinutes(services[0], addonIds)
  }
  return services.reduce((sum, s) => sum + (s.durationMinutes || 30), 0)
}

/** Basket PKR for UI / analytics — menu prices only, never invented. */
/** True when any selected service prices from a floor rather than a fixed
 *  figure — Hair, Hair Treatments, and Bridal (hair length/density). The
 *  basket total must say "from", or a bride confirms a static total and is
 *  charged more at the counter. */
export function servicesHaveVariablePrice(services) {
  return Boolean(services?.some((s) => s?.fromPrice))
}

export function computeServicesPricePkr(services, addonIds = []) {
  if (!services?.length) return 0
  if (services.length === 1) {
    const primary = services[0]
    const ids = filterAllowedAddonIds(primary.id, addonIds)
    return (
      (primary.pricePkr || 0) +
      ids.reduce((sum, id) => sum + (ALL_SERVICES.find((a) => a.id === id)?.pricePkr || 0), 0)
    )
  }
  return services.reduce((sum, s) => sum + (s.pricePkr || 0), 0)
}

/** Salon-readable sheet column G — "A + B + C". */
export function formatCombinedServiceName(services) {
  if (!services?.length) return ''
  return services.map((s) => s.name).join(' + ')
}

/** Single category when all match; otherwise Combined. */
export function formatCombinedCategory(services) {
  if (!services?.length) return ''
  const cats = [...new Set(services.map((s) => s.category).filter(Boolean))]
  return cats.length === 1 ? cats[0] : 'Combined'
}

/** Most restrictive station cap across the visit.
 *  Always ≤ DEFAULT_MAX_WORKERS so slots, book pre-check, and shouldCancelSelf
 *  share the same salon station count (currently 2). */
export function getBookingMaxWorkers(services) {
  if (!services?.length) return DEFAULT_MAX_WORKERS
  return Math.min(
    DEFAULT_MAX_WORKERS,
    ...services.map((s) => getServiceMaxWorkers(s)),
  )
}
