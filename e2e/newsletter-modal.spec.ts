import { test, expect } from '@playwright/test'

test.describe('Newsletter popup', () => {
  test('home does not open an email capture dialog', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight * 0.9, behavior: 'instant' })
      window.dispatchEvent(new Event('scroll'))
    })
    await page.waitForTimeout(800)
    await expect(
      page.getByRole('dialog', { name: /tips from the chair|salon updates|seasonal tips/i }),
    ).toHaveCount(0)
  })
})
