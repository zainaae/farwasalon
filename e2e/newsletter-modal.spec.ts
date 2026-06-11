import { test, expect } from '@playwright/test'
import { mockSubscribeApi, openNewsletterModal } from './helpers'

test.describe('Newsletter modal', () => {
  test.beforeEach(async ({ page }) => {
    await mockSubscribeApi(page)
  })

  test('submit valid email shows success message', async ({ page }) => {
    await openNewsletterModal(page)

    await page.locator('#nl-email').fill('e2e-test@example.com')
    await page.getByRole('button', { name: /get my 10% off/i }).click()

    await expect(page.getByRole('heading', { name: /welcome!/i })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/10% off code will arrive/i)).toBeVisible()
  })
})
