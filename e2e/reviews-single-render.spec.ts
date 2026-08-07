/**
 * The reviews rows used to be built twice: a `md:hidden` horizontal scroller
 * and a `hidden md:grid` grid, rendering the same posts. Every review shipped
 * in the HTML twice and one copy was always display:none — 33 KB of the
 * homepage document, plus the star SVGs inside it, for markup no one ever saw.
 *
 * They are one element now, restyled per breakpoint. These tests hold that:
 * the first guards against the duplication coming back, the second against the
 * responsive classes being wrong in either direction — which is the failure the
 * duplication was hiding, since a broken breakpoint still had a second copy to
 * fall back on.
 */
import { test, expect, type Page } from '@playwright/test'

const rows = (page: Page) => page.locator('div.snap-x')

test('each review is in the DOM exactly once', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const quotes = await page.locator('div.snap-x blockquote').allTextContents()
  const seen = new Map<string, number>()
  for (const q of quotes) seen.set(q, (seen.get(q) ?? 0) + 1)

  expect(
    [...seen].filter(([, c]) => c > 1).map(([q]) => q.slice(0, 40)),
    'a review shipped twice — the mobile/desktop split is back',
  ).toEqual([])
  expect(quotes.length, 'reviews still render at all').toBeGreaterThan(4)
})

test('reviews rows: scroller on mobile, wrapping grid on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const count = await rows(page).count()
  expect(count).toBeGreaterThan(0)
  const perRow: number[] = []

  for (let r = 0; r < count; r++) {
    const cards = rows(page).nth(r).locator('blockquote')
    const n = await cards.count()
    perRow.push(n)
    const a = await cards.first().boundingBox()
    const b = await cards.nth(1).boundingBox()
    expect(b!.x, `row ${r} mobile: cards sit side by side`).toBeGreaterThan(a!.x)
    expect(Math.abs(a!.y - b!.y), `row ${r} mobile: one line`).toBeLessThan(20)
    expect(
      await rows(page).nth(r).evaluate((el: Element) => el.scrollWidth > el.clientWidth + 4),
      `row ${r} mobile: actually scrollable`,
    ).toBe(true)
  }

  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  for (let r = 0; r < count; r++) {
    const cards = rows(page).nth(r).locator('blockquote')
    const n = await cards.count()
    expect(n, `row ${r}: same DOM at both widths`).toBe(perRow[r])

    expect(
      await rows(page).nth(r).evaluate((el: Element) => getComputedStyle(el).overflowX),
      `row ${r} desktop: horizontal scrolling is off`,
    ).toBe('visible')

    const a = await cards.first().boundingBox()
    const b = await cards.nth(1).boundingBox()
    expect(Math.abs(a!.y - b!.y), `row ${r} desktop: first two share a row`).toBeLessThan(20)
    expect(a!.width, `row ${r} desktop: cards are not stuck at mobile 85vw`).toBeLessThan(500)

    if (n > 3) {
      const last = await cards.nth(n - 1).boundingBox()
      expect(last!.y, `row ${r} desktop: ${n} cards wrap into a grid`).toBeGreaterThan(a!.y)
    }
  }
})
