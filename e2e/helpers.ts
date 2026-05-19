import { expect, type Page } from '@playwright/test'

export const MOCK_SLOTS = {
  slots: [
    { time: '10:00', available: true },
    { time: '10:30', available: true },
    { time: '11:00', available: false },
    { time: '14:00', available: true },
  ],
}

export async function mockSlotsApi(page: Page, slots = MOCK_SLOTS) {
  await page.route('**/api/slots**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(slots),
    })
  })
}

export async function mockBookApi(page: Page) {
  await page.route('**/api/book', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue()
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        booking: {
          id: 'e2e-test-001',
          service: 'Eyebrow Threading',
          clientName: 'E2E Tester',
          date: '2026-05-20',
          time: '10:00',
          duration: 10,
          cancelToken: 'mock-cancel-token',
        },
      }),
    })
  })
}

/** Expand Threading category, select Eyebrow Threading, advance to date step. */
export async function selectEyebrowThreading(page: Page) {
  await page.getByRole('button', { name: /^Threading\b/i }).click()
  await page.getByRole('button', { name: /Eyebrow Threading/i }).click()
  await page.getByRole('button', { name: 'Next' }).click()
}

/** First enabled date chip in the book flow date strip (skips Sundays). */
export async function pickFirstAvailableDate(page: Page) {
  const dateBtn = page.locator('button.snap-center:not([disabled])').first()
  await expect(dateBtn).toBeVisible({ timeout: 10_000 })
  await dateBtn.click()
}

export async function pickDateAndTime(page: Page) {
  await pickFirstAvailableDate(page)
  const slot = page.getByRole('button', { name: /10:00 AM/i })
  await expect(slot).toBeVisible({ timeout: 15_000 })
  await slot.click()
  await page.getByRole('button', { name: 'Next' }).last().click()
}
