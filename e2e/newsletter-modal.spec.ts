import { test, expect } from '@playwright/test'

test.describe('Newsletter capture removed', () => {
  test('home has no email capture dialog', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight * 0.9, behavior: 'instant' })
      window.dispatchEvent(new Event('scroll'))
    })
    await page.waitForTimeout(500)
    await expect(
      page.getByRole('dialog', { name: /tips from the chair|salon updates|seasonal tips/i }),
    ).toHaveCount(0)
  })

  test('footer has no subscribe email field', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#footer-nl-email, #nl-email')).toHaveCount(0)
    await expect(page.getByRole('button', { name: /join the list|subscribe/i })).toHaveCount(0)
  })

  test('/api/subscribe is gone', async ({ request }) => {
    const res = await request.post('/api/subscribe', {
      data: { email: 'e2e-test@example.com', firstName: 'E2E' },
    })
    expect(res.status()).toBe(404)
  })
})
