/**
 * Integration tests for POST /api/book/cancel — the cancel window (2-hour boundary),
 * token verification, and phone-last4 binding. Google Sheets and the rate limiter
 * are mocked; everything else (token signing, validation) is real.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('./google-sheets.js', () => ({
  getSheetRows: vi.fn(),
  updateBookingStatus: vi.fn(),
  isConfigured: vi.fn(() => true),
}))
vi.mock('./rate-limit.js', () => ({
  checkRateLimit: vi.fn(() => ({ limited: false })),
}))

import { getSheetRows, updateBookingStatus, isConfigured } from './google-sheets.js'
import { checkRateLimit } from './rate-limit.js'
import { signCancelToken } from './booking-cancel-token.js'
import { CANCELLATION_MIN_HOURS } from './booking-duration.js'
import { POST } from '../app/api/book/cancel/route.js'

const BOOKING = {
  bookingId: 'FBS-ABCD1234',
  date: '2026-07-14',
  timeSlot: '12:00',
  status: 'Confirmed',
  clientPhone: '0322 2782254',
}

/** A signed token for the fixture booking. The tokenless path is gone — it was
 *  an auth bypass — so every legitimate request carries one. */
function tokenFor(overrides = {}) {
  return signCancelToken({
    bookingId: BOOKING.bookingId,
    date: BOOKING.date,
    phoneLast4: '2254',
    ...overrides,
  })
}

