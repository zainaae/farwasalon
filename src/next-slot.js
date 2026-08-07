import { salonNow, SAME_DAY_LEAD_MINUTES, SALON_TZ } from '../lib/booking-slots.js'
import { isDateBlocked } from '../lib/blocked-dates.js'

/** Next bookable slot estimate for the hero hint.
 *  Mirrors the slots API rules: Mon–Sat 11:00–19:00, 30-min booking lead,
 *  slots on the half hour, 6:30pm is the last same-day slot. Computed in salon
 *  time (Asia/Karachi) using the same primitives the slots API uses, so the
 *  hint can never drift from what /api/slots will actually accept — the old
 *  copy re-implemented the rules in device-local time and lied to visitors
 *  outside Pakistan. */
const LAST_SLOT_MIN = 18 * 60 + 30
const OPEN_MIN = 11 * 60

/** YYYY-MM-DD + offset days, in salon time, as { date, weekday }. */
function dayFromToday(now, offset) {
  const { date: today } = salonNow(now)
  const base = new Date(`${today}T12:00:00Z`)
  base.setUTCDate(base.getUTCDate() + offset)
  const date = base.toISOString().slice(0, 10)
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long' }).format(base)
  return { date, weekday }
}

/** Label prefix for the next OPEN day from today (skips Sundays + blocked dates). */
function nextOpenDayLabel(now) {
  for (let offset = 1; offset <= 14; offset++) {
    const { date, weekday } = dayFromToday(now, offset)
    if (isDateBlocked(date)) continue
    if (offset === 1) return 'Tomorrow'
    return weekday
  }
  return 'Monday'
}

export function computeNextSlot(now = new Date()) {
  const { date, minutes } = salonNow(now)

  /* Same 30-min lead the slots API enforces, rounded up to the next :00/:30,
     clamped to opening. Between 10:30 and 11:00 the 30-min lead pushes the
     first offerable slot to 11:30 — the old hardcoded "Today · 11:00am"
     branch advertised a slot the slots API would reject. */
  const slotMin = Math.max(OPEN_MIN, Math.ceil((minutes + SAME_DAY_LEAD_MINUTES) / 30) * 30)

  const todayBlocked = isDateBlocked(date)
  const beforeOpen = minutes < OPEN_MIN

  if (todayBlocked || slotMin > LAST_SLOT_MIN) {
    return { label: `${nextOpenDayLabel(now)} · 11:00am`, open: false }
  }

  const h = Math.floor(slotMin / 60)
  const m = slotMin % 60
  const suffix = h >= 12 ? 'pm' : 'am'
  const h12 = h > 12 ? h - 12 : h
  return { label: `Today · ${h12}:${String(m).padStart(2, '0')}${suffix}`, open: !beforeOpen }
}
