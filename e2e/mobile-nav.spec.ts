import { test, expect } from '@playwright/test'

test.describe('Mobile navigation', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('hamburger opens menu and Services link navigates', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#main')).toBeVisible()

    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Close menu' })).toBeVisible()

    await page.getByRole('banner').getByRole('link', { name: 'Services', exact: true }).click()
    await expect(page).toHaveURL(/\/services$/)
    await expect(page.getByRole('heading', { name: /services/i })).toBeVisible()
  })
})
