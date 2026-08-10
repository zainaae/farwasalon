'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { STOCK_REASONS } from '../../../../lib/pos/stock.js'
import { adjustStockAction } from './actions.js'

/**
 * @param {{
 *   products: Array<{
 *     id: string,
 *     sku: string,
 *     name: string,
 *     qty_on_hand: number,
 *     unit: string,
 *     active: boolean,
 *   }>,
 * }} props
 */
export default function AdjustStockForm({ products }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const active = products.filter((p) => p.active !== false)
  const [productId, setProductId] = useState(active[0]?.id || '')
  const [direction, setDirection] = useState('out')
  const [amount, setAmount] = useState('5')
  const [reason, setReason] = useState('adjust')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [okMsg, setOkMsg] = useState('')

  const resolvedId = active.some((p) => p.id === productId)
    ? productId
    : active[0]?.id || ''
  const selected = active.find((p) => p.id === resolvedId)
  const onHand = selected ? Number(selected.qty_on_hand) : 0

  function onDirectionChange(next) {
    setDirection(next)
    if (next === 'in' && (reason === 'sale' || reason === 'waste')) {
      setReason('purchase')
    }
    if (next === 'out' && reason === 'purchase') {
      setReason('adjust')
    }
  }

  function onSubmit(e) {
    e.preventDefault()
    setError('')
    setOkMsg('')
    if (!resolvedId) {
      setError('Add a product first.')
      return
    }

    startTransition(async () => {
      const res = await adjustStockAction({
        product_id: resolvedId,
        direction,
        amount: Number(amount),
        reason,
        notes,
        qty_on_hand: onHand,
      })
      if (!res.ok) {
        setError(res.error)
        return
      }
      setOkMsg(
        `Moved ${res.delta > 0 ? '+' : ''}${res.delta}. On hand now ${res.qty_on_hand}.`,
      )
      setNotes('')
      router.refresh()
    })
  }

  if (active.length === 0) {
    return (
      <p className="mt-3 text-sm text-ink/50">
        No active products yet — create one below, then adjust stock.
      </p>
    )
  }

  const reasonOptions =
    direction === 'in'
      ? STOCK_REASONS.filter((r) => r === 'purchase' || r === 'adjust')
      : STOCK_REASONS.filter((r) => r !== 'purchase')

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      <div>
        <label
          htmlFor="adj-product"
          className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55"
        >
          Product
        </label>
        <select
          id="adj-product"
          value={resolvedId}
          onChange={(e) => setProductId(e.target.value)}
          className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
        >
          {active.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} — {p.name} ({p.qty_on_hand} {p.unit})
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-ink/45">
          On hand: {onHand} {selected?.unit || ''}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="adj-dir"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55"
          >
            Direction
          </label>
          <select
            id="adj-dir"
            value={direction}
            onChange={(e) => onDirectionChange(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
          >
            <option value="in">In (+)</option>
            <option value="out">Out (−)</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="adj-amount"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55"
          >
            Amount
          </label>
          <input
            id="adj-amount"
            type="number"
            min={0.001}
            step="any"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
          />
        </div>
        <div>
          <label
            htmlFor="adj-reason"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55"
          >
            Reason
          </label>
          <select
            id="adj-reason"
            value={reasonOptions.includes(reason) ? reason : reasonOptions[0]}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
          >
            {reasonOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="adj-notes"
          className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55"
        >
          Notes (optional)
        </label>
        <input
          id="adj-notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={200}
          className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {okMsg && (
        <p
          role="status"
          className="rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
        >
          {okMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !resolvedId}
        className="inline-flex items-center justify-center rounded-sm bg-ink px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Record movement'}
      </button>
    </form>
  )
}
