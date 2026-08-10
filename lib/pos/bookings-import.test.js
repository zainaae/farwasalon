import { describe, expect, it } from 'vitest'
import {
  appointmentToVisitPrefill,
  filterUpcomingScheduled,
  mapSheetStatusToAppointment,
  matchCatalogService,
  normalizeImportRow,
  normalizeServiceLabel,
  sheetDateTimeToIso,
} from './bookings-import.js'
import { mergeAppointmentStatus } from './bookings-import-run.js'

describe('mapSheetStatusToAppointment', () => {
  it('maps cancelled variants', () => {
    expect(mapSheetStatusToAppointment('Cancelled')).toBe('cancelled')
    expect(mapSheetStatusToAppointment('canceled')).toBe('cancelled')
    expect(mapSheetStatusToAppointment('No-Show')).toBe('cancelled')
  })

  it('defaults confirmed / blank to scheduled', () => {
    expect(mapSheetStatusToAppointment('Confirmed')).toBe('scheduled')
    expect(mapSheetStatusToAppointment('')).toBe('scheduled')
  })
})

describe('sheetDateTimeToIso', () => {
  it('builds Karachi +05:00 instant', () => {
    expect(sheetDateTimeToIso('2026-08-10', '11:00')).toBe(
      new Date('2026-08-10T11:00:00+05:00').toISOString(),
    )
  })

  it('rejects bad inputs', () => {
    expect(sheetDateTimeToIso('10-08-2026', '11:00')).toBeNull()
    expect(sheetDateTimeToIso('2026-08-10', '11')).toBeNull()
  })
})

describe('matchCatalogService', () => {
  const catalog = [
    { id: 1, name: 'Eyebrow Threading', category: 'Threading', price_pkr: 300 },
    { id: 2, name: 'Full Arms Waxing', category: 'Waxing', price_pkr: 1500 },
    { id: 3, name: 'Upper Lip Threading', category: 'Threading', price_pkr: 200 },
  ]

  it('matches exact case-insensitive', () => {
    expect(matchCatalogService('eyebrow threading', catalog)?.id).toBe(1)
  })

  it('matches unique includes', () => {
    expect(matchCatalogService('Full Arms', catalog)?.id).toBe(2)
  })

  it('returns null on ambiguous or empty', () => {
    expect(matchCatalogService('Threading', catalog)).toBeNull()
    expect(matchCatalogService('', catalog)).toBeNull()
  })
})

describe('normalizeImportRow', () => {
  const base = {
    bookingId: 'FBS-AABBCCDD11223344',
    date: '2026-08-12',
    timeSlot: '14:30',
    clientName: 'Ayesha',
    clientPhone: '03001234567',
    service: 'Eyebrow Threading',
    category: 'Threading',
    duration: 15,
    status: 'Confirmed',
    notes: '',
  }

  it('builds upsert payload', () => {
    const res = normalizeImportRow(base, {
      catalog: [
        { id: 1, name: 'Eyebrow Threading', category: 'Threading', price_pkr: 300 },
      ],
    })
    expect(res.ok).toBe(true)
    expect(res.booking.external_id).toBe('FBS-AABBCCDD11223344')
    expect(res.booking.phone_e164).toBe('923001234567')
    expect(res.booking.status).toBe('scheduled')
    expect(res.booking.catalog_service_id).toBe(1)
  })

  it('skips non-FBS and out-of-range dates', () => {
    expect(normalizeImportRow({ ...base, bookingId: 'X-1' }).skip).toBe(true)
    expect(
      normalizeImportRow(base, { fromYmd: '2026-08-13' }).skip,
    ).toBe(true)
  })

  it('errors on bad phone', () => {
    const res = normalizeImportRow({ ...base, clientPhone: '123' })
    expect(res.ok).toBe(false)
    expect(res.skip).toBe(false)
  })
})

describe('filterUpcomingScheduled', () => {
  it('keeps scheduled from fromYmd onward', () => {
    const rows = [
      { status: 'scheduled', scheduled_at: '2026-08-09T06:00:00.000Z' }, // Aug 9 11:00 Khi
      { status: 'scheduled', scheduled_at: '2026-08-10T06:00:00.000Z' },
      { status: 'cancelled', scheduled_at: '2026-08-11T06:00:00.000Z' },
      { status: 'completed', scheduled_at: '2026-08-12T06:00:00.000Z' },
    ]
    const out = filterUpcomingScheduled(rows, '2026-08-10')
    expect(out).toHaveLength(1)
    expect(out[0].scheduled_at).toBe('2026-08-10T06:00:00.000Z')
  })
})

describe('appointmentToVisitPrefill', () => {
  it('prefills catalog line when matched', () => {
    const prefill = appointmentToVisitPrefill(
      {
        id: 'appt-1',
        external_id: 'FBS-AABBCCDD11223344',
        client_id: 'c1',
        service_name: 'Eyebrow Threading',
        clients: { id: 'c1', name: 'Ayesha', phone_display: '03001234567' },
      },
      { id: 1, name: 'Eyebrow Threading', category: 'Threading', price_pkr: 300 },
    )
    expect(prefill.phone).toBe('03001234567')
    expect(prefill.appointment_id).toBe('appt-1')
    expect(prefill.lines[0].catalog_service_id).toBe(1)
    expect(prefill.lines[0].unit_price_pkr).toBe(300)
  })

  it('falls back to custom zero-price line', () => {
    const prefill = appointmentToVisitPrefill({
      id: 'a2',
      external_id: 'FBS-1',
      service_name: 'Mystery Package',
      phone_display: '03009998887',
    })
    expect(prefill.lines[0].catalog_service_id).toBeNull()
    expect(prefill.lines[0].name).toBe('Mystery Package')
  })
})

describe('normalizeServiceLabel', () => {
  it('strips punctuation', () => {
    expect(normalizeServiceLabel('  Full-Arms, Waxing! ')).toBe('full arms waxing')
  })
})

describe('mergeAppointmentStatus', () => {
  it('never downgrades completed or no_show', () => {
    expect(mergeAppointmentStatus('completed', 'scheduled')).toBe('completed')
    expect(mergeAppointmentStatus('no_show', 'cancelled')).toBe('no_show')
  })

  it('allows sheet cancel / reconfirm on open rows', () => {
    expect(mergeAppointmentStatus('scheduled', 'cancelled')).toBe('cancelled')
    expect(mergeAppointmentStatus('cancelled', 'scheduled')).toBe('scheduled')
    expect(mergeAppointmentStatus(null, 'scheduled')).toBe('scheduled')
  })
})
