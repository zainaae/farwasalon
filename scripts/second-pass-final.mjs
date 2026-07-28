import { chromium } from '@playwright/test'

const BASE = 'http://localhost:3000'
const routes = [
  '/', '/book', '/bridal', '/prices', '/services', '/services/facials',
  '/services/threading', '/services/bridal-makeup-in-pechs-karachi',
  '/gallery', '/contact', '/about', '/faq', '/blog',
  '/blog/salon-price-list-karachi-2026', '/beauty-salon-karachi', '/privacy',
]

const browser = await chromium.launch()
const matrix = []

for (const vp of [
  { name: 'm375', width: 375, height: 812 },
  { name: 'd1280', width: 1280, height: 800 },
]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
  const page = await ctx.newPage()
  for (const route of routes) {
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 })
      await page.waitForTimeout(450)
      const info = await page.evaluate(() => {
        const issues = []
        const ox = document.documentElement.scrollWidth - document.documentElement.clientWidth
        if (ox > 2) issues.push(`overflow-x +${ox}`)
        const h1 = document.querySelectorAll('h1').length
        if (h1 !== 1) issues.push(`h1=${h1}`)
        const body = document.body?.innerText || ''
        if ((body.match(/-in-[a-z-]+/g) || []).length > 25) issues.push('hub-spam')
        if (/Areas we serve[\s\S]{0,120}(best beauty|near me)/i.test(body)) issues.push('seo-dump')
        return { issues }
      })
      matrix.push({ vp: vp.name, route, ok: info.issues.length === 0, issues: info.issues })
      console.log(`${vp.name} ${route} → ${info.issues.length ? info.issues.join('; ') : 'ok'}`)
    } catch (e) {
      matrix.push({ vp: vp.name, route, ok: false, issues: [e.message.slice(0, 80)] })
      console.log(`${vp.name} ${route} → ERR`)
    }
  }
  if (vp.name === 'm375') {
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: /^menu$/i }).click()
    await page.waitForTimeout(350)
    const sticky = await page.evaluate(() => !!document.querySelector('nav[aria-label="Quick contact and booking"]'))
    const header = await page.evaluate(() => {
      const h = document.querySelector('header')
      const logo = h.querySelector('a[href="/"]')
      const menu = h.querySelector('button[aria-expanded]')
      const mid = (el) => {
        const r = el.getBoundingClientRect()
        return +(r.top + r.height / 2).toFixed(1)
      }
      return { logoMid: mid(logo), menuMid: mid(menu), delta: +(mid(logo) - mid(menu)).toFixed(1), h: +h.getBoundingClientRect().height.toFixed(1) }
    })
    matrix.push({ vp: 'm375', route: '/#menu', ok: !sticky, stickyUnderMenu: sticky, header })
    console.log('m375 menu sticky=', sticky, 'header', header)
  }
  if (vp.name === 'd1280') {
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(700)
    const align = await page.evaluate(() => {
      const h = document.querySelector('header')
      const nav = h.querySelector('nav[aria-label="Main navigation"]')
      const links = [...nav.querySelectorAll('a')].filter((a) => getComputedStyle(a).display !== 'none')
      const logo = h.querySelector('a[href="/"]')
      const book = [...h.querySelectorAll('a[href="/book"]')].find((a) => getComputedStyle(a).display.includes('flex'))
      const mid = (el) => {
        const r = el.getBoundingClientRect()
        return +(r.top + r.height / 2).toFixed(1)
      }
      const mids = [mid(logo), ...links.map(mid), mid(book)]
      const h0 = h.getBoundingClientRect().height
      window.scrollTo(0, 300)
      return new Promise((resolve) => {
        setTimeout(() => {
          const h1 = h.getBoundingClientRect().height
          resolve({
            spread: +(Math.max(...mids) - Math.min(...mids)).toFixed(1),
            h0: +h0.toFixed(1),
            h1: +h1.toFixed(1),
            heightStable: Math.abs(h0 - h1) < 0.5,
          })
        }, 400)
      })
    })
    matrix.push({ vp: 'd1280', route: '/#header-align', ok: align.spread === 0 && align.heightStable, ...align })
    console.log('d1280 header align', align)
  }
  await ctx.close()
}

await browser.close()
const bad = matrix.filter((r) => r.ok === false)
console.log(`\nTOTAL=${matrix.length} FAIL=${bad.length}`)
bad.forEach((r) => console.log(`${r.vp} ${r.route}: ${(r.issues || [JSON.stringify(r)]).join('; ')}`))
