import { salonNow, SAME_DAY_LEAD_MINUTES, SALON_TZ } from '../lib/booking-slots.js'

/** Next bookable slot estimate for the hero hint.
 *  Mirrors the slots API rules: Mon–Sat 11:00–19:00, 30-min booking lead,
 *  slots on the half hour, 6:30pm is the last same-day slot. Computed in salon
 *  time (Asia/Karachi) using the same primitives the slots API uses, so the
 *  hint can never drift from what /api/slots will actually accept — the old
 *  copy re-implemented the rules in device-local time and lied to visitors
 *  outside Pakistan. */
const LAST_SLOT_MIN = 18 * 60 + 30

export function computeNextSlot(now = new Date()) {
  const { minutes } = salonNow(now)
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: SALON_TZ, weekday: 'long' }).format(now)

  if (weekday === 'Sunday') return { label: 'Tomorrow · 11:00am', open: false } // Sunday closed → Monday

  if (minutes < 11 * 60) return { label: 'Today · 11:00am', open: false }

  // Same 30-min lead the slots API enforces, rounded up to the next :00/:30.
  const slotMin = Math.ceil((minutes + SAME_DAY_LEAD_MINUTES) / 30) * 30
  if (slotMin > LAST_SLOT_MIN) {
    const next = weekday === 'Saturday' ? 'Monday' : 'Tomorrow'
    return { label: `${next} · 11:00am`, open: false }
  }

  const h = Math.floor(slotMin / 60)
  const m = slotMin % 60
  const suffix = h >= 12 ? 'pm' : 'am'
  const h12 = h > 12 ? h - 12 : h
  return { label: `Today · ${h12}:${String(m).padStart(2, '0')}${suffix}`, open: true }
}
