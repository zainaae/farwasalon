/**
 * Shared responsive / resolution matrix for Playwright e2e and design-qa.
 * Keep docs/qa-test-dataset.md in sync when changing these.
 */

export type ViewportSize = {
  width: number
  height: number
  label: string
}

/** Full overflow matrix (includes 414 large phone). */
export const OVERFLOW_VIEWPORTS = [
  { width: 320, height: 568, label: '320' },
  { width: 375, height: 812, label: '375' },
  { width: 390, height: 844, label: '390' },
  { width: 414, height: 896, label: '414' },
  { width: 768, height: 1024, label: '768' },
  { width: 1024, height: 768, label: '1024' },
  { width: 1280, height: 800, label: '1280' },
] as const satisfies readonly ViewportSize[]

/** Core money pages — full width × zoom matrix. */
export const OVERFLOW_CORE_PAGES = [
  '/',
  '/services',
  '/services/threading',
  '/book',
  '/gallery',
] as const

/**
 * Long / SEO pages — reduced width set to keep CI bounded
 * (320 / 390 / 768 / 1280 still cover phone → desktop).
 */
export const OVERFLOW_EXTENDED_PAGES = [
  '/prices',
  '/bridal',
  '/deals',
  '/blog',
  '/services/waxing-in-pechs-karachi',
] as const

export const OVERFLOW_EXTENDED_VIEWPORTS = OVERFLOW_VIEWPORTS.filter((vp) =>
  [320, 390, 768, 1280].includes(vp.width),
)

/** Approximate browser zoom by shrinking the layout viewport. */
export const ZOOM_LEVELS = [
  { label: '100', widthScale: 1 },
  { label: '125', widthScale: 1 / 1.25 },
] as const

export const MOBILE_PORTRAIT = { width: 390, height: 844, label: '390×844' } as const

export const LANDSCAPE_MOBILE = [
  { width: 844, height: 390, label: '844×390' },
  { width: 667, height: 375, label: '667×375' },
] as const satisfies readonly ViewportSize[]

export const PORTRAIT_MOBILE = [
  { width: 390, height: 844, label: '390×844' },
  { width: 375, height: 667, label: '375×667' },
  { width: 414, height: 896, label: '414×896' },
] as const satisfies readonly ViewportSize[]

export const DESKTOP_VIEWPORTS = [
  { width: 1280, height: 800, label: '1280×800' },
  { width: 1920, height: 1080, label: '1920×1080' },
] as const satisfies readonly ViewportSize[]

/** DPR smoke: home + /prices at 390 only (bounded CI). */
export const DPR_SMOKE_PAGES = ['/', '/prices'] as const
export const DPR_SMOKE_VIEWPORT = { width: 390, height: 844 } as const
export const DPR_SMOKE_FACTORS = [1, 2] as const

/** Money pages for mobile axe. */
export const MOBILE_AXE_PAGES = [
  { path: '/', name: 'home' },
  { path: '/prices', name: 'prices' },
  { path: '/bridal', name: 'bridal' },
  { path: '/book', name: 'book' },
  { path: '/services/threading', name: 'service category' },
] as const

export function scaledViewport(
  viewport: { width: number; height: number },
  widthScale: number,
): { width: number; height: number } {
  return {
    width: Math.max(320, Math.round(viewport.width * widthScale)),
    height: viewport.height,
  }
}
