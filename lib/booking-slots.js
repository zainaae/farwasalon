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

function timeToMinutes(time) {
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
