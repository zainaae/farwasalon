import { defineConfig, devices } from '@playwright/test'

const PORT = process.env.PLAYWRIGHT_PORT || '3000'
const baseURL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: baseURL,
    // Default off locally too: a stale `next start` after rebuild 404s CSS/JS chunks
    // and falsely fails H1/overflow/tab hydration assertions. Opt in with PLAYWRIGHT_REUSE=1.
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE === '1',
    timeout: 180_000,
  },
})
