import { describe, it, expect } from 'vitest'
import { sheetsErrorDetail } from './google-sheets.js'

describe('sheetsErrorDetail', () => {
  it('extracts Google API error message', () => {
    const err = {
      response: { data: { error: { message: 'Unable to parse range: Subscribers!A:D' } } },
    }
    expect(sheetsErrorDetail(err)).toBe('Unable to parse range: Subscribers!A:D')
  })

  it('falls back to Error message', () => {
    expect(sheetsErrorDetail(new Error('network'))).toBe('network')
  })
})
