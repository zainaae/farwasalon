import { describe, it, expect } from 'vitest'
import {
  PHONE_RE,
  isValidPhone,
  normalizePhoneE164,
  normalizePhoneDisplay,
  phonesMatch,
} from './phone.js'

describe('pos phone', () => {
  it('re-exports PHONE_RE from site-config', () => {
    expect(PHONE_RE.test('03001234567')).toBe(true)
    expect(PHONE_RE.test('not-a-phone')).toBe(false)
  })

  it('normalizes 03xx ↔ 923xx', () => {
    expect(normalizePhoneE164('03001234567')).toBe('923001234567')
    expect(normalizePhoneE164('0300 1234567')).toBe('923001234567')
    expect(normalizePhoneE164('0300-1234567')).toBe('923001234567')
    expect(normalizePhoneE164('+92 300 1234567')).toBe('923001234567')
    expect(normalizePhoneE164('923001234567')).toBe('923001234567')
    expect(normalizePhoneDisplay('923001234567')).toBe('03001234567')
    expect(normalizePhoneDisplay('+923001234567')).toBe('03001234567')
  })

  it('rejects unusable numbers', () => {
    expect(isValidPhone('')).toBe(false)
    expect(isValidPhone(null)).toBe(false)
    expect(normalizePhoneE164('not-a-phone')).toBe(null)
    expect(normalizePhoneE164('0211234567')).toBe(null)
    expect(normalizePhoneDisplay('abc')).toBe(null)
  })

  it('phonesMatch across formats', () => {
    expect(phonesMatch('03001234567', '923001234567')).toBe(true)
    expect(phonesMatch('03001234567', '03009999999')).toBe(false)
  })
})
