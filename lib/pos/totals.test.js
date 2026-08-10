import { describe, it, expect } from 'vitest'
import {
  PAYMENT_MODES,
  computeTotals,
  validateVisit,
  lineKind,
} from './totals.js'

const cash = { payment_mode: 'Cash' }

describe('pos totals — line kinds', () => {
  it('classifies fixed / variable / custom', () => {
    expect(lineKind({ catalog_service_id: 1, unit_price_pkr: 500 })).toBe('fixed')
    expect(
      lineKind({ catalog_service_id: 2, is_from_price: true, unit_price_pkr: 4000 }),
    ).toBe('variable')
    expect(lineKind({ catalog_service_id: null, name: 'Keratin', final_price_pkr: 9000 })).toBe(
      'custom',
    )
  })
})

describe('pos totals — fixed-only', () => {
  it('locks final to unit and sums line totals', () => {
    const totals = computeTotals({
      lines: [
        { catalog_service_id: 10, name: 'Threading', unit_price_pkr: 300, qty: 1 },
        { catalog_service_id: 11, name: 'Manicure', unit_price_pkr: 1500, qty: 2 },
      ],
    })
    expect(totals.lines[0].final_price_pkr).toBe(300)
    expect(totals.lines[0].line_total).toBe(300)
    expect(totals.lines[1].line_total).toBe(3000)
    expect(totals.subtotal_pkr).toBe(3300)
    expect(totals.printed_sum).toBe(3300)
    expect(totals.net_pkr).toBe(3300)
    expect(totals.due_pkr).toBe(3300)
  })

  it('validates a paid fixed ticket', () => {
    const result = validateVisit({
      ...cash,
      amount_paid_pkr: 800,
      lines: [
        { catalog_service_id: 1, name: 'Cleansing', unit_price_pkr: 800, qty: 1 },
      ],
    })
    expect(result.ok).toBe(true)
    expect(result.totals.net_pkr).toBe(800)
    expect(result.totals.due_pkr).toBe(0)
  })
})

describe('pos totals — hair / bridal variable', () => {
  it('requires final and uses it for subtotal; printed_sum stays on floor', () => {
    const hair = validateVisit({
      ...cash,
      amount_paid_pkr: 5500,
      lines: [
        {
          catalog_service_id: 20,
          name: 'Hair Colour',
          unit_price_pkr: 4000,
          is_from_price: true,
          final_price_pkr: 5500,
          qty: 1,
        },
      ],
    })
    expect(hair.ok).toBe(true)
    expect(hair.totals.subtotal_pkr).toBe(5500)
    expect(hair.totals.printed_sum).toBe(4000)
  })

  it('accepts bridal variable finals above floor', () => {
    const bridal = validateVisit({
      ...cash,
      amount_paid_pkr: 30000,
      lines: [
        {
          catalog_service_id: 30,
          name: 'Full Bridal Package',
          unit_price_pkr: 25000,
          fromPrice: true,
          final_price_pkr: 30000,
          qty: 1,
        },
      ],
    })
    expect(bridal.ok).toBe(true)
    expect(bridal.totals.subtotal_pkr).toBe(30000)
    expect(bridal.totals.printed_sum).toBe(25000)
  })

  it('rejects final below floor', () => {
    const result = validateVisit({
      ...cash,
      amount_paid_pkr: 0,
      lines: [
        {
          catalog_service_id: 20,
          name: 'Hair Colour',
          unit_price_pkr: 4000,
          is_from_price: true,
          final_price_pkr: 3500,
          qty: 1,
        },
      ],
    })
    expect(result.ok).toBe(false)
    expect(result.errors.some((e) => /floor/i.test(e))).toBe(true)
  })

  it('rejects variable line missing final', () => {
    const result = validateVisit({
      ...cash,
      amount_paid_pkr: 0,
      lines: [
        {
          catalog_service_id: 20,
          name: 'Hair Colour',
          unit_price_pkr: 4000,
          is_from_price: true,
          qty: 1,
        },
      ],
    })
    expect(result.ok).toBe(false)
    expect(result.errors.some((e) => /final_price_pkr/i.test(e))).toBe(true)
  })
})

describe('pos totals — discount + note', () => {
  it('accepts discount with note and computes net/due', () => {
    const result = validateVisit({
      ...cash,
      discount_pkr: 200,
      discount_note: 'Loyalty',
      amount_paid_pkr: 600,
      lines: [
        { catalog_service_id: 1, name: 'Threading', unit_price_pkr: 800, qty: 1 },
      ],
    })
    expect(result.ok).toBe(true)
    expect(result.totals.subtotal_pkr).toBe(800)
    expect(result.totals.discount_pkr).toBe(200)
    expect(result.totals.net_pkr).toBe(600)
    expect(result.totals.due_pkr).toBe(0)
  })

  it('rejects discount without note', () => {
    const result = validateVisit({
      ...cash,
      discount_pkr: 100,
      discount_note: '',
      amount_paid_pkr: 0,
      lines: [
        { catalog_service_id: 1, name: 'Threading', unit_price_pkr: 800, qty: 1 },
      ],
    })
    expect(result.ok).toBe(false)
    expect(result.errors.some((e) => /discount_note/i.test(e))).toBe(true)
  })

  it('rejects discount note shorter than 3 chars', () => {
    const result = validateVisit({
      ...cash,
      discount_pkr: 50,
      discount_note: 'ok',
      amount_paid_pkr: 0,
      lines: [
        { catalog_service_id: 1, name: 'Threading', unit_price_pkr: 800, qty: 1 },
      ],
    })
    expect(result.ok).toBe(false)
    expect(result.errors.some((e) => /discount_note/i.test(e))).toBe(true)
  })
})

describe('pos totals — custom + payment modes', () => {
  it('requires name + final for custom (catalog null)', () => {
    const ok = validateVisit({
      payment_mode: 'JazzCash',
      amount_paid_pkr: 12000,
      lines: [
        {
          catalog_service_id: null,
          name: 'Party makeup',
          unit_price_pkr: 0,
          final_price_pkr: 12000,
          qty: 1,
        },
      ],
    })
    expect(ok.ok).toBe(true)
    expect(ok.totals.lines[0].kind).toBe('custom')
    expect(ok.totals.subtotal_pkr).toBe(12000)

    const bad = validateVisit({
      payment_mode: 'EasyPaisa',
      amount_paid_pkr: 0,
      lines: [{ catalog_service_id: null, name: '', final_price_pkr: 5000, qty: 1 }],
    })
    expect(bad.ok).toBe(false)
  })

  it('exposes staff payment modes including Partial and Credit', () => {
    expect(PAYMENT_MODES).toEqual([
      'Cash',
      'JazzCash',
      'EasyPaisa',
      'Partial',
      'Credit',
    ])
    const bad = validateVisit({
      payment_mode: 'Card',
      amount_paid_pkr: 0,
      lines: [{ catalog_service_id: 1, name: 'Threading', unit_price_pkr: 300, qty: 1 }],
    })
    expect(bad.ok).toBe(false)
    expect(bad.errors.some((e) => /payment_mode/i.test(e))).toBe(true)
  })
})
