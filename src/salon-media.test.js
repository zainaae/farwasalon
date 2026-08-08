import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { SALON_OWNED, SERVICE_PANEL_LOOP } from './salon-media.js'
import { webmSourceFor } from '../lib/video-manifest.js'

const publicDir = join(__dirname, '..', 'public')

describe('SERVICE_PANEL_LOOP', () => {
  it('lists only owned salon clips (no stock hover bed)', () => {
    expect(SERVICE_PANEL_LOOP.length).toBeGreaterThan(0)
    const ownedVideos = new Set(
      Object.values(SALON_OWNED).filter((v) => typeof v === 'string' && v.endsWith('.mp4')),
    )
    const ownedStills = new Set(
      Object.values(SALON_OWNED).filter((v) => typeof v === 'string' && !v.endsWith('.mp4')),
    )
    for (const entry of SERVICE_PANEL_LOOP) {
      expect(ownedVideos.has(entry.video)).toBe(true)
      expect(ownedStills.has(entry.poster)).toBe(true)
    }
  })

  it.each(SERVICE_PANEL_LOOP)('ships $video + $poster under public/', ({ video, poster }) => {
    expect(video).toMatch(/\.mp4$/)
    expect(existsSync(join(publicDir, video))).toBe(true)
    expect(existsSync(join(publicDir, poster))).toBe(true)
  })

  it('has a WebM twin for the nails idle loop', () => {
    expect(webmSourceFor(SALON_OWNED.nailsVideo)).toBe('/manicurephotography.webm')
    expect(existsSync(join(publicDir, 'manicurephotography.webm'))).toBe(true)
  })
})
