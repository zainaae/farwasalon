/**
 * Shared admin POS display helpers (Karachi day bounds, money labels).
 */

import { formatPrice } from '../../../src/site-config.js'

export { formatPrice }
export {
  karachiDateParts,
  karachiYmd,
  karachiDayBounds,
  karachiMonthBounds,
} from '../../../lib/pos/karachi.js'

export function formatVisitTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-PK', {
    timeZone: 'Asia/Karachi',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatVisitDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-PK', {
    timeZone: 'Asia/Karachi',
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function moneyOrDash(pkr) {
  if (pkr == null || !Number.isFinite(Number(pkr))) return '—'
  return formatPrice(Number(pkr))
}
