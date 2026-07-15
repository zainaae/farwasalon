import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const A11Y_PAGES = [
  { path: '/', name: 'home' },
  { path: '/book', name: 'book' },
  { path: '/contact', name: 'contact' },
  { path: '/services/threading', name: 'service category' },
  { path: '/blog/threading-vs-waxing', name: 'blog article' },
]

for (const { path, name } of A11Y_PAGES) {
  test(`accessibility — ${name} has no serious axe violations`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('#main', { state: 'visible' })

    // Scroll through the page so whileInView animations fire and settle.
    // Without this, axe scans elements mid-fade (diluted computed colors →
    // phantom color-contrast failures) and skips below-fold text entirely.
    await page.evaluate(async () => {
      const step = window.innerHeight / 2
      for (let y = 0; y <= document.body.scrollHeight; y += step) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 120))
      }
      window.scrollTo(0, 0)
    })
    await page.waitForTimeout(800)

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
}
