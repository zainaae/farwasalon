import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const BASE = process.env.QA_BASE || 'http://localhost:3000'
const OUT = path.join(process.cwd(), 'qa-shots')
fs.mkdirSync(OUT, { recursive: true })

const routes = [
  '/',
  '/book',
  '/bridal',
  '/prices',
  '/services',
  '/services/facials',
  '/services/threading',
  '/services/bridal-makeup-in-pechs-karachi',
  '/gallery',
  '/contact',
  '/about',
  '/faq',
  '/blog',
  '/blog/salon-price-list-karachi-2026',
  '/beauty-salon-karachi',
]

const viewports = [
  { name: 'm375', width: 375, height: 812 },
  { name: 'd1280', width: 1280, height: 800 },
]

function issuesFromPage(info) {
  const issues = []
  if (info.scrollWidth > info.clientWidth + 2) {
    issues.push(`overflow-x ${info.scrollWidth - info.clientWidth}px`)
  }
  if (info.stickyCount > 1) issues.push(`sticky navs=${info.stickyCount}`)
  if (info.hasSeoDump) issues.push('possible SEO area dump text')
  if (info.tinyTaps?.length) issues.push(`tiny taps: ${info.tinyTaps.slice(0, 5).join('; ')}`)
  if (info.h1Count !== 1) issues.push(`h1 count=${info.h1Count}`)
  return issues
}

async function probe(page) {
  return page.evaluate(() => {
    const sticky = document.querySelectorAll('nav[aria-label="Quick contact and booking"]')
    const bodyText = document.body?.innerText || ''
    const hasSeoDump =
      /Areas we serve[\s\S]{0,80}(best beauty|near me|in Karachi).{0,40}(best beauty|near me)/i.test(bodyText) ||
      (bodyText.match(/-in-[a-z-]+/g) || []).length > 40
    const taps = [...document.querySelectorAll('a, button')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && (r.width < 40 || r.height < 36)
      })
      .slice(0, 8)
      .map((el) => {
        const r = el.getBoundingClientRect()
        return `${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 24)} ${Math.round(r.width)}x${Math.round(r.height)}`
      })
    return {
      title: document.title,
      h1Count: document.querySelectorAll('h1').length,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      stickyCount: sticky.length,
      hasSeoDump,
      tinyTaps: taps,
    }
  })
}

const report = []

const browser = await chromium.launch({ headless: true })
for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()
  for (const route of routes) {
    const slug = route === '/' ? 'home' : route.replace(/\//g, '_').replace(/^_/, '')
    const file = `${vp.name}_${slug}.png`
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 })
      await page.waitForTimeout(700)
      await page.screenshot({ path: path.join(OUT, file), fullPage: false })
      const info = await probe(page)
      const issues = issuesFromPage(info)
      report.push({ vp: vp.name, route, file, ...info, issues })
      console.log(`${vp.name} ${route} → ${issues.length ? issues.join(' | ') : 'ok'}`)

      if (route === '/book' && vp.name === 'm375') {
        const next = page.getByRole('button', { name: /continue|next/i }).first()
        if (await next.isVisible().catch(() => false)) {
          await next.click().catch(() => {})
          await page.waitForTimeout(400)
          await page.screenshot({ path: path.join(OUT, 'm375_book_step2.png'), fullPage: false })
        }
      }
    } catch (e) {
      report.push({ vp: vp.name, route, error: String(e.message || e), issues: ['nav-error'] })
      console.log(`${vp.name} ${route} → ERROR ${e.message}`)
    }
  }
  await context.close()
}
await browser.close()

fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2))
const bad = report.filter((r) => (r.issues && r.issues.length) || r.error)
console.log('\n=== SUMMARY ===')
console.log(`routes=${report.length} withIssues=${bad.length}`)
bad.forEach((r) => console.log(`${r.vp} ${r.route}: ${(r.issues || [r.error]).join(' | ')}`))
