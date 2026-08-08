/**
 * Hair quote builder deep-link + WhatsApp prefill (floors, not locked totals).
 * Step coverage: category → modal → prices row → builder → WA href.
 * Book path for the same SKUs stays covered in hair-bridal-quote-booking + booking-entry-paths.
 */
import { test, expect } from '@playwright/test'
import { mockSlotsApi, visibleMain } from './helpers'
import { getServiceIdByName } from '../src/data.js'
import { hairQuotePath } from '../lib/quote-request.js'

test.describe('Hair quote path', () => {
  test('/prices?quote=1&serviceId= prefills Hair Colour — length, density, note → WA', async ({ page }) => {
    const serviceId = getServiceIdByName('Hair Colour')
    expect(serviceId).toBeTruthy()

    await page.goto(hairQuotePath(serviceId))
    const quote = page.locator('#quote')
    await expect(quote).toBeVisible()
    await expect(quote.getByRole('heading', { name: /Get a quote/i })).toBeVisible()

    const colourPill = quote.getByRole('button', { name: /Hair Colour/i })
    await expect(colourPill).toHaveAttribute('aria-pressed', 'true')
    await expect(quote.getByText(/from Rs 4,000/i).first()).toBeVisible()

    await quote.getByRole('button', { name: 'Long', exact: true }).click()
    await quote.getByRole('button', { name: 'Thick', exact: true }).click()
    await quote.locator('#quote-note').fill('roots only')

    const send = quote.getByRole('link', { name: /Send for a quote/i })
    const href = await send.getAttribute('href')
    expect(href).toBeTruthy()
    const decoded = decodeURIComponent(href!)
    expect(decoded).toMatch(/Quote please — Hair Colour/)
    expect(decoded).toMatch(/from Rs 4,000/)
    expect(decoded).toMatch(/length: Long/)
    expect(decoded).toMatch(/density: Thick/)
    expect(decoded).toMatch(/note: roots only/)
    expect(decoded).not.toMatch(/Total\s*Rs/i)
    expect(decoded).toMatch(/via farwasalon\.com\/prices/)
  })

  test('/services/hair row Get a quote deep-links to builder', async ({ page }) => {
    const serviceId = getServiceIdByName('Hair Colour')
    expect(serviceId).toBeTruthy()

    await page.goto('/services/hair')
    const quoteLink = page.getByRole('link', { name: /Get a quote for Hair Colour/i })
    await expect(quoteLink).toHaveAttribute('href', hairQuotePath(serviceId))
    await quoteLink.click()
    await expect(page).toHaveURL(new RegExp(`/prices\\?quote=1&serviceId=${serviceId}`))
    await expect(page.locator('#quote').getByRole('button', { name: /Hair Colour/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('/services/hair-treatments row Get a quote deep-links Protein', async ({ page }) => {
    const serviceId = getServiceIdByName('Normal Protein Treatment')
    expect(serviceId).toBeTruthy()

    await page.goto('/services/hair-treatments')
    const quoteLink = page.getByRole('link', { name: /Get a quote for Normal Protein Treatment/i })
    await expect(quoteLink).toHaveAttribute('href', hairQuotePath(serviceId))
    await quoteLink.click()
    await expect(page).toHaveURL(new RegExp(`/prices\\?quote=1&serviceId=${serviceId}`))
    const quote = page.locator('#quote')
    await expect(quote.getByRole('button', { name: /Normal Protein Treatment/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(quote.getByText(/from Rs 2,000/i).first()).toBeVisible()
  })

  test('/services/hair modal Get a quote → builder prefill', async ({ page }) => {
    const serviceId = getServiceIdByName('Haircut & Blowdry')
    expect(serviceId).toBeTruthy()

    await page.goto('/services/hair')
    await page.getByRole('button', { name: /haircut & blowdry/i }).click()
    const dialog = page.getByRole('dialog')
    const quoteLink = dialog.getByRole('link', { name: /^Get a quote$/i })
    await expect(quoteLink).toHaveAttribute('href', hairQuotePath(serviceId))
    await quoteLink.click()
    await expect(page).toHaveURL(new RegExp(`/prices\\?quote=1&serviceId=${serviceId}`))
    await expect(page.locator('#quote').getByRole('button', { name: /Haircut & Blowdry/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('/prices Hair row keeps Book and offers Get quote', async ({ page }) => {
    const serviceId = getServiceIdByName('Haircut & Blowdry')
    expect(serviceId).toBeTruthy()

    await page.goto('/prices')
    const section = page.locator('section').filter({ has: page.locator('#prices-hair') })
    await expect(section.getByRole('link', { name: 'Book' }).first()).toBeVisible()
    const quote = section.getByRole('link', { name: 'Get quote' }).first()
    await expect(quote).toHaveAttribute('href', hairQuotePath(serviceId))
  })

  test('/prices Hair Treatments Get quote → builder → WA floor only', async ({ page }) => {
    const serviceId = getServiceIdByName('Wellaplex Stand-Alone Treatment')
    expect(serviceId).toBeTruthy()

    await page.goto('/prices')
    const section = page.locator('section').filter({ has: page.locator('#prices-hair-treatments') })
    const wella = section.locator('li').filter({ hasText: /Wellaplex/i }).getByRole('link', { name: 'Get quote' })
    await expect(wella).toHaveAttribute('href', hairQuotePath(serviceId))
    await wella.click()
    await expect(page).toHaveURL(new RegExp(`/prices\\?quote=1&serviceId=${serviceId}`))

    const quote = page.locator('#quote')
    await expect(quote.getByRole('button', { name: /Wellaplex/i })).toHaveAttribute('aria-pressed', 'true')
    await expect(quote.getByText(/from Rs 3,000/i).first()).toBeVisible()
    await quote.getByRole('button', { name: 'Shoulder length', exact: true }).click()
    await quote.getByRole('button', { name: 'Medium', exact: true }).click()

    const href = await quote.getByRole('link', { name: /Send for a quote/i }).getAttribute('href')
    const decoded = decodeURIComponent(href!)
    expect(decoded).toMatch(/Wellaplex/)
    expect(decoded).toMatch(/from Rs 3,000/)
    expect(decoded).toMatch(/length: Shoulder length/)
    expect(decoded).toMatch(/density: Medium/)
    expect(decoded).not.toMatch(/Total\s*Rs/i)
  })

  test('Book still prefills Hair Colour from /prices row (parallel path)', async ({ page }) => {
    await mockSlotsApi(page)
    const serviceId = getServiceIdByName('Hair Colour')
    expect(serviceId).toBeTruthy()

    await page.goto('/prices')
    const section = page.locator('section').filter({ has: page.locator('#prices-hair') })
    const colourRow = section.locator('li').filter({ hasText: /Hair Colour/i })
    await colourRow.getByRole('link', { name: 'Book' }).click()
    await expect(page).toHaveURL(/\/book\?/)
    await expect(page).toHaveURL(/serviceId=\d+/)
    const main = visibleMain(page)
    await expect(main.getByText(/Hair Colour/i).first()).toBeVisible()
    await expect(main.getByText(/from Rs 4,000/i).first()).toBeVisible()
    await expect(main.getByText(/^Total Rs 4,000$/)).toHaveCount(0)
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByText('— Pick a date')).toBeVisible()
  })
})
