/**
 * Durable client-side record of a confirmed booking.
 *
 * Why this module exists: the confirmation page used to read the booking out of
 * sessionStorage, which dies with the tab. A customer who closed her browser had
 * no proof her appointment existed, and — worse — could no longer cancel it,
 * because the cancel token lives in that same record. The FAQ warns that late
 * cancellations may reduce booking priority, so the site was penalising her for
 * something it structurally prevented.
 *
 * The cancel token deliberately does NOT travel in the URL. Plausible and the
 * Meta Pixel both transmit location.href, so a token in the query string is a
 * bearer credential handed to third parties on every confirmation view. Durable
 * client-side storage is the fix; the URL is not.
 *
 * Three tiers, written on save and tried in order on read:
 *   1. localStorage   — survives a closed tab. The whole point.
 *   2. sessionStorage — kept so records written by the previous build (and the
 *                       seeded e2e fixtures) still resolve, and as a second
 *                       chance when localStorage is full but session is not.
 *   3. an in-memory Map — private browsing, where both of the above throw.
 *      /book → /book/confirmation is a client-side router.push within one
 *      document, so the memory tier keeps the happy path intact even when
 *      nothing can be persisted. It is not durable, and callers are told so via
 *      `durable: false` so the UI can push the customer to save the .ics or send
 *      the WhatsApp message instead.
 *
 * Storage key contract (unchanged from the sessionStorage version):
 *   `farwa-confirm-${bookingId}` → JSON record.
 */

const RECORD_PREFIX = 'farwa-confirm-'
const PROBE_KEY = 'farwa-storage-probe'

/** Keep a record this long after the appointment ends, then drop it. */
export const RETENTION_MS = 7 * 24 * 60 * 60 * 1000
/** Hard cap so a heavy user cannot fill the origin's quota with old bookings. */
export const MAX_RECORDS = 20

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^\d{1,2}:\d{2}$/
const MAX_FIELD = 240
const MAX_TOKEN = 512

/**
 * Private-browsing fallback, exposed through the same tiny Storage surface as
 * the real tiers so reads, writes and pruning are identical for all three.
 * Deliberately gated on `isBrowser()` at every use: a module-level Map on the
 * server would be shared across requests, leaking one customer's booking into
 * another's render.
 */
const memoryStore = new Map()
const memoryStorage = {
  get length() {
    return memoryStore.size
  },
  key(index) {
    return [...memoryStore.keys()][index] ?? null
  },
  getItem(key) {
    return memoryStore.has(key) ? memoryStore.get(key) : null
  },
  setItem(key, value) {
    memoryStore.set(key, String(value))
  },
  removeItem(key) {
    memoryStore.delete(key)
  },
}

function isBrowser() {
  return typeof window !== 'undefined'
}

/** Accessing window.localStorage itself throws in some blocked-cookie modes. */
function getStore(kind) {
  if (!isBrowser()) return null
  try {
    const store = kind === 'local' ? window.localStorage : window.sessionStorage
    if (!store || typeof store.getItem !== 'function') return null
    return store
  } catch {
    return null
  }
}

function readRaw(store, key) {
  if (!store) return null
  try {
    return store.getItem(key)
  } catch {
    return null
  }
}

function removeRaw(store, key) {
  try {
    store?.removeItem(key)
  } catch {
    // ignore
  }
}

export function bookingRecordKey(id) {
  return `${RECORD_PREFIX}${id}`
}

function cleanString(value, maxLen = MAX_FIELD) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLen)
}

/**
 * Coerce anything into the stored record shape, or null if it is not a booking.
 * Everything here came from a server response or from storage a previous build
 * wrote, so it is validated rather than trusted.
 *
 * @returns {{
 *   id: string, service: string, name: string, date: string, time: string,
 *   duration: number, cancelToken: string, savedAt: number, cancelledAt?: number
 * } | null}
 */
export function normalizeBookingRecord(input, now = Date.now()) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const id = cleanString(input.id)
  if (!id) return null

  const date = cleanString(input.date, 10)
  const time = cleanString(input.time, 5)
  const duration = Number(input.duration)
  const savedAt = Number(input.savedAt)

  const record = {
    id,
    service: cleanString(input.service),
    name: cleanString(input.name),
    date: DATE_RE.test(date) ? date : '',
    time: TIME_RE.test(time) ? time : '',
    duration: Number.isFinite(duration) && duration > 0 ? Math.min(Math.round(duration), 1440) : 60,
    cancelToken: cleanString(input.cancelToken, MAX_TOKEN),
    savedAt: Number.isFinite(savedAt) && savedAt > 0 ? savedAt : now,
  }

  const cancelledAt = Number(input.cancelledAt)
  if (Number.isFinite(cancelledAt) && cancelledAt > 0) record.cancelledAt = cancelledAt

  return record
}

function parseRecord(raw, fallbackId, now) {
  if (typeof raw !== 'string' || raw === '') return null
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
  return normalizeBookingRecord({ ...parsed, id: parsed.id || fallbackId }, now)
}

/** Appointment start as a local-time epoch, matching how calendar-ics reads it. */
function bookingStartMs(record) {
  if (!record?.date) return null
  const time = record.time ? record.time.padStart(5, '0') : '00:00'
  const ms = new Date(`${record.date}T${time}:00`).getTime()
  return Number.isFinite(ms) ? ms : null
}

function bookingEndMs(record) {
  const start = bookingStartMs(record)
  if (start == null) return null
  return start + (record.duration || 60) * 60_000
}

/** When a record stops being worth keeping. Undated records fall back to savedAt. */
function isExpired(record, now) {
  const end = bookingEndMs(record)
  const reference = end == null ? record.savedAt : end
  return Number.isFinite(reference) && reference + RETENTION_MS < now
}

