/**
 * Integration tests for POST /api/book - the double-booking guard (capacity + buffer),
 * the post-append race re-check with rollback, honeypot/origin/field validation, and
 * the cancel token returned on success. Google Sheets and the rate limiter are mocked;
 * validation, slot math, and token signing are real.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('./google-sheets.js', () => ({
  getSheetRows: vi.fn(),
  appendBooking: vi.fn(),
  generateBookingId: vi.fn(() => 'FBS-7E57C0DE'),
  isConfigured: vi.fn(() => true),
  updateBookingStatus: vi.fn(),
}))
vi.mock('./rate-limit.js', () => ({
  checkRateLimit: vi.fn(() => ({ limited: false })),
}))

import {
  getSheetRows,
  appendBooking,
  isConfigured,
  updateBookingStatus,
} from './google-sheets.js'
import { checkRateLimit } from './rate-limit.js'
import { verifyCancelToken } from './booking-cancel-token.js'
import { computeBookingDurationMinutes } from './booking-duration.js'
import { addMinutes, MAX_WORKERS } from './booking-slots.js'
import { ALL_SERVICES } from '../src/data.js'
import { POST } from '../app/api/book/route.js'

const SERVICE = ALL_SERVICES.find((s) => s.id === 1)

const VALID_BODY = {
  serviceId: 1,
  clientName: 'Test Client',
  clientPhone: '0322 2782254',
  date: '2026-07-15', // Wednesday - tomorrow relative to the frozen clock
  time: '12:00',
  notes: '',
}

function makeRequest(body, { origin = 'https://farwasalon.com' } = {}) {
  const headers = { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.9' }
  if (origin) headers.origin = origin
  return new Request('http://localhost/api/book', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

function confirmed(time, duration = 30) {
  return { status: 'Confirmed', timeSlot: time, duration, endTime: addMinutes(time, duration) }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 6, 14, 9, 0, 0)) // Tue 2026-07-14 09:00 local
  process.env.BOOKING_CANCEL_SECRET = 'test-secret-fixture-do-not-use-in-prod'
  getSheetRows.mockReset().mockResolvedValue([])
  appendBooking.mockReset().mockResolvedValue(undefined)
  updateBookingStatus.mockReset().mockResolvedValue(undefined)
  isConfigured.mockReset().mockReturnValue(true)
  checkRateLimit.mockReset().mockReturnValue({ limited: false })
})

afterEach(() => {
  vi.useRealTimers()
  delete process.env.BOOKING_CANCEL_SECRET
})

describe('POST /api/book - validation gate', () => {
  it('sanity: service id 1 exists in the catalog', () => {
    expect(SERVICE).toBeTruthy()
  })

  it('rejects disallowed origins with 403', async () => {
    const res = await POST(makeRequest(VALID_BODY, { origin: 'https://evil.com' }))
    expect(res.status).toBe(403)
    expect(appendBooking).not.toHaveBeenCalled()
  })

  it('rejects honeypot submissions with 400', async () => {
    for (const trap of [{ website: 'http://spam' }, { _hp: 'bot' }]) {
      const res = await POST(makeRequest({ ...VALID_BODY, ...trap }))
      expect(res.status).toBe(400)
    }
    expect(appendBooking).not.toHaveBeenCalled()
  })

  it('rejects non-string/non-number serviceId with 400 and unknown service with 404', async () => {
    expect((await POST(makeRequest({ ...VALID_BODY, serviceId: { evil: 1 } }))).status).toBe(400)
    expect((await POST(makeRequest({ ...VALID_BODY, serviceId: 999999 }))).status).toBe(404)
  })

  it('rejects invalid phone formats with 400', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, clientPhone: '12345' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toContain('phone')
  })

  it('rejects a Sunday (salon closed) with 400', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, date: '2026-07-19' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toContain('Sunday')
  })

  it('rejects past dates and dates beyond the booking window', async () => {
    expect((await POST(makeRequest({ ...VALID_BODY, date: '2026-07-13' }))).status).toBe(400)
    expect((await POST(makeRequest({ ...VALID_BODY, date: '2026-07-29' }))).status).toBe(400)
  })

  it('rejects times outside the slot grid with 400', async () => {
    for (const time of ['10:00', '19:00', '12:15']) {
      expect((await POST(makeRequest({ ...VALID_BODY, time }))).status).toBe(400)
    }
  })

  it('returns 429 when rate limited', async () => {
    checkRateLimit.mockReturnValueOnce({ limited: true, retryAfter: 30 })
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(429)
  })
})

describe('POST /api/book - double-booking guard', () => {
  it('books successfully on an empty calendar and returns a verifiable cancel token', async () => {
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(200)
    const { success, booking } = await res.json()
    expect(success).toBe(true)
    expect(booking.id).toBe('FBS-7E57C0DE')
    const expectedDuration = computeBookingDurationMinutes(SERVICE, [])
    expect(booking.duration).toBe(expectedDuration)
    expect(booking.endTime).toBe(addMinutes('12:00', expectedDuration))
    expect(appendBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingId: 'FBS-7E57C0DE',
        date: VALID_BODY.date,
        timeSlot: '12:00',
        status: 'Confirmed',
      }),
    )
    // token must decode back to this booking, bound to the phone's last 4 digits
    expect(verifyCancelToken(booking.cancelToken)).toEqual({
      bookingId: 'FBS-7E57C0DE',
      date: VALID_BODY.date,
      phoneLast4: '2254',
    })
  })

  it('returns 409 when the requested slot is at worker capacity', async () => {
    getSheetRows.mockResolvedValue(
      Array.from({ length: MAX_WORKERS }, () => confirmed('12:00')),
    )
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(409)
    expect(appendBooking).not.toHaveBeenCalled()
  })

  it('returns 409 for the ADJACENT slot too, because of the 15-min buffer', async () => {
    // Two bookings ending 12:30 occupy 12:30 as well (buffer) - 12:30 request must fail.
    getSheetRows.mockResolvedValue([confirmed('12:00'), confirmed('12:00')])
    const res = await POST(makeRequest({ ...VALID_BODY, time: '12:30' }))
    expect(res.status).toBe(409)
  })

  it('still books when one worker remains free at the slot', async () => {
    getSheetRows.mockResolvedValue([confirmed('12:00')])
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(200)
  })

  /* A static mock returned the same rows for the pre-check and the post-append
     verify, so it never modelled the row the route had just written. That hid a
     bug where the last free station at any slot was always rejected: the verify
     counted our own booking and concluded the slot was full. This mock appends,
     the way the real sheet does. */
  it('books the LAST free station — the verify must not count our own row', async () => {
    const rows = [confirmed('12:00')] // 1 of 2 taken
    getSheetRows.mockImplementation(async () => [...rows])
    appendBooking.mockImplementation(async (row) => {
      rows.push({ ...confirmed('12:00'), bookingId: row.bookingId, status: 'Confirmed' })
    })

    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(200)
    expect(updateBookingStatus).not.toHaveBeenCalled()
    expect(rows).toHaveLength(2)
  })

  it('still rolls back when someone else genuinely takes the last station mid-write', async () => {
    const rows = [confirmed('12:00')]
    getSheetRows.mockImplementation(async () => [...rows])
    appendBooking.mockImplementation(async (row) => {
      // our row, plus a competitor who landed between pre-check and verify
      rows.push({ ...confirmed('12:00'), bookingId: row.bookingId, status: 'Confirmed' })
      rows.push({ ...confirmed('12:00'), bookingId: 'OTHER', status: 'Confirmed' })
    })

    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(409)
    expect(updateBookingStatus).toHaveBeenCalledWith(expect.any(String), 'Cancelled')
  })

  it('cancelled rows do not consume capacity', async () => {
    getSheetRows.mockResolvedValue([
      { ...confirmed('12:00'), status: 'Cancelled' },
      { ...confirmed('12:00'), status: 'Cancelled' },
    ])
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(200)
  })

  it('race lost after append: rolls the booking back to Cancelled and returns 409', async () => {
    // First read (pre-check): empty. Second read (post-append verify): rival bookings
    // filled the slot - ours must be auto-cancelled.
    getSheetRows
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([confirmed('12:00'), confirmed('12:00'), confirmed('12:00')])
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(409)
    expect((await res.json()).error).toContain('just booked')
    expect(updateBookingStatus).toHaveBeenCalledWith('FBS-7E57C0DE', 'Cancelled')
  })

  it('verify-read failure is optimistic: booking still succeeds', async () => {
    getSheetRows
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error('sheets flake'))
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(200)
    expect(updateBookingStatus).not.toHaveBeenCalled()
  })

  it('returns 502 without booking when the availability read fails', async () => {
    getSheetRows.mockRejectedValueOnce(new Error('sheets down'))
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(502)
    expect(appendBooking).not.toHaveBeenCalled()
  })
})
