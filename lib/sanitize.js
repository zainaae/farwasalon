/** Strip formula injection prefixes from values written to Google Sheets. */
export function sanitizeForSheets(value) {
  if (value == null) return ''
  if (typeof value === 'string') {
    return value.replace(/^[=+\-@\t\r]+/, '')
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'boolean') {
    return value
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeForSheets)
  }
  if (typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      out[k] = sanitizeForSheets(v)
    }
    return out
  }
  return String(value).replace(/^[=+\-@\t\r]+/, '')
}

export function requireStringField(body, key, { maxLen = 500, required = true } = {}) {
  const raw = body[key]
  if (raw == null || raw === '') {
    if (required) return { error: `Missing required field: ${key}` }
    return { value: '' }
  }
  if (typeof raw !== 'string') {
    return { error: `Invalid ${key}: must be a string` }
  }
  const trimmed = raw.trim()
  if (required && !trimmed) {
    return { error: `Missing required field: ${key}` }
  }
  if (trimmed.length > maxLen) {
    return { error: `${key} is too long` }
  }
  return { value: sanitizeForSheets(trimmed) }
}
