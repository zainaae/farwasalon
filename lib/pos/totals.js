/**
 * POS ticket money engine — fixed / variable / custom lines + visit totals.
 *
 * Locked math:
 *   line_total   = final_price_pkr × qty
 *   subtotal_pkr = Σ line_total
 *   printed_sum  = Σ (unit_price_pkr × qty)   // deal eligibility only
 *   discount_pkr = 0..subtotal (integer)
 *   net_pkr      = subtotal − discount
 *   due_pkr      = max(0, net − amount_paid)
 */

export const PAYMENT_MODES = Object.freeze([
  'Cash',
  'JazzCash',
  'EasyPaisa',
  'Partial',
  'Credit',
])

export const DISCOUNT_NOTE_MIN = 3

function isIntPkr(n) {
  return typeof n === 'number' && Number.isInteger(n) && Number.isFinite(n)
}

function isNonNegInt(n) {
  return isIntPkr(n) && n >= 0
}

function trimNote(note) {
  return typeof note === 'string' ? note.trim() : ''
}

/**
 * Classify a line for validation.
 * Custom = no catalog id; variable = fromPrice / is_from_price; else fixed.
 */
export function lineKind(line) {
  const catalogId = line?.catalog_service_id
  if (catalogId == null || catalogId === '') return 'custom'
  if (line.is_from_price === true || line.fromPrice === true) return 'variable'
  return 'fixed'
}

/**
 * Resolve final PKR for a line (does not validate).
 * Fixed → unit; variable/custom → final_price_pkr as given.
 */
export function resolveFinalPrice(line) {
  const kind = lineKind(line)
  const unit = Number(line?.unit_price_pkr)
  if (kind === 'fixed') return unit
  return line?.final_price_pkr
}

/**
 * @param {object} line
 * @returns {{
 *   catalog_service_id: number | string | null,
 *   name: string,
 *   unit_price_pkr: number,
 *   qty: number,
 *   is_from_price: boolean,
 *   final_price_pkr: number,
 *   line_total: number,
 *   kind: 'fixed' | 'variable' | 'custom',
 * }}
 */
export function enrichLine(line) {
  const kind = lineKind(line)
  const qty = Number(line?.qty ?? 1)
  const unit = Number(line?.unit_price_pkr ?? 0)
  const final = kind === 'fixed' ? unit : Number(line?.final_price_pkr)
  return {
    catalog_service_id: kind === 'custom' ? null : line.catalog_service_id,
    name: String(line?.name ?? '').trim(),
    unit_price_pkr: unit,
    qty,
    is_from_price: kind !== 'fixed',
    final_price_pkr: final,
    line_total: final * qty,
    kind,
  }
}

/**
 * Compute ticket money from lines + discount + paid.
 * Does not validate — use validateVisit for save checks.
 *
 * @param {{
 *   lines?: object[],
 *   discount_pkr?: number,
 *   amount_paid_pkr?: number,
 *   amount_paid?: number,
 * }} input
 */
export function computeTotals(input = {}) {
  const rawLines = Array.isArray(input.lines) ? input.lines : []
  const lines = rawLines.map(enrichLine)
  const subtotal_pkr = lines.reduce((sum, l) => sum + l.line_total, 0)
  const printed_sum = lines.reduce((sum, l) => sum + l.unit_price_pkr * l.qty, 0)
  const discount_pkr = Number(input.discount_pkr ?? 0)
  const amount_paid_pkr = Number(
    input.amount_paid_pkr ?? input.amount_paid ?? 0,
  )
  const net_pkr = subtotal_pkr - discount_pkr
  const due_pkr = Math.max(0, net_pkr - amount_paid_pkr)
  return {
    lines,
    subtotal_pkr,
    printed_sum,
    discount_pkr,
    net_pkr,
    amount_paid_pkr,
    due_pkr,
  }
}

