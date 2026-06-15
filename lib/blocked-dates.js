/** Static map of fully-closed YYYY-MM-DD dates (Eid, owner travel, holidays).
 *  Sundays are also treated as closed via isDateBlocked() — the salon operates Mon–Sat. */
export const BLOCKED_DATES = {
  // 'YYYY-MM-DD': 'Reason shown to client',
  // '2026-05-25': 'Eid al-Adha',
}

export function isSunday(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`)
  return d.getDay() === 0
}

export function isDateBlocked(dateStr) {
  if (!dateStr) return false
  if (isSunday(dateStr)) return true
  return dateStr in BLOCKED_DATES
}

export function getBlockedReason(dateStr) {
  if (!dateStr) return null
  if (isSunday(dateStr)) return 'Closed on Sundays'
  return BLOCKED_DATES[dateStr] || null
}
