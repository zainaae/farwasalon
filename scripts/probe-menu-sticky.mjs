import { chromium } from '@playwright/test'

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 375, height: 812 } })
const page = await context.newPage()

await page.goto('http://localhost:3000/contact', { waitUntil: 'networkidle' })
await page.waitForTimeout(900)
const sticky = await page.evaluate(() => {
  const nav = document.querySelector('nav[aria-label="Quick contact and booking"]')
  const bar = nav?.querySelector('.sticky-cta-enter')
  const call = nav?.querySelector('a[aria-label="Call the salon"]')
  const s = bar && getComputedStyle(bar)
  const cs = call && getComputedStyle(call)
  return {
    bg: s?.backgroundColor,
    opacity: s?.opacity,
    callColor: cs?.color,
    barH: Math.round(bar?.getBoundingClientRect().height || 0),
  }
})
console.log('contact sticky', sticky)

await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(700)
await page.getByRole('button', { name: /menu/i }).click()
await page.waitForTimeout(400)
const collision = await page.evaluate(() => {
  const stickyNav = document.querySelector('nav[aria-label="Quick contact and booking"]')
  const menuOpen = document.querySelector('button[aria-expanded="true"]')
  const r = stickyNav?.getBoundingClientRect()
  return {
    menuOpen: !!menuOpen,
    stickyH: Math.round(r?.height || 0),
    stickyPointer: stickyNav ? getComputedStyle(stickyNav).pointerEvents : null,
    stickyDisplay: stickyNav ? getComputedStyle(stickyNav).display : null,
  }
})
console.log('menu collision BEFORE fix', collision)

await page.goto('http://localhost:3000/book', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(500)
const threading = page.getByRole('button', { name: /threading/i }).first()
if (await threading.isVisible()) {
  await threading.click()
  await page.waitForTimeout(400)
}
const continueBtn = page.getByRole('button', { name: /continue|next/i }).first()
console.log('book continue visible', await continueBtn.isVisible().catch(() => false))
if (await continueBtn.isVisible().catch(() => false)) {
  await continueBtn.click()
  await page.waitForTimeout(500)
}
const step = await page.evaluate(() => document.body.innerText.slice(0, 200))
console.log('book after click snippet', step.replace(/\s+/g, ' ').slice(0, 160))

await browser.close()
