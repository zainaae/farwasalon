/** YYYY-MM-DD in local timezone (avoids UTC shift from toISOString). */
export function toLocalDateString(date) {
  const d = date instanceof Date ? date : new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** YYYY-MM-DD of the salon's wall-clock "today" (Asia/Karachi).
 *
 *  The booking server validates dates in salon time, and a visitor's device
 *  may sit west of Karachi where its own "today" is the salon's yesterday.
 *  Both the /book date strip and the live-availability fetch must anchor on
 *  the salon's date, or same-day booking silently breaks for ~10-14h a day. */
export function salonTodayString(ref = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(ref)
  const get = (type) => parts.find((p) => p.type === type)?.value
  return `${get('year')}-${get('month')}-${get('day')}`
}
