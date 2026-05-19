import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkRateLimit } from './rate-limit.js'

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
})
