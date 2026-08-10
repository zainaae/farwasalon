import { describe, expect, it } from 'vitest'
import { SETTLEMENT_MODES, validateRecordPayment } from './payments.js'

describe('SETTLEMENT_MODES', () => {
  it('is Cash | JazzCash | EasyPaisa only', () => {
    expect([...SETTLEMENT_MODES]).toEqual(['Cash', 'JazzCash', 'EasyPaisa'])
  })
})

describe('validateRecordPayment', () => {
  const base = {
    visit_id: '11111111-1111-1111-1111-111111111111',
    idempotency_key: '22222222-2222-2222-2222-222222222222',
    amount_pkr: 500,
    mode: 'Cash',
    due_pkr: 1200,
  }

  it('accepts a valid settlement', () => {
    const res = validateRecordPayment(base)
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.amount_pkr).toBe(500)
      expect(res.mode).toBe('Cash')
      expect(res.notes).toBeNull()
    }
  })

  it('rejects overpay against remaining due', () => {
    const res = validateRecordPayment({ ...base, amount_pkr: 1500 })
    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.errors.some((e) => /overpay/i.test(e))).toBe(true)
    }
  })

  it('rejects Partial / Credit as settlement modes', () => {
    for (const mode of ['Partial', 'Credit', 'Card']) {
      const res = validateRecordPayment({ ...base, mode })
      expect(res.ok).toBe(false)
      if (!res.ok) {
        expect(res.errors.some((e) => /mode/i.test(e))).toBe(true)
      }
    }
  })

  it('rejects zero or negative amount', () => {
    expect(validateRecordPayment({ ...base, amount_pkr: 0 }).ok).toBe(false)
    expect(validateRecordPayment({ ...base, amount_pkr: -1 }).ok).toBe(false)
  })

  it('requires visit_id and idempotency_key', () => {
    const missingVisit = validateRecordPayment({ ...base, visit_id: '' })
    expect(missingVisit.ok).toBe(false)
    const missingKey = validateRecordPayment({
      ...base,
      idempotency_key: '  ',
    })
    expect(missingKey.ok).toBe(false)
  })

  it('trims notes', () => {
    const res = validateRecordPayment({ ...base, notes: '  settled next day  ' })
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.notes).toBe('settled next day')
  })
})
