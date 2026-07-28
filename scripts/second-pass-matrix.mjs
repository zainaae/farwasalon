import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const BASE = 'http://localhost:3000'
const OUT = path.join(process.cwd(), 'qa-shots', 'second-pass')
fs.mkdirSync(OUT, { recursive: true })

const routes = [
  '/', '/book', '/bridal', '/prices', '/services', '/services/facials',
  '/services/threading', '/services/bridal-makeup-in-pechs-karachi',
  '/gallery', '/contact', '/about', '/faq', '/blog',
  '/blog/salon-price-list-karachi-2026', '/beauty-salon-karachi', '/privacy',
]

async function probe(page) {
  return page.evaluate(() => {
    const issues = []
    const doc = document.documentElement
    if (doc.scrollWidth > doc.clientWidth + 2) issues.push(`overflow-x +${doc.scrollWidth - doc.clientWidth}`)
    const h1 = document.querySelectorAll('h1').length
    if (h1 !== 1) issues.push(`h1=${h1}`)
    const body = document.body?.innerText || ''
    const hubs = (body.match(/-in-[a-z-]+/g) || []).length
    if (hubs > 25) issues.push(`hub-spam ${hubs}`)
    if (/Areas we serve[\s\S]{0,120}(best beauty|near me)/i.test(body)) issues.push('seo-dump')
    const sticky = document.querySelector('nav[aria-label="Quick contact and booking"]')
    const unlabeled = [...document.querySelectorAll('input:not([type=hidden]):not([type=submit]), select, textarea')]
      .filter((el) => {
        const id = el.id
        return !(id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) && !el.closest('label') && !(el.getAttribute('aria-label') || el.getAttribute('aria-labelledby'))
      })
      .map((el) => el.name || el.id || el.type)
    if (unlabeled.length) issues.push(`unlabeled:${unlabeled.slice(0, 3).join(',')}`)
    return { issues, sticky: !!sticky, title: document.title.slice(0, 60) }
  })
}

const matrix = []
const browser = await chromium.launch()

for (const vp of [
  { name: 'm375', width: 375, height: 812 },
  { name: 'd1280', width: 1280, height: 800 },
]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
  const page = await ctx.newPage()
  for (const route of routes) {
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 })
      await page.waitForTimeout(550)
      const info = await probe(page)
      const row = { vp: vp.name, route, ok: info.issues.length === 0, ...info }
      matrix.push(row)
      console.log(`${vp.name} ${route} → ${row.ok ? 'ok' : info.issues.join('; ')}`)
    } catch (e) {
      matrix.push({ vp: vp.name, route, ok: false, issues: [`nav-error:${e.message}`] })
      console.log(`${vp.name} ${route} → ERROR`)
    }
  }

  if (vp.name === 'm375') {
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: /menu/i }).click()
    await page.waitForTimeout(300)
    const stickyWhileMenu = await page.evaluate(() => !!document.querySelector('nav[aria-label="Quick contact and booking"]'))
    matrix.push({ vp: 'm375', route: '/#menu', ok: !stickyWhileMenu, issues: stickyWhileMenu ? ['sticky-under-menu'] : [], stickyWhileMenu })
    console.log(`m375 /#menu stickyWhileMenu=${stickyWhileMenu}`)

    await page.goto(`${BASE}/book`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(400)
    const cat = page.locator('button, [role="button"]').filter({ hasText: /threading/i }).first()
    if (await cat.isVisible().catch(() => false)) {
      await cat.click().catch(() => {})
      await page.waitForTimeout(350)
      const svc = page.locator('button, label').filter({ hasText: /eyebrow/i }).first()
      if (await svc.isVisible().catch(() => false)) await svc.click().catch(() => {})
      await page.waitForTimeout(250)
      const cont = page.getByRole('button', { name: /continue|next/i }).first()
      const contVis = await cont.isVisible().catch(() => false)
      if (contVis) await cont.click().catch(() => {})
      await page.waitForTimeout(400)
      await page.screenshot({ path: path.join(OUT, 'book-step.png'), fullPage: false })
      matrix.push({ vp: 'm375', route: '/book#progress', ok: true, contVis })
      console.log(`m375 /book progress contVis=${contVis}`)
    }
  }
  await ctx.close()
}

await browser.close()
fs.writeFileSync(path.join(OUT, 'matrix.json'), JSON.stringify(matrix, null, 2))
const bad = matrix.filter((r) => r.ok === false)
console.log(`\nTOTAL=${matrix.length} FAIL=${bad.length}`)
bad.forEach((r) => console.log(`${r.vp} ${r.route}: ${(r.issues || []).join('; ')}`))
