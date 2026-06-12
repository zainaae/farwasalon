import { test, expect } from '@playwright/test'
import { CAT_SLUGS } from '../src/data.js'

const NAVIGATE_LINKS = [
  '/',
  '/services',
  '/gallery',
  '/blog',
  '/about',
  '/contact',
  '/team',
  '/faq',
] as const

/** Matches the six service links rendered in Footer (src/shared.jsx). */
const FOOTER_SERVICE_LINKS = [
  CAT_SLUGS['Threading'],
  CAT_SLUGS['Bridal'],
  CAT_SLUGS['Facials'],
  CAT_SLUGS['Nails'],
  CAT_SLUGS['Eyebrow Tattoo'],
  CAT_SLUGS['Massage'],
].map((slug) => `/services/${slug}`)

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
})
