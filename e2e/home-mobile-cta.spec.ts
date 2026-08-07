import { test, expect } from '@playwright/test'
import { visibleMain } from './helpers'

test.describe('Home — mobile CTA bar', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('hero, service tabs, and sticky tel/wa/book CTAs', async ({ page }) => {
    await page.goto('/')
    await expect(visibleMain(page)).toBeVisible()
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

    /* These filters used to declare role=tablist/role=tab with aria-selected.
       That contract promises arrow-key roving focus and an owned tabpanel, and
       neither exists — so the roles were removed in favour of aria-pressed
       toggle buttons, and this test follows the corrected semantics. */
    const servicesSection = page.locator('section').filter({
      has: page.getByRole('group', { name: 'Filter service categories' }),
    })
    await servicesSection.scrollIntoViewIfNeeded()
    const threading = page.getByRole('button', { name: 'Threading', exact: true })
    await threading.click()
    await expect(threading).toHaveAttribute('aria-pressed', 'true')
    const categoryLinks = servicesSection.locator('.divide-y').getByRole('link')
    await expect(categoryLinks).toHaveCount(1)
    await expect(categoryLinks.first()).toContainText(/threading/i)
  })

  test('sticky mobile CTA hidden on /book', async ({ page }) => {
    await page.goto('/book')
    // Tier-A H1 is "BOOK — ONLINE" (may render from Suspense fallback before the client form hydrates)
    await expect(page.getByRole('heading', { level: 1, name: /book|online/i })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Quick contact and booking' })).toHaveCount(0)
  })

  test('gallery uses 3-action sticky CTA (not book-only pill)', async ({ page }) => {
    await page.goto('/gallery')
    await expect(page.getByRole('navigation', { name: 'Quick contact and booking' })).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByRole('link', { name: 'Book an appointment online' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Call the salon' })).toBeVisible()
  })

  test('footer Book Online links point to /book', async ({ page }) => {
    await page.goto('/')
    const bookLinks = page.locator('footer a[href="/book"], footer a[href^="/book?"]')
    await expect(bookLinks.first()).toBeVisible()
    await expect(bookLinks.first()).toHaveAttribute('href', /\/book/)
  })
})
