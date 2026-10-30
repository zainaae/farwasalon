/**
 * Plain-text WhatsApp receipt for a completed POS visit.
 * Shows finals + discount — never marketing “Quote please — from Rs …” copy.
 */
import { formatPrice } from '../../src/site-config.js'
import { normalizePhoneDisplay } from './phone.js'

function money(pkr) {
  if (pkr == null || !Number.isFinite(Number(pkr))) return formatPrice(0)
  return formatPrice(Number(pkr))
}

function lineLabel(line) {
  const name = String(line?.name ?? '').trim() || 'Service'
  const qty = Number(line?.qty ?? 1)
  const final = line?.final_price_pkr
  const total =
    line?.line_total != null
      ? line.line_total
      : Number(final) * qty
  const qtyBit = qty !== 1 ? ` × ${qty}` : ''
  return `• ${name}${qtyBit} — ${money(total)}`
}

/**
 * @param {{
 *   clientName?: string,
 *   clientPhone?: string,
 *   lines?: object[],
 *   subtotal_pkr?: number,
 *   discount_pkr?: number,
 *   discount_note?: string,
 *   net_pkr?: number,
 *   amount_paid_pkr?: number,
 *   amount_paid?: number,
 *   due_pkr?: number,
 *   payment_mode?: string,
 *   txn_ref?: string,
 *   visit_at?: string,
 * }} visit
 * @returns {string}
 */
export function buildReceiptText(visit = {}) {
  const lines = Array.isArray(visit.lines) ? visit.lines : []
  const discount = Number(visit.discount_pkr ?? 0)
  const paid = Number(visit.amount_paid_pkr ?? visit.amount_paid ?? 0)
  const phone =
    normalizePhoneDisplay(visit.clientPhone) ||
    (visit.clientPhone ? String(visit.clientPhone).trim() : '')

  const parts = ['Farwa Beauty Salon — Receipt']

  if (visit.txn_ref) parts.push(`Txn: ${visit.txn_ref}`)
  if (visit.visit_at) parts.push(`Date: ${visit.visit_at}`)

  const clientName = String(visit.clientName ?? '').trim()
  if (clientName) parts.push(`Client: ${clientName}`)
  if (phone) parts.push(`Phone: ${phone}`)

  parts.push('')
  parts.push('Services:')
  if (lines.length === 0) {
    parts.push('• (none)')
  } else {
    for (const line of lines) parts.push(lineLabel(line))
  }

  parts.push('')
  parts.push(`Subtotal: ${money(visit.subtotal_pkr)}`)

  if (discount > 0) {
    const note = String(visit.discount_note ?? '').trim()
    parts.push(
      note
        ? `Discount: ${money(discount)} (${note})`
        : `Discount: ${money(discount)}`,
    )
  }

  parts.push(`Net: ${money(visit.net_pkr)}`)

  const mode = visit.payment_mode ? ` (${visit.payment_mode})` : ''
  parts.push(`Paid${mode}: ${money(paid)}`)
  parts.push(`Due: ${money(visit.due_pkr ?? 0)}`)
  parts.push('')
  parts.push('Thank you for visiting Farwa Beauty Salon.')

  return parts.join('\n')
}
