/**
 * Asia/Karachi calendar bounds (UTC+5 year-round, no DST).
 * Shared by admin UI (pos-format) and reconcile helpers (reports).
 */

/** Karachi calendar parts for an instant. */
export function karachiDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const get = (type) => parts.find((p) => p.type === type)?.value
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
  }
}

/** YYYY-MM-DD in Asia/Karachi for an instant. */
export function karachiYmd(date = new Date()) {
  const { year, month, day } = karachiDateParts(date)
  return `${year}-${month}-${day}`
}

/** Start/end of Asia/Karachi calendar day as ISO strings (UTC). */
export function karachiDayBounds(date = new Date()) {
  const { year: y, month: m, day: d } = karachiDateParts(date)
  const start = new Date(`${y}-${m}-${d}T00:00:00+05:00`)
  const end = new Date(`${y}-${m}-${d}T23:59:59.999+05:00`)
  return { start: start.toISOString(), end: end.toISOString(), ymd: `${y}-${m}-${d}` }
}

/**
 * Start/end of Asia/Karachi calendar month as ISO strings (UTC).
 * @param {Date | string} [ref] Date, or `YYYY-MM` / `YYYY-MM-DD` string.
 */
export function karachiMonthBounds(ref = new Date()) {
  let y
  let m
  if (typeof ref === 'string' && /^\d{4}-\d{2}/.test(ref)) {
    y = ref.slice(0, 4)
    m = ref.slice(5, 7)
  } else {
    const parts = karachiDateParts(ref instanceof Date ? ref : new Date(ref))
    y = parts.year
    m = parts.month
  }
  const lastDay = new Date(Date.UTC(Number(y), Number(m), 0)).getUTCDate()
  const dd = String(lastDay).padStart(2, '0')
  const start = new Date(`${y}-${m}-01T00:00:00+05:00`)
  const end = new Date(`${y}-${m}-${dd}T23:59:59.999+05:00`)
  return {
    start: start.toISOString(),
    end: end.toISOString(),
    ym: `${y}-${m}`,
    daysInMonth: lastDay,
  }
}
