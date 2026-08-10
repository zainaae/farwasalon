import { describe, expect, it } from 'vitest'
import {
  PRODUCT_KINDS,
  STOCK_REASONS,
  buildAdjustDelta,
  isLowStock,
  validateProductCreate,
  validateStockMovement,
} from './stock.js'

describe('STOCK_REASONS / PRODUCT_KINDS', () => {
  it('locks reason and kind enums', () => {
    expect([...STOCK_REASONS]).toEqual(['purchase', 'sale', 'adjust', 'waste'])
    expect([...PRODUCT_KINDS]).toEqual(['retail', 'consumable'])
  })
})

describe('isLowStock', () => {
  it('flags qty at or below reorder', () => {
    expect(isLowStock({ qty_on_hand: 5, reorder_level: 5 })).toBe(true)
    expect(isLowStock({ qty_on_hand: 4, reorder_level: 5 })).toBe(true)
    expect(isLowStock({ qty_on_hand: 6, reorder_level: 5 })).toBe(false)
  })

  it('ignores inactive products', () => {
    expect(
      isLowStock({ qty_on_hand: 0, reorder_level: 2, active: false }),
    ).toBe(false)
  })
})

describe('buildAdjustDelta', () => {
  it('builds +delta for in / purchase', () => {
    const res = buildAdjustDelta({
      direction: 'in',
      amount: 5,
      reason: 'purchase',
    })
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.delta).toBe(5)
      expect(res.reason).toBe('purchase')
    }
  })

  it('builds −delta for out / adjust', () => {
    const res = buildAdjustDelta({
      direction: 'out',
      amount: 5,
      reason: 'adjust',
    })
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.delta).toBe(-5)
      expect(res.reason).toBe('adjust')
    }
  })

  it('rejects zero or negative amount', () => {
    expect(buildAdjustDelta({ direction: 'in', amount: 0 }).ok).toBe(false)
    expect(buildAdjustDelta({ direction: 'out', amount: -1 }).ok).toBe(false)
  })
})

describe('validateStockMovement', () => {
  const base = {
    product_id: '11111111-1111-1111-1111-111111111111',
    delta: -5,
    reason: 'adjust',
    qty_on_hand: 10,
  }

  it('accepts adjust −5 when stock covers it', () => {
    const res = validateStockMovement(base)
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.delta).toBe(-5)
      expect(res.reason).toBe('adjust')
    }
  })

  it('rejects movement that would make qty negative', () => {
    const res = validateStockMovement({
      ...base,
      delta: -12,
      reason: 'sale',
      qty_on_hand: 10,
    })
    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.errors.some((e) => /insufficient stock/i.test(e))).toBe(true)
    }
  })

  it('rejects purchase with negative delta', () => {
    const res = validateStockMovement({
      ...base,
      delta: -3,
      reason: 'purchase',
    })
    expect(res.ok).toBe(false)
  })

  it('rejects sale with positive delta', () => {
    const res = validateStockMovement({
      ...base,
      delta: 3,
      reason: 'sale',
    })
    expect(res.ok).toBe(false)
  })

  it('requires product_id and non-zero delta', () => {
    expect(validateStockMovement({ ...base, product_id: '' }).ok).toBe(false)
    expect(validateStockMovement({ ...base, delta: 0 }).ok).toBe(false)
  })
})

describe('validateProductCreate', () => {
  it('accepts a retail SKU at qty 0', () => {
    const res = validateProductCreate({
      sku: 'RET-001',
      name: 'Hair oil 100ml',
      kind: 'retail',
      unit: 'bottle',
      reorder_level: 3,
      sale_price_pkr: 1200,
    })
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.qty_on_hand).toBe(0)
      expect(res.sale_price_pkr).toBe(1200)
    }
  })

  it('rejects bad kind / missing sku', () => {
    expect(
      validateProductCreate({
        sku: '',
        name: 'X',
        kind: 'retail',
      }).ok,
    ).toBe(false)
    expect(
      validateProductCreate({
        sku: 'A',
        name: 'X',
        kind: 'widget',
      }).ok,
    ).toBe(false)
  })
})
