/**
 * Hair quote builder deep-link + WhatsApp prefill (floors, not locked totals).
 * Complements hair-bridal-quote-booking (Book path stays quote floors).
 */
import { test, expect } from '@playwright/test'
import { getServiceIdByName } from '../src/data.js'
import { hairQuotePath } from '../lib/quote-request.js'

test.describe('Hair quote path', () => {
  test('/prices?quote=1&serviceId= prefills Hair Colour in builder', async ({ page }) => {
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

    const send = quote.getByRole('link', { name: /Send for a quote/i })
    const href = await send.getAttribute('href')
    expect(href).toBeTruthy()
    const decoded = decodeURIComponent(href!)
    expect(decoded).toMatch(/Quote please — Hair Colour/)
    expect(decoded).toMatch(/from Rs 4,000/)
    expect(decoded).toMatch(/length: Long/)
    expect(decoded).toMatch(/density: Thick/)
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

  test('/prices Hair row keeps Book and offers Get quote', async ({ page }) => {
    const serviceId = getServiceIdByName('Haircut & Blowdry')
    expect(serviceId).toBeTruthy()

    await page.goto('/prices')
    const section = page.locator('section').filter({ has: page.locator('#prices-hair') })
    await expect(section.getByRole('link', { name: 'Book' }).first()).toBeVisible()
    const quote = section.getByRole('link', { name: 'Get quote' }).first()
    await expect(quote).toHaveAttribute('href', hairQuotePath(serviceId))
  })
})
