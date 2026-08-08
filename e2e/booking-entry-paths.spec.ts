/**
 * Entry → /book deep-link coverage for each meaningful booking path.
 * Complements book-flow-smoke (core steps) with source-page → prefill checks.
 */
import { test, expect } from '@playwright/test'
import { mockBookApi, mockSlotsApi, pickDateAndTime, visibleMain } from './helpers'

test.describe('Booking entry paths', () => {
  test.beforeEach(async ({ page }) => {
    await mockSlotsApi(page)
  })

  test('home Quick Pick Threading → /book?category=Threading expanded', async ({ page }) => {
    await page.goto('/')
    const pick = page.getByRole('link', { name: /Book Threading/i })
    await expect(pick).toBeVisible()
    await expect(pick).toHaveAttribute('href', /\/book\?category=Threading/)
    await pick.click()
    await expect(page).toHaveURL(/\/book\?category=Threading/)
    await expect(page.getByText('— Choose services')).toBeVisible()
    await expect(page.getByRole('button', { name: /Eyebrow Threading/i })).toBeVisible()
  })

  test('home sticky Book CTA → /book', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    const book = page.getByRole('link', { name: 'Book an appointment online' })
    await expect(book).toBeVisible({ timeout: 15_000 })
    await expect(book).toHaveAttribute('href', /\/book/)
    await book.click()
    await expect(page).toHaveURL(/\/book/)
    await expect(page.getByRole('heading', { level: 1, name: /book|online/i })).toBeVisible()
  })

  test('/prices category Book → /book?category=Facials expanded', async ({ page }) => {
    await page.goto('/prices')
    const catBook = page.getByRole('link', { name: /^Book Facials$/i })
    await expect(catBook).toHaveAttribute('href', /\/book\?category=Facials/)
    await catBook.click()
    await expect(page).toHaveURL(/\/book\?category=Facials/)
    await expect(page.getByRole('button', { name: /Normal Facial/i })).toBeVisible()
  })

  test('/prices row Book → ?service=Name selects that service', async ({ page }) => {
    await page.goto('/prices')
    const threadingSection = page.locator('section').filter({
      has: page.getByRole('heading', { name: /^Threading$/i }),
    })
    const rowBook = threadingSection.getByRole('link', { name: /^Book$/i }).first()
    await expect(rowBook).toHaveAttribute('href', /\/book\?service=.*&category=Threading/)
    await rowBook.click()
    await expect(page).toHaveURL(/\/book\?/)
    /* Book client canonicalizes named deep-links to serviceId=; assert selection,
       not the transient service=/category= query that replace() may race away. */
    await expect(page.getByRole('button', { name: 'Remove Eyebrow Threading' })).toBeVisible()
    await expect(page).toHaveURL(/serviceId=\d+/)
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByText('— Pick a date')).toBeVisible()
  })

  test('/bridal package Book → serviceId preselected, can advance', async ({ page }) => {
    await page.goto('/bridal')
    const pkgBook = page.getByRole('link', { name: /Book Full Bridal Package/i }).first()
    await expect(pkgBook).toHaveAttribute('href', /\/book\?serviceId=\d+/)
    await pkgBook.click()
    await expect(page).toHaveURL(/\/book\?serviceId=\d+/)
    await expect(visibleMain(page)).toBeVisible()
    /* Prefill selects the package — Next advances to date step. */
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByText('— Pick a date')).toBeVisible()
  })

  test('/contact LiveAvailability Book appointment → /book (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/contact')
    /* Widget hides on slots error; mockSlotsApi keeps it visible when free > 0.
       Scope to main — footer also has a "Book appointment" link. */
    const liveBook = visibleMain(page).getByRole('link', { name: /^Book appointment$/i })
    await expect(liveBook).toBeVisible({ timeout: 15_000 })
    await expect(liveBook).toHaveAttribute('href', '/book')
    await liveBook.click()
    await expect(page).toHaveURL(/\/book/)
    await expect(page.getByText('— Choose services')).toBeVisible()
  })

  test('/services/hair modal Continue to book → serviceId on /book', async ({ page }) => {
    await page.goto('/services/hair')
    await page.getByRole('button', { name: /haircut & blowdry/i }).click()
    const dialog = page.getByRole('dialog')
    const bookLink = dialog.getByRole('link', { name: /continue to book haircut & blowdry/i })
    await expect(bookLink).toHaveAttribute('href', /\/book\?serviceId=\d+/)
    await bookLink.click()
    await expect(page).toHaveURL(/\/book\?serviceId=\d+/)
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByText('— Pick a date')).toBeVisible()
  })

  test('/book?serviceId=1 deep-link completes mocked booking', async ({ page }) => {
    await mockBookApi(page)
    await page.goto('/book?serviceId=1')
    await page.getByRole('button', { name: 'Next' }).click()
    await pickDateAndTime(page)
    await page.locator('#bk-name').fill('E2E Entry')
    await page.locator('#bk-phone').fill('03001234567')
    await page.getByRole('button', { name: 'Confirm Booking' }).click()
    await expect(page).toHaveURL(/\/book\/confirmation/, { timeout: 15_000 })
    await expect(page.getByRole('heading', { name: /you're set/i })).toBeVisible()
  })

  test('mobile 390 — Quick Pick Nails → category prefill', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    const nails = page.getByRole('link', { name: /Book Nails/i })
    await nails.scrollIntoViewIfNeeded()
    await nails.click()
    await expect(page).toHaveURL(/\/book\?category=Nails/)
    await expect(page.getByText('— Choose services')).toBeVisible()
  })
})
