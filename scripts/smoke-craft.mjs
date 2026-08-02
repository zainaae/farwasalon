import { chromium, devices } from 'playwright'

const browser = await chromium.launch()
const ctx = await browser.newContext({ ...devices['iPhone 12'] })
const page = await ctx.newPage()

await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
await page.waitForTimeout(900)
const sticky = await page.locator('nav[aria-label="Quick contact and booking"]').count()
const stickyOpacity = await page.locator('.sticky-cta-enter').evaluate((el) => getComputedStyle(el).opacity)

await page.goto('http://localhost:3000/book', { waitUntil: 'domcontentloaded' })
const firstVisitOpen = await page.locator('details[open]').count()

await page.goto('http://localhost:3000/services/threading', { waitUntil: 'domcontentloaded' })
const backDup = await page.getByRole('button', { name: /all services/i }).count()
const crumbs = await page.getByLabel('Breadcrumb').count()

console.log(JSON.stringify({ sticky, stickyOpacity, firstVisitOpen, backDup, crumbs }, null, 2))
await browser.close()
