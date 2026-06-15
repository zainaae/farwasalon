import { describe, it, expect } from 'vitest'
import { isValidEmail, normalizeEmail } from './email-validate.js'

describe('isValidEmail', () => {
  it('accepts common shapes', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('first.last@sub.example.com')).toBe(true)
    expect(isValidEmail('a+tag@example.co')).toBe(true)
    expect(isValidEmail('hello@farwa-salon.pk')).toBe(true)
  })

  it('rejects nonsense', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('   ')).toBe(false)
    expect(isValidEmail('no-at-sign.com')).toBe(false)
    expect(isValidEmail('two@@signs.com')).toBe(false)
    expect(isValidEmail('trailing@dot.')).toBe(false)
    expect(isValidEmail('@nouser.com')).toBe(false)
    expect(isValidEmail('user@')).toBe(false)
    expect(isValidEmail('user@nodomain')).toBe(false)
  })

  it('rejects non-string input', () => {
    expect(isValidEmail(null)).toBe(false)
    expect(isValidEmail(undefined)).toBe(false)
    expect(isValidEmail(42)).toBe(false)
    expect(isValidEmail({})).toBe(false)
  })

  it('rejects too-long addresses', () => {
    const long = 'x'.repeat(250) + '@y.co'
    expect(isValidEmail(long)).toBe(false)
  })
})

describe('normalizeEmail', () => {
  it('lowercases and trims', () => {
    expect(normalizeEmail('  USER@Example.COM  ')).toBe('user@example.com')
  })

  it('returns empty string for non-strings', () => {
    expect(normalizeEmail(null)).toBe('')
    expect(normalizeEmail(undefined)).toBe('')
    expect(normalizeEmail(42)).toBe('')
  })
})
