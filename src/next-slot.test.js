import { describe, it, expect } from 'vitest'
import { computeNextSlot } from './next-slot.js'

// Wed 15 Jul 2026 is a Wednesday; Sat 18 Jul; Sun 19 Jul.
// Anchors carry an explicit +05:00 offset (Karachi) so the salon-time
// computation is deterministic on any machine timezone.
const at = (dateStr) => new Date(dateStr)

describe('computeNextSlot', () => {
  it('offers the next half-hour slot with the 30-min booking lead', () => {
    expect(computeNextSlot(at('2026-07-15T12:00:00+05:00'))).toEqual({ label: 'Today · 12:30pm', open: true })
    // 12:10 + 30min lead = 12:40 → next slot is 1:00pm, not the 12:30 the API would reject
    expect(computeNextSlot(at('2026-07-15T12:10:00+05:00'))).toEqual({ label: 'Today · 1:00pm', open: true })
    expect(computeNextSlot(at('2026-07-15T17:50:00+05:00'))).toEqual({ label: 'Today · 6:30pm', open: true })
  })

  it('never advertises a slot in the past near closing (the 6:30-7pm window)', () => {
    // Regression: 18:35 used to render "Today · 6:00pm"
    expect(computeNextSlot(at('2026-07-15T18:35:00+05:00'))).toEqual({ label: 'Tomorrow · 11:00am', open: false })
    expect(computeNextSlot(at('2026-07-15T18:05:00+05:00'))).toEqual({ label: 'Tomorrow · 11:00am', open: false })
    expect(computeNextSlot(at('2026-07-15T17:55:00+05:00'))).toEqual({ label: 'Today · 6:30pm', open: true })
  })

  it('handles closed states: before opening, after close, Saturday night, Sunday', () => {
    expect(computeNextSlot(at('2026-07-15T09:00:00+05:00'))).toEqual({ label: 'Today · 11:00am', open: false })
    expect(computeNextSlot(at('2026-07-15T21:00:00+05:00'))).toEqual({ label: 'Tomorrow · 11:00am', open: false })
    expect(computeNextSlot(at('2026-07-18T19:30:00+05:00'))).toEqual({ label: 'Monday · 11:00am', open: false })
    expect(computeNextSlot(at('2026-07-19T14:00:00+05:00'))).toEqual({ label: 'Tomorrow · 11:00am', open: false })
  })
})
