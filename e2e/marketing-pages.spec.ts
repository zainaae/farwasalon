import { test, expect } from '@playwright/test'
import { assertNoHorizontalOverflow, visibleMain } from './helpers'
import { SERVICES, YEARS_ACTIVE } from '../src/data.js'

const CATEGORY_COUNT = Object.keys(SERVICES).length
const SERVICE_COUNT = Object.values(SERVICES).reduce((a, v) => a + v.length, 0)

const MARKETING_PAGES = [
  { path: '/about', heading: /our story/i },
  { path: '/faq', heading: /frequently asked/i },
  { path: '/privacy', heading: /privacy policy/i },
] as const

test.describe('Marketing pages @ 390px', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  for (const { path, heading } of MARKETING_PAGES) {
    test(`${path} loads with heading and no horizontal overflow`, async ({ page }) => {
      const res = await page.goto(path)
      expect(res?.status()).toBe(200)

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.getByRole('heading', { level: 1 })).toContainText(heading)
      await expect(visibleMain(page)).toBeVisible()

      await page.waitForTimeout(300)
      await assertNoHorizontalOverflow(page)
    })
  }

  test('/about stats expose sr-only labels for screen readers', async ({ page }) => {
    await page.goto('/about')
    const srOnly = visibleMain(page).locator('.sr-only')
    await expect(srOnly).toHaveCount(4)
    await expect(srOnly.nth(0)).toHaveText(`${YEARS_ACTIVE}+ Years of expertise`)
    await expect(srOnly.nth(1)).toHaveText(`${CATEGORY_COUNT} Service categories`)
    // No "+": the count is computed from SERVICES, so it is exactly this number.
    await expect(srOnly.nth(2)).toHaveText(`${SERVICE_COUNT} Services on the menu`)
    await expect(srOnly.nth(3)).toHaveText('1,000+ Appointments a month')
  })

  test('/team permanently redirects to /about', async ({ page }) => {
    const res = await page.goto('/team', { waitUntil: 'commit' })
    expect(res?.status()).toBe(200)
    expect(page.url()).toMatch(/\/about$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/our story/i)
  })
})
