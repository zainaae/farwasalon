/**
 * Reconcile-friendly visit money aggregates for Today / Month dashboards.
 *
 * Revenue uses locked ticket fields only:
 *   gross     = Σ subtotal_pkr   (line finals × qty — never printed floors)
 *   discounts = Σ discount_pkr
 *   net       = Σ net_pkr
 *   collected = Σ amount_paid_pkr
 *   dues      = Σ due_pkr
 *
 * Voided visits are excluded from all money KPIs.
 */

import { karachiYmd } from './karachi.js'

/**
 * @typedef {object} VisitMoneyRow
 * @property {string} [status]
 * @property {number|string|null} [subtotal_pkr]
 * @property {number|string|null} [discount_pkr]
 * @property {number|string|null} [net_pkr]
 * @property {number|string|null} [amount_paid_pkr]
 * @property {number|string|null} [due_pkr]
 * @property {string} [visit_at]
 * @property {{ name?: string }|null} [clients]
 * @property {string} [client_name]
 * @property {string} [txn_ref]
 * @property {string} [payment_mode]
 * @property {Array<{ name_snapshot?: string, qty?: number, final_price_pkr?: number }>|null} [visit_items]
 */

/** @param {VisitMoneyRow[]} visits */
export function completedVisits(visits) {
  return (visits || []).filter((v) => v?.status === 'completed')
}

function asPkr(n) {
  const x = Number(n)
  return Number.isFinite(x) ? x : 0
}

/**
 * Sum money stack over completed visits only.
 * @param {VisitMoneyRow[]} visits
 */
export function aggregateVisitMoney(visits) {
  const rows = completedVisits(visits)
  let visits_count = 0
  let gross_pkr = 0
  let discount_pkr = 0
  let net_pkr = 0
  let collected_pkr = 0
  let dues_opened_pkr = 0

  for (const v of rows) {
    visits_count += 1
    gross_pkr += asPkr(v.subtotal_pkr)
    discount_pkr += asPkr(v.discount_pkr)
    net_pkr += asPkr(v.net_pkr)
    collected_pkr += asPkr(v.amount_paid_pkr)
    dues_opened_pkr += asPkr(v.due_pkr)
  }

  const avg_net_ticket_pkr =
    visits_count === 0 ? 0 : Math.round(net_pkr / visits_count)

  return {
    visits_count,
    gross_pkr,
    discount_pkr,
    net_pkr,
    collected_pkr,
    dues_opened_pkr,
    avg_net_ticket_pkr,
  }
}

/**
 * Assert KPI totals equal row-wise sums (reconcile check).
 * @param {VisitMoneyRow[]} visits
 * @param {ReturnType<typeof aggregateVisitMoney>} [kpis]
 */
export function assertKpisMatchRows(visits, kpis = aggregateVisitMoney(visits)) {
  const rows = completedVisits(visits)
  const sum = (key) => rows.reduce((s, v) => s + asPkr(v[key]), 0)
  const mismatches = []
  if (kpis.visits_count !== rows.length) {
    mismatches.push(`visits_count ${kpis.visits_count} !== ${rows.length}`)
  }
  if (kpis.gross_pkr !== sum('subtotal_pkr')) {
    mismatches.push(`gross ${kpis.gross_pkr} !== row sum`)
  }
  if (kpis.discount_pkr !== sum('discount_pkr')) {
    mismatches.push(`discount ${kpis.discount_pkr} !== row sum`)
  }
  if (kpis.net_pkr !== sum('net_pkr')) {
    mismatches.push(`net ${kpis.net_pkr} !== row sum`)
  }
  if (kpis.collected_pkr !== sum('amount_paid_pkr')) {
    mismatches.push(`collected ${kpis.collected_pkr} !== row sum`)
  }
  if (kpis.dues_opened_pkr !== sum('due_pkr')) {
    mismatches.push(`dues ${kpis.dues_opened_pkr} !== row sum`)
  }
  return { ok: mismatches.length === 0, mismatches }
}

/**
 * Top services by line count from name_snapshot (completed visits only).
 * @param {VisitMoneyRow[]} visits
 * @param {number} [limit]
 */
