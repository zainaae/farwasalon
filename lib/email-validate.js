/** Pragmatic email check: rejects obviously bad input, accepts real-world addresses.
 *  Not RFC 5322 strict — that's overkill and rejects valid edge cases anyway. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidEmail(value) {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (trimmed.length < 5 || trimmed.length > 254) return false
  return EMAIL_RE.test(trimmed)
}

export function normalizeEmail(value) {
  if (typeof value !== 'string') return ''
  return value.trim().toLowerCase()
}
