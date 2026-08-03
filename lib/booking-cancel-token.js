import { createHmac, timingSafeEqual } from 'node:crypto'

const TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000 // 90 days

function base64url(buf) {
  return Buffer.from(buf).toString('base64url')
}

function fromBase64url(str) {
  return Buffer.from(str, 'base64url')
}

let warnedMissingSecret = false

/** @returns {string | null} */
export function getCancelSecret() {
  /* Fail closed. The old fallback — "cancel:<sheetId>:<serviceAccountEmail>" —
     derived the HMAC key from two semi-public values, so a missing
     BOOKING_CANCEL_SECRET quietly produced forgeable cancel tokens. If the
     secret is unset we return null and cancellation is simply unavailable
     (signCancelToken -> null, and the cancel route rejects tokenless
     requests), instead of issuing tokens an attacker can mint. */
  const secret = process.env.BOOKING_CANCEL_SECRET?.trim()
  if (!secret && !warnedMissingSecret) {
    /* One loud warning per process: without this var, self-service
       cancellation is silently dead for every customer. Operator action is
       required (set it in Vercel Production + Preview). */
    warnedMissingSecret = true
    console.warn(
      '[booking-cancel-token] BOOKING_CANCEL_SECRET is not set — cancel tokens cannot be signed and ' +
        '/api/book/cancel will reject all requests. Set it in Vercel Production and Preview.',
    )
  }
  return secret || null
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