export function topServicesFromItems(visits, limit = 10) {
  /** @type {Map<string, { name: string, lines: number, qty: number, revenue_pkr: number }>} */
  const map = new Map()
  for (const v of completedVisits(visits)) {
    for (const item of v.visit_items || []) {
      const name = String(item?.name_snapshot || '').trim()
      if (!name) continue
      const qty = Math.max(1, asPkr(item.qty) || 1)
      const lineRevenue = asPkr(item.final_price_pkr) * qty
      const prev = map.get(name) || {
        name,
        lines: 0,
        qty: 0,
        revenue_pkr: 0,
      }
      prev.lines += 1
      prev.qty += qty
      prev.revenue_pkr += lineRevenue
      map.set(name, prev)
    }
  }
  return [...map.values()]
    .sort(
      (a, b) =>
        b.qty - a.qty || b.revenue_pkr - a.revenue_pkr || a.name.localeCompare(b.name),
    )
    .slice(0, limit)
}

/**
 * Day-of-month collected (amount_paid) for completed visits in Karachi TZ.
 * @param {VisitMoneyRow[]} visits
 * @param {{ ym: string, daysInMonth: number }} month
 */
export function collectedByKarachiDay(visits, month) {
  const { ym, daysInMonth } = month
  /** @type {Map<string, { ymd: string, day: number, visits_count: number, collected_pkr: number, net_pkr: number }>} */
  const byDay = new Map()
  for (let d = 1; d <= daysInMonth; d += 1) {
    const day = String(d).padStart(2, '0')
    const ymd = `${ym}-${day}`
    byDay.set(ymd, {
      ymd,
      day: d,
      visits_count: 0,
      collected_pkr: 0,
      net_pkr: 0,
    })
  }

  for (const v of completedVisits(visits)) {
    if (!v.visit_at) continue
    const ymd = karachiYmd(new Date(v.visit_at))
    if (!ymd.startsWith(`${ym}-`)) continue
    const bucket = byDay.get(ymd)
    if (!bucket) continue
    bucket.visits_count += 1
    bucket.collected_pkr += asPkr(v.amount_paid_pkr)
    bucket.net_pkr += asPkr(v.net_pkr)
  }

  return [...byDay.values()]
}

/** Escape one CSV field (RFC 4180). */
export function csvEscape(value) {
  const s = value == null ? '' : String(value)
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

/**
 * @param {string[]} headers
 * @param {Array<Array<string|number|null|undefined>>} rows
 */
export function toCsv(headers, rows) {
  const lines = [headers.map(csvEscape).join(',')]
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(','))
  }
  return `${lines.join('\r\n')}\r\n`
}

/**
 * Visit list CSV — row sums must match aggregateVisitMoney for completed rows.
 * Includes voided rows with status so desk can audit; reconcile uses completed only.
 * @param {VisitMoneyRow[]} visits
 * @param {{ includeVoided?: boolean }} [opts]
 */
export function visitsMoneyCsv(visits, opts = {}) {
  const includeVoided = opts.includeVoided !== false
  const rows = includeVoided
    ? visits || []
    : completedVisits(visits)

  const headers = [
    'txn_ref',
    'visit_at',
    'visit_date_khi',
    'status',
    'client_name',
    'payment_mode',
    'subtotal_pkr',
    'discount_pkr',
    'net_pkr',
    'amount_paid_pkr',
    'due_pkr',
  ]

  const body = rows.map((v) => {
    const visitAt = v.visit_at || ''
    return [
      v.txn_ref || '',
      visitAt,
      visitAt ? karachiYmd(new Date(visitAt)) : '',
      v.status || '',
      v.clients?.name || v.client_name || '',
      v.payment_mode || '',
      asPkr(v.subtotal_pkr),
      asPkr(v.discount_pkr),
      asPkr(v.net_pkr),
      asPkr(v.amount_paid_pkr),
      asPkr(v.due_pkr),
    ]
  })

  return toCsv(headers, body)
}

/**
 * Day-of-month collected CSV for a month report.
 * @param {ReturnType<typeof collectedByKarachiDay>} days
 */
export function monthDaysCsv(days) {
  return toCsv(
    ['visit_date_khi', 'day', 'visits_count', 'net_pkr', 'collected_pkr'],
    (days || []).map((d) => [
      d.ymd,
      d.day,
      d.visits_count,
      d.net_pkr,
      d.collected_pkr,
    ]),
  )
}
