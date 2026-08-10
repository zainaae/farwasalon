/**
 * Shared admin POS display helpers (Karachi day bounds, money labels).
 *
 * Time labels are built from formatToParts (not toLocaleString) so Node SSR
 * and the browser never disagree on "07:55 pm" vs "7:55 PM" etc.
 */

import { formatPrice } from '../../../src/site-config.js'

export { formatPrice }
export {
  karachiDateParts,
  karachiYmd,
  karachiDayBounds,
  karachiMonthBounds,
} from '../../../lib/pos/karachi.js'

const karachiClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Karachi',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
})

const karachiDate = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Karachi',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function partsMap(formatter, date) {
  const map = Object.create(null)
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') map[part.type] = part.value
  }
  return map
}

/** e.g. "07:55 pm" — stable across Node/browser ICU. */
export function formatVisitTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const p = partsMap(karachiClock, d)
  const hour = String(p.hour || '').padStart(2, '0')
  const minute = String(p.minute || '').padStart(2, '0')
  const dayPeriod = String(p.dayPeriod || '').toLowerCase()
  return `${hour}:${minute} ${dayPeriod}`.trim()
}

/** e.g. "10 Aug 2026, 07:55 pm" */
export function formatVisitDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return `${karachiDate.format(d)}, ${formatVisitTime(iso)}`
}

export function moneyOrDash(pkr) {
  if (pkr == null || !Number.isFinite(Number(pkr))) return '—'
  return formatPrice(Number(pkr))
}

