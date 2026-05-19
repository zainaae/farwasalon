import { test, expect } from '@playwright/test'

const PAGES = ['/', '/services', '/services/threading', '/book', '/gallery'] as const

const VIEWPORTS = [
  { width: 320, height: 568, label: '320' },
  { width: 375, height: 812, label: '375' },
  { width: 390, height: 844, label: '390' },
  { width: 768, height: 1024, label: '768' },
  { width: 1024, height: 768, label: '1024' },
  { width: 1280, height: 800, label: '1280' },
] as const

/** Approximate browser zoom by shrinking the layout viewport (avoids CSS zoom false positives). */
const ZOOM_LEVELS = [
  { label: '100', widthScale: 1 },
  { label: '125', widthScale: 1 / 1.25 },
] as const

async function assertNoHorizontalOverflow(page: import('@playwright/test').Page) {
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

for (const viewport of VIEWPORTS) {
  for (const { label: zoomLabel, widthScale } of ZOOM_LEVELS) {
    test.describe(`responsive overflow @ ${viewport.label}px ~${zoomLabel}% zoom`, () => {
      test.use({
        viewport: {
          width: Math.max(320, Math.round(viewport.width * widthScale)),
          height: viewport.height,
        },
      })

      for (const path of PAGES) {
        test(`${path} has no horizontal overflow`, async ({ page }) => {
          await page.goto(path, { waitUntil: 'load' })
          if (path === '/book') {
            await expect(page.getByText('— Choose a service')).toBeVisible({ timeout: 15_000 })
          } else {
            await expect(page.locator('#main')).toBeVisible()
          }
          await page.waitForTimeout(300)
          await assertNoHorizontalOverflow(page)
        })
      }
    })
  }
}
