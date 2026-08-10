'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { SETTLEMENT_MODES } from '../../../../../lib/pos/payments.js'
import { formatPrice } from '../../pos-format.js'
import { recordPaymentAction } from '../../visits/actions.js'

function newIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `idem-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/**
 * @param {{
 *   clientId: string,
 *   outstanding: Array<{
 *     id: string,
 *     txn_ref: string,
 *     due_pkr: number,
 *     visit_at: string,
 *     label: string,
 *   }>,
 * }} props
 */
export default function RecordPaymentForm({ clientId, outstanding }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const initialVisitId = outstanding[0]?.id || ''
  const [visitId, setVisitId] = useState(initialVisitId)
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState('Cash')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [okMsg, setOkMsg] = useState('')
  const [idempotencyKey, setIdempotencyKey] = useState(newIdempotencyKey)

  const resolvedVisitId = outstanding.some((v) => v.id === visitId)
    ? visitId
    : outstanding[0]?.id || ''
  const selected = outstanding.find((v) => v.id === resolvedVisitId)
  const due = selected?.due_pkr ?? 0

  function fillRemaining() {
    if (due > 0) setAmount(String(due))
  }

  function onVisitChange(nextId) {
    setVisitId(nextId)
    setAmount('')
    setOkMsg('')
    setError('')
  }

  function onSubmit(e) {
    e.preventDefault()
    setError('')
    setOkMsg('')
    if (!resolvedVisitId) {
      setError('Select a visit with an outstanding due.')
      return
    }
    if (!idempotencyKey) {
      setError('Missing idempotency key — refresh and try again.')
      return
    }

    startTransition(async () => {
      const res = await recordPaymentAction({
        client_id: clientId,
        visit_id: resolvedVisitId,
        amount_pkr: Number(amount),
        mode,
        notes,
        idempotency_key: idempotencyKey,
        due_pkr: due,
      })
      if (!res.ok) {
        setError(res.error)
        return
      }
      setOkMsg(
        res.due_pkr === 0
          ? `Paid in full (${formatPrice(res.amount_pkr)}).`
          : `Recorded ${formatPrice(res.amount_pkr)}. Remaining due ${formatPrice(res.due_pkr)}.`,
      )
      setAmount('')
      setNotes('')
      setIdempotencyKey(newIdempotencyKey())
      router.refresh()
    })
  }

  if (outstanding.length === 0) {
    return (
      <p className="mt-3 text-sm text-ink/50">No outstanding dues to collect.</p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      <div>
        <label
          htmlFor="pay-visit"
          className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55"
        >
          Visit
        </label>
        <select
          id="pay-visit"
          value={resolvedVisitId}
          onChange={(e) => onVisitChange(e.target.value)}
          className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
        >
          {outstanding.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label} — due {formatPrice(v.due_pkr)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <label
              htmlFor="pay-amount"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55"
            >
              Amount (PKR)
            </label>
            <button
              type="button"
              onClick={fillRemaining}
              className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/45 hover:text-ink"
            >
              Pay remaining
            </button>
          </div>
          <input
            id="pay-amount"
            type="number"
            inputMode="numeric"
            min={1}
            max={due}
            step={1}
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
          />
          <p className="mt-1 text-xs text-ink/45">
            Remaining on visit: {formatPrice(due)} (overpay rejected)
          </p>
        </div>

        <div>
          <label
            htmlFor="pay-mode"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55"
          >
            Mode
          </label>
          <select
            id="pay-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
          >
            {SETTLEMENT_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="pay-notes"
          className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55"
        >
          Notes (optional)
        </label>
        <input
          id="pay-notes"
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
        disabled={pending || !resolvedVisitId}
        className="inline-flex items-center justify-center rounded-sm bg-ink px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-60"
      >
        {pending ? 'Recording…' : 'Record payment'}
      </button>
    </form>
  )
}
