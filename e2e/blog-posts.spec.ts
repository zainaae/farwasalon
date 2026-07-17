import { test, expect } from '@playwright/test'
import { BLOG_POSTS } from '../src/blog-data.js'
import { BLOG_SLUGS } from './helpers'

test.describe('Blog articles', () => {
  test.describe.configure({ mode: 'serial' })

  test('blog index lists all posts', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/beauty tips/i)
    for (const post of BLOG_POSTS) {
      await expect(page.getByRole('link', { name: new RegExp(post.title.slice(0, 24), 'i') })).toBeVisible()
    }
  })

  for (const slug of BLOG_SLUGS) {
    test(`/blog/${slug} loads with article title`, async ({ page }) => {
      const post = BLOG_POSTS.find((p) => p.slug === slug)
      expect(post).toBeTruthy()

      // domcontentloaded avoids CI hangs waiting on lazy images/fonts for long posts
      const res = await page.goto(`/blog/${slug}`, { waitUntil: 'domcontentloaded', timeout: 60_000 })
      expect(res?.status()).toBe(200)

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.getByRole('heading', { level: 1 })).toContainText(post!.title.slice(0, 20))
      await expect(page.locator('#main')).not.toContainText(/article not found/i)
    })
  }
})
