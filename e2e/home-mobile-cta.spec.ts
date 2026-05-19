import { test, expect } from '@playwright/test'

test.describe('Home — mobile CTA bar', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('hero, service tabs, and sticky tel/wa/book CTAs', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#main')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    await expect(page.getByRole('navigation', { name: 'Quick contact and booking' })).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByRole('link', { name: 'Book an appointment online' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Call the salon' })).toHaveAttribute('href', /tel:/)
    await expect(page.getByRole('link', { name: 'Message the salon on WhatsApp' })).toHaveAttribute(
      'href',
      /wa\.me/,
    )

    const servicesLink = page.getByRole('link', { name: /services/i }).first()
    if (await servicesLink.isVisible()) {
      await expect(servicesLink).toBeVisible()
    }

    const servicesSection = page.locator('section').filter({
      has: page.getByRole('tablist', { name: 'Filter service categories' }),
    })
    await servicesSection.scrollIntoViewIfNeeded()
    await page.getByRole('tab', { name: 'Threading' }).click()
    await expect(page.getByRole('tab', { name: 'Threading' })).toHaveAttribute('aria-selected', 'true')
    const categoryLinks = servicesSection.locator('.divide-y').getByRole('link')
    await expect(categoryLinks).toHaveCount(1)
    await expect(categoryLinks.first()).toContainText(/threading/i)
  })

  test('sticky mobile CTA hidden on /book', async ({ page }) => {
    await page.goto('/book')
    await expect(page.getByRole('heading', { name: /book/i })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Quick contact and booking' })).toHaveCount(0)
  })

  test('footer Book Online links point to /book', async ({ page }) => {
    await page.goto('/')
    const bookLinks = page.locator('footer a[href="/book"], footer a[href^="/book?"]')
    await expect(bookLinks.first()).toBeVisible()
    await expect(bookLinks.first()).toHaveAttribute('href', /\/book/)
  })
})
