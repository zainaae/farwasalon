import { test, expect } from '@playwright/test'
import { assertNoHorizontalOverflow } from './helpers'

const MARKETING_PAGES = [
  { path: '/about', heading: /our story/i },
  { path: '/faq', heading: /frequently asked/i },
  { path: '/team', heading: /our team/i },
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
      await expect(page.locator('#main')).toBeVisible()

      await page.waitForTimeout(300)
      await assertNoHorizontalOverflow(page)
    })
  }
})
