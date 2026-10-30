import { test, expect } from '@playwright/test'
import { SAMPLE_LOCATION_LINKS, visibleMain } from './helpers'

for (const { slug, href } of SAMPLE_LOCATION_LINKS) {
  test(`kept area hub ${slug} loads with CTAs`, async ({ page }) => {
    const res = await page.goto(href)
    expect(res?.status()).toBe(200)

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    const main = visibleMain(page)
    await expect(main.getByRole('link', { name: /book online/i })).toBeVisible()
    await expect(main.getByRole('link', { name: /^whatsapp$/i })).toBeVisible()

    const body = await main.innerText()
    expect(body).not.toMatch(/page not found/i)
    expect(body).toMatch(/PECHS/i)
    expect(body).not.toMatch(/multiple branches|several locations|other branches/i)
  })
}

const KEPT_AREAS = ['pechs-karachi', 'tariq-road', 'bahadurabad', 'gulshan']

for (const area of KEPT_AREAS) {
  test(`area page /areas/${area} renders its own route and timing`, async ({ page }) => {
    const res = await page.goto(`/areas/${area}`)
    expect(res?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Beauty Salon for/i)
    await expect(page.getByRole('heading', { name: /Getting here from/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /worth booking from this distance/i })).toBeVisible()
    await expect(page.getByText(/We do not run branches/i)).toBeVisible()
  })
}

test('areas hub lists kept catchments', async ({ page }) => {
  const res = await page.goto('/areas')
  expect(res?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Areas we serve/i)
  await expect(page.getByRole('link', { name: /PECHS/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Tariq Road/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Bahadurabad/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Gulshan/i })).toBeVisible()
})

test('area pages state different drive times from each other', async ({ page }) => {
  await page.goto('/areas/tariq-road')
  const near = await page.locator('h1').innerText()
  await page.goto('/areas/gulshan')
  const far = await page.locator('h1').innerText()
  expect(near).not.toBe(far)
})