/** Newest-first ordering used for eviction: soonest-expiring goes first. */
function evictionRank(record) {
  const end = bookingEndMs(record)
  return end == null ? record.savedAt || 0 : end
}

function recordKeys(store) {
  const keys = []
  try {
    const len = store.length
    for (let i = 0; i < len; i += 1) {
      const key = store.key(i)
      if (typeof key === 'string' && key.startsWith(RECORD_PREFIX)) keys.push(key)
    }
  } catch {
    return []
  }
  return keys
}

/**
 * Drop expired records, then trim to `limit` newest. Called opportunistically on
 * every save so old appointments do not accumulate, and again — harder — if a
 * write throws, which on the web is almost always a full quota.
 */
function pruneStore(store, now, limit = MAX_RECORDS) {
  if (!store) return
  const entries = []
  for (const key of recordKeys(store)) {
    const record = parseRecord(readRaw(store, key), key.slice(RECORD_PREFIX.length), now)
    if (!record || isExpired(record, now)) {
      removeRaw(store, key)
      continue
    }
    entries.push({ key, record })
  }
  if (entries.length <= limit) return
  entries.sort((a, b) => evictionRank(b.record) - evictionRank(a.record))
  for (const { key } of entries.slice(limit)) removeRaw(store, key)
}

function writeTo(store, key, json, now) {
  if (!store) return false
  try {
    pruneStore(store, now)
    store.setItem(key, json)
    return true
  } catch {
    // Out of quota (or private browsing). Make room aggressively and retry once.
  }
  try {
    pruneStore(store, now, 3)
    store.setItem(key, json)
    return true
  } catch {
    return false
  }
}

/**
 * Persist a confirmed booking on this device.
 *
 * @returns {{ record: object|null, durable: boolean, stored: boolean }}
 *   `durable` — survived into localStorage, i.e. it will still be here after the
 *   tab is closed. `stored` — reached any Web Storage at all. Both false means
 *   the record only exists in memory for this document's lifetime.
 */
export function saveBookingRecord(input, { now = Date.now() } = {}) {
  const record = normalizeBookingRecord(input, now)
  if (!record) return { record: null, durable: false, stored: false }
  if (!isBrowser()) return { record, durable: false, stored: false }

  const key = bookingRecordKey(record.id)
  const json = JSON.stringify(record)

  writeTo(memoryStorage, key, json, now)
  const durable = writeTo(getStore('local'), key, json, now)
  const inSession = writeTo(getStore('session'), key, json, now)

  return { record, durable, stored: durable || inSession }
}

/** Read one booking by id. localStorage wins, then sessionStorage, then memory. */
export function readBookingRecord(id, { now = Date.now() } = {}) {
  const cleanId = cleanString(id)
  if (!cleanId || !isBrowser()) return null
  const key = bookingRecordKey(cleanId)

  const candidates = [
    readRaw(getStore('local'), key),
    readRaw(getStore('session'), key),
    readRaw(memoryStorage, key),
  ]
  for (const raw of candidates) {
    const record = parseRecord(raw, cleanId, now)
    if (record) return record
  }
  return null
}

/** A cancelled record beats a stale live one; otherwise the most recent write wins. */
function preferRecord(a, b) {
  if (!a) return b
  if (!b) return a
  if (Boolean(a.cancelledAt) !== Boolean(b.cancelledAt)) return a.cancelledAt ? a : b
  return (b.savedAt || 0) > (a.savedAt || 0) ? b : a
}

/**
 * Every non-expired booking this device knows about, soonest first. This is what
 * makes a confirmation "retrievable" after the tab is gone: /book can show the
 * customer her own upcoming appointment without her having kept the URL.
 */
export function listBookingRecords({ now = Date.now() } = {}) {
  if (!isBrowser()) return []

  const byId = new Map()
  const collect = (raw, fallbackId) => {
    const record = parseRecord(raw, fallbackId, now)
    if (!record || isExpired(record, now)) return
    byId.set(record.id, preferRecord(byId.get(record.id), record))
  }

  for (const store of [getStore('local'), getStore('session'), memoryStorage]) {
    if (!store) continue
    for (const key of recordKeys(store)) {
      collect(readRaw(store, key), key.slice(RECORD_PREFIX.length))
    }
  }

  return [...byId.values()].sort(
    (a, b) => (bookingStartMs(a) ?? a.savedAt) - (bookingStartMs(b) ?? b.savedAt),
  )
}

/** Bookings that have not started yet and were not cancelled. */
export function listUpcomingBookings({ now = Date.now() } = {}) {
  return listBookingRecords({ now }).filter((record) => {
    if (record.cancelledAt) return false
    const end = bookingEndMs(record)
    return end != null && end > now
  })
}

/**
 * Flag a booking as cancelled once the API confirms it. The token is dropped so
 * the UI cannot offer a second cancellation, and the record stops appearing as
 * upcoming — but it is kept, so revisiting the confirmation link explains what
 * happened instead of claiming the appointment is still on.
 */
export function markBookingCancelled(id, { now = Date.now() } = {}) {
  const record = readBookingRecord(id, { now })
  if (!record) return null
  return saveBookingRecord(
    { ...record, cancelToken: '', cancelledAt: now, savedAt: now },
    { now },
  ).record
}

/** True when this device can actually keep a booking past the current tab. */
export function isBookingStorageDurable() {
  const store = getStore('local')
  if (!store) return false
  try {
    store.setItem(PROBE_KEY, '1')
    store.removeItem(PROBE_KEY)
    return true
  } catch {
    return false
  }
}
