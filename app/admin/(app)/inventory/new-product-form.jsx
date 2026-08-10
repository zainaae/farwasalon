'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PRODUCT_KINDS } from '../../../../lib/pos/stock.js'
import { createProductAction } from './actions.js'

export default function NewProductForm() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [kind, setKind] = useState('retail')
  const [unit, setUnit] = useState('ea')
  const [reorder, setReorder] = useState('0')
  const [price, setPrice] = useState('')
  const [error, setError] = useState('')
  const [okMsg, setOkMsg] = useState('')

  function onSubmit(e) {
    e.preventDefault()
    setError('')
    setOkMsg('')
    startTransition(async () => {
      const res = await createProductAction({
        sku,
        name,
        kind,
        unit,
        reorder_level: Number(reorder),
        sale_price_pkr: price === '' ? null : Number(price),
      })
      if (!res.ok) {
        setError(res.error)
        return
      }
      setOkMsg(`Created ${res.product.sku} at qty 0 — add stock with Adjust.`)
      setSku('')
      setName('')
      setUnit('ea')
      setReorder('0')
      setPrice('')
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="prod-sku"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55"
          >
            SKU
          </label>
          <input
            id="prod-sku"
            required
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
          />
        </div>
        <div>
          <label
            htmlFor="prod-name"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55"
          >
            Name
          </label>
          <input
            id="prod-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
          />
        </div>
        <div>
          <label
            htmlFor="prod-kind"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55"
          >
            Kind
          </label>
          <select
            id="prod-kind"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
          >
            {PRODUCT_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="prod-unit"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55"
          >
            Unit
          </label>
          <input
            id="prod-unit"
            required
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
          />
        </div>
        <div>
          <label
            htmlFor="prod-reorder"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55"
          >
            Reorder level
          </label>
          <input
            id="prod-reorder"
            type="number"
            min={0}
            step="any"
            value={reorder}
            onChange={(e) => setReorder(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
          />
        </div>
        <div>
          <label
            htmlFor="prod-price"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55"
          >
            Sale price (PKR, optional)
          </label>
          <input
            id="prod-price"
            type="number"
            min={0}
            step={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
          />
        </div>
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
        disabled={pending}
        className="inline-flex items-center justify-center rounded-sm border border-ink/20 bg-white px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Add product'}
      </button>
    </form>
  )
}
