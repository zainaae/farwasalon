/**
 * Guards a class of defect that is invisible everywhere else.
 *
 * The homepage rendered "For over 18years, Farwa Beauty Salon…" and /prices
 * rendered "The remaining 9are hair and hair-treatment services…". Both source
 * files contained a normal space after the expression — the JSX transform
 * collapsed it at a line wrap.
 *
 * That means: code review cannot see it, because the source is correct. Unit
 * tests cannot see it, because the data layer is correct. Only the served
 * markup shows it.
 *
 * The signature is exact. React separates adjacent dynamic children with an
 * empty comment, so `{n} word` emits `n<!-- --> <!-- -->word` when the space
 * survives and `n<!-- -->word` when it does not. Matching that comment pattern
 * — rather than reading textContent — avoids the false positives you get from
 * two neighbouring elements whose text simply concatenates ("Rs 1,400" beside a
 * "Bridal" heading reads as "400Bridal" and is perfectly fine).
 *
 * The fix at each site is {' '} rather than a literal space.
 */
import { test, expect } from '@playwright/test'

/** Every page a first-time visitor is likely to read. */
const PAGES = ['/', '/prices', '/services', '/about', '/book', '/contact', '/faq', '/bridal', '/deals']

/** A word character butted against a React child boundary with no whitespace. */
const COLLAPSED = /([\w.,%)])<!-- -->([A-Za-z]{2,})/g

for (const path of PAGES) {
  test(`${path} — no JSX space was collapsed at a child boundary`, async ({ page }) => {
    const res = await page.goto(path, { waitUntil: 'domcontentloaded' })
    expect(res?.status(), `${path} did not load`).toBe(200)

    const html = await page.content()
    const offenders = [...html.matchAll(COLLAPSED)].map(([, before, after]) => `${before}${after}`)

    expect(
      [...new Set(offenders)],
      `${path} renders words fused to what precedes them — a JSX space was collapsed. ` +
        `Use {' '} at the interpolation instead of a literal space.`,
    ).toEqual([])
  })
}

test('the two known collapse sites render with their spaces intact', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  expect(await page.locator('#main').innerText()).toMatch(/For over \d+ years,/)

  await page.goto('/prices', { waitUntil: 'domcontentloaded' })
  expect(await page.locator('#main').innerText()).toMatch(/remaining \d+ are hair/)
})
