import { isDateBlocked, getBlockedReason } from './blocked-dates.js'
import { FILTERED_SLOTS, slotIndex, salonNow } from './booking-slots.js'

export const BOOKING_WINDOW_DAYS = 14

/** @param {Date} ref - reference "now" for salon-time today */
export function validateBookingDate(dateStr, ref = new Date()) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { ok: false, code: 'invalid_format', message: 'Invalid date format' }
  }

  /* Strict calendar check first, so impossible dates (2026-02-30) are rejected
     instead of being silently rolled forward by the Date constructor. */
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!(y >= 2000 && y <= 2100) || !(m >= 1 && m <= 12) || !(d >= 1 && d <= 31)) {
    return { ok: false, code: 'invalid_format', message: 'Invalid date format' }
  }
  const normalized = new Date(Date.UTC(y, m - 1, d))
  if (
    normalized.getUTCFullYear() !== y ||
    normalized.getUTCMonth() !== m - 1 ||
    normalized.getUTCDate() !== d
  ) {
    return { ok: false, code: 'invalid_format', message: 'Invalid date format' }
  }

  /* Salon wall-clock today. The old code used server-local "today" — UTC on
     Vercel — so for 00:00–05:00 PKT a legitimate Karachi date read as "the
     future" and the whole booking window shifted by a day. */
  const now = salonNow(ref)

  if (isDateBlocked(dateStr)) {
    return {
      ok: false,
      code: 'closed',
      message: getBlockedReason(dateStr) || 'Salon is closed on this date.',
      closed: true,
    }
  }

  const maxDate = new Date(`${now.date}T00:00:00Z`)
  maxDate.setUTCDate(maxDate.getUTCDate() + BOOKING_WINDOW_DAYS)
  const maxStr = maxDate.toISOString().slice(0, 10)

  // YYYY-MM-DD compares correctly as strings
  if (dateStr < now.date) {
    return { ok: false, code: 'past', message: 'Date cannot be in the past.' }
  }
  if (dateStr > maxStr) {
    return {
      ok: false,
      code: 'too_far',
      message: `Date must be within the next ${BOOKING_WINDOW_DAYS} days.`,
    }
  }

  return { ok: true, dayOfWeek: normalized.getUTCDay() }
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
