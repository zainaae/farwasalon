import { test, expect } from '@playwright/test'
import { assertNoHorizontalOverflow, visibleMain } from './helpers'
import {
  DPR_SMOKE_FACTORS,
  DPR_SMOKE_PAGES,
  DPR_SMOKE_VIEWPORT,
  OVERFLOW_CORE_PAGES,
  OVERFLOW_EXTENDED_PAGES,
  OVERFLOW_EXTENDED_VIEWPORTS,
  OVERFLOW_VIEWPORTS,
  ZOOM_LEVELS,
  scaledViewport,
} from './viewports'

async function gotoOverflowPage(page: import('@playwright/test').Page, path: string) {
  await page.goto(path, { waitUntil: 'load' })
  await expect(visibleMain(page)).toBeVisible({ timeout: 15_000 })
  if (path === '/book') {
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/BOOK/i)
  }
  await page.waitForTimeout(300)
}

for (const viewport of OVERFLOW_VIEWPORTS) {
  for (const { label: zoomLabel, widthScale } of ZOOM_LEVELS) {
    test.describe(`responsive overflow @ ${viewport.label}px ~${zoomLabel}% zoom`, () => {
      test.use({
        viewport: scaledViewport(viewport, widthScale),
      })

      for (const path of OVERFLOW_CORE_PAGES) {
        test(`${path} has no horizontal overflow`, async ({ page }) => {
          await gotoOverflowPage(page, path)
          await assertNoHorizontalOverflow(page)
        })
      }
    })
  }
}

for (const viewport of OVERFLOW_EXTENDED_VIEWPORTS) {
  for (const { label: zoomLabel, widthScale } of ZOOM_LEVELS) {
    test.describe(`responsive overflow extended @ ${viewport.label}px ~${zoomLabel}% zoom`, () => {
      test.use({
        viewport: scaledViewport(viewport, widthScale),
      })

      for (const path of OVERFLOW_EXTENDED_PAGES) {
        test(`${path} has no horizontal overflow`, async ({ page }) => {
          await gotoOverflowPage(page, path)
          await assertNoHorizontalOverflow(page)
        })
      }
    })
  }
}

for (const dpr of DPR_SMOKE_FACTORS) {
  test.describe(`DPR smoke deviceScaleFactor=${dpr} @ 390`, () => {
    test.use({
      viewport: DPR_SMOKE_VIEWPORT,
      deviceScaleFactor: dpr,
    })

    for (const path of DPR_SMOKE_PAGES) {
      test(`${path} has no horizontal overflow at ${dpr}x`, async ({ page }) => {
        await gotoOverflowPage(page, path)
        await assertNoHorizontalOverflow(page)
      })
    }
  })
}
