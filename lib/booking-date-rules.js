import { isDateBlocked, getBlockedReason } from './blocked-dates.js'
import { FILTERED_SLOTS, slotIndex } from './booking-slots.js'

export const BOOKING_WINDOW_DAYS = 14

/** @param {Date} ref - midnight local reference (today) */
export function validateBookingDate(dateStr, ref = new Date()) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { ok: false, code: 'invalid_format', message: 'Invalid date format' }
  }

  const today = new Date(ref)
  today.setHours(0, 0, 0, 0)
  const reqDate = new Date(`${dateStr}T12:00:00`)

  if (Number.isNaN(reqDate.getTime())) {
    return { ok: false, code: 'invalid_format', message: 'Invalid date format' }
  }

  if (isDateBlocked(dateStr)) {
    return {
      ok: false,
      code: 'closed',
      message: getBlockedReason(dateStr) || 'Salon is closed on this date.',
      closed: true,
    }
  }

  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + BOOKING_WINDOW_DAYS)
  maxDate.setHours(23, 59, 59, 999) // include the full final day, not just midnight

  if (reqDate < today) {
    return { ok: false, code: 'past', message: 'Date cannot be in the past.' }
  }
  if (reqDate > maxDate) {
    return {
      ok: false,
      code: 'too_far',
      message: `Date must be within the next ${BOOKING_WINDOW_DAYS} days.`,
    }
  }

  return { ok: true, dayOfWeek: reqDate.getDay() }
}

export function validateTimeInGrid(time) {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) {
    return { ok: false, message: 'Invalid time format' }
  }
  if (slotIndex(time) === -1) {
    return { ok: false, message: 'Time is outside salon hours.' }
  }
  return { ok: true }
}

export function dayLabel(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`)
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
}
