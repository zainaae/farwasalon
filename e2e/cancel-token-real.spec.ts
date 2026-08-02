// Cancel flow against the REAL /api/book/cancel route (no mocks): tampered and
// garbage tokens must be rejected with the error UI, never a cancellation.
//
// Tokens are seeded through sessionStorage rather than the query string. They
// used to ride in the URL, where Plausible and the Meta Pixel both report
// location.href verbatim — a bearer credential handed to third parties on every
// view. The route's HMAC verification is unchanged; only the transport moved.
import { test, expect } from '@playwright/test'

async function seedToken(page, id: string, cancelToken: string) {
  const payload = JSON.stringify({
    id,
    cancelToken,
    service: 'Threading',
    name: 'Test',
    date: '2099-01-05',
    time: '13:00',
    duration: 30,
    savedAt: Date.now(),
  })
  await page.addInitScript(
    ([key, raw]) => {
      try { localStorage.setItem(key as string, raw as string) } catch { /* ignore */ }
      try { sessionStorage.setItem(key as string, raw as string) } catch { /* ignore */ }
    },
    [`farwa-confirm-${id}`, payload],
  )
}

test('cancel — tampered token is rejected by the real API', async ({ page }) => {
  // Well-formed shape (payload.signature) but a forged signature.
  const forged =
    Buffer.from(
      JSON.stringify({ bookingId: 'FBS-FAKE1234', date: '2099-01-05', phoneLast4: '9999', exp: 4102444800000 }),
    ).toString('base64url') + '.Zm9yZ2VkLXNpZ25hdHVyZQ'

  await seedToken(page, 'FBS-FAKE1234', forged)
  await page.goto('/book/cancel?id=FBS-FAKE1234', { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: /cancel/i }).first().click()
  // Real route verifies HMAC — forged signature must surface an error, not success.
  await expect(page.getByText(/invalid|expired|failed|not found|unable/i).first()).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByText('Your appointment has been cancelled')).toHaveCount(0)
})

test('cancel — garbage token shows error, no stored booking shows invalid-link UI', async ({ page }) => {
  await seedToken(page, 'FBS-X', 'not-a-token')
  await page.goto('/book/cancel?id=FBS-X', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /cancel/i }).first().click()
  await expect(page.getByText(/invalid|expired|failed|not found|unable/i).first()).toBeVisible({
    timeout: 15_000,
  })

  await page.goto('/book/cancel', { waitUntil: 'domcontentloaded' })
  await expect(page.getByText('Invalid cancellation link')).toBeVisible()
})

test('cancel — no token or customer name ever reaches the URL', async ({ page }) => {
  await seedToken(page, 'FBS-URLCHK', 'some-token-value')
  await page.goto('/book/cancel?id=FBS-URLCHK', { waitUntil: 'domcontentloaded' })
  expect(page.url()).not.toContain('some-token-value')
  expect(page.url()).not.toContain('token=')
  expect(page.url()).not.toContain('name=')
})
