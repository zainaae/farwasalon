import { describe, it, expect } from 'vitest'
import { webmSourceFor, HAS_WEBM } from './video-manifest.js'

describe('webmSourceFor', () => {
  it('returns the .webm src for videos in the manifest', () => {
    expect(webmSourceFor('/hero-mp4.mp4')).toBe('/hero-mp4.webm')
    expect(webmSourceFor('/manicurephotography.mp4')).toBe('/manicurephotography.webm')
  })

  it('accepts srcs without a leading slash', () => {
    expect(webmSourceFor('hero-mp4.mp4')).toBe('hero-mp4.webm')
  })

  it('returns null for videos without a webm variant', () => {
    expect(webmSourceFor('/some-other-video.mp4')).toBe(null)
  })

  it('returns null for non-mp4 srcs', () => {
    expect(webmSourceFor('/hero-mp4.webm')).toBe(null)
    expect(webmSourceFor('/hero-mp4')).toBe(null)
  })

  it('returns null for non-string input', () => {
    expect(webmSourceFor(null)).toBe(null)
    expect(webmSourceFor(undefined)).toBe(null)
    expect(webmSourceFor(42)).toBe(null)
  })

  it('returns null for nested paths not in the manifest', () => {
    expect(webmSourceFor('/videos/hero-mp4.mp4')).toBe(null)
  })

  it('every manifest entry is a bare basename (no slash, no extension)', () => {
    for (const name of HAS_WEBM) {
      expect(name).not.toMatch(/[/.]/)
    }
  })
})
