/** Shared slot grid + occupancy helpers for /api/book and /api/slots */

export const BUFFER_MIN = 15
export const MAX_WORKERS = 2

const BASE_SLOTS = []
for (let h = 11; h <= 18; h++) {
  BASE_SLOTS.push(`${String(h).padStart(2, '0')}:00`)
  if (h < 18 || h === 18) BASE_SLOTS.push(`${String(h).padStart(2, '0')}:30`)
}
export const FILTERED_SLOTS = BASE_SLOTS.filter(s => s <= '18:30')

export function slotIndex(time) {
  return FILTERED_SLOTS.indexOf(time)
}

export function addMinutes(time, mins) {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** Mark 30-min slots occupied, including BUFFER_MIN before/after each booking. */
export function buildOccupiedCounts(bookings, bufferMin = BUFFER_MIN) {
  const occupied = new Array(FILTERED_SLOTS.length).fill(0)

  for (const bk of bookings) {
    if (bk.status === 'Cancelled') continue
    const startIdx = slotIndex(bk.timeSlot)
    if (startIdx === -1) continue

    const dur = bk.duration || 30
    const startMin = timeToMinutes(bk.timeSlot) - bufferMin
    const endMin = timeToMinutes(bk.endTime || addMinutes(bk.timeSlot, dur)) + bufferMin

    for (let i = 0; i < FILTERED_SLOTS.length; i++) {
      const slotMin = timeToMinutes(FILTERED_SLOTS[i])
      const slotEnd = slotMin + 30
      if (slotMin < endMin && slotEnd > startMin) {
        occupied[i]++
      }
    }
  }

  return occupied
}

export function slotsNeededForDuration(durationMinutes) {
  return Math.ceil((durationMinutes || 30) / 30)
}

export function canFitAtIndex(occupied, startIdx, slotsNeeded, maxWorkers = MAX_WORKERS) {
  if (startIdx === -1) return false
  const cap = Math.max(1, maxWorkers)
  for (let i = 0; i < slotsNeeded; i++) {
    if (startIdx + i >= FILTERED_SLOTS.length || occupied[startIdx + i] >= cap) {
      return false
    }
  }
  return true
}

/**
 * Deterministic single-winner tiebreak for the post-append race re-check.
 *
 * When a station is over capacity, exactly one racer should survive, and both
 * racers must reach the same verdict. Rows are ordered by (bookedAt, bookingId)
 * — earliest wins. Self is cancelled iff on any grid index it occupies, at
 * least `maxWorkers` overlapping rows are strictly earlier than it. Manual and
 * legacy rows (empty bookedAt) sort first, so a stale pre-check can never evict
 * a real appointment that was already on the sheet.
 *
 * The old "exclude our own row and re-check" made two simultaneous bookings on
 * the last free station cancel EACH OTHER — slot left empty, both got 409.
 */
export function shouldCancelSelf(bookings, self, maxWorkers = MAX_WORKERS) {
  if (self == null || !self.bookingId) return false
  const sortKey = (bk) => `${bk.bookedAt || '\u0000'}:${bk.bookingId || ''}`
  const myKey = sortKey(self)
  const cap = Math.max(1, maxWorkers)

  const startMin = timeToMinutes(self.timeSlot) - BUFFER_MIN
  const endMin = timeToMinutes(self.endTime || addMinutes(self.timeSlot, self.duration || 30)) + BUFFER_MIN

  for (let i = 0; i < FILTERED_SLOTS.length; i++) {
    const slotMin = timeToMinutes(FILTERED_SLOTS[i])
    const slotEnd = slotMin + 30
    if (!(slotMin < endMin && slotEnd > startMin)) continue // not a slot self occupies

    let earlier = 0
    for (const bk of bookings) {
      if (bk.status === 'Cancelled') continue
      if (bk.bookingId === self.bookingId) continue
      const bStart = timeToMinutes(bk.timeSlot) - BUFFER_MIN
      const bEnd = timeToMinutes(bk.endTime || addMinutes(bk.timeSlot, bk.duration || 30)) + BUFFER_MIN
      if (slotMin < bEnd && slotEnd > bStart && sortKey(bk) < myKey) earlier++
    }
    if (earlier >= cap) return true
  }
  return false
}

/** Salon wall-clock timezone. The server may run in UTC (Vercel), so "is this
 *  slot in the past?" must be answered in Karachi time, never server-local. */
export const SALON_TZ = 'Asia/Karachi'

/** Same-day bookings must start at least this many minutes from now. */
export const SAME_DAY_LEAD_MINUTES = 30

/** Current {date: 'YYYY-MM-DD', minutes: since-midnight} in salon time. */
export function salonNow(ref = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SALON_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(ref)
  const get = (t) => parts.find((p) => p.type === t)?.value
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  }
}

/** True when a slot (HH:MM on dateStr) already started, or starts within the
 *  same-day lead window. Future dates are never past. */
export function isSlotInPast(dateStr, time, ref = new Date(), leadMinutes = SAME_DAY_LEAD_MINUTES) {
  const now = salonNow(ref)
  if (dateStr > now.date) return false
  if (dateStr < now.date) return true
  const [h, m] = String(time).split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return true
  return h * 60 + m < now.minutes + leadMinutes
}
