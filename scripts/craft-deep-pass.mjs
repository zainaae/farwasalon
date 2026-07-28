import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const BASE = process.env.QA_BASE || 'http://localhost:3000'
const OUT = path.join(process.cwd(), 'qa-shots', 'deep')
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
  '/privacy',
]

const viewports = [
  { name: 'm375', width: 375, height: 812 },
  { name: 'd1280', width: 1280, height: 800 },
]

async function deepProbe(page, route) {
  return page.evaluate((routeName) => {
    const issues = []
    const notes = []

    const docEl = document.documentElement
    if (docEl.scrollWidth > docEl.clientWidth + 2) {
      issues.push(`P0 overflow-x +${docEl.scrollWidth - docEl.clientWidth}px`)
    }

    const h1s = [...document.querySelectorAll('h1')]
    if (h1s.length !== 1) issues.push(`P1 h1 count=${h1s.length}`)

    // Sticky bars covering interactive content at bottom
    const sticky = [...document.querySelectorAll('nav[aria-label="Quick contact and booking"], .sticky-cta-enter, [class*="sticky"]')]
      .filter((el) => {
        const s = getComputedStyle(el)
        return (s.position === 'fixed' || s.position === 'sticky') && el.getBoundingClientRect().height > 0
      })
    const fixedBottom = sticky.filter((el) => {
      const r = el.getBoundingClientRect()
      return r.bottom >= window.innerHeight - 4 && r.top > window.innerHeight / 2
    })
    if (fixedBottom.length > 1) issues.push(`P1 multiple bottom stickies=${fixedBottom.length}`)

    // Main interactive CTAs under sticky
    if (fixedBottom[0]) {
      const stickyTop = fixedBottom[0].getBoundingClientRect().top
      const candidates = [...document.querySelectorAll('a.btn, button.btn, main a[href*="/book"], main button')]
        .filter((el) => {
          const r = el.getBoundingClientRect()
          return r.width > 80 && r.height > 28 && r.bottom > stickyTop && r.top < window.innerHeight
        })
      if (candidates.length) {
        const sample = candidates.slice(0, 3).map((el) => (el.textContent || '').trim().slice(0, 28))
        issues.push(`P1 CTA under sticky: ${sample.join(' | ')}`)
      }
    }

    // SEO / hub spam in chrome
    const bodyText = document.body?.innerText || ''
    const hyphenHubs = (bodyText.match(/-in-[a-z-]+/g) || []).length
    if (hyphenHubs > 25) issues.push(`P1 SEO hub density hyphen-in=${hyphenHubs}`)
    if (/Areas we serve[\s\S]{0,120}(best beauty|near me)/i.test(bodyText)) {
      issues.push('P1 SEO area dump visible')
    }
    if (/lorem ipsum|TODO|placeholder text|coming soon(?!)/i.test(bodyText)) {
      issues.push('P1 placeholder/trust-killer copy')
    }

    // Skip link presence/behavior
    const skip = document.querySelector('a.skip-link, a[href="#main"], a[href="#content"]')
    if (!skip) notes.push('no skip-link found')
    else {
      const href = skip.getAttribute('href') || ''
      const target = document.querySelector(href)
      if (!target && href.startsWith('#')) issues.push(`P1 skip-link target missing (${href})`)
    }

    // Form labels
    const unlabeled = [...document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea')]
      .filter((el) => {
        if (el.disabled || el.getAttribute('aria-hidden') === 'true') return false
        const id = el.id
        const byFor = id && document.querySelector(`label[for="${CSS.escape(id)}"]`)
        const wrapped = el.closest('label')
        const aria = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')
        return !(byFor || wrapped || aria)
      })
      .map((el) => el.name || el.id || el.type)
    if (unlabeled.length) issues.push(`P1 unlabeled inputs: ${unlabeled.slice(0, 5).join(', ')}`)

    // Tiny primary nav / sticky taps (ignore footer link lists & chips in dense grids)
    const primaryTiny = [...document.querySelectorAll('header a, header button, nav[aria-label="Quick contact and booking"] a, nav[aria-label="Quick contact and booking"] button, .site-header a, .site-header button')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && (r.width < 40 || r.height < 36)
      })
      .map((el) => {
        const r = el.getBoundingClientRect()
        return `${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 20)} ${Math.round(r.width)}x${Math.round(r.height)}`
      })
    if (primaryTiny.length) issues.push(`P1 tiny header/sticky taps: ${primaryTiny.slice(0, 4).join('; ')}`)

    // Colliding text: overlapping inline elements in hero/main first section
    const hero = document.querySelector('main section, main > div, [class*="hero"]') || document.querySelector('main')
    if (hero) {
      const texts = [...hero.querySelectorAll('h1, h2, p, a, button')].filter((el) => {
        const r = el.getBoundingClientRect()
        return r.width > 20 && r.height > 10 && r.top < window.innerHeight
      })
      for (let i = 0; i < texts.length; i++) {
        const a = texts[i].getBoundingClientRect()
        for (let j = i + 1; j < Math.min(texts.length, i + 8); j++) {
          const b = texts[j].getBoundingClientRect()
          const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left)
          const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
          if (overlapX > 12 && overlapY > 8 && !texts[i].contains(texts[j]) && !texts[j].contains(texts[i])) {
            issues.push(`P1 overlapping text near hero: "${(texts[i].textContent||'').trim().slice(0,18)}" / "${(texts[j].textContent||'').trim().slice(0,18)}"`)
            i = texts.length
            break
          }
        }
      }
    }

    // Double-mount / FOUC signals for home hero split
    if (routeName === '/') {
      const heroes = document.querySelectorAll('[class*="hero"], section[aria-label*="Hero"], .home-hero')
      notes.push(`hero-like nodes=${heroes.length}`)
      const videos = document.querySelectorAll('video')
      notes.push(`videos=${videos.length}`)
      const below = document.querySelector('[data-below-fold], #below-fold, .home-below-fold')
      notes.push(`below-fold=${!!below}`)
    }

    // Low contrast candidates on primary buttons (rough luminance)
    function lum(c) {
      const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (!m) return null
      const [r, g, b] = m.slice(1).map(Number).map((v) => {
        v /= 255
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    const weakBtns = [...document.querySelectorAll('a.btn, button.btn, .btn')]
      .slice(0, 20)
      .filter((el) => {
        const s = getComputedStyle(el)
        const fg = lum(s.color)
        const bg = lum(s.backgroundColor)
        if (fg == null || bg == null) return false
        const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05)
        return ratio < 3 && s.backgroundColor !== 'rgba(0, 0, 0, 0)'
      })
      .map((el) => (el.textContent || '').trim().slice(0, 24))
    if (weakBtns.length) issues.push(`P1 weak btn contrast: ${weakBtns.slice(0, 3).join(' | ')}`)

    // Drawer / menu open trap check (only if open)
    const dialog = document.querySelector('[role="dialog"][aria-modal="true"], .drawer.open, nav[data-open="true"]')
    if (dialog) notes.push('modal/drawer open')

    return {
      title: document.title,
      path: location.pathname,
      issues: [...new Set(issues)],
      notes,
      stickyBottom: fixedBottom.length,
      h1: h1s[0]?.textContent?.trim()?.slice(0, 80) || null,
    }
  }, route)
}

const report = []
const browser = await chromium.launch({ headless: true })

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()
  page.on('pageerror', (err) => {
    report.push({ vp: vp.name, route: 'RUNTIME', issues: [`P0 pageerror: ${err.message}`] })
  })

  for (const route of routes) {
    const slug = route === '/' ? 'home' : route.replace(/\//g, '_').replace(/^_/, '')
    const file = `${vp.name}_${slug}.png`
    try {
      const consoleErrors = []
      page.removeAllListeners('console')
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 120))
      })

      await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 })
      await page.waitForTimeout(800)
      await page.screenshot({ path: path.join(OUT, file), fullPage: false })
      const info = await deepProbe(page, route)
      if (consoleErrors.length) info.issues.push(`P1 console errors: ${consoleErrors.slice(0, 2).join(' | ')}`)
      report.push({ vp: vp.name, route, file, ...info })
      console.log(`${vp.name} ${route} → ${info.issues.length ? info.issues.join(' || ') : 'ok'} ${info.notes?.length ? '[' + info.notes.join('; ') + ']' : ''}`)

      // Book flow: attempt step progression on mobile
      if (route === '/book' && vp.name === 'm375') {
        for (let step = 1; step <= 3; step++) {
          const next = page.getByRole('button', { name: /continue|next|book|confirm/i }).first()
          if (!(await next.isVisible().catch(() => false))) break
          // Prefer selecting a service first if available
          if (step === 1) {
            const svc = page.locator('button, label, a').filter({ hasText: /thread|wax|facial|manicure|bridal/i }).first()
            if (await svc.isVisible().catch(() => false)) await svc.click().catch(() => {})
            await page.waitForTimeout(300)
          }
          await next.click().catch(() => {})
          await page.waitForTimeout(500)
          await page.screenshot({ path: path.join(OUT, `m375_book_step${step + 1}.png`), fullPage: false })
          const stepInfo = await deepProbe(page, '/book')
          report.push({ vp: vp.name, route: `/book#step${step + 1}`, ...stepInfo })
          console.log(`m375 /book#step${step + 1} → ${stepInfo.issues.length ? stepInfo.issues.join(' || ') : 'ok'}`)
        }
      }

      // Mobile menu open/close on home
      if (route === '/' && vp.name === 'm375') {
        const menuBtn = page.getByRole('button', { name: /menu|open navigation|close/i }).first()
        if (await menuBtn.isVisible().catch(() => false)) {
          await menuBtn.click().catch(() => {})
          await page.waitForTimeout(400)
          await page.screenshot({ path: path.join(OUT, 'm375_home_menu.png'), fullPage: false })
          const menuInfo = await deepProbe(page, '/')
          report.push({ vp: 'm375', route: '/#menu', ...menuInfo })
          console.log(`m375 /#menu → ${menuInfo.issues.length ? menuInfo.issues.join(' || ') : 'ok'}`)
          // Escape / close
          await page.keyboard.press('Escape').catch(() => {})
          await page.waitForTimeout(200)
        }
      }

      // Prices jump chips vs sticky
      if (route === '/prices' && vp.name === 'm375') {
        await page.evaluate(() => window.scrollTo(0, 400))
        await page.waitForTimeout(300)
        await page.screenshot({ path: path.join(OUT, 'm375_prices_scrolled.png'), fullPage: false })
        const scrolled = await deepProbe(page, '/prices')
        report.push({ vp: 'm375', route: '/prices#scrolled', ...scrolled })
        console.log(`m375 /prices#scrolled → ${scrolled.issues.length ? scrolled.issues.join(' || ') : 'ok'}`)
      }
    } catch (e) {
      report.push({ vp: vp.name, route, error: String(e.message || e), issues: ['P0 nav-error'] })
      console.log(`${vp.name} ${route} → ERROR ${e.message}`)
    }
  }
  await context.close()
}

await browser.close()
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2))
const bad = report.filter((r) => (r.issues && r.issues.length) || r.error)
console.log('\n=== DEEP SUMMARY ===')
console.log(`checks=${report.length} withIssues=${bad.length}`)
bad.forEach((r) => console.log(`${r.vp} ${r.route}: ${(r.issues || [r.error]).join(' | ')}`))
