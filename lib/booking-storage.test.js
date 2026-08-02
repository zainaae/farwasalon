// @vitest-environment jsdom
/**
 * The customer-facing contract these tests defend:
 *  - she closes the tab, comes back tomorrow, and her booking (and its cancel
 *    token) is still there;
 *  - private browsing degrades to "not durable" instead of throwing;
 *  - records written by the previous sessionStorage-only build still resolve.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

/** Local-time epoch, matching how the app parses `${date}T${time}`. */
const NOW = new Date('2026-07-31T12:00:00').getTime()
const TOMORROW = '2026-08-01'
const NEXT_WEEK = '2026-08-07'

const originalLocal = Object.getOwnPropertyDescriptor(window, 'localStorage')
const originalSession = Object.getOwnPropertyDescriptor(window, 'sessionStorage')

/** Fresh module per test: the private-browsing tier is a module-level Map. */
async function loadModule() {
  vi.resetModules()
  return import('./booking-storage.js')
}

function makeBooking(overrides = {}) {
  return {
    id: 'FBS-A1B2',
    service: 'Eyebrow Threading',
    name: 'Ayesha',
    date: TOMORROW,
    time: '16:00',
    duration: 30,
    cancelToken: 'payload.signature',
    ...overrides,
  }
}

/** Storage that throws on every operation — Safari private mode, blocked cookies. */
function denyStorage(...kinds) {
  const deny = () => {
    throw new Error('SecurityError: storage is disabled')
  }
  for (const kind of kinds) {
    Object.defineProperty(window, kind, {
      configurable: true,
      value: {
        getItem: deny,
        setItem: deny,
        removeItem: deny,
        key: deny,
        get length() {
          return deny()
        },
      },
    })
  }
}

beforeEach(() => {
  window.localStorage.clear()
  window.sessionStorage.clear()
})

afterEach(() => {
  if (originalLocal) Object.defineProperty(window, 'localStorage', originalLocal)
  if (originalSession) Object.defineProperty(window, 'sessionStorage', originalSession)
})

describe('saveBookingRecord / readBookingRecord', () => {
  it('survives a closed tab: the record and its cancel token live in localStorage', async () => {
    const { saveBookingRecord, readBookingRecord, bookingRecordKey } = await loadModule()

    const result = saveBookingRecord(makeBooking(), { now: NOW })
    expect(result.durable).toBe(true)
    expect(result.stored).toBe(true)

    // Simulate closing the tab: sessionStorage is gone, localStorage is not.
    window.sessionStorage.clear()

    const read = readBookingRecord('FBS-A1B2', { now: NOW })
    expect(read).toMatchObject({
      id: 'FBS-A1B2',
      service: 'Eyebrow Threading',
      name: 'Ayesha',
      date: TOMORROW,
      time: '16:00',
      duration: 30,
      cancelToken: 'payload.signature',
    })
    expect(window.localStorage.getItem(bookingRecordKey('FBS-A1B2'))).toBeTruthy()
  })

  it('keeps the `farwa-confirm-${id}` key so legacy sessionStorage records still resolve', async () => {
    const { readBookingRecord } = await loadModule()
    window.sessionStorage.setItem(
      'farwa-confirm-FBS-OLD1',
      JSON.stringify({ cancelToken: 'test-token', service: 'Threading', name: 'Test' }),
    )

    const read = readBookingRecord('FBS-OLD1', { now: NOW })
    expect(read.cancelToken).toBe('test-token')
    expect(read.service).toBe('Threading')
    expect(read.id).toBe('FBS-OLD1')
  })

  it('writes both tiers and prefers localStorage on read', async () => {
    const { saveBookingRecord, readBookingRecord } = await loadModule()
    saveBookingRecord(makeBooking(), { now: NOW })
    expect(window.sessionStorage.getItem('farwa-confirm-FBS-A1B2')).toBeTruthy()

    window.localStorage.setItem(
      'farwa-confirm-FBS-A1B2',
      JSON.stringify({ id: 'FBS-A1B2', service: 'From local', savedAt: NOW }),
    )
    expect(readBookingRecord('FBS-A1B2', { now: NOW }).service).toBe('From local')
  })

  it('returns null for an unknown id, a blank id, and corrupt JSON', async () => {
    const { readBookingRecord } = await loadModule()
    window.localStorage.setItem('farwa-confirm-FBS-BAD', '{not json')

    expect(readBookingRecord('FBS-NOPE', { now: NOW })).toBeNull()
    expect(readBookingRecord('', { now: NOW })).toBeNull()
    expect(readBookingRecord(undefined, { now: NOW })).toBeNull()
    expect(readBookingRecord('FBS-BAD', { now: NOW })).toBeNull()
  })
})

