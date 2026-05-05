import { describe, it, expect } from 'vitest'
import { WA_NUMBER, waLink, waLinkBooking } from './data.js'

describe('waLink', () => {
  it('uses default message when service is omitted or empty', () => {
    expect(waLink()).toContain(WA_NUMBER)
    expect(waLink('')).toContain(WA_NUMBER)
  })

  it('encodes service name in the prefilled text', () => {
    const u = waLink('Eyebrow Threading')
    expect(u).toContain(`wa.me/${WA_NUMBER}`)
    const textParam = new URL(u).searchParams.get('text')
    expect(textParam).toBeTruthy()
    expect(decodeURIComponent(textParam)).toContain('Eyebrow Threading')
  })
})

describe('waLinkBooking', () => {
  it('includes services and optional meta in the message', () => {
    const u = waLinkBooking(['Cut', 'Colour'], { name: 'Sana', date: 'Jan 1', time: '11:00' })
    const text = decodeURIComponent(new URL(u).searchParams.get('text') ?? '')
    expect(text).toContain('Cut')
    expect(text).toContain('Colour')
    expect(text).toContain('Name: Sana')
    expect(text).toContain('Preferred date: Jan 1')
    expect(text).toContain('Preferred time: 11:00')
    expect(u).toContain(`wa.me/${WA_NUMBER}`)
  })
})
