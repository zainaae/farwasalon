import { test, expect } from '@playwright/test'

test.describe('Contact page', () => {
  test('loads form and WhatsApp booking flow', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.getByRole('heading', { name: /book your appointment/i })).toBeVisible()
    await expect(page.getByRole('form', { name: /booking request form/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /whatsapp/i }).first()).toHaveAttribute(
      'href',
      /wa\.me/,
    )

    await page.locator('#booking-name').fill('E2E Tester')
    await page.locator('#booking-phone').fill('03001234567')
    await page.locator('#booking-add-service').selectOption({ label: 'Eyebrow Threading' })
    await expect(page.getByText('Eyebrow Threading').first()).toBeVisible()

    const submit = page.locator('form[aria-label="Booking request form"] button[type="submit"]')
    await expect(submit).toBeEnabled()
    await expect(submit).toContainText(/whatsapp/i)
  })
})
