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
  '/deals',
  '/services',
  '/services/facials',
  '/services/threading',
  '/services/waxing-in-pechs-karachi',
  '/gallery',
  '/contact',
  '/about',
  '/faq',
  '/blog',
  '/blog/salon-price-list-karachi-2026',
  '/beauty-salon-karachi',
]

/** Aligned with e2e/viewports.ts — 375 / 414 / 1280 + one DPR-2 mobile pass. */
const viewports = [
  { name: 'm375', width: 375, height: 812, deviceScaleFactor: 1 },
  { name: 'm414', width: 414, height: 896, deviceScaleFactor: 1 },
  { name: 'm390-dpr2', width: 390, height: 844, deviceScaleFactor: 2 },
  { name: 'd1280', width: 1280, height: 800, deviceScaleFactor: 1 },
]

function issuesFromPage(info) {
  const issues = []
  if (info.scrollWidth > info.clientWidth + 2) {
    issues.push(`overflow-x ${info.scrollWidth - info.clientWidth}px`)
  }
  if (info.stickyCount > 1) issues.push(`sticky navs=${info.stickyCount}`)
  if (info.hasSeoDump) issues.push('possible SEO area dump text')
  if (info.h1Count !== 1) issues.push(`h1 count=${info.h1Count}`)
  return issues
}

function warnFromPage(info) {
  const warnings = []
  if (info.tinyTaps?.length) {
    warnings.push(`tiny taps: ${info.tinyTaps.slice(0, 5).join('; ')}`)
  }
  return warnings
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
    deviceScaleFactor: vp.deviceScaleFactor ?? 1,
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
      const warnings = warnFromPage(info)
      report.push({ vp: vp.name, route, file, ...info, issues, warnings })
      const warnNote = warnings.length ? ` (warn: ${warnings.join(' | ')})` : ''
      console.log(`${vp.name} ${route} → ${issues.length ? issues.join(' | ') : 'ok'}${warnNote}`)

      if (route === '/book' && vp.name === 'm375') {
        const next = page.getByRole('button', { name: /continue|next/i }).first()
        if (await next.isVisible().catch(() => false)) {
          await next.click().catch(() => {})
          await page.waitForTimeout(400)
          await page.screenshot({ path: path.join(OUT, 'm375_book_step2.png'), fullPage: false })
        }
      }
    } catch (e) {
      report.push({ vp: vp.name, route, error: String(e.message || e), issues: ['nav-error'], warnings: [] })
      console.log(`${vp.name} ${route} → ERROR ${e.message}`)
    }
  }
  await context.close()
}
await browser.close()

fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2))
const bad = report.filter((r) => (r.issues && r.issues.length) || r.error)
const warned = report.filter((r) => r.warnings?.length)
console.log('\n=== SUMMARY ===')
console.log(`routes=${report.length} withIssues=${bad.length} withWarnings=${warned.length}`)
bad.forEach((r) => console.log(`FAIL ${r.vp} ${r.route}: ${(r.issues || [r.error]).join(' | ')}`))
warned.forEach((r) => console.log(`WARN ${r.vp} ${r.route}: ${r.warnings.join(' | ')}`))

if (bad.length) {
  process.exitCode = 1
}
