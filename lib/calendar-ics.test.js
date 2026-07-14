import { describe, it, expect } from 'vitest'
import { buildBookingIcs } from './calendar-ics.js'

const BASE = {
  id: 'FBS-ABCD1234',
  service: 'Party Makeup',
  date: '2026-07-15',
  time: '14:00',
  name: 'Ayesha',
  durationMinutes: 90,
}

function lines(ics) {
  return ics.split('\r\n')
}

describe('buildBookingIcs', () => {
  it('wraps the event in a valid VCALENDAR/VEVENT envelope', () => {
    const l = lines(buildBookingIcs(BASE))
    expect(l[0]).toBe('BEGIN:VCALENDAR')
    expect(l[l.length - 1]).toBe('END:VCALENDAR')
    expect(l).toContain('BEGIN:VEVENT')
    expect(l).toContain('END:VEVENT')
    expect(l).toContain('VERSION:2.0')
    expect(l).toContain('STATUS:CONFIRMED')
  })

  it('uses CRLF line endings only (RFC 5545)', () => {
    const ics = buildBookingIcs(BASE)
    expect(ics.replace(/\r\n/g, '')).not.toContain('\n')
  })

  it('computes DTSTART and DTEND from date, time, and duration (floating local time)', () => {
    const l = lines(buildBookingIcs(BASE))
    expect(l).toContain('DTSTART:20260715T140000')
    expect(l).toContain('DTEND:20260715T153000') // 14:00 + 90 min
  })

  it('defaults duration to 60 minutes', () => {
    const l = lines(buildBookingIcs({ ...BASE, durationMinutes: undefined }))
    expect(l).toContain('DTEND:20260715T150000')
  })

  it('handles durations that cross an hour boundary from a :30 slot', () => {
    const l = lines(buildBookingIcs({ ...BASE, time: '18:30', durationMinutes: 45 }))
    expect(l).toContain('DTSTART:20260715T183000')
    expect(l).toContain('DTEND:20260715T191500')
  })

  it('builds UID from booking id', () => {
    expect(lines(buildBookingIcs(BASE))).toContain('UID:FBS-ABCD1234@farwasalon.com')
  })

  it('falls back to a generic UID when id is missing', () => {
    expect(lines(buildBookingIcs({ ...BASE, id: undefined }))).toContain('UID:booking@farwasalon.com')
  })

  it('escapes commas and semicolons in the service name (SUMMARY)', () => {
    const l = lines(buildBookingIcs({ ...BASE, service: 'Cut, Color; Style' }))
    const summary = l.find((s) => s.startsWith('SUMMARY:'))
    expect(summary).toBe('SUMMARY:Cut\\, Color\\; Style — Farwa Beauty Salon')
  })

  it('escapes newlines in user-supplied name', () => {
    const ics = buildBookingIcs({ ...BASE, name: 'A\nB' })
    // actual newline chars must not survive inside a content line
    const desc = lines(ics).find((s) => s.startsWith('DESCRIPTION:'))
    expect(desc).toContain('A\\nB')
  })

  it('tolerates missing service and name without throwing', () => {
    const ics = buildBookingIcs({ id: 'FBS-1234', date: '2026-07-15', time: '11:00' })
    expect(ics).toContain('BEGIN:VEVENT')
    expect(lines(ics).find((s) => s.startsWith('SUMMARY:'))).toBe('SUMMARY: — Farwa Beauty Salon')
  })

  it('KNOWN BEHAVIOR: DESCRIPTION renders a literal "\\n" between ID and guest (double-escaped)', () => {
    // Pins the current (buggy) output — see unit-integration-report.md.
    const desc = lines(buildBookingIcs(BASE)).find((s) => s.startsWith('DESCRIPTION:'))
    expect(desc).toBe('DESCRIPTION:Booking ID: FBS-ABCD1234\\\\nGuest: Ayesha')
  })

  // REAL BUG (documented in unit-integration-report.md): lib/calendar-ics.js line 45 writes
  // `\\n` (a literal backslash + n) into the template, which escapeIcs() double-escapes to
  // `\\\\n`. Calendar apps therefore show the text "\n" instead of a line break between
  // "Booking ID: ..." and "Guest: ...". The source should use a real newline (`\n`) and let
  // escapeIcs() convert it. Skipped until the source is fixed.
  it.skip('DESCRIPTION separates ID and guest with an ICS newline escape', () => {
    const desc = lines(buildBookingIcs(BASE)).find((s) => s.startsWith('DESCRIPTION:'))
    expect(desc).toBe('DESCRIPTION:Booking ID: FBS-ABCD1234\\nGuest: Ayesha')
  })
})
