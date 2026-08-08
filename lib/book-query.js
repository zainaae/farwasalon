import { SERVICES, ALL_SERVICES } from '../src/data.js'

/**
 * Resolve `/prices` row links: `?service=Name` (+ optional `category=`).
 * Prefer a match inside the named category; fall back to a global name match.
 * `serviceId` / `serviceIds` still win when present (handled by the caller).
 */
export function resolveServiceFromNameParam(serviceNameParam, categoryParam) {
  const name = typeof serviceNameParam === 'string' ? serviceNameParam.trim() : ''
  if (!name) return null
  const lower = name.toLowerCase()
  const inCategory =
    categoryParam && Array.isArray(SERVICES[categoryParam]) ? SERVICES[categoryParam] : null
  if (inCategory) {
    const scoped = inCategory.find((s) => s.name.toLowerCase() === lower)
    if (scoped) return scoped
  }
  return ALL_SERVICES.find((s) => s.name.toLowerCase() === lower) || null
}
