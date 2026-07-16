import { test, expect } from '@playwright/test'
import { ALL_CATEGORY_SLUGS } from './helpers'

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

  for (const slug of ALL_CATEGORY_SLUGS) {
    test(`/services/${slug} loads with heading and prices`, async ({ page }) => {
      const res = await page.goto(`/services/${slug}`)
      expect(res?.status()).toBe(200)
      await expect(page.locator('#service-category-title')).toBeVisible()
      await expect(page.getByText(/Rs/i).first()).toBeVisible()
      await expect(page.locator('ul li').first()).toBeVisible()
    })
  }

  test('/services category videos mount only on hover', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('farwa-newsletter-seen', '1'))
    await page.goto('/services')
    await expect(page.getByRole('link', { name: /threading/i }).first()).toBeVisible()

    // No hover yet — no category clip may be fetched just from browsing the grid.
    expect(await page.locator('article video').count()).toBe(0)

    const card = page.locator('article', { has: page.locator('a[href="/services/threading"]') })
    await card.hover()
    await expect(card.locator('video source[src="/threading.mp4"]')).toHaveCount(1)
  })

  test('/services/hair service modal and book link', async ({ page }) => {
    await page.goto('/services/hair')
    await page.getByRole('button', { name: /haircut & blowdry/i }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: /haircut & blowdry/i })).toBeVisible()

    const bookLink = page.getByRole('link', { name: /book haircut & blowdry/i })
    await expect(bookLink).toHaveAttribute('href', /\/book\?serviceId=\d+/)
  })

  test('/services/bridal service modal and book link', async ({ page }) => {
    await page.goto('/services/bridal')
    await page.getByRole('button', { name: /full bridal package/i }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: /full bridal package/i })).toBeVisible()

    const bookLink = page.getByRole('link', { name: /book full bridal package/i })
    await expect(bookLink).toHaveAttribute('href', /\/book\?serviceId=\d+/)
  })

  test('/services/facials lists services with book links', async ({ page }) => {
    await page.goto('/services/facials')
    await expect(page.locator('#service-category-title')).toContainText(/facials/i)

    const bookLink = page.getByRole('link', { name: /book normal facial/i })
    await expect(bookLink).toHaveAttribute('href', /\/book\?serviceId=\d+/)
  })
})
