import { describe, it, expect } from 'vitest'
import { sanitizeForSheets, requireStringField } from './sanitize.js'

describe('sanitizeForSheets', () => {
  it('strips formula-injection prefixes from strings', () => {
    expect(sanitizeForSheets('=SUM(A1:A10)')).toBe('SUM(A1:A10)')
    expect(sanitizeForSheets('+1+1')).toBe('1+1')
    expect(sanitizeForSheets('-7')).toBe('7')
    expect(sanitizeForSheets('@HYPERLINK')).toBe('HYPERLINK')
    expect(sanitizeForSheets('\tTAB')).toBe('TAB')
  })

  it('preserves safe strings', () => {
    expect(sanitizeForSheets('Hello world')).toBe('Hello world')
    expect(sanitizeForSheets('+923222782254')).toBe('923222782254')
  })

  it('coerces null/undefined to empty string', () => {
    expect(sanitizeForSheets(null)).toBe('')
    expect(sanitizeForSheets(undefined)).toBe('')
  })

  it('preserves finite numbers and booleans', () => {
    expect(sanitizeForSheets(42)).toBe(42)
    expect(sanitizeForSheets(true)).toBe(true)
    expect(sanitizeForSheets(false)).toBe(false)
  })

  it('recursively sanitizes arrays', () => {
    const out = sanitizeForSheets(['=FORMULA', 'safe', '+evil'])
    expect(out).toEqual(['FORMULA', 'safe', 'evil'])
  })

  it('recursively sanitizes objects', () => {
    const out = sanitizeForSheets({ name: '=BAD', age: 30, role: '@admin' })
    expect(out).toEqual({ name: 'BAD', age: 30, role: 'admin' })
  })
})

describe('requireStringField', () => {
  it('returns trimmed value for valid strings', () => {
    const r = requireStringField({ name: '  Hello  ' }, 'name')
    expect(r.value).toBe('Hello')
    expect(r.error).toBeUndefined()
  })

  it('errors when required field is missing', () => {
    const r = requireStringField({}, 'name')
    expect(r.error).toMatch(/Missing/i)
  })

  it('errors when value is not a string', () => {
    const r = requireStringField({ name: 123 }, 'name')
    expect(r.error).toMatch(/string/i)
  })

  it('errors when value exceeds maxLen', () => {
    const r = requireStringField({ name: 'x'.repeat(50) }, 'name', { maxLen: 10 })
    expect(r.error).toMatch(/too long/i)
  })

  it('allows empty optional field', () => {
    const r = requireStringField({}, 'notes', { required: false })
    expect(r.value).toBe('')
    expect(r.error).toBeUndefined()
  })

  it('sanitizes formula prefixes', () => {
    const r = requireStringField({ name: '=FORMULA' }, 'name')
    expect(r.value).toBe('FORMULA')
  })
})
