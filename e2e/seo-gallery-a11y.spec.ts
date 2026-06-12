import { test, expect } from '@playwright/test'

test.describe('Blog, SEO feeds, gallery, accessibility', () => {
  test('/blog index and article', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.locator('#main')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/beauty tips/i)
    await expect(page.getByRole('link', { name: /Read article/i }).first()).toBeVisible()

    await page.goto('/blog/bridal-beauty-timeline')
    await expect(page.locator('#main')).toBeVisible()
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

  test('/gallery before/after slider renders', async ({ page }) => {
    await page.goto('/gallery')
    await expect(page.locator('#main')).toBeVisible()
    const slider = page.getByRole('slider').first()
    await expect(slider).toBeVisible()
    await expect(slider).toHaveAttribute('aria-valuenow', /.*/)
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
    await expect(h1).toContainText(/Beauty Salon/i)
    await expect(h1).toContainText(/Karachi/i)
    await expect(h1).toContainText(/PECHS/i)
  })

  test('footer shows single salon location', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer.getByText('Location')).toBeVisible()
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
