/**
 * The printed price list does not update itself.
 *
 * Every surface showing PKR rates — /prices, category rails, booking, schema —
 * reads from SERVICES in src/data.js. Pakistan inflation and menu changes make
 * stale prices the same failure mode this site criticises in aggregators.
 *
 * This test fails once PRICES_LAST_VERIFIED is 90 days old. Fix: re-check the
 * floor menu against the salon, update any pricePkr that moved, set
 * PRICES_LAST_VERIFIED to today in the same commit.
 */
import { describe, it, expect } from 'vitest'
import { PRICES_LAST_VERIFIED, SERVICES } from './data.js'

const MAX_AGE_DAYS = 90
const daysSince = (ymd) => Math.floor((Date.now() - Date.parse(`${ymd}T00:00:00Z`)) / 86_400_000)

describe('Printed prices are current', () => {
  it('records when the menu was last verified', () => {
    expect(PRICES_LAST_VERIFIED, 'PRICES_LAST_VERIFIED is missing').toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('was verified in the last 90 days', () => {
    const age = daysSince(PRICES_LAST_VERIFIED)
    expect(
      age,
      `Printed prices were last verified ${age} days ago (${PRICES_LAST_VERIFIED}). ` +
        'Re-check SERVICES pricePkr against the salon floor list and set PRICES_LAST_VERIFIED to today.',
    ).toBeLessThanOrEqual(MAX_AGE_DAYS)
  })

  it('was not verified in the future', () => {
    expect(daysSince(PRICES_LAST_VERIFIED)).toBeGreaterThanOrEqual(0)
  })

  it('still has priced services on the menu', () => {
    const priced = Object.values(SERVICES).flat().filter((s) => s.pricePkr != null)
    expect(priced.length).toBeGreaterThan(50)
  })
})
