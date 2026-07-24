import { test, expect, type Page } from '@playwright/test'
import { visibleMain } from './helpers'

const PAGES = ['/', '/book', '/services', '/services/threading', '/gallery', '/contact'] as const

const LANDSCAPE_MOBILE = [
  { width: 844, height: 390, label: '844×390' },
  { width: 667, height: 375, label: '667×375' },
] as const

const PORTRAIT_MOBILE = [
  { width: 390, height: 844, label: '390×844' },
  { width: 375, height: 667, label: '375×667' },
] as const

const DESKTOP = [
  { width: 1280, height: 800, label: '1280×800' },
  { width: 1920, height: 1080, label: '1920×1080' },
] as const

async function assertNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => {
    const doc = document.documentElement
    const body = document.body
    return {
      scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
      clientWidth: doc.clientWidth,
    }
  })
  expect(
    metrics.scrollWidth,
    `scrollWidth ${metrics.scrollWidth} should fit clientWidth ${metrics.clientWidth}`,
  ).toBeLessThanOrEqual(metrics.clientWidth + 1)
}

async function gotoAndSettle(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'load' })
  if (path === '/book') {
    await expect(page.getByText('— Choose a service')).toBeVisible({ timeout: 15_000 })
  } else {
    await expect(visibleMain(page)).toBeVisible()
  }
  await page.waitForTimeout(300)
}

for (const viewport of LANDSCAPE_MOBILE) {
  test.describe(`landscape mobile ${viewport.label}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    for (const path of PAGES) {
      test(`${path} has no horizontal overflow`, async ({ page }) => {
        await gotoAndSettle(page, path)
        await assertNoHorizontalOverflow(page)
      })
    }

    test('nav is usable (desktop links at md+ width)', async ({ page }) => {
      await gotoAndSettle(page, '/')
      if (viewport.width >= 768) {
        await expect(page.getByRole('banner').getByRole('link', { name: 'Services', exact: true })).toBeVisible()
      } else {
        await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeVisible()
      }
    })
  })
}

for (const viewport of PORTRAIT_MOBILE) {
  test.describe(`portrait mobile ${viewport.label}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    test('home sticky CTA visible and hero readable', async ({ page }) => {
      await gotoAndSettle(page, '/')
      await assertNoHorizontalOverflow(page)

      const sticky = page.getByRole('navigation', { name: 'Quick contact and booking' })
      await expect(sticky).toBeVisible({ timeout: 15_000 })

      const h1 = page.getByRole('heading', { level: 1 })
      await expect(h1).toBeVisible()
      const box = await h1.boundingBox()
      expect(box).not.toBeNull()
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(-1)
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1)
      }
    })

    test('/book step UI not cut off', async ({ page }) => {
      await gotoAndSettle(page, '/book')
      await assertNoHorizontalOverflow(page)

      const step = page.getByText('— Choose a service')
      await expect(step).toBeVisible()
      const box = await step.boundingBox()
      expect(box).not.toBeNull()
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
      }
    })

    test('hamburger nav opens', async ({ page }) => {
      await gotoAndSettle(page, '/')
      await page.getByRole('button', { name: 'Menu', exact: true }).click()
      await expect(page.getByRole('button', { name: 'Close menu' })).toBeVisible()
    })
  })
}

for (const viewport of DESKTOP) {
  test.describe(`desktop ${viewport.label}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    test('home uses desktop nav, no mobile sticky CTA', async ({ page }) => {
      await gotoAndSettle(page, '/')
      await assertNoHorizontalOverflow(page)

      await expect(page.getByRole('banner').getByRole('link', { name: 'Services', exact: true })).toBeVisible()
      await expect(page.getByRole('navigation', { name: 'Quick contact and booking' })).toHaveCount(0)
    })

    for (const path of PAGES) {
      test(`${path} has no horizontal overflow`, async ({ page }) => {
        await gotoAndSettle(page, path)
        await assertNoHorizontalOverflow(page)
      })
    }
  })
}
