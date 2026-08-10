import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/deals-data.js', () => ({
  getActiveDeals: vi.fn(() => []),
}))

import { getActiveDeals } from '../../src/deals-data.js'
import { suggestDiscountForVisit, dealPercentOff } from './deals.js'

describe('pos deals', () => {
  beforeEach(() => {
    getActiveDeals.mockReset()
    getActiveDeals.mockReturnValue([])
  })

  it('parses percent from deal title', () => {
    expect(dealPercentOff({ title: 'Freedom Deal — 14% off' })).toBe(14)
    expect(dealPercentOff({ discountPct: 10, title: 'x' })).toBe(10)
    expect(dealPercentOff({ title: 'No percent here' })).toBe(null)
  })

  it('suggests round(subtotal × pct/100) when mocked deal is active and printed_sum meets threshold', () => {
    getActiveDeals.mockReturnValue([
      {
        id: 'freedom-deal-2026',
        title: 'Freedom Deal — 14% off',
        thresholdPkr: 1400,
      },
    ])

    const suggestion = suggestDiscountForVisit({
      printed_sum: 1400,
      subtotal_pkr: 5500,
    })

    expect(getActiveDeals).toHaveBeenCalled()
    expect(suggestion).toEqual({
      deal_id: 'freedom-deal-2026',
      title: 'Freedom Deal — 14% off',
      percent: 14,
      threshold_pkr: 1400,
      discount_pkr: 770,
      printed_sum: 1400,
      subtotal_pkr: 5500,
    })
  })

  it('does not suggest when printed_sum is under threshold', () => {
    getActiveDeals.mockReturnValue([
      {
        id: 'freedom-deal-2026',
        title: 'Freedom Deal — 14% off',
        thresholdPkr: 1400,
      },
    ])
    expect(
      suggestDiscountForVisit({ printed_sum: 1399, subtotal_pkr: 2000 }),
    ).toBe(null)
  })

  it('does not suggest when no deal is active', () => {
    getActiveDeals.mockReturnValue([])
    expect(
      suggestDiscountForVisit({ printed_sum: 5000, subtotal_pkr: 5000 }),
    ).toBe(null)
  })

  it('can compute printed_sum / subtotal from lines', () => {
    getActiveDeals.mockReturnValue([
      {
        id: 'test-deal',
        title: '10% off',
        thresholdPkr: 1000,
      },
    ])
    const suggestion = suggestDiscountForVisit({
      lines: [
        {
          catalog_service_id: 1,
          name: 'Threading',
          unit_price_pkr: 500,
          qty: 2,
        },
        {
          catalog_service_id: 2,
          name: 'Hair Colour',
          unit_price_pkr: 4000,
          is_from_price: true,
          final_price_pkr: 5500,
          qty: 1,
        },
      ],
    })
    expect(suggestion.printed_sum).toBe(5000)
    expect(suggestion.subtotal_pkr).toBe(6500)
    expect(suggestion.discount_pkr).toBe(650)
  })

  it('accepts an injected getActiveDeals for callers that already filtered', () => {
    const suggestion = suggestDiscountForVisit(
      { printed_sum: 2000, subtotal_pkr: 2000 },
      {
        getActiveDeals: () => [
          { id: 'x', title: '5% off', thresholdPkr: 1000 },
        ],
      },
    )
    expect(suggestion.discount_pkr).toBe(100)
    expect(getActiveDeals).not.toHaveBeenCalled()
  })
})