describe('normalizeBookingRecord', () => {
  it('rejects anything without an id', async () => {
    const { normalizeBookingRecord } = await loadModule()
    expect(normalizeBookingRecord(null)).toBeNull()
    expect(normalizeBookingRecord('FBS-A1B2')).toBeNull()
    expect(normalizeBookingRecord([])).toBeNull()
    expect(normalizeBookingRecord({ service: 'Facial' })).toBeNull()
  })

  it('drops malformed dates and times rather than storing junk', async () => {
    const { normalizeBookingRecord } = await loadModule()
    const record = normalizeBookingRecord(
      makeBooking({ date: '01/08/2026', time: 'four pm' }),
      NOW,
    )
    expect(record.date).toBe('')
    expect(record.time).toBe('')
  })

  it('clamps duration to a sane positive number and stamps savedAt', async () => {
    const { normalizeBookingRecord } = await loadModule()
    expect(normalizeBookingRecord(makeBooking({ duration: 0 }), NOW).duration).toBe(60)
    expect(normalizeBookingRecord(makeBooking({ duration: -5 }), NOW).duration).toBe(60)
    expect(normalizeBookingRecord(makeBooking({ duration: 'abc' }), NOW).duration).toBe(60)
    expect(normalizeBookingRecord(makeBooking({ duration: 99999 }), NOW).duration).toBe(1440)
    expect(normalizeBookingRecord(makeBooking(), NOW).savedAt).toBe(NOW)
    expect(normalizeBookingRecord(makeBooking({ savedAt: 123 }), NOW).savedAt).toBe(123)
  })
})

describe('private browsing', () => {
  it('does not throw, reports durable:false, and still serves the record in-document', async () => {
    denyStorage('localStorage', 'sessionStorage')
    const { saveBookingRecord, readBookingRecord, isBookingStorageDurable } = await loadModule()

    const result = saveBookingRecord(makeBooking(), { now: NOW })
    expect(result.durable).toBe(false)
    expect(result.stored).toBe(false)
    expect(result.record.id).toBe('FBS-A1B2')

    // The /book → /book/confirmation redirect is a client-side push within the
    // same document, so the memory tier keeps the flow working.
    expect(readBookingRecord('FBS-A1B2', { now: NOW }).cancelToken).toBe('payload.signature')
    expect(isBookingStorageDurable()).toBe(false)
  })

  it('falls back to sessionStorage when only localStorage is blocked', async () => {
    denyStorage('localStorage')
    const { saveBookingRecord, readBookingRecord } = await loadModule()

    const result = saveBookingRecord(makeBooking(), { now: NOW })
    expect(result.durable).toBe(false)
    expect(result.stored).toBe(true)
    expect(readBookingRecord('FBS-A1B2', { now: NOW }).service).toBe('Eyebrow Threading')
  })

  it('reports durable storage in a normal browser', async () => {
    const { isBookingStorageDurable } = await loadModule()
    expect(isBookingStorageDurable()).toBe(true)
    // The probe must not leave anything behind.
    expect(window.localStorage.length).toBe(0)
  })
})

