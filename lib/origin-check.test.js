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

  it('allows this project\'s Vercel preview deployments', () => {
    // Vercel preview hosts: farwasalon-<hash>.vercel.app (and the bare
    // project alias). Only THIS project's hosts are trusted.
    expect(isAllowedOrigin(requestWithOrigin('https://farwasalon-abc123.vercel.app'))).toBe(true)
  })

  it('rejects arbitrary third-party origins', () => {
    expect(isAllowedOrigin(requestWithOrigin('https://evil.com'))).toBe(false)
    expect(isAllowedOrigin(requestWithOrigin('http://farwasalon.com'))).toBe(false) // http downgrade
    expect(isAllowedOrigin(requestWithOrigin('https://farwasalon.com.evil.com'))).toBe(false) // suffix trick
    expect(isAllowedOrigin(requestWithOrigin('http://localhost:9999'))).toBe(false)
    // ANY *.vercel.app page was previously allowed — anyone can create a free
    // Vercel project, so that was no CSRF control at all. Only preview hosts
    // that belong to THIS project pass now.
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
