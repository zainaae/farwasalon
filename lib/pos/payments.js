/**
 * Settlement tenders for dues / Record payment (site modes only).
 * Visit ticket modes may still include Partial | Credit; ledger rows do not.
 */

export const SETTLEMENT_MODES = Object.freeze([
  'Cash',
  'JazzCash',
  'EasyPaisa',
])

function isPositiveInt(n) {
  return typeof n === 'number' && Number.isInteger(n) && Number.isFinite(n) && n > 0
}

function isNonNegInt(n) {
  return typeof n === 'number' && Number.isInteger(n) && Number.isFinite(n) && n >= 0
}

/**
 * Validate a Record payment payload before RPC.
 *
 * @param {{
 *   visit_id?: string,
 *   client_id?: string,
 *   amount_pkr?: number,
 *   mode?: string,
 *   due_pkr?: number,
 *   notes?: string,
 *   idempotency_key?: string,
 * }} input
 * @returns {{ ok: true, amount_pkr: number, mode: string, notes: string | null }
 *   | { ok: false, errors: string[] }}
 */
export function validateRecordPayment(input = {}) {
  const errors = []
  const visit_id =
    typeof input.visit_id === 'string' ? input.visit_id.trim() : ''
  const idempotency_key =
    typeof input.idempotency_key === 'string'
      ? input.idempotency_key.trim()
      : ''
  const amount_pkr = Number(input.amount_pkr)
  const mode = input.mode
  const due_pkr =
    input.due_pkr == null || input.due_pkr === ''
      ? null
      : Number(input.due_pkr)
  const notesRaw = typeof input.notes === 'string' ? input.notes.trim() : ''

  if (!visit_id) errors.push('visit_id is required')
  if (!idempotency_key) errors.push('idempotency_key is required')
  if (!isPositiveInt(amount_pkr)) {
    errors.push('amount_pkr must be a positive integer')
  }
  if (!SETTLEMENT_MODES.includes(mode)) {
    errors.push(`mode must be one of: ${SETTLEMENT_MODES.join(', ')}`)
  }
  if (due_pkr != null) {
    if (!isNonNegInt(due_pkr)) {
      errors.push('due_pkr must be a non-negative integer')
    } else if (isPositiveInt(amount_pkr) && amount_pkr > due_pkr) {
      errors.push('overpay rejected: amount exceeds remaining due')
    }
  }

  if (errors.length > 0) return { ok: false, errors }

  return {
    ok: true,
    amount_pkr,
    mode,
    notes: notesRaw || null,
    visit_id,
    idempotency_key,
  }
}
