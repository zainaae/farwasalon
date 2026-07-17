import { test, expect } from '@playwright/test'
import { CAT_SLUGS, SERVICES } from '../src/data.js'

const NAVIGATE_LINKS = [
  '/',
  '/services',
  '/book',
  '/gallery',
  '/blog',
  '/about',
  '/contact',
  '/faq',
  '/bridal',
] as const

/** All 13 service category links rendered in Footer (src/shared.jsx). */
const FOOTER_SERVICE_LINKS = Object.keys(SERVICES).map(
  (cat) => `/services/${CAT_SLUGS[cat as keyof typeof CAT_SLUGS]}`
)

test.describe('Footer links @ 390px', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('Navigate column links return 200 with a heading', async ({ page }) => {
    await page.goto('/')

    const footer = page.locator('footer')
    for (const path of NAVIGATE_LINKS) {
      const link = footer.locator(`a[href="${path}"]`).first()
      await expect(link).toBeVisible()
      const res = await page.goto(path)
      expect(res?.status(), `${path} should return 200`).toBe(200)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    }
  })

  test('Services column links return 200 with a heading', async ({ page }) => {
    await page.goto('/')

    const footer = page.locator('footer')
    for (const path of FOOTER_SERVICE_LINKS) {
      const link = footer.locator(`a[href="${path}"]`).first()
      await expect(link).toBeVisible()
      const res = await page.goto(path)
      expect(res?.status(), `${path} should return 200`).toBe(200)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    }
  })

  test('Location hub link returns 200 with a heading', async ({ page }) => {
    await page.goto('/')
    const hubLink = page.locator('footer').getByRole('link', { name: /Beauty salon in Karachi/i })
    await expect(hubLink).toBeVisible()
    const res = await page.goto('/beauty-salon-karachi')
    expect(res?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})
