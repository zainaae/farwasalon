/**
 * Stock movement validation helpers (desk + server actions).
 * qty_on_hand is never edited directly — only via record_stock_movement RPC.
 */

export const STOCK_REASONS = Object.freeze([
  'purchase',
  'sale',
  'adjust',
  'waste',
])

export const PRODUCT_KINDS = Object.freeze(['retail', 'consumable'])

function isFiniteNumber(n) {
  return typeof n === 'number' && Number.isFinite(n)
}

function isNonNegNumber(n) {
  return isFiniteNumber(n) && n >= 0
}

function isNonNegInt(n) {
  return (
    typeof n === 'number' &&
    Number.isInteger(n) &&
    Number.isFinite(n) &&
    n >= 0
  )
}

/**
 * True when on-hand is at or below reorder (and product is considered stocked).
 * @param {{ qty_on_hand?: number, reorder_level?: number, active?: boolean }} product
 */
export function isLowStock(product = {}) {
  if (product.active === false) return false
  const qty = Number(product.qty_on_hand)
  const reorder = Number(product.reorder_level)
  if (!Number.isFinite(qty) || !Number.isFinite(reorder)) return false
  return qty <= reorder
}

/**
 * Build signed delta from desk adjust form.
 * direction: 'in' | 'out'; amount: positive quantity.
 *
 * @param {{ direction?: string, amount?: number, reason?: string }} input
 * @returns {{ ok: true, delta: number, reason: string }
 *   | { ok: false, errors: string[] }}
 */
export function buildAdjustDelta(input = {}) {
  const errors = []
  const direction = input.direction === 'out' ? 'out' : input.direction === 'in' ? 'in' : null
  const amount = Number(input.amount)
  let reason = typeof input.reason === 'string' ? input.reason.trim() : ''

  if (!direction) errors.push('direction must be in or out')
  if (!isFiniteNumber(amount) || amount <= 0) {
    errors.push('amount must be a positive number')
  }

  if (!reason) {
    reason = direction === 'in' ? 'purchase' : 'adjust'
  }
  if (!STOCK_REASONS.includes(reason)) {
    errors.push(`reason must be one of: ${STOCK_REASONS.join(', ')}`)
  }

  if (errors.length > 0) return { ok: false, errors }

  const signed = direction === 'out' ? -Math.abs(amount) : Math.abs(amount)

  // Match RPC conventions
  if (reason === 'purchase' && signed < 0) {
    return { ok: false, errors: ['purchase delta must be positive'] }
  }
  if ((reason === 'sale' || reason === 'waste') && signed > 0) {
    return { ok: false, errors: ['sale/waste delta must be negative'] }
  }

  return { ok: true, delta: signed, reason }
}

/**
 * Validate record_stock_movement payload before RPC.
 * Optionally checks against current qty so the desk can fail closed early.
 *
 * @param {{
 *   product_id?: string,
 *   delta?: number,
 *   reason?: string,
 *   qty_on_hand?: number,
 *   visit_id?: string,
 *   notes?: string,
 * }} input
 */
export function validateStockMovement(input = {}) {
  const errors = []
  const product_id =
    typeof input.product_id === 'string' ? input.product_id.trim() : ''
  const delta = Number(input.delta)
  const reason = typeof input.reason === 'string' ? input.reason.trim() : ''
  const notesRaw = typeof input.notes === 'string' ? input.notes.trim() : ''
  const visit_id =
    typeof input.visit_id === 'string' && input.visit_id.trim()
      ? input.visit_id.trim()
      : null
  const qty_on_hand =
    input.qty_on_hand == null || input.qty_on_hand === ''
      ? null
      : Number(input.qty_on_hand)

  if (!product_id) errors.push('product_id is required')
  if (!isFiniteNumber(delta) || delta === 0) {
    errors.push('delta must be a non-zero number')
  }
  if (!STOCK_REASONS.includes(reason)) {
    errors.push(`reason must be one of: ${STOCK_REASONS.join(', ')}`)
  }

  if (isFiniteNumber(delta) && STOCK_REASONS.includes(reason)) {
    if (reason === 'purchase' && delta < 0) {
      errors.push('purchase delta must be positive')
    }
    if ((reason === 'sale' || reason === 'waste') && delta > 0) {
      errors.push('sale/waste delta must be negative')
    }
  }

  if (qty_on_hand != null) {
    if (!isNonNegNumber(qty_on_hand)) {
      errors.push('qty_on_hand must be a non-negative number')
    } else if (isFiniteNumber(delta) && qty_on_hand + delta < 0) {
      errors.push('insufficient stock: movement would make qty negative')
    }
  }

  if (errors.length > 0) return { ok: false, errors }

  return {
    ok: true,
    product_id,
    delta,
    reason,
    visit_id,
    notes: notesRaw || null,
  }
}

/**
 * Validate create-product fields (qty always starts at 0 — seed via purchase).
 *
 * @param {{
 *   sku?: string,
 *   name?: string,
 *   kind?: string,
 *   unit?: string,
 *   reorder_level?: number,
 *   sale_price_pkr?: number | null,
 * }} input
 */
export function validateProductCreate(input = {}) {
  const errors = []
  const sku = typeof input.sku === 'string' ? input.sku.trim() : ''
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  const kind = typeof input.kind === 'string' ? input.kind.trim() : ''
  const unit =
    typeof input.unit === 'string' && input.unit.trim()
      ? input.unit.trim()
      : 'ea'
  const reorder_level =
    input.reorder_level == null || input.reorder_level === ''
      ? 0
      : Number(input.reorder_level)
  let sale_price_pkr = null
  if (input.sale_price_pkr != null && input.sale_price_pkr !== '') {
    sale_price_pkr = Number(input.sale_price_pkr)
  }

  if (!sku) errors.push('sku is required')
  if (!name) errors.push('name is required')
  if (!PRODUCT_KINDS.includes(kind)) {
    errors.push(`kind must be one of: ${PRODUCT_KINDS.join(', ')}`)
  }
  if (!unit) errors.push('unit is required')
  if (!isNonNegNumber(reorder_level)) {
    errors.push('reorder_level must be a non-negative number')
  }
  if (sale_price_pkr != null && !isNonNegInt(sale_price_pkr)) {
    errors.push('sale_price_pkr must be a non-negative integer or empty')
  }
  if (kind === 'retail' && sale_price_pkr == null) {
    // Soft guidance — allowed null for draft SKUs; desk can set later.
  }

  if (errors.length > 0) return { ok: false, errors }

  return {
    ok: true,
    sku,
    name,
    kind,
    unit,
    reorder_level,
    sale_price_pkr,
    qty_on_hand: 0,
    active: true,
  }
}
