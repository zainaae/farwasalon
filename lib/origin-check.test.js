import { describe, it, expect } from 'vitest'
import { isAllowedOrigin } from './origin-check.js'

function requestWithOrigin(origin) {
  const headers = new Headers()
  if (origin != null) headers.set('origin', origin)
  return { headers }
}

describe('isAllowedOrigin', () => {
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

  it('allows Vercel preview deployments', () => {
    expect(isAllowedOrigin(requestWithOrigin('https://farwa-abc123.vercel.app'))).toBe(true)
  })

  it('rejects arbitrary third-party origins', () => {
    expect(isAllowedOrigin(requestWithOrigin('https://evil.com'))).toBe(false)
    expect(isAllowedOrigin(requestWithOrigin('http://farwasalon.com'))).toBe(false) // http downgrade
    expect(isAllowedOrigin(requestWithOrigin('https://farwasalon.com.evil.com'))).toBe(false) // suffix trick
    expect(isAllowedOrigin(requestWithOrigin('http://localhost:9999'))).toBe(false)
  })

  it('rejects the literal "null" origin (sandboxed iframes / file://)', () => {
    expect(isAllowedOrigin(requestWithOrigin('null'))).toBe(false)
  })

  it('is case-sensitive on the host (browsers always send lowercase)', () => {
    expect(isAllowedOrigin(requestWithOrigin('https://FARWASALON.COM'))).toBe(false)
  })

  it('documents that ANY *.vercel.app origin is accepted (known policy tradeoff)', () => {
    // Anyone can deploy to <name>.vercel.app, so this check is spam-prevention,
    // not a security boundary. Pinned here so a future tightening is deliberate.
    expect(isAllowedOrigin(requestWithOrigin('https://attacker-site.vercel.app'))).toBe(true)
  })
})
