import { describe, it, expect } from 'vitest'
import {
  sheetsErrorDetail,
  sheetsSerialToYmd,
  sheetsSerialToHm,
  parseBookingSheetRow,
} from './google-sheets.js'

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

describe('sheets serial date/time normalisation', () => {
  it('keeps ISO dates and HH:MM as-is', () => {
    expect(sheetsSerialToYmd('2026-08-03')).toBe('2026-08-03')
    expect(sheetsSerialToHm('11:00')).toBe('11:00')
    expect(sheetsSerialToHm('9:30')).toBe('09:30')
  })

  it('converts Sheets serials from USER_ENTERED appends', () => {
    expect(sheetsSerialToYmd(46237)).toBe('2026-08-03')
    expect(sheetsSerialToYmd('46238')).toBe('2026-08-04')
    expect(sheetsSerialToHm(0.4583333333)).toBe('11:00')
    expect(sheetsSerialToHm('0.4652777778')).toBe('11:10')
  })
})

describe('parseBookingSheetRow', () => {
  it('maps A–N columns including source', () => {
    const row = parseBookingSheetRow([
      'FBS-AABBCCDD',
      '2026-08-10',
      '11:00',
      '11:30',
      'Sara',
      '03001112233',
      'Eyebrow Threading',
      'Threading',
      '30',
      'Confirmed',
      '2026-08-01T10:00:00Z',
      'note',
      'Notified',
      'web',
    ])
    expect(row.bookingId).toBe('FBS-AABBCCDD')
    expect(row.date).toBe('2026-08-10')
    expect(row.timeSlot).toBe('11:00')
    expect(row.source).toBe('web')
  })
})
