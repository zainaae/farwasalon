import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { signCancelToken, verifyCancelToken, phoneLast4 } from './booking-cancel-token.js'

describe('booking-cancel-token', () => {
  const orig = process.env.BOOKING_CANCEL_SECRET

  beforeEach(() => {
    process.env.BOOKING_CANCEL_SECRET = 'test-secret-for-cancel-tokens'
  })

  afterEach(() => {
    if (orig === undefined) delete process.env.BOOKING_CANCEL_SECRET
    else process.env.BOOKING_CANCEL_SECRET = orig
  })

  it('phoneLast4 extracts last four digits', () => {
    expect(phoneLast4('0322-2782254')).toBe('2254')
    expect(phoneLast4('+923222782254')).toBe('2254')
  })

  it('signs and verifies a token', () => {
    const token = signCancelToken({
      bookingId: 'FBS-AB12',
      date: '2026-06-01',
      phoneLast4: '2254',
    })
    expect(token).toBeTruthy()
    const payload = verifyCancelToken(token)
    expect(payload).toEqual({
      bookingId: 'FBS-AB12',
      date: '2026-06-01',
      phoneLast4: '2254',
    })
  })

  it('rejects tampered tokens', () => {
    const token = signCancelToken({
      bookingId: 'FBS-AB12',
      date: '2026-06-01',
      phoneLast4: '2254',
    })
    const tampered = token.slice(0, -4) + 'XXXX'
    expect(verifyCancelToken(tampered)).toBeNull()
  })
})
