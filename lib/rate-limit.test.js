import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { checkRateLimit, getClientIp } from './rate-limit.js'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-20T12:00:00Z'))
  })

  it('allows requests under the limit', () => {
    const ip = `test-1-${Date.now()}`
    const opts = { window: 60, max: 3 }
    expect(checkRateLimit(ip, opts).limited).toBe(false)
    expect(checkRateLimit(ip, opts).limited).toBe(false)
    expect(checkRateLimit(ip, opts).limited).toBe(false)
  })

  it('rejects when over the limit', () => {
    const ip = `test-2-${Date.now()}`
    const opts = { window: 60, max: 2 }
    expect(checkRateLimit(ip, opts).limited).toBe(false)
    expect(checkRateLimit(ip, opts).limited).toBe(false)
    const result = checkRateLimit(ip, opts)
    expect(result.limited).toBe(true)
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  it('treats different IPs independently', () => {
    const opts = { window: 60, max: 1 }
    const ipA = `test-3a-${Date.now()}`
    const ipB = `test-3b-${Date.now()}`
    expect(checkRateLimit(ipA, opts).limited).toBe(false)
    expect(checkRateLimit(ipB, opts).limited).toBe(false)
    // ipA should now be limited
    expect(checkRateLimit(ipA, opts).limited).toBe(true)
    // ipB also limited (independent counter, both at limit)
    expect(checkRateLimit(ipB, opts).limited).toBe(true)
  })

  it('allows again after window expires', () => {
    const ip = `test-4-${Date.now()}`
    const opts = { window: 60, max: 1 }
    expect(checkRateLimit(ip, opts).limited).toBe(false)
    expect(checkRateLimit(ip, opts).limited).toBe(true)
    // Advance past the window
    vi.advanceTimersByTime(61_000)
    expect(checkRateLimit(ip, opts).limited).toBe(false)
  })

  it('returns retryAfter close to window length', () => {
    const ip = `test-5-${Date.now()}`
    const opts = { window: 60, max: 1 }
    checkRateLimit(ip, opts)
    const result = checkRateLimit(ip, opts)
    expect(result.limited).toBe(true)
    expect(result.retryAfter).toBeGreaterThan(0)
    expect(result.retryAfter).toBeLessThanOrEqual(60)
  })

  it('treats scopes independently for the same ip and window', () => {
    const ip = `test-6-${Date.now()}`
    const opts = { window: 600, max: 2 }
    expect(checkRateLimit(ip, { ...opts, scope: 'book' }).limited).toBe(false)
    expect(checkRateLimit(ip, { ...opts, scope: 'book' }).limited).toBe(false)
    // book budget is exhausted, but book-cancel still has its own budget
    expect(checkRateLimit(ip, { ...opts, scope: 'book' }).limited).toBe(true)
    expect(checkRateLimit(ip, { ...opts, scope: 'book-cancel' }).limited).toBe(false)
  })
})

/* getClientIp read only x-vercel-forwarded-for. Off Vercel that header never
   arrives, every visitor keys to 'unknown', and the clamp caps that shared
   bucket at 2 — the third person to open /book in a minute gets a 429 and an
   empty time grid. TRUSTED_IP_HEADER lets a non-Vercel deploy name the header
   its own proxy sets. Opt-in, never a fallback chain: a chain is what lets an
   attacker rotate headers per request. */
describe('trusted IP header is configurable for non-Vercel targets', () => {
  const req = (headers) => new Request('http://localhost/api/book', { headers })

  afterEach(() => {
    delete process.env.TRUSTED_IP_HEADER
  })

  it('reads the Vercel header by default', () => {
    expect(getClientIp(req({ 'x-vercel-forwarded-for': '203.0.113.7' }))).toBe('203.0.113.7')
  })

  it('reads a configured header instead when one is named', () => {
    process.env.TRUSTED_IP_HEADER = 'x-real-ip'
    expect(getClientIp(req({ 'x-real-ip': '198.51.100.4' }))).toBe('198.51.100.4')
  })

  it('does NOT fall back to other headers — that is the spoofing hole', () => {
    process.env.TRUSTED_IP_HEADER = 'x-real-ip'
    expect(getClientIp(req({ 'x-forwarded-for': '198.51.100.9' }))).toBe('unknown')
  })

  it('takes the first entry of a comma list', () => {
    expect(getClientIp(req({ 'x-vercel-forwarded-for': ' 203.0.113.7 , 10.0.0.1 ' }))).toBe('203.0.113.7')
  })
})

describe('a rejected request does not extend its own lockout', () => {
  it('lets a customer through again once the window rolls, not later', () => {
    const ip = `reject-test-${Math.random()}`
    const opts = { scope: 'book', window: 600, max: 2 }
    expect(checkRateLimit(ip, opts).limited).toBe(false)
    expect(checkRateLimit(ip, opts).limited).toBe(false)

    const first = checkRateLimit(ip, opts)
    expect(first.limited).toBe(true)

    // Tapping "try again" must not push the window further out.
    const second = checkRateLimit(ip, opts)
    expect(second.limited).toBe(true)
    expect(second.retryAfter).toBeLessThanOrEqual(first.retryAfter)
  })
})
