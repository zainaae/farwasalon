import { test, expect } from '@playwright/test'
import { mockSubscribeApi, openNewsletterModal } from './helpers'

test.describe('Newsletter modal', () => {
  test.beforeEach(async ({ page }) => {
    await mockSubscribeApi(page)
  })

  test('submit valid email shows success message', async ({ page }) => {
    await openNewsletterModal(page)

    await page.locator('#nl-email').fill('e2e-test@example.com')
    await page.getByRole('button', { name: /join the list/i }).click()

    await expect(page.getByRole('heading', { name: /welcome!/i })).toBeVisible({ timeout: 15_000 })
    /* The modal used to promise a 10% code by email. appendSubscriber() has one
       caller and zero readers, so nothing ever sent one. The copy now promises
       only what the site can deliver, and this asserts that the old promise
       cannot come back. */
    await expect(page.getByText(/never often, never spam/i)).toBeVisible()
    await expect(page.getByText(/code will arrive/i)).toHaveCount(0)
  })

  // Exit-intent uses document mouseleave + clientY <= 0; headless Chromium does not
  // reliably synthesize pointer leave at the viewport edge, so this stays skipped.
  test.skip('exit-intent mouseleave opens modal', async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.removeItem('farwa-newsletter-seen')
      } catch {
        // private mode
      }
    })
    await page.goto('/')
    await page.evaluate(() => {
      document.dispatchEvent(new MouseEvent('mouseleave', { clientY: -1, bubbles: true }))
    })
    await expect(page.getByRole('dialog', { name: /salon updates|seasonal tips/i })).toBeVisible({ timeout: 5_000 })
  })
})
