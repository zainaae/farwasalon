import { ALL_SERVICES } from '../src/data.js'

/** Salon policy: online cancel at least this many hours before appointment. */
export const CANCELLATION_MIN_HOURS = 2

/**
 * Total bookable minutes = primary service + selected add-ons (each add-on's durationMinutes).
 */
export function computeBookingDurationMinutes(service, addonIds = []) {
  if (!service) return 30
  let total = service.durationMinutes || 30
  const ids = Array.isArray(addonIds) ? addonIds : []
  for (const rawId of ids) {
    const id = parseInt(String(rawId), 10)
    if (!Number.isFinite(id)) continue
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
