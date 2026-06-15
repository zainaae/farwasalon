import { createHmac, timingSafeEqual } from 'node:crypto'

const TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000 // 90 days

function base64url(buf) {
  return Buffer.from(buf).toString('base64url')
}

function fromBase64url(str) {
  return Buffer.from(str, 'base64url')
}

/** @returns {string | null} */
export function getCancelSecret() {
  const secret = process.env.BOOKING_CANCEL_SECRET?.trim()
  if (secret) return secret
  const sheetId = process.env.GOOGLE_SHEET_ID?.trim()
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim()
  if (sheetId && email) return `cancel:${sheetId}:${email}`
  return null
}

export function phoneLast4(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  return digits.slice(-4) || '0000'
}

/**
 * @param {{ bookingId: string, date: string, phoneLast4: string }} payload
 * @returns {string | null}
 */
export function signCancelToken({ bookingId, date, phoneLast4: last4 }) {
  const secret = getCancelSecret()
  if (!secret) return null

  const body = JSON.stringify({
    bid: bookingId,
    d: date,
    p4: last4,
    exp: Date.now() + TOKEN_TTL_MS,
  })
  const payload = base64url(body)
  const sig = createHmac('sha256', secret).update(payload).digest()
  return `${payload}.${base64url(sig)}`
}

/**
 * @param {string} token
 * @returns {{ bookingId: string, date: string, phoneLast4: string } | null}
 */
export function verifyCancelToken(token) {
  const secret = getCancelSecret()
  if (!secret || typeof token !== 'string') return null

  const dot = token.lastIndexOf('.')
  if (dot <= 0) return null
  const payload = token.slice(0, dot)
  const sigB64 = token.slice(dot + 1)

  let expected
  let actual
  try {
    expected = createHmac('sha256', secret).update(payload).digest()
    actual = fromBase64url(sigB64)
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null
  } catch {
    return null
  }

  let parsed
  try {
    parsed = JSON.parse(fromBase64url(payload).toString('utf8'))
  } catch {
    return null
  }

  if (!parsed?.bid || !parsed?.d || !parsed?.p4 || !parsed?.exp) return null
  if (Date.now() > parsed.exp) return null
  if (!/^FBS-[A-F0-9]{4,16}$/i.test(parsed.bid)) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(parsed.d)) return null

  return {
    bookingId: parsed.bid,
    date: parsed.d,
    phoneLast4: String(parsed.p4),
  }
}
