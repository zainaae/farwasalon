import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createHmac } from 'node:crypto'
import {
  phoneLast4,
  signCancelToken,
  verifyCancelToken,
  getCancelSecret,
} from './booking-cancel-token.js'

const SECRET = 'test-secret-fixture-do-not-use-in-prod'

function signRaw(payload, secret = SECRET) {
  const b64 = Buffer.from(payload).toString('base64url')
  const sig = createHmac('sha256', secret).update(b64).digest('base64url')
  return `${b64}.${sig}`
}

describe('phoneLast4', () => {
  it('extracts last 4 digits from a clean phone', () => {
    expect(phoneLast4('923222782254')).toBe('2254')
  })

  it('strips non-digit characters before extracting', () => {
    expect(phoneLast4('+92 322 278 2254')).toBe('2254')
    expect(phoneLast4('0322-2782254')).toBe('2254')
    expect(phoneLast4('(0322) 278-2254')).toBe('2254')
  })

  it('returns 0000 placeholder for empty / null', () => {
    expect(phoneLast4('')).toBe('0000')
    expect(phoneLast4(null)).toBe('0000')
    expect(phoneLast4(undefined)).toBe('0000')
  })

  it('returns 0000 when no digits present', () => {
    expect(phoneLast4('abc')).toBe('0000')
  })

  it('returns shorter string when fewer than 4 digits', () => {
    expect(phoneLast4('123')).toBe('123')
  })
})

describe('signCancelToken / verifyCancelToken', () => {
  beforeEach(() => {
    process.env.BOOKING_CANCEL_SECRET = SECRET
  })

  afterEach(() => {
    delete process.env.BOOKING_CANCEL_SECRET
    vi.useRealTimers()
  })

  it('returns a payload.signature shaped token', () => {
    const token = signCancelToken({ bookingId: 'FBS-DEADBEEF', date: '2026-06-01', phoneLast4: '2254' })
    expect(token).toBeTruthy()
    expect(token.split('.').length).toBe(2)
  })

  it('round-trips successfully', () => {
    const token = signCancelToken({ bookingId: 'FBS-DEADBEEF', date: '2026-06-01', phoneLast4: '2254' })
    expect(verifyCancelToken(token)).toEqual({
      bookingId: 'FBS-DEADBEEF',
      date: '2026-06-01',
      phoneLast4: '2254',
    })
  })

  it('rejects a tampered signature', () => {
    const token = signCancelToken({ bookingId: 'FBS-DEADBEEF', date: '2026-06-01', phoneLast4: '2254' })
    const [payload] = token.split('.')
    expect(verifyCancelToken(`${payload}.AAAA`)).toBeNull()
  })

  it('rejects a tampered payload (sig no longer matches)', () => {
    const token = signCancelToken({ bookingId: 'FBS-DEADBEEF', date: '2026-06-01', phoneLast4: '2254' })
    const [, sig] = token.split('.')
    const fakePayload = Buffer.from(
      JSON.stringify({ bid: 'FBS-FFFFFFFF', d: '2026-06-01', p4: '0000', exp: Date.now() + 60_000 }),
    ).toString('base64url')
    expect(verifyCancelToken(`${fakePayload}.${sig}`)).toBeNull()
  })

  it('rejects expired tokens (>90 days)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const token = signCancelToken({ bookingId: 'FBS-DEADBEEF', date: '2026-06-01', phoneLast4: '2254' })
    vi.setSystemTime(new Date('2026-04-02T00:00:01Z')) // 91 days later
    expect(verifyCancelToken(token)).toBeNull()
  })

  it('rejects malformed input', () => {
    expect(verifyCancelToken('')).toBeNull()
    expect(verifyCancelToken(null)).toBeNull()
    expect(verifyCancelToken(undefined)).toBeNull()
    expect(verifyCancelToken('no-dot-here')).toBeNull()
    expect(verifyCancelToken('.startswithdot')).toBeNull()
    expect(verifyCancelToken(123)).toBeNull()
  })

  it('rejects payload with invalid bookingId pattern', () => {
    const body = JSON.stringify({ bid: 'NOT-VALID', d: '2026-06-01', p4: '2254', exp: Date.now() + 60_000 })
    expect(verifyCancelToken(signRaw(body))).toBeNull()
  })

  it('rejects payload with invalid date pattern', () => {
    const body = JSON.stringify({ bid: 'FBS-DEADBEEF', d: 'tomorrow', p4: '2254', exp: Date.now() + 60_000 })
    expect(verifyCancelToken(signRaw(body))).toBeNull()
  })

  it('rejects payload missing required fields', () => {
    const body = JSON.stringify({ bid: 'FBS-DEADBEEF', d: '2026-06-01' }) // no p4 / exp
    expect(verifyCancelToken(signRaw(body))).toBeNull()
  })
})

describe('getCancelSecret fallback', () => {
  afterEach(() => {
    delete process.env.BOOKING_CANCEL_SECRET
    delete process.env.GOOGLE_SHEET_ID
    delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  })

  it('returns null when no env is configured', () => {
    expect(getCancelSecret()).toBeNull()
  })

  it('uses BOOKING_CANCEL_SECRET when set', () => {
    process.env.BOOKING_CANCEL_SECRET = 'primary-secret'
    expect(getCancelSecret()).toBe('primary-secret')
  })

  it('falls back to sheet-id + email pair when no explicit secret', () => {
    process.env.GOOGLE_SHEET_ID = 'sheet-123'
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'svc@example.com'
    expect(getCancelSecret()).toBe('cancel:sheet-123:svc@example.com')
  })

  it('returns null if only one of the fallback vars is set', () => {
    process.env.GOOGLE_SHEET_ID = 'sheet-123'
    expect(getCancelSecret()).toBeNull()
  })

  it('signCancelToken returns null when no secret is configured', () => {
    expect(signCancelToken({ bookingId: 'FBS-DEADBEEF', date: '2026-06-01', phoneLast4: '2254' })).toBeNull()
  })
})