/**
 * Validate a visit payload and return computed totals when ok.
 *
 * @param {{
 *   lines?: object[],
 *   discount_pkr?: number,
 *   discount_note?: string,
 *   amount_paid_pkr?: number,
 *   amount_paid?: number,
 *   payment_mode?: string,
 * }} payload
 * @returns {{ ok: true, totals: object, discount_note: string, payment_mode: string }
 *   | { ok: false, errors: string[] }}
 */
export function validateVisit(payload = {}) {
  const errors = []
  const rawLines = Array.isArray(payload.lines) ? payload.lines : []

  if (rawLines.length === 0) {
    errors.push('At least one line is required')
  }

  rawLines.forEach((line, i) => {
    const label = `Line ${i + 1}`
    const kind = lineKind(line)
    const name = String(line?.name ?? '').trim()
    const qty = line?.qty ?? 1
    const unit = line?.unit_price_pkr

    if (!name) errors.push(`${label}: name is required`)
    if (!isNonNegInt(qty) || qty < 1) {
      errors.push(`${label}: qty must be a positive integer`)
    }

    if (kind === 'custom') {
      if (!isNonNegInt(line?.final_price_pkr)) {
        errors.push(`${label}: custom line requires final_price_pkr`)
      }
      if (unit != null && unit !== '' && !isNonNegInt(unit)) {
        errors.push(`${label}: unit_price_pkr must be a non-negative integer`)
      }
    } else if (!isNonNegInt(unit)) {
      errors.push(`${label}: unit_price_pkr must be a non-negative integer`)
    }

    if (kind === 'fixed') {
      const final = line?.final_price_pkr
      if (final != null && final !== '' && final !== unit) {
        errors.push(`${label}: fixed menu line final must equal unit_price_pkr`)
      }
    }

    if (kind === 'variable') {
      if (!isNonNegInt(line?.final_price_pkr)) {
        errors.push(`${label}: variable line requires final_price_pkr`)
      } else if (isNonNegInt(unit) && line.final_price_pkr < unit) {
        errors.push(`${label}: final_price_pkr must be >= unit_price_pkr (floor)`)
      }
    }

    if (kind === 'custom' && isNonNegInt(line?.final_price_pkr) && isNonNegInt(unit)) {
      /* Custom may set a staff floor; if present, final still may not undercut it. */
      if (line.final_price_pkr < unit) {
        errors.push(`${label}: final_price_pkr must be >= unit_price_pkr (floor)`)
      }
    }
  })

  const discount_pkr = payload.discount_pkr ?? 0
  if (!isNonNegInt(discount_pkr)) {
    errors.push('discount_pkr must be a non-negative integer')
  }

  const amount_paid_pkr = payload.amount_paid_pkr ?? payload.amount_paid ?? 0
  if (!isNonNegInt(amount_paid_pkr)) {
    errors.push('amount_paid_pkr must be a non-negative integer')
  }

  const payment_mode = payload.payment_mode
  if (!PAYMENT_MODES.includes(payment_mode)) {
    errors.push(
      `payment_mode must be one of: ${PAYMENT_MODES.join(', ')}`,
    )
  }

  const discount_note = trimNote(payload.discount_note)
  if (isNonNegInt(discount_pkr) && discount_pkr > 0) {
    if (discount_note.length < DISCOUNT_NOTE_MIN) {
      errors.push(
        `discount_note is required (min ${DISCOUNT_NOTE_MIN} characters) when discount_pkr > 0`,
      )
    }
  }

  /* Subtotal bound needs computed lines; only check when lines look sane. */
  if (errors.length === 0) {
    const totals = computeTotals({
      lines: rawLines,
      discount_pkr,
      amount_paid_pkr,
    })
    if (discount_pkr > totals.subtotal_pkr) {
      errors.push('discount_pkr cannot exceed subtotal_pkr')
    } else {
      return {
        ok: true,
        totals,
        discount_note,
        payment_mode,
      }
    }
  }

  return { ok: false, errors }
}
