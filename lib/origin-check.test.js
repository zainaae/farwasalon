import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { isAllowedOrigin } from './origin-check.js'

function requestWithOrigin(origin) {
  const headers = new Headers()
  if (origin != null) headers.set('origin', origin)
  return { headers }
}

describe('isAllowedOrigin', () => {
  const prevVercelUrl = process.env.VERCEL_URL
  const prevAllowed = process.env.ALLOWED_BOOKING_ORIGINS

  beforeEach(() => {
    delete process.env.VERCEL_URL
    delete process.env.ALLOWED_BOOKING_ORIGINS
  })

  afterEach(() => {
    if (prevVercelUrl === undefined) delete process.env.VERCEL_URL
    else process.env.VERCEL_URL = prevVercelUrl
    if (prevAllowed === undefined) delete process.env.ALLOWED_BOOKING_ORIGINS
    else process.env.ALLOWED_BOOKING_ORIGINS = prevAllowed
  })

  it('allows requests with no Origin header (curl / server-to-server)', () => {
    expect(isAllowedOrigin(requestWithOrigin(null))).toBe(true)
  })

  it('allows the production origins', () => {
    expect(isAllowedOrigin(requestWithOrigin('https://farwasalon.com'))).toBe(true)
    expect(isAllowedOrigin(requestWithOrigin('https://www.farwasalon.com'))).toBe(true)
  })

  it('allows localhost dev origins', () => {
    expect(isAllowedOrigin(requestWithOrigin('http://localhost:3000'))).toBe(true)
    expect(isAllowedOrigin(requestWithOrigin('http://localhost:3001'))).toBe(true)
  })

  it('allows the exact Vercel production alias', () => {
    expect(isAllowedOrigin(requestWithOrigin('https://farwasalon.vercel.app'))).toBe(true)
  })

  it('allows the current deployment host from VERCEL_URL', () => {
    process.env.VERCEL_URL = 'farwasalon-git-branch-team.vercel.app'
    expect(
      isAllowedOrigin(requestWithOrigin('https://farwasalon-git-branch-team.vercel.app')),
    ).toBe(true)
  })

  it('allows origins listed in ALLOWED_BOOKING_ORIGINS', () => {
    process.env.ALLOWED_BOOKING_ORIGINS =
      'https://farwasalon-git-feature-team.vercel.app, https://staging.example.com'
    expect(
      isAllowedOrigin(requestWithOrigin('https://farwasalon-git-feature-team.vercel.app')),
    ).toBe(true)
    expect(isAllowedOrigin(requestWithOrigin('https://staging.example.com'))).toBe(true)
  })

  it('rejects attacker farwasalon-*.vercel.app hosts unless allowlisted', () => {
    // Prefix alone must NOT grant access — anyone can register farwasalon-evil.
    expect(isAllowedOrigin(requestWithOrigin('https://farwasalon-evil.vercel.app'))).toBe(false)
    expect(isAllowedOrigin(requestWithOrigin('https://farwasalon-abc123.vercel.app'))).toBe(false)
  })

  it('rejects arbitrary third-party origins', () => {
    expect(isAllowedOrigin(requestWithOrigin('https://evil.com'))).toBe(false)
    expect(isAllowedOrigin(requestWithOrigin('http://farwasalon.com'))).toBe(false) // http downgrade
    expect(isAllowedOrigin(requestWithOrigin('https://farwasalon.com.evil.com'))).toBe(false) // suffix trick
    expect(isAllowedOrigin(requestWithOrigin('http://localhost:9999'))).toBe(false)
    expect(isAllowedOrigin(requestWithOrigin('https://attacker-site.vercel.app'))).toBe(false)
    expect(isAllowedOrigin(requestWithOrigin('https://farwasalon-abc123.vercel.app.evil.com'))).toBe(false)
  })

  it('rejects the literal "null" origin (sandboxed iframes / file://)', () => {
    expect(isAllowedOrigin(requestWithOrigin('null'))).toBe(false)
  })

  it('is case-sensitive on the host (browsers always send lowercase)', () => {
    expect(isAllowedOrigin(requestWithOrigin('https://FARWASALON.COM'))).toBe(false)
  })
})