function makeRequest(body, { origin = 'https://farwasalon.com' } = {}) {
  const headers = { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.7' }
  if (origin) headers.origin = origin
  return new Request('http://localhost/api/book/cancel', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.useFakeTimers()
  /* An explicit UTC instant, not machine-local. The old fixture built the clock
     and parsed the booking on the same local side, so the two drifted together
     and every window assertion passed in any timezone — including the broken
     one, where a Vercel UTC server thought a 12:00 PKT appointment was still
     3.5 h away when it had already started. 04:00Z is 09:00 in Karachi. */
  vi.setSystemTime(new Date('2026-07-14T04:00:00Z'))
  process.env.BOOKING_CANCEL_SECRET = 'test-secret-fixture-do-not-use-in-prod'
  getSheetRows.mockReset().mockResolvedValue([{ ...BOOKING }])
  updateBookingStatus.mockReset().mockResolvedValue(undefined)
  isConfigured.mockReset().mockReturnValue(true)
  checkRateLimit.mockReset().mockReturnValue({ limited: false })
})

afterEach(() => {
  vi.useRealTimers()
  delete process.env.BOOKING_CANCEL_SECRET
})

describe('POST /api/book/cancel — request validation', () => {
  it('rejects disallowed origins with 403', async () => {
    const res = await POST(makeRequest({ token: tokenFor() }, { origin: 'https://evil.com' }))
    expect(res.status).toBe(403)
  })

  it('rejects invalid JSON with 400', async () => {
    const res = await POST(makeRequest('not-json'))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('Invalid JSON')
  })

  it('rejects a request with no token at all — there is no unauthenticated path', async () => {
    const res = await POST(makeRequest({ bookingId: BOOKING.bookingId, date: BOOKING.date }))
    expect(res.status).toBe(401)
    expect(updateBookingStatus).not.toHaveBeenCalled()
  })

  /* bookingId and date now reach the route only inside a verified token, so the
     format checks sit behind the signature rather than in front of it. */
  it('rejects a malformed booking id carried inside a valid token', async () => {
    const res = await POST(makeRequest({ token: tokenFor({ bookingId: 'nope' }) }))
    expect(res.status).toBe(400)
    expect(updateBookingStatus).not.toHaveBeenCalled()
  })

  it('rejects a malformed date carried inside a valid token', async () => {
    const res = await POST(makeRequest({ token: tokenFor({ date: '14-07-2026' }) }))
    expect(res.status).toBe(400)
    expect(updateBookingStatus).not.toHaveBeenCalled()
  })

  it('rejects a token signed with a different secret', async () => {
    const good = tokenFor()
    process.env.BOOKING_CANCEL_SECRET = 'a-completely-different-secret'
    const res = await POST(makeRequest({ token: good }))
    expect(res.status).toBe(400)
    expect(updateBookingStatus).not.toHaveBeenCalled()
  })

  it('returns 429 when rate limited', async () => {
    checkRateLimit.mockReturnValueOnce({ limited: true, retryAfter: 60 })
    const res = await POST(makeRequest({ token: tokenFor() }))
    expect(res.status).toBe(429)
    expect(res.headers.get('Retry-After')).toBe('60')
  })

  it('returns 503 when the sheet backend is not configured', async () => {
    isConfigured.mockReturnValueOnce(false)
    const res = await POST(makeRequest({ token: tokenFor() }))
    expect(res.status).toBe(503)
  })

  it('returns 404 when the booking does not exist on that date', async () => {
    getSheetRows.mockResolvedValueOnce([])
    const res = await POST(makeRequest({ token: tokenFor() }))
    expect(res.status).toBe(404)
  })

  it('rejects an already-cancelled booking with 400', async () => {
    getSheetRows.mockResolvedValueOnce([{ ...BOOKING, status: 'Cancelled' }])
    const res = await POST(makeRequest({ token: tokenFor() }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toContain('already cancelled')
    expect(updateBookingStatus).not.toHaveBeenCalled()
  })
})

describe('POST /api/book/cancel — 2-hour cancellation window', () => {
  it('CANCELLATION_MIN_HOURS is 2 (window assumed by these tests)', () => {
    expect(CANCELLATION_MIN_HOURS).toBe(2)
  })

  it('allows cancellation well before the window (3 h out)', async () => {
    const res = await POST(makeRequest({ token: tokenFor() }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true, bookingId: BOOKING.bookingId })
    expect(updateBookingStatus).toHaveBeenCalledWith(BOOKING.bookingId, 'Cancelled')
  })

  it('allows cancellation EXACTLY at the 2-hour boundary ("at least 2 hours" is inclusive)', async () => {
    vi.setSystemTime(new Date('2026-07-14T05:00:00Z')) // 10:00 PKT — exactly 2 h before 12:00
    const res = await POST(makeRequest({ token: tokenFor() }))
    expect(res.status).toBe(200)
    expect(updateBookingStatus).toHaveBeenCalledWith(BOOKING.bookingId, 'Cancelled')
  })

  /* One MINUTE inside, not one second: the window is now computed from salon
     wall-clock, which has minute resolution. Second-level precision was an
     artifact of parsing a date string, and it came with a 5-hour timezone error
     — minute granularity is both correct for the policy and honest about it. */
  it('rejects cancellation one minute inside the window', async () => {
    vi.setSystemTime(new Date('2026-07-14T05:01:00Z')) // 10:01 PKT
    const res = await POST(makeRequest({ token: tokenFor() }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toContain(`at least ${CANCELLATION_MIN_HOURS} hours`)
    expect(updateBookingStatus).not.toHaveBeenCalled()
  })

  it('rejects cancellation after the appointment started', async () => {
    vi.setSystemTime(new Date('2026-07-14T08:00:00Z')) // 13:00 PKT — appointment already started
    const res = await POST(makeRequest({ token: tokenFor() }))
    expect(res.status).toBe(400)
    expect(updateBookingStatus).not.toHaveBeenCalled()
  })
})

describe('POST /api/book/cancel — signed token flow', () => {
  it('cancels via a valid signed token (id + date + phone last4 all bound)', async () => {
    const token = signCancelToken({ bookingId: BOOKING.bookingId, date: BOOKING.date, phoneLast4: '2254' })
    expect(token).toBeTruthy()
    const res = await POST(makeRequest({ token }))
    expect(res.status).toBe(200)
    expect(updateBookingStatus).toHaveBeenCalledWith(BOOKING.bookingId, 'Cancelled')
  })

  it('rejects a token whose phone last4 does not match the booking', async () => {
    const token = signCancelToken({ bookingId: BOOKING.bookingId, date: BOOKING.date, phoneLast4: '9999' })
    const res = await POST(makeRequest({ token }))
    expect(res.status).toBe(403)
    expect(updateBookingStatus).not.toHaveBeenCalled()
  })

  it('rejects a tampered token with 400', async () => {
    const token = signCancelToken({ bookingId: BOOKING.bookingId, date: BOOKING.date, phoneLast4: '2254' })
    const tampered = token.slice(0, -3) + (token.endsWith('AAA') ? 'BBB' : 'AAA')
    const res = await POST(makeRequest({ token: tampered }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toContain('Invalid or expired')
  })

  it('token payload overrides any bookingId/date also present in the body', async () => {
    const token = signCancelToken({ bookingId: BOOKING.bookingId, date: BOOKING.date, phoneLast4: '2254' })
    const res = await POST(makeRequest({ token, bookingId: 'FBS-FFFF9999', date: '2026-01-01' }))
    expect(res.status).toBe(200)
    expect(getSheetRows).toHaveBeenCalledWith(BOOKING.date)
    expect(updateBookingStatus).toHaveBeenCalledWith(BOOKING.bookingId, 'Cancelled')
  })
})
