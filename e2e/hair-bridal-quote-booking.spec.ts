/**
 * Hair + bridal book as quote floors (fromPrice), not locked menu totals.
 * Complements book-flow-smoke with product-honest price language checks.
 */
import { test, expect } from '@playwright/test'
import { mockSlotsApi, pickDateAndTime, visibleMain } from './helpers'
import { getServiceIdByName } from '../src/data.js'

test.describe('Hair and bridal quote booking', () => {
  test.beforeEach(async ({ page }) => {
    await mockSlotsApi(page)
  })

  test('Quick Pick Bridal leads with package ceiling, not trial floor', async ({ page }) => {
    await page.goto('/')
    const bridal = page.getByRole('link', { name: /Book Bridal/i })
    await expect(bridal).toBeVisible()
    await expect(bridal).toHaveAttribute('href', /\/book\?category=Bridal/)
    await expect(bridal).toContainText(/Package Rs 25,000/i)
    await expect(bridal).not.toContainText(/From Rs 8,000/i)
  })

  test('/services Bridal row leads from Full Package, not trial', async ({ page }) => {
    await page.goto('/services')
    const bridal = page.getByRole('link', { name: /Bridal/i }).filter({ hasText: /from/i }).first()
    await expect(bridal).toBeVisible()
    await expect(bridal).toContainText(/Rs 25,000/)
    await expect(bridal).not.toContainText(/Rs 8,000/)
  })

  test('/book Bridal category chip leads from Full Package, not trial', async ({ page }) => {
    await page.goto('/book')
    const chip = page.getByRole('button', { name: /Bridal/i }).filter({ hasText: /from/i })
    await expect(chip).toBeVisible()
    await expect(chip).toContainText(/from Rs 25,000/i)
    await expect(chip).not.toContainText(/from Rs 8,000/i)
  })

  test('/bridal Prefer-a-trial clears the 844 mobile fold', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/bridal')
    await expect(page.getByRole('heading', { level: 1, name: /Bridal makeup/i })).toBeVisible()

    const trial = page.getByRole('link', { name: /Book Bridal Trial \(from Rs 8,000\)/i }).first()
    await expect(trial).toBeAttached()
    const top = await trial.evaluate((el) => el.getBoundingClientRect().top)
    /* Must sit clearly below first viewport (was ~10px under fold before taxonomy). */
    expect(top).toBeGreaterThan(844)
  })

  test('/bridal Full Package Book → fromPrice language + can advance', async ({ page }) => {
    const serviceId = getServiceIdByName('Full Bridal Package')
    expect(serviceId).toBeTruthy()

    await page.goto('/bridal')
    const pkgBook = page.getByRole('link', { name: /Book Full Bridal Package/i }).first()
    await expect(pkgBook).toHaveAttribute('href', `/book?serviceId=${serviceId}`)
    await pkgBook.click()
    await expect(page).toHaveURL(new RegExp(`/book\\?serviceId=${serviceId}`))

    const main = visibleMain(page)
    await expect(main.getByText(/from Rs 25,000/i).first()).toBeVisible()
    await expect(main.getByText(/final quote|quote floors|printed floor/i).first()).toBeVisible()
    await expect(main.getByText(/^Total Rs 25,000$/)).toHaveCount(0)

    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByText('— Pick a date')).toBeVisible()
    await expect(page.getByText(/Hair and bridal prices start from the printed floor/i)).toBeVisible()
  })

  test('/book?serviceId Hair Colour shows from floor and quote copy', async ({ page }) => {
    const serviceId = getServiceIdByName('Hair Colour')
    expect(serviceId).toBeTruthy()

    await page.goto(`/book?serviceId=${serviceId}`)
    const main = visibleMain(page)
    await expect(main.getByText(/Hair Colour/i).first()).toBeVisible()
    await expect(main.getByText(/from Rs 4,000/i).first()).toBeVisible()
    await expect(main.getByText(/final quote|quote floors|printed floor|hair\/bridal finals/i).first()).toBeVisible()
    await expect(main.getByText(/^Total Rs 4,000$/)).toHaveCount(0)

    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByText('— Pick a date')).toBeVisible()
    await expect(page.getByText(/Hair and bridal prices start from the printed floor/i)).toBeVisible()
  })

  test('/book?serviceId Wellaplex shows fromPrice floor disclaimer', async ({ page }) => {
    const serviceId = getServiceIdByName('Wellaplex Stand-Alone Treatment')
    expect(serviceId).toBeTruthy()

    await page.goto(`/book?serviceId=${serviceId}`)
    const main = visibleMain(page)
    await expect(main.getByText(/Wellaplex/i).first()).toBeVisible()
    await expect(main.getByText(/from Rs 3,000/i).first()).toBeVisible()
    await expect(main.getByText(/final quote|quote floors|printed floor|hair\/bridal finals/i).first()).toBeVisible()
    await expect(main.getByText(/^Total Rs 3,000$/)).toHaveCount(0)
  })

  test('bridal serviceId completes mocked booking; WhatsApp has no locked price', async ({ page }) => {
    const serviceId = getServiceIdByName('Full Bridal Package')
    expect(serviceId).toBeTruthy()

    /* Echo catalog service name so confirmation/WA match the booked SKU. */
    await page.route('**/api/book', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue()
        return
      }
      const body = route.request().postDataJSON() as { serviceId?: number; clientName?: string }
      expect(body.serviceId).toBe(serviceId)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          booking: {
            id: 'e2e-bridal-quote-001',
            service: 'Full Bridal Package',
            clientName: body.clientName || 'E2E Bridal Quote',
            date: '2026-05-20',
            time: '10:00',
            duration: 300,
            cancelToken: 'mock-cancel-token',
          },
        }),
      })
    })

    await page.goto(`/book?serviceId=${serviceId}`)
    await page.getByRole('button', { name: 'Next' }).click()
    await pickDateAndTime(page)

    const main = visibleMain(page)
    await expect(main.getByText(/Starting from Rs 25,000/i)).toBeVisible()
    await expect(main.getByText(/not a fixed online total/i)).toBeVisible()

    await page.locator('#bk-name').fill('E2E Bridal Quote')
    await page.locator('#bk-phone').fill('03001234567')
    await page.getByRole('button', { name: 'Confirm Booking' }).click()
    await expect(page).toHaveURL(/\/book\/confirmation/, { timeout: 15_000 })
    await expect(page.getByRole('heading', { name: /you're set/i })).toBeVisible()

    const wa = page.getByRole('link', { name: /Send WhatsApp confirmation/i })
    const href = await wa.getAttribute('href')
    expect(href).toBeTruthy()
    const decoded = decodeURIComponent(href!)
    expect(decoded).toMatch(/Full Bridal Package/i)
    expect(decoded).not.toMatch(/Rs\s*25,?000/)
    expect(decoded).not.toMatch(/Total\s*Rs/i)
  })
})
