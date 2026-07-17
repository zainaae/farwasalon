/** Next bookable slot estimate for the hero hint.
 *  Mirrors the slots API rules: Mon–Sat 11:00–19:00, 30-min booking lead,
 *  slots on the half hour, 6:30pm is the last same-day slot. */
export function computeNextSlot(now = new Date()) {
  const day = now.getDay() // 0 Sun..6 Sat
  if (day === 0) return { label: 'Tomorrow · 11:00am', open: false } // Sunday closed → Monday

  const hr = now.getHours()
  if (hr < 11) return { label: 'Today · 11:00am', open: false }

  // Same 30-min lead the slots API enforces, rounded up to the next :00/:30.
  const LAST_SLOT = 18 * 60 + 30 // 6:30pm is the last bookable slot of the day
  const slotMin = Math.ceil((hr * 60 + now.getMinutes() + 30) / 30) * 30
  if (slotMin > LAST_SLOT) {
    return day === 6
      ? { label: 'Monday · 11:00am', open: false }
      : { label: 'Tomorrow · 11:00am', open: false }
  }

  const h = Math.floor(slotMin / 60)
  const m = slotMin % 60
  const suffix = h >= 12 ? 'pm' : 'am'
  const h12 = h > 12 ? h - 12 : h
  return { label: `Today · ${h12}:${String(m).padStart(2, '0')}${suffix}`, open: true }
}
