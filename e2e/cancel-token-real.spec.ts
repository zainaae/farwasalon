// Cancel flow against the REAL /api/book/cancel route (no mocks): tampered and
// garbage tokens must be rejected with the error UI, never a cancellation.
import { test, expect } from '@playwright/test'

test('cancel — tampered token is rejected by the real API', async ({ page }) => {
  // Well-formed shape (payload.signature) but a forged signature.
  const forged =
    Buffer.from(JSON.stringify({ bookingId: 'FBS-FAKE1234', date: '2099-01-05', phoneLast4: '9999', exp: 4102444800000 }))
      .toString('base64url') + '.Zm9yZ2VkLXNpZ25hdHVyZQ'
  await page.goto(`/book/cancel?token=${forged}&id=FBS-FAKE1234&date=2099-01-05&time=13:00`, {
    waitUntil: 'domcontentloaded',
  })

  await page.getByRole('button', { name: /cancel/i }).first().click()
  // Real route verifies HMAC — forged signature must surface an error, not success.
  await expect(page.getByText(/invalid|expired|failed|not found|unable/i).first()).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByText('Your appointment has been cancelled')).toHaveCount(0)
})

test('cancel — garbage token shows error, missing params show invalid-link UI', async ({ page }) => {
  await page.goto('/book/cancel?token=not-a-token&id=FBS-X&date=2099-01-05&time=13:00', {
    waitUntil: 'domcontentloaded',
  })
  await page.getByRole('button', { name: /cancel/i }).first().click()
  await expect(page.getByText(/invalid|expired|failed|not found|unable/i).first()).toBeVisible({
    timeout: 15_000,
  })

  await page.goto('/book/cancel', { waitUntil: 'domcontentloaded' })
  await expect(page.getByText('Invalid cancellation link')).toBeVisible()
})
