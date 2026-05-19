import { test, expect } from '@playwright/test'

test.describe('Services pages', () => {
  test('/services shows category grid and ItemList schema', async ({ page }) => {
    await page.goto('/services')
    await expect(page.getByRole('heading', { name: /services/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /threading/i }).first()).toBeVisible()

    const html = await page.content()
    expect(html).toMatch(/"@type"\s*:\s*"ItemList"/)
  })

  test('/services/threading has prices, Offer schema, speakable ids', async ({ page }) => {
    await page.route('**/api/slots**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ slots: [{ time: '10:00', available: true }] }),
      })
    })

    await page.goto('/services/threading')
    await expect(page.locator('#service-category-title')).toContainText(/threading/i)
    await expect(page.locator('#service-category-desc')).toBeVisible()
    await expect(page.getByText(/Rs/i).first()).toBeVisible()

    const html = await page.content()
    expect(html).toMatch(/"@type"\s*:\s*"(Offer|AggregateOffer)"/)
    expect(html).toMatch(/SpeakableSpecification/)
    expect(html).toContain('service-category-title')

    await expect(page.locator('#main')).toBeVisible()
  })
})
