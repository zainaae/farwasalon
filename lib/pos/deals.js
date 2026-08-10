/**
 * Suggest a ticket discount from currently active site deals.
 * Eligibility uses printed_sum (floors + fixed menu); amount uses subtotal (finals).
 * Dates and rates come from src/deals-data.js — never hardcode campaign windows here.
 */
import { getActiveDeals } from '../../src/deals-data.js'
import { computeTotals } from './totals.js'

/** Prefer explicit discountPct; else first N% in title/description. */
export function dealPercentOff(deal) {
  if (!deal) return null
  if (typeof deal.discountPct === 'number' && Number.isFinite(deal.discountPct)) {
    return deal.discountPct
  }
  if (typeof deal.percentOff === 'number' && Number.isFinite(deal.percentOff)) {
    return deal.percentOff
  }
  const blob = `${deal.title || ''} ${deal.description || ''}`
  const m = blob.match(/(\d+(?:\.\d+)?)\s*%/)
  if (!m) return null
  const pct = Number(m[1])
  return Number.isFinite(pct) ? pct : null
}

/**
 * @param {{
 *   printed_sum?: number,
 *   subtotal_pkr?: number,
 *   lines?: object[],
 * }} visit
 * @param {{ now?: Date | number | string, getActiveDeals?: Function }} [opts]
 * @returns {{
 *   deal_id: string,
 *   title: string,
 *   percent: number,
 *   threshold_pkr: number,
 *   discount_pkr: number,
 *   printed_sum: number,
 *   subtotal_pkr: number,
 * } | null}
 */
export function suggestDiscountForVisit(visit = {}, opts = {}) {
  const now = opts.now ?? new Date()
  const listFn = opts.getActiveDeals ?? getActiveDeals
  const active = listFn(now) || []

  let printed_sum = visit.printed_sum
  let subtotal_pkr = visit.subtotal_pkr
  if (
    (printed_sum == null || subtotal_pkr == null) &&
    Array.isArray(visit.lines)
  ) {
    const totals = computeTotals({ lines: visit.lines })
    printed_sum = printed_sum ?? totals.printed_sum
    subtotal_pkr = subtotal_pkr ?? totals.subtotal_pkr
  }

  if (!Number.isFinite(printed_sum) || !Number.isFinite(subtotal_pkr)) {
    return null
  }
  if (subtotal_pkr <= 0) return null

  for (const deal of active) {
    const threshold = deal?.thresholdPkr
    if (typeof threshold !== 'number' || !Number.isFinite(threshold)) continue
    if (printed_sum < threshold) continue

    const percent = dealPercentOff(deal)
    if (percent == null || percent <= 0) continue

    const discount_pkr = Math.round((subtotal_pkr * percent) / 100)
    if (discount_pkr <= 0) continue

    return {
      deal_id: deal.id,
      title: deal.title,
      percent,
      threshold_pkr: threshold,
      discount_pkr: Math.min(discount_pkr, Math.trunc(subtotal_pkr)),
      printed_sum,
      subtotal_pkr,
    }
  }

  return null
}
