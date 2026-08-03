/**
 * Integration tests for GET /api/slots — multi-service duration sum, catalog
 * validation for serviceIds, and closed-day short-circuit. Sheets + rate limit mocked.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('./google-sheets.js', () => ({
  getSheetRows: vi.fn(),
  isConfigured: vi.fn(() => true),
}))
vi.mock('./rate-limit.js', () => ({
  checkRateLimit: vi.fn(() => ({ limited: false })),
  getClientIp: vi.fn(() => '203.0.113.9'),
}))

import { getSheetRows, isConfigured } from './google-sheets.js'
import { checkRateLimit } from './rate-limit.js'
import { MAX_BOOKING_SERVICES } from './booking-duration.js'
import { FILTERED_SLOTS } from './booking-slots.js'
import { ALL_SERVICES } from '../src/data.js'
import { GET } from '../app/api/slots/route.js'

function makeRequest(query) {
  const url = new URL('http://localhost/api/slots')
  for (const [k, v] of Object.entries(query)) {
    if (v != null) url.searchParams.set(k, String(v))
  }
  return new Request(url, {
    method: 'GET',
    headers: { 'x-forwarded-for': '203.0.113.9' },
  })
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 6, 14, 9, 0, 0)) // Tue 2026-07-14 09:00 local
  getSheetRows.mockReset().mockResolvedValue([])
  isConfigured.mockReset().mockReturnValue(true)
  checkRateLimit.mockReset().mockReturnValue({ limited: false })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('GET /api/slots - multi-service validation', () => {
  it('returns 200 with a slot grid for two real service ids', async () => {
    const res = await GET(makeRequest({ date: '2026-07-15', serviceIds: '1,2' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.slots).toHaveLength(FILTERED_SLOTS.length)
    expect(body.slots.every((s) => typeof s.time === 'string' && typeof s.available === 'boolean')).toBe(
      true,
    )
  })

  it('applies summed multi-service duration so late slots cannot fit a long visit', async () => {
    const short = await GET(makeRequest({ date: '2026-07-15', serviceIds: '1,2' }))
    const long = await GET(makeRequest({ date: '2026-07-15', serviceIds: '27,37' }))
    expect(short.status).toBe(200)
    expect(long.status).toBe(200)
    const shortSlots = (await short.json()).slots
    const longSlots = (await long.json()).slots
    const lateShort = shortSlots.find((s) => s.time === '18:30')
    const lateLong = longSlots.find((s) => s.time === '18:30')
    expect(lateShort.available).toBe(true)
    expect(lateLong.available).toBe(false)
  })

  it('allows date-only polls without serviceIds (legacy 30-min grid)', async () => {
    const res = await GET(makeRequest({ date: '2026-07-15' }))
    expect(res.status).toBe(200)
    expect((await res.json()).slots).toHaveLength(FILTERED_SLOTS.length)
  })

  it('treats empty serviceIds as omitted (not an error)', async () => {
    const res = await GET(makeRequest({ date: '2026-07-15', serviceIds: '' }))
    expect(res.status).toBe(200)
  })

  it('rejects unknown serviceIds with 404', async () => {
    const res = await GET(makeRequest({ date: '2026-07-15', serviceIds: '999999' }))
    expect(res.status).toBe(404)
    expect((await res.json()).error).toMatch(/not found/i)
  })

  it('rejects more than MAX_BOOKING_SERVICES with 400', async () => {
    const ids = ALL_SERVICES.map((s) => s.id)
      .slice(0, MAX_BOOKING_SERVICES + 1)
      .join(',')
    const res = await GET(makeRequest({ date: '2026-07-15', serviceIds: ids }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/up to/i)
  })

  it('rejects missing date with 400', async () => {
    expect((await GET(makeRequest({ serviceIds: '1,2' }))).status).toBe(400)
  })
})
