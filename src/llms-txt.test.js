/**
 * public/llms.txt is the plain-text salon brief for assistants that fetch it.
 * Google Search does not require it, but wrong facts here get quoted — keep it
 * locked to the same sources the site uses (menu count, GBP stats, NAP).
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { GOOGLE_GBP_STATS } from './google-reviews-data.js'
import { getMenuStats } from '../lib/service-schema.js'
import {
  SALON_PHONE_DISPLAY,
  SALON_STREET,
  SALON_POSTAL,
  WA_PROFILE,
} from '../lib/business-schema.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const llms = readFileSync(join(root, 'public', 'llms.txt'), 'utf8')
const menu = getMenuStats()

describe('public/llms.txt stays accurate', () => {
  it('states the live menu size, not a rounded “100+”', () => {
    expect(llms).toContain(`${menu.total} services`)
    expect(llms).not.toMatch(/100\+\s*services/i)
  })

  it('matches GBP rating and review count', () => {
    expect(llms).toContain(`${GOOGLE_GBP_STATS.rating}/5`)
    expect(llms).toContain(`${GOOGLE_GBP_STATS.reviewCount} reviews`)
  })

  it('keeps NAP + WhatsApp consistent with schema', () => {
    expect(llms).toContain(SALON_STREET)
    expect(llms).toContain(SALON_POSTAL)
    expect(llms).toContain(SALON_PHONE_DISPLAY)
    expect(llms).toContain(WA_PROFILE)
  })

  it('states women-only, studio-only, and quote-only edges', () => {
    expect(llms).toMatch(/women-only/i)
    expect(llms).toMatch(/no home services/i)
    expect(llms).toMatch(/keratin/i)
    expect(llms).toMatch(/party makeup/i)
  })

  it('does not advertise Freedom Deal as live', () => {
    expect(llms).toMatch(/No Freedom Deal/i)
    expect(llms).not.toMatch(/Freedom Deal is live|Now on.*Freedom/i)
  })

  it('points at money pages assistants should cite', () => {
    for (const path of ['/prices', '/bridal', '/deals', '/book', '/faq', '/gallery', '/about']) {
      expect(llms).toContain(`https://farwasalon.com${path}`)
    }
  })
})
