import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const A11Y_PAGES = [
  { path: '/', name: 'home' },
  { path: '/book', name: 'book' },
  { path: '/contact', name: 'contact' },
]

for (const { path, name } of A11Y_PAGES) {
  test(`accessibility — ${name} has no serious axe violations`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('#main', { state: 'visible' })

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast'])
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
