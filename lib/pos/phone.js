/**
 * POS client phone helpers — same Pakistan mobile rules as public booking.
 * Canonical store form is digits-only E.164 without '+': 923xxxxxxxxx.
 * Display form is local 03xxxxxxxxx.
 */
import { PHONE_RE } from '../../src/site-config.js'

export { PHONE_RE }

/** Strip spaces so PHONE_RE matches the booking form check. */
export function isValidPhone(value) {
  if (typeof value !== 'string') return false
  return PHONE_RE.test(value.replace(/\s/g, ''))
}

/**
 * Digits only, then fold 03… / +92… / 92… into 923xxxxxxxxx.
 * @returns {string | null}
 */
export function normalizePhoneE164(phone) {
  if (phone == null) return null
  const digits = String(phone).replace(/\D/g, '')
  if (!digits) return null

  let n = digits
  if (n.startsWith('0')) n = `92${n.slice(1)}`
  else if (!n.startsWith('92')) n = `92${n}`

  if (!/^923\d{9}$/.test(n)) return null
  /* Re-check against the public regex in local or E.164 shape. */
  if (!PHONE_RE.test(n) && !PHONE_RE.test(`0${n.slice(2)}`)) return null
  return n
}

/** Local display: 03xxxxxxxxx from any accepted input. */
export function normalizePhoneDisplay(phone) {
  const e164 = normalizePhoneE164(phone)
  if (!e164) return null
  return `0${e164.slice(2)}`
}

/** True when both normalize to the same E.164 mobile. */
export function phonesMatch(a, b) {
  const ea = normalizePhoneE164(a)
  const eb = normalizePhoneE164(b)
  return Boolean(ea && eb && ea === eb)
}
