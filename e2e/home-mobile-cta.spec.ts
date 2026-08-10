import { test, expect } from '@playwright/test'
import { visibleMain } from './helpers'

test.describe('Home — mobile CTA bar', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('hero, services list, and sticky tel/wa/book CTAs', async ({ page }) => {
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

    /* Honesty pass dropped the home service filter pills — the section is now
       a straight category list into /services/[slug], not aria-pressed tabs. */
    const servicesSection = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Our services' }),
    })
    await servicesSection.scrollIntoViewIfNeeded()
    const categoryLinks = servicesSection.locator('.divide-y').getByRole('link')
    await expect(categoryLinks.first()).toBeVisible()
    await expect(
      servicesSection.getByRole('link', { name: /threading/i }).first(),
    ).toHaveAttribute('href', /\/services\/threading/)
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

  test('gallery hero has no zero-size btn-loud Book trap @390', async ({ page }) => {
    await page.goto('/gallery')
    await page.evaluate(() => window.scrollTo(0, 0))
    const hero = page.locator('main .title-stack').first().locator('..')
    await expect(hero.getByRole('link', { name: /Book an Appointment/i }).first()).toBeVisible()

    const loud = await page.evaluate(() => {
      const vh = window.innerHeight
      return [...document.querySelectorAll('main a.btn-loud')].map((el) => {
        const r = el.getBoundingClientRect()
        const s = getComputedStyle(el)
        return {
          display: s.display,
          w: Math.round(r.width),
          h: Math.round(r.height),
          inFold: r.top < vh && r.bottom > 0 && r.width > 0 && r.height > 0,
          text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
        }
      })
    })
    /* Desktop loud Book must be display:none on mobile — not inline-flex at 0×0. */
    const headerLoud = loud.filter((x) => x.text === 'Book an Appointment')
    expect(headerLoud.length).toBeGreaterThanOrEqual(1)
    expect(headerLoud[0].display).toBe('none')
    expect(headerLoud[0].w).toBe(0)
    expect(loud.filter((x) => x.inFold)).toHaveLength(0)
  })

  test('footer Book Online links point to /book', async ({ page }) => {
    await page.goto('/')
    const bookLinks = page.locator('footer a[href="/book"], footer a[href^="/book?"]')
    await expect(bookLinks.first()).toBeVisible()
    await expect(bookLinks.first()).toHaveAttribute('href', /\/book/)
  })
})
