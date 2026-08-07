/**
 * Two fixes that a build cannot catch.
 *
 * The homepage marquee doubles its photo list so the strip can loop. When
 * those figures became links, the clones became tab stops — 26 of them for 13
 * destinations, inside a strip that is still moving.
 *
 * The blog index featured the newest post of ALL categories and rendered it
 * above the filter, so choosing Hair still led with a Seasonal article.
 */
import { test, expect } from '@playwright/test'

test('marquee loop clones are not tab stops or screen-reader content', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const links = page.locator('a[aria-label$="see more"], a[aria-label$="see gallery"]')
  const total = await links.count()
  expect(total, 'the strip still renders a doubled list').toBeGreaterThan(0)

  const reachable = page.locator(
    'a[aria-label$="see more"]:not([tabindex="-1"]), a[aria-label$="see gallery"]:not([tabindex="-1"])',
  )
  expect(await reachable.count(), 'exactly half the strip is reachable').toBe(total / 2)

  // every unreachable one is also hidden from assistive tech
  const hidden = page.locator(
    'a[aria-label$="see more"][tabindex="-1"][aria-hidden="true"], a[aria-label$="see gallery"][tabindex="-1"][aria-hidden="true"]',
  )
  expect(await hidden.count(), 'clones are aria-hidden too').toBe(total / 2)

  // and no destination is announced twice
  const labels = await reachable.evaluateAll((els) =>
    els.filter((e) => e.offsetParent !== null).map((e) => e.getAttribute('aria-label')),
  )
  expect(new Set(labels).size, 'each visible destination appears once').toBe(labels.length)
})

test('blog featured article respects the category filter', async ({ page }) => {
  await page.goto('/blog', { waitUntil: 'domcontentloaded' })

  const featuredKicker = page.getByText(/^Featured · /)
  await expect(featuredKicker).toBeVisible()
  const before = await featuredKicker.textContent()

  // pick a category that is not the one currently featured
  const chips = page.locator('button[aria-pressed]')
  expect(await chips.count(), 'filter chips render as toggle buttons').toBeGreaterThan(2)

  const names = await chips.evaluateAll((els) => els.map((e) => e.textContent?.trim()))
  const target = names.find((n) => n && n !== 'All' && !before?.includes(n))
  expect(target, 'found a category other than the featured one').toBeTruthy()

  await page.getByRole('button', { name: target!, exact: true }).click()
  await expect(featuredKicker).toHaveText(`Featured · ${target}`)
  await expect(page.getByRole('button', { name: target!, exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('blog filter chips are toggle buttons, not a broken tab pattern', async ({ page }) => {
  await page.goto('/blog', { waitUntil: 'domcontentloaded' })
  expect(await page.locator('[role="tablist"], [role="tab"]').count(),
    'role=tab promises arrow-key roving focus and an owned tabpanel — neither exists here').toBe(0)
})
