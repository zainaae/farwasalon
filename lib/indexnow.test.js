import { describe, it, expect } from 'vitest'
import { getIndexNowUrls, INDEXNOW_KEY_LOCATION } from './indexnow.js'

describe('indexnow', () => {
  it('includes hub and home URLs', () => {
    const urls = getIndexNowUrls()
    expect(urls).toContain('https://farwasalon.com/')
    expect(urls).toContain('https://farwasalon.com/beauty-salon-karachi')
    expect(urls).toContain('https://farwasalon.com/bridal')
    expect(urls).toContain('https://farwasalon.com/prices')
    expect(urls.length).toBeLessThanOrEqual(50)
  })

  it('key location matches public file path', () => {
    expect(INDEXNOW_KEY_LOCATION).toBe('https://farwasalon.com/farwa-salon-indexnow.txt')
  })
})
