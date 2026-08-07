import { test, expect } from '@playwright/test'
import { visibleMain } from './helpers'

test.describe('Blog, SEO feeds, gallery, accessibility', () => {
  test('/blog index and article', async ({ page }) => {
    await page.goto('/blog')
    await expect(visibleMain(page)).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/beauty tips/i)
    await expect(page.getByRole('link', { name: /Read article/i }).first()).toBeVisible()

    await page.goto('/blog/bridal-beauty-timeline')
    await expect(visibleMain(page)).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('/blog/rss.xml returns RSS', async ({ request }) => {
    const res = await request.get('/blog/rss.xml')
    expect(res.ok()).toBeTruthy()
    const body = await res.text()
    expect(body).toMatch(/<rss|<feed/i)
  })

  test('sitemap.xml and child sitemaps', async ({ request }) => {
    const index = await request.get('/sitemap.xml')
    expect(index.ok()).toBeTruthy()
    const indexXml = await index.text()
    expect(indexXml).toMatch(/sitemapindex|urlset/i)

    for (const path of ['/sitemap-static.xml', '/sitemap-services.xml', '/sitemap-locations.xml', '/sitemap-blog.xml']) {
      const res = await request.get(path)
      expect(res.ok(), path).toBeTruthy()
      const xml = await res.text()
      expect(xml).toMatch(/urlset/i)
    }
  })

  test('/gallery work showcase renders', async ({ page }) => {
    await page.goto('/gallery')
    await expect(visibleMain(page)).toBeVisible()
    await expect(page.getByRole('heading', { name: /Services we offer/i })).toBeVisible()
    // Quiet studio framing — no Instagram-as-main-proof trust blocker.
    /* Asserts the copy does NOT claim a provenance the repo cannot back.
       SALON_OWNED lists only the nail video; docs/salon-photography-guide.md
       says some sections use stock. The page may describe what it shows — it
       may not claim the images are the salon's own. */
    await expect(page.getByText(/services we offer in our PECHS studio/i)).toBeVisible()
    await expect(page.getByText(/not stock before-and-afters/i)).toHaveCount(0)
    await expect(page.getByText(/real clients go up on\s+our Instagram/i)).toHaveCount(0)
    // Quieter luxury routes Book to /book (Link), not the WhatsApp sheet button.
    const bookCta = page.getByRole('link', { name: /Book an Appointment/i }).first()
    await expect(bookCta).toBeVisible()
    await expect(bookCta).toHaveAttribute('href', '/book')
    await expect(page.getByText('Threading & glow facial')).toBeVisible()
    await expect(page.getByText('Bridal styling')).toBeVisible()
    await expect(page.getByText('Manicure & pedicure')).toBeVisible()
  })

  test('accessibility smoke — no empty buttons, images have alt on home', async ({ page }) => {
    const paths = ['/', '/services', '/book', '/blog/bridal-beauty-timeline']
    for (const path of paths) {
      await page.goto(path)
      const emptyButtons = await page.locator('button').evaluateAll((buttons) =>
        buttons.filter((b) => {
          const text = (b.textContent || '').trim()
          const label = b.getAttribute('aria-label')
          return !text && !label
        }).length,
      )
      expect(emptyButtons, `empty buttons on ${path}`).toBe(0)

      const imgsWithoutAlt = await page.locator('img:not([alt])').count()
      expect(imgsWithoutAlt, `images missing alt on ${path}`).toBe(0)
    }
  })

  test('home hero includes local SEO headline', async ({ page }) => {
    await page.goto('/')
    const h1 = page.locator('#hero-headline')
    const lede = page.locator('#hero-lede')
    await expect(h1).toContainText(/Beauty Salon/i)
    await expect(h1).toContainText(/PECHS/i)
    await expect(h1).toContainText(/Karachi/i)
    await expect(lede).toContainText(/Farwa Beauty Salon/i)
  })

  test('footer shows single salon location', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer.getByText('Visit Us')).toBeVisible()
    await expect(footer.getByText(/PECHS Block 3, Karachi/i)).toBeVisible()
    await expect(footer.getByRole('link', { name: /Directions on Google Maps/i })).toBeVisible()
    await expect(footer.getByRole('link', { name: /Beauty salon in Karachi/i })).toHaveAttribute(
      'href',
      '/beauty-salon-karachi',
    )
    await expect(footer.getByText('Salon near you in Karachi')).toHaveCount(0)
  })

  test('/beauty-salon-karachi hub page', async ({ page }) => {
    await page.goto('/beauty-salon-karachi')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Beauty Salon in Karachi/i)
    await expect(page.getByRole('link', { name: /Book Online/i }).first()).toBeVisible()
  })

  test('newsletter subscribe API accepts POST', async ({ request }) => {
    const res = await request.post('/api/subscribe', {
      data: { email: 'e2e-test@example.com', firstName: 'E2E', website: '' },
    })
    // 503 when Sheets env is missing locally; 502 only on transient upstream failure
    expect([200, 400, 503]).toContain(res.status())
  })
})

/* The homepage once shipped 55 words and zero <h2> because its below-fold
   content loaded through dynamic(..., { ssr: false }) behind an idle callback.
   It is the site's highest-impression URL. This asserts the content is in the
   server-rendered HTML, not assembled after hydration — so a well-meaning perf
   change cannot quietly empty it again. */
test('homepage server-renders its content, not an empty shell', async ({ page }) => {
  // JS disabled: exactly what a crawler and the first paint receive.
  const ctx = await page.context().browser()!.newContext({ javaScriptEnabled: false })
  const raw = await ctx.newPage()
  await raw.goto('/', { waitUntil: 'domcontentloaded' })

  /* Assert against the HTML source, not innerText. Eight sections carry
     content-visibility: auto, so innerText returns only what is on screen —
     240 words — while the markup carries 2,000+. Google parses the markup. */
  const html = await raw.content()
  const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'))
  const words = main
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length

  expect(words, 'words of server-rendered content in <main>').toBeGreaterThan(800)
  expect((main.match(/<h2/g) || []).length, '<h2> headings').toBeGreaterThanOrEqual(4)
  expect(main).toContain('href="/prices"')
  expect(main).toContain('href="/book"')
  expect((main.match(/href="\/services/g) || []).length, 'service links').toBeGreaterThan(3)

  await ctx.close()
})
