import { test, expect } from '@playwright/test'
import {
  mockBookApi,
  mockCancelApi,
  mockSlotsApi,
  pickDateAndTime,
  selectEyebrowThreading,
} from './helpers'

test.describe('Booking flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockSlotsApi(page)
    await mockBookApi(page)
  })

  test('step 1–3 smoke with mocked APIs', async ({ page }) => {
    await page.goto('/book')
    await expect(page.getByRole('heading', { name: /book/i })).toBeVisible()
    await expect(page.getByText('— Choose a service')).toBeVisible()

    await selectEyebrowThreading(page)
    await expect(page.getByText('— Pick a date')).toBeVisible()

    await pickDateAndTime(page)
    await expect(page.getByText('— Your details')).toBeVisible()
    await expect(page.locator('#bk-name')).toBeVisible()
    await expect(page.locator('#bk-phone')).toBeVisible()
  })

  test('invalid phone shows validation error', async ({ page }) => {
    await page.goto('/book')
    await selectEyebrowThreading(page)
    await pickDateAndTime(page)

    await page.locator('#bk-name').fill('Test User')
    const phone = page.locator('#bk-phone')
    await phone.fill('12345')
    await phone.blur()
    await expect(page.locator('#bk-phone-error')).toContainText(/valid Pakistani/i)
  })

  test('confirm button disabled without name and phone', async ({ page }) => {
    await page.goto('/book')
    await selectEyebrowThreading(page)
    await pickDateAndTime(page)
    await expect(page.getByRole('button', { name: 'Confirm Booking' })).toBeDisabled()
  })

  test('valid phone submits with mocked API (no live sheet write)', async ({ page }) => {
    await page.goto('/book')
    await selectEyebrowThreading(page)
    await pickDateAndTime(page)

    await page.locator('#bk-name').fill('E2E Tester')
    await page.locator('#bk-phone').fill('03001234567')
    await page.getByRole('button', { name: 'Confirm Booking' }).click()
    await expect(page).toHaveURL(/\/book\/confirmation/, { timeout: 15_000 })
    await expect(page.getByRole('heading', { name: /you're booked/i })).toBeVisible()
  })

  test('slots error path when API returns empty', async ({ page }) => {
    await page.unroute('**/api/slots**')
    await page.route('**/api/slots**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ slots: [] }),
      })
    })

    await page.goto('/book')
    await selectEyebrowThreading(page)
    const dateChip = page.locator('button.snap-center:not([disabled])').first()
    await dateChip.click()
    await expect(page.getByText(/No times available|No open slots/i)).toBeVisible({
      timeout: 15_000,
    })
  })

  test('confirmation page structure with sessionStorage key', async ({ page }) => {
    await page.goto(
      '/book/confirmation?id=e2e-001&date=2026-05-20&time=10:00&service=Eyebrow%20Threading&name=Tester&duration=10',
    )
    await page.evaluate(() => {
      sessionStorage.setItem(
        'farwa-confirm-e2e-001',
        JSON.stringify({ service: 'Eyebrow Threading', name: 'Tester' }),
      )
    })
    await page.reload()
    await expect(page.getByRole('heading', { name: /you're booked/i })).toBeVisible()
    await expect(page.getByText(/Eyebrow Threading/i)).toBeVisible()
    await expect(page.getByText(/Tester/i)).toBeVisible()
  })

  test('cancel booking with mocked API shows success', async ({ page }) => {
    await mockCancelApi(page)
    await page.goto(
      '/book/cancel?token=test&date=2026-06-15&time=14:00&id=FS-TEST&service=Threading&name=Test',
    )
    await expect(page.getByRole('heading', { name: /cancel appointment/i })).toBeVisible()
    await page.getByRole('button', { name: /yes, cancel my appointment/i }).click()
    await expect(page.getByRole('heading', { name: /cancelled/i })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/appointment has been cancelled/i)).toBeVisible()
  })

  test('cancel page without token or id shows invalid link UI', async ({ page }) => {
    await page.goto('/book/cancel?date=2026-06-15&time=14:00&service=Threading&name=Test')
    await expect(page.getByRole('heading', { name: /invalid cancellation link/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /whatsapp the salon/i })).toHaveAttribute(
      'href',
      /wa\.me/,
    )
  })

  test('mobile viewport 390px — book step 1 layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/book?category=Threading')
    await expect(page.locator('#main')).toBeVisible()
    await expect(page.getByText('— Choose a service')).toBeVisible()
    await expect(page.getByRole('button', { name: /Eyebrow Threading/i })).toBeVisible()
  })
})

test('slots timeout message when fetch aborts', async ({ page }) => {
  await page.route('**/api/slots**', async (route) => {
    await route.abort('timedout')
  })
  await page.goto('/book')
  await selectEyebrowThreading(page)
  const dateChip = page.locator('button.snap-center:not([disabled])').first()
  await dateChip.click()
  await expect(page.getByText(/Could not load times|timed out|connection/i)).toBeVisible({
    timeout: 30_000,
  })
})
