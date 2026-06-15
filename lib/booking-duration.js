import { ALL_SERVICES, getAddonsForService } from '../src/data.js'

/** Salon policy: online cancel at least this many hours before appointment. */
export const CANCELLATION_MIN_HOURS = 2

/** Keep only add-on IDs permitted for this primary service. */
export function filterAllowedAddonIds(serviceId, addonIds) {
  const allowed = new Set(getAddonsForService(serviceId).map((a) => a.id))
  const ids = Array.isArray(addonIds) ? addonIds : []
  return ids
    .map((v) => parseInt(String(v), 10))
    .filter((n) => Number.isFinite(n) && n > 0 && allowed.has(n))
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
