import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const OUT = path.join(process.cwd(), 'qa-shots')
fs.mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
await page.waitForTimeout(900)
await page.screenshot({
  path: path.join(OUT, 'header-after-d1280.png'),
  clip: { x: 0, y: 0, width: 1280, height: 72 },
})

const mid = (el) => {
  const r = el.getBoundingClientRect()
  return +(r.top + r.height / 2).toFixed(2)
}

const beforeScroll = await page.evaluate(() => {
  const h = document.querySelector('header')
  const nav = h.querySelector('nav[aria-label="Main navigation"]')
  const links = [...nav.querySelectorAll('a')].filter((a) => getComputedStyle(a).display !== 'none')
  const logo = h.querySelector('a[href="/"]')
  const books = [...h.querySelectorAll('a[href="/book"]')].filter((a) => getComputedStyle(a).display !== 'none')
  const book = books.find((a) => a.closest('header > div'))
  const midY = (el) => {
    const r = el.getBoundingClientRect()
    return +(r.top + r.height / 2).toFixed(2)
  }
  const mids = [midY(logo), ...links.map(midY), book ? midY(book) : null].filter((n) => n != null)
  return {
    h: +h.getBoundingClientRect().height.toFixed(2),
    logo: midY(logo),
    links: links.map((l) => ({ t: l.textContent.trim(), m: midY(l) })),
    book: book ? midY(book) : null,
    spread: +(Math.max(...mids) - Math.min(...mids)).toFixed(2),
  }
})

await page.evaluate(() => window.scrollTo(0, 240))
await page.waitForTimeout(450)
const afterScroll = await page.evaluate(() => {
  const h = document.querySelector('header')
  return {
    h: +h.getBoundingClientRect().height.toFixed(2),
    hasImg: !!h.querySelector('img'),
  }
})
await page.screenshot({
  path: path.join(OUT, 'header-after-scrolled-d1280.png'),
  clip: { x: 0, y: 0, width: 1280, height: 72 },
})

const m375 = await browser.newPage({ viewport: { width: 375, height: 812 } })
await m375.goto('http://localhost:3000/prices', { waitUntil: 'networkidle' })
await m375.waitForTimeout(700)
await m375.screenshot({
  path: path.join(OUT, 'header-after-m375.png'),
  clip: { x: 0, y: 0, width: 375, height: 64 },
})

// Menu + sticky collision check
await m375.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' })
await m375.waitForTimeout(600)
await m375.getByRole('button', { name: /menu/i }).click()
await m375.waitForTimeout(350)
const menuSticky = await m375.evaluate(() => {
  const sticky = document.querySelector('nav[aria-label="Quick contact and booking"]')
  return {
    menuOpen: !!document.querySelector('button[aria-expanded="true"]'),
    stickyPresent: !!sticky,
    stickyH: sticky ? sticky.getBoundingClientRect().height : 0,
  }
})
await m375.screenshot({ path: path.join(OUT, 'header-menu-open-m375.png'), fullPage: false })

console.log(JSON.stringify({ beforeScroll, afterScroll, menuSticky }, null, 2))
await browser.close()
