/**
 * LIVE booking round-trip — the one journey nothing else covers unmocked:
 * UI → /api/slots → /api/book → Google Sheet row → confirmation → cancel link
 * → /api/book/cancel → row Cancelled.
 *
 * Gated behind QA_LIVE=1 because it WRITES a real row to the configured sheet
 * (GOOGLE_SHEET_ID from .env.local). Books as the designated QA identity from
 * scripts/qa-dataset.mjs and cancels itself at the end.
 *
 *   QA_LIVE=1 npx playwright test e2e/live-booking-roundtrip.spec.ts
 */
import { test, expect } from '@playwright/test'

test.skip(process.env.QA_LIVE !== '1', 'live sheet write — run with QA_LIVE=1')

test('live: book via UI, verify confirmation, cancel via UI', async ({ page }) => {
  test.setTimeout(180_000)

  // Step 1 — service pre-selected via URL (Eyebrow Threading, id 1)
  await page.goto('/book?serviceId=1', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Next' }).click()

  // Step 2 — walk date chips until one has a free slot (today may have none
  // left: past times are filtered server-side). Selectors proven in book-flow-smoke.
  const chips = page.locator('button.snap-center:not([disabled])')
  await expect(chips.first()).toBeVisible({ timeout: 15_000 })
  const slot = page
    .locator('button:not([disabled])', { hasText: /^\d{1,2}:\d{2} (AM|PM)$/ })
    .first()
  // Start from the SECOND chip (tomorrow+): a same-day slot can sit inside the
  // 2-hour cancel window, which would break the self-cleanup cancel step.
  const chipCount = Math.min(await chips.count(), 6)
  let slotLabel: string | undefined
  for (let i = 1; i < chipCount; i++) {
    await chips.nth(i).click()
    try {
      await expect(slot).toBeVisible({ timeout: 15_000 })
      slotLabel = (await slot.textContent())?.trim()
      break
    } catch {
      // no free slots on this day — try the next chip
    }
  }
  expect(slotLabel, 'no free slots on the first 5 selectable days').toBeTruthy()
  await slot.click()
  await page.getByRole('button', { name: 'Next' }).click()

  // Step 3 — QA identity from scripts/qa-dataset.mjs
  await page.locator('#bk-name').fill('QA Workflow Test')
  await page.locator('#bk-phone').fill('03009999999')
  const notes = page.locator('#bk-notes')
  if (await notes.count()) await notes.fill('Automated QA probe — safe to cancel')

  await page.getByRole('button', { name: 'Confirm Booking' }).click()

  // Confirmation = the real sheet row exists (route verifies before responding)
  await expect(page.getByRole('heading', { name: /you're booked/i })).toBeVisible({
    timeout: 30_000,
  })
  // Analytics scrub removes `id` from the address after first paint; read the
  // Booking ID from the confirmation UI (or durable cancel link) instead.
  const bookingIdText = page.getByText(/^FBS-[A-F0-9]+$/i).first()
  await expect(bookingIdText).toBeVisible({ timeout: 10_000 })
  const bookingId = (await bookingIdText.textContent())?.trim()
  expect(bookingId, 'confirmation must show a booking id').toBeTruthy()
  const url = new URL(page.url())
  expect(url.searchParams.get('id'), 'id must be scrubbed from confirmation URL').toBeNull()
  // Cancel token must NEVER be in the URL (Plausible + Meta Pixel transmit href).
  expect(url.searchParams.get('token')).toBeNull()
  expect(page.url()).not.toMatch(/token=/)
  console.log(`LIVE BOOKING id=${bookingId} time=${slotLabel}`)

  // Round-trip cleanup: cancel through the real UI + API (token from durable storage)
  await page.locator('a[href*="/book/cancel"]').first().click()
  await expect(page.getByRole('heading', { name: /cancel appointment/i })).toBeVisible({
    timeout: 15_000,
  })
  await page.getByRole('button', { name: /yes, cancel my appointment/i }).click()
  await expect(page.getByRole('heading', { name: /^cancelled$/i })).toBeVisible({ timeout: 30_000 })
  console.log(`LIVE BOOKING ${bookingId} cancelled — sheet row left in Cancelled state`)
})