describe('listUpcomingBookings', () => {
  it('lists future bookings soonest-first and hides finished ones', async () => {
    const { saveBookingRecord, listUpcomingBookings } = await loadModule()
    saveBookingRecord(makeBooking({ id: 'FBS-LATER', date: NEXT_WEEK, time: '11:00' }), { now: NOW })
    saveBookingRecord(makeBooking({ id: 'FBS-SOON', date: TOMORROW, time: '16:00' }), { now: NOW })
    saveBookingRecord(makeBooking({ id: 'FBS-PAST', date: '2026-07-30', time: '11:00' }), { now: NOW })

    expect(listUpcomingBookings({ now: NOW }).map((b) => b.id)).toEqual(['FBS-SOON', 'FBS-LATER'])
  })

  it('keeps an appointment listed until it actually ends', async () => {
    const { saveBookingRecord, listUpcomingBookings } = await loadModule()
    saveBookingRecord(makeBooking({ id: 'FBS-NOW', date: '2026-07-31', time: '11:45', duration: 30 }), { now: NOW })
    // 11:45 + 30min ends at 12:15, and it is 12:00.
    expect(listUpcomingBookings({ now: NOW }).map((b) => b.id)).toEqual(['FBS-NOW'])
    expect(listUpcomingBookings({ now: NOW + 30 * 60_000 })).toEqual([])
  })

  it('ignores records with no usable date', async () => {
    const { saveBookingRecord, listUpcomingBookings } = await loadModule()
    saveBookingRecord(makeBooking({ id: 'FBS-NODATE', date: '' }), { now: NOW })
    expect(listUpcomingBookings({ now: NOW })).toEqual([])
  })
})

describe('markBookingCancelled', () => {
  it('drops the token, keeps the record, and removes it from the upcoming list', async () => {
    const { saveBookingRecord, markBookingCancelled, readBookingRecord, listUpcomingBookings } =
      await loadModule()
    saveBookingRecord(makeBooking(), { now: NOW })

    const cancelled = markBookingCancelled('FBS-A1B2', { now: NOW })
    expect(cancelled.cancelledAt).toBe(NOW)
    expect(cancelled.cancelToken).toBe('')

    const read = readBookingRecord('FBS-A1B2', { now: NOW })
    expect(read.cancelledAt).toBe(NOW)
    expect(read.service).toBe('Eyebrow Threading')
    expect(listUpcomingBookings({ now: NOW })).toEqual([])
  })

  it('is a no-op for an unknown booking', async () => {
    const { markBookingCancelled } = await loadModule()
    expect(markBookingCancelled('FBS-GHOST', { now: NOW })).toBeNull()
  })
})

describe('retention', () => {
  it('expired records are neither listed nor left in storage', async () => {
    const { saveBookingRecord, listBookingRecords, RETENTION_MS } = await loadModule()
    const stale = JSON.stringify({
      id: 'FBS-STALE',
      date: '2026-01-01',
      time: '11:00',
      duration: 30,
      savedAt: NOW - RETENTION_MS * 2,
    })
    window.localStorage.setItem('farwa-confirm-FBS-STALE', stale)

    expect(listBookingRecords({ now: NOW }).map((b) => b.id)).toEqual([])

    // The next save prunes it out of storage for good.
    saveBookingRecord(makeBooking(), { now: NOW })
    expect(window.localStorage.getItem('farwa-confirm-FBS-STALE')).toBeNull()
  })

  it('caps how many bookings one device accumulates', async () => {
    const { saveBookingRecord, listBookingRecords, MAX_RECORDS } = await loadModule()
    for (let i = 0; i < MAX_RECORDS + 8; i += 1) {
      saveBookingRecord(
        makeBooking({ id: `FBS-${String(i).padStart(4, '0')}`, date: NEXT_WEEK, time: '11:00' }),
        { now: NOW + i },
      )
    }
    expect(listBookingRecords({ now: NOW }).length).toBeLessThanOrEqual(MAX_RECORDS + 1)
  })

  it('leaves other origins’ keys alone', async () => {
    const { saveBookingRecord } = await loadModule()
    window.localStorage.setItem('farwa-book-draft', '{"step":1}')
    saveBookingRecord(makeBooking(), { now: NOW })
    expect(window.localStorage.getItem('farwa-book-draft')).toBe('{"step":1}')
  })
})
