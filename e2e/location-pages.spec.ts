import { test, expect } from '@playwright/test'
import { SAMPLE_LOCATION_LINKS } from './helpers'

for (const { slug, href } of SAMPLE_LOCATION_LINKS) {
  test(`location page ${slug} loads with CTAs`, async ({ page }) => {
    const res = await page.goto(href)
    expect(res?.status()).toBe(200)

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    await expect(page.locator('#main').getByRole('link', { name: /book online/i })).toBeVisible()
    await expect(page.locator('#main').getByRole('link', { name: /^whatsapp$/i })).toBeVisible()

    const body = await page.locator('#main').innerText()
    expect(body).not.toMatch(/page not found/i)
    expect(body).toMatch(/PECHS/i)
    expect(body).not.toMatch(/multiple branches|several locations|other branches/i)
  })
}
