import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('404 — bogus URL returns not-found page with recovery links', async ({ page }) => {
  const res = await page.goto('/definitely-not-a-page', { waitUntil: 'domcontentloaded' })
  expect(res?.status()).toBe(404)
  await expect(page.getByText('Page Not Found')).toBeVisible()
  await expect(page.locator('a[href="/"]').first()).toBeVisible()

  // No horizontal overflow at mobile width
  await page.setViewportSize({ width: 390, height: 844 })
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const serious = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  )
  expect(
    serious,
    serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`).join('\n'),
  ).toEqual([])
})
