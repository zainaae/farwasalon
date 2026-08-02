import { describe, it, expect, beforeEach, vi } from 'vitest'
import { track } from '../src/site-config.js'

/* The pixel is money-adjacent: if these mappings drift, Meta optimises the ad
   budget toward the wrong action and the campaign quietly wastes spend. */
describe('track() → Meta', () => {
  let fbq, plausible

  beforeEach(() => {
    fbq = vi.fn()
    plausible = vi.fn()
    globalThis.window = { fbq, plausible }
  })

  it('always reports to Plausible, pixel or not', () => {
    delete globalThis.window.fbq
    track('BookingCompleted', { service: 'Facial' })
    expect(plausible).toHaveBeenCalledWith('BookingCompleted', { props: { service: 'Facial' } })
  })

  it('maps a completed booking to Schedule with basket value in PKR', () => {
    track('BookingCompleted', { service: 'Hydra Facial', value: 3500 })
    expect(fbq).toHaveBeenCalledWith('track', 'Schedule', {
      value: 3500,
      currency: 'PKR',
      content_name: 'Hydra Facial',
    })
  })

  it('never forwards cancelToken into the Meta pixel payload', () => {
    track('BookingCompleted', {
      service: 'Eyebrow Threading + Upper Lip Threading',
      value: 700,
      cancelToken: 'should-never-reach-fbq',
    })
    const payload = fbq.mock.calls[0][2]
    expect(JSON.stringify(payload)).not.toMatch(/cancelToken|should-never-reach/)
    expect(payload).toEqual({
      value: 700,
      currency: 'PKR',
      content_name: 'Eyebrow Threading + Upper Lip Threading',
    })
  })

  it('maps WhatsApp and call taps to Contact', () => {
    track('WhatsAppIntent', { from: 'sticky-bar' })
    track('CallIntent', { from: 'sticky-bar' })
    expect(fbq).toHaveBeenNthCalledWith(1, 'track', 'Contact', { content_name: 'sticky-bar' })
    expect(fbq).toHaveBeenNthCalledWith(2, 'track', 'Contact', { content_name: 'sticky-bar' })
  })

  it('omits value when there is no real basket rather than sending a fake 0', () => {
    track('BookingStarted', { service: 'Threading' })
    expect(fbq).toHaveBeenCalledWith('track', 'InitiateCheckout', { content_name: 'Threading' })
  })

  it('leaves non-conversion events out of Meta entirely', () => {
    track('DealStripClick', { from: 'home' })
    expect(fbq).not.toHaveBeenCalled()
    expect(plausible).toHaveBeenCalled()
  })

  it('survives a missing pixel without throwing', () => {
    delete globalThis.window.fbq
    expect(() => track('BookingCompleted', { value: 1400 })).not.toThrow()
  })
})
