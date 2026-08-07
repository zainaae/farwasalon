import { expect, type Page } from '@playwright/test'
import { CAT_SLUGS } from '../src/data.js'
import { BLOG_POSTS } from '../src/blog-data.js'
import { getPriorityLocationLinks } from '../lib/location-links.js'

export const ALL_CATEGORY_SLUGS = Object.values(CAT_SLUGS)
export const BLOG_SLUGS = BLOG_POSTS.map((post) => post.slug)

/** Ten representative location landing pages — diverse services and neighborhoods. */
export const SAMPLE_LOCATION_LINKS = getPriorityLocationLinks().filter(({ slug }) =>
  [
    'threading-in-pechs-karachi',
    'bridal-makeup-in-pechs-karachi',
    'facials-in-pechs-karachi',
    'threading-in-gulshan',
    'bridal-makeup-in-clifton-karachi',
    'bridal-makeup-in-dha',
    'threading-in-dha',
    'threading-in-bahadurabad',
    'waxing-in-tariq-road',
    'hair-in-dha',
  ].includes(slug),
)

/**
 * Next 16 / React 19 can briefly keep a hidden duplicate of the route in the DOM
 * (Activity / Suspense reveal). ID selectors then match 2 nodes and Playwright
 * strict mode fails — prefer visibility-filtered locators.
 */
export function visibleMain(page: Page) {
  return page.locator('#main').filter({ visible: true })
}

export function visibleById(page: Page, id: string) {
  return page.locator(`#${id}`).filter({ visible: true })
}

export async function assertNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => {
    const doc = document.documentElement
    const body = document.body
    return {
      scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
      clientWidth: doc.clientWidth,
    }
  })
  expect(
    metrics.scrollWidth,
    `scrollWidth ${metrics.scrollWidth} should fit clientWidth ${metrics.clientWidth}`,
  ).toBeLessThanOrEqual(metrics.clientWidth + 1)
}

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

export async function mockCancelApi(page: Page) {
  await page.route('**/api/book/cancel', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue()
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    })
  })
}

export async function mockSubscribeApi(page: Page) {
  await page.route('**/api/subscribe', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue()
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    })
  })
}

/** Open newsletter modal via engagement scroll (60% depth). */
export async function openNewsletterModal(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('farwa-newsletter-seen')
    } catch {
      // private mode
    }
  })
  await page.goto('/')
  // The modal is engagement-gated: it opens at 60% scroll depth. The scroll
  // listener attaches after hydration, so keep nudging until it reacts.
  const dialog = page.getByRole('dialog', { name: /seasonal tips|salon updates/i })
  for (let i = 0; i < 30; i++) {
    if (await dialog.isVisible().catch(() => false)) break
    await page.evaluate(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight * 0.85, behavior: 'instant' })
      window.dispatchEvent(new Event('scroll'))
    })
    await page.waitForTimeout(250)
  }
  await expect(dialog).toBeVisible({ timeout: 5_000 })
}
