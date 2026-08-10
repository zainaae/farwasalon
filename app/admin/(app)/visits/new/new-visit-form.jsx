'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '../../../../../src/site-config.js'
import { computeTotals, PAYMENT_MODES } from '../../../../../lib/pos/totals.js'
import {
  createClientRecord,
  createVisitAction,
  getVisitReceiptText,
  searchClientsByPhone,
  suggestDealAction,
} from '../actions.js'

function newIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `idem-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/**
 * @param {{
 *   catalog: Array<{ id: number, name: string, category: string, price_pkr: number, from_price: boolean }>,
 *   prefill?: {
 *     appointment_id?: string | null,
 *     external_id?: string | null,
 *     phone?: string,
 *     client?: object | null,
 *     notes?: string | null,
 *     lines?: object[],
 *   } | null
 * }} props
 */
export default function NewVisitForm({ catalog, prefill = null }) {
  const router = useRouter()
  const [searchPending, startSearchTransition] = useTransition()
  const [clientPending, startClientTransition] = useTransition()
  const [dealPending, startDealTransition] = useTransition()
  const [savePending, startSaveTransition] = useTransition()
  const idempotencyKeyRef = useRef(null)

  const [phoneQuery, setPhoneQuery] = useState(prefill?.phone || '')
  const [client, setClient] = useState(prefill?.client || null)
  const [createName, setCreateName] = useState(prefill?.client?.name || '')
  const [clientMsg, setClientMsg] = useState(
    prefill?.client ? 'Client loaded from online booking.' : '',
  )
  const [searchHits, setSearchHits] = useState([])

  const [lines, setLines] = useState(() => {
    const seed = prefill?.lines || []
    return seed.map((l, i) => ({
      ...l,
      key: `L${i + 1}`,
      final_price_pkr:
        l.final_price_pkr === undefined || l.final_price_pkr === null
          ? l.is_from_price
            ? ''
            : l.unit_price_pkr
          : l.final_price_pkr,
    }))
  })
  const lineSeq = useRef((prefill?.lines || []).length)

  function nextLineKey() {
    lineSeq.current += 1
    return `L${lineSeq.current}`
  }

  function getIdempotencyKey() {
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = newIdempotencyKey()
    }
    return idempotencyKeyRef.current
  }

  const [catalogPick, setCatalogPick] = useState('')
  const [customName, setCustomName] = useState('')
  const [customPrice, setCustomPrice] = useState('')

  const [discountPkr, setDiscountPkr] = useState(0)
  const [discountNote, setDiscountNote] = useState('')
  const [dealId, setDealId] = useState(null)
  const [dealHint, setDealHint] = useState(null)

  const [paymentMode, setPaymentMode] = useState('Cash')
  const [amountPaid, setAmountPaid] = useState('')
  const [notes, setNotes] = useState(prefill?.notes || '')
  const [appointmentId] = useState(prefill?.appointment_id || null)

  const [formError, setFormError] = useState('')
  const [saved, setSaved] = useState(null)
  const [receiptText, setReceiptText] = useState('')
  const [copyMsg, setCopyMsg] = useState('')

  const categories = useMemo(() => {
    const map = new Map()
    for (const s of catalog) {
      if (!map.has(s.category)) map.set(s.category, [])
      map.get(s.category).push(s)
    }
    return [...map.entries()]
  }, [catalog])

  const totals = useMemo(
    () =>
      computeTotals({
        lines,
        discount_pkr: Number(discountPkr) || 0,
        amount_paid_pkr: resolvePaidPreview(
          paymentMode,
          amountPaid,
          lines,
          discountPkr,
        ),
      }),
    [lines, discountPkr, paymentMode, amountPaid],
  )

  function resolvePaidPreview(mode, paidRaw, currentLines, disc) {
    const t = computeTotals({
      lines: currentLines,
      discount_pkr: Number(disc) || 0,
      amount_paid_pkr: 0,
    })
    if (mode === 'Credit') return 0
    if (mode === 'Partial') return Number(paidRaw || 0)
    if (paidRaw === '' || paidRaw == null) return t.net_pkr
    return Number(paidRaw)
  }

  function onSearchPhone(e) {
    e.preventDefault()
    setClientMsg('')
    setSearchHits([])
    startSearchTransition(async () => {
      const res = await searchClientsByPhone(phoneQuery)
      if (!res.ok) {
        setClientMsg(res.error)
        return
      }
      if (res.clients.length === 0) {
        setClientMsg('No client found — create one below.')
        setClient(null)
        return
      }
      if (res.clients.length === 1) {
        setClient(res.clients[0])
        setClientMsg('')
        return
      }
      setSearchHits(res.clients)
      setClientMsg('Pick a client.')
    })
  }

  function onCreateClient(e) {
    e.preventDefault()
    setClientMsg('')
    startClientTransition(async () => {
      const res = await createClientRecord({
        name: createName,
        phone: phoneQuery,
      })
      if (!res.ok) {
        setClientMsg(res.error)
        return
      }
      setClient(res.client)
      setCreateName('')
      setClientMsg(res.existed ? 'Existing client selected.' : 'Client created.')
      setSearchHits([])
    })
  }

  function addCatalogService() {
    const id = Number(catalogPick)
    const svc = catalog.find((s) => s.id === id)
    if (!svc) return
    setLines((prev) => [
      ...prev,
      {
        key: nextLineKey(),
        catalog_service_id: svc.id,
        name: svc.name,
        category: svc.category,
        unit_price_pkr: svc.price_pkr,
        qty: 1,
        is_from_price: Boolean(svc.from_price),
        final_price_pkr: svc.from_price ? '' : svc.price_pkr,
      },
    ])
    setCatalogPick('')
  }

  function addCustomLine(e) {
    e.preventDefault()
    const name = customName.trim()
    const price = Number(customPrice)
    if (!name || !Number.isInteger(price) || price < 0) return
    setLines((prev) => [
      ...prev,
      {
        key: nextLineKey(),
        catalog_service_id: null,
        name,
        category: 'Custom',
        unit_price_pkr: 0,
        qty: 1,
        is_from_price: true,
        final_price_pkr: price,
      },
    ])
    setCustomName('')
    setCustomPrice('')
  }

  function updateLine(key, patch) {
    setLines((prev) =>
      prev.map((l) => (l.key === key ? { ...l, ...patch } : l)),
    )
  }

  function removeLine(key) {
    setLines((prev) => prev.filter((l) => l.key !== key))
  }

  function onApplyDeal() {
    startDealTransition(async () => {
      const res = await suggestDealAction({ lines })
      if (!res.ok || !res.suggestion) {
        setDealHint(null)
        setDealId(null)
        setFormError('No active deal matches this ticket (threshold / dates).')
        return
      }
      const s = res.suggestion
      setDiscountPkr(s.discount_pkr)
      setDiscountNote(s.title || `${s.percent}% deal`)
      setDealId(s.deal_id)
      setDealHint(
        `${s.title}: ${s.percent}% → ${formatPrice(s.discount_pkr)} (editable)`,
      )
      setFormError('')
    })
  }

  function onSave(e) {
    e.preventDefault()
    setFormError('')
    setCopyMsg('')
    if (!client?.id) {
      setFormError('Select or create a client first.')
      return
    }
    startSaveTransition(async () => {
      const payloadLines = lines.map((l) => ({
        catalog_service_id: l.catalog_service_id,
        name: l.name,
        category: l.category,
        unit_price_pkr: Number(l.unit_price_pkr),
        qty: Number(l.qty) || 1,
        is_from_price: Boolean(l.is_from_price),
        final_price_pkr:
          l.final_price_pkr === '' || l.final_price_pkr == null
            ? undefined
            : Number(l.final_price_pkr),
      }))

      const res = await createVisitAction({
        client_id: client.id,
        lines: payloadLines,
        discount_pkr: Number(discountPkr) || 0,
        discount_note: discountNote,
        deal_id: dealId,
        payment_mode: paymentMode,
        amount_paid_pkr:
          amountPaid === '' ? undefined : Number(amountPaid),
        notes,
        idempotency_key: getIdempotencyKey(),
        appointment_id: appointmentId || undefined,
      })

      if (!res.ok) {
        setFormError(res.error)
        return
      }

      setSaved({ visit_id: res.visit_id, txn_ref: res.txn_ref })
      if (res.appointment_link_error) {
        setFormError(
          `Visit saved, but linking the online booking failed: ${res.appointment_link_error}`,
        )
      }
      const receipt = await getVisitReceiptText(res.visit_id)
      if (receipt.ok) setReceiptText(receipt.text)
    })
  }

  async function copyReceipt() {
    if (!receiptText) return
    try {
      await navigator.clipboard.writeText(receiptText)
      setCopyMsg('Receipt copied — paste into WhatsApp.')
    } catch {
      setCopyMsg('Copy failed — select the text below manually.')
    }
  }

  if (saved) {
    return (
      <div className="mt-8 space-y-4">
        <p className="rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Saved · Txn <span className="font-mono font-semibold">{saved.txn_ref}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyReceipt}
            className="rounded-sm bg-ink px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white"
          >
            Copy WA receipt
          </button>
          <button
            type="button"
            onClick={() => router.push(`/admin/visits/${saved.visit_id}`)}
            className="rounded-sm border border-ink/20 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink"
          >
            View visit
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="rounded-sm border border-ink/20 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink"
          >
            Back to Today
          </button>
        </div>
        {copyMsg && <p className="text-sm text-ink/65">{copyMsg}</p>}
        {receiptText && (
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-sm border border-ink/10 bg-white px-3 py-3 text-xs leading-relaxed text-ink/80">
            {receiptText}
          </pre>
        )}
      </div>
    )
  }

  return (
    <div className="mt-8 space-y-10">
      {/* Client */}
      <section className="space-y-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
          Client
        </h2>
        <form onSubmit={onSearchPhone} className="flex flex-col gap-2 sm:flex-row">
          <input
            type="tel"
            inputMode="tel"
            placeholder="03xxxxxxxxx"
            value={phoneQuery}
            onChange={(e) => setPhoneQuery(e.target.value)}
            className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40 sm:max-w-xs"
          />
          <button
            type="submit"
            disabled={searchPending}
            className="rounded-sm border border-ink/20 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink disabled:opacity-60"
          >
            {searchPending ? 'Searching…' : 'Search'}
          </button>
        </form>
        {clientMsg && <p className="text-sm text-ink/65">{clientMsg}</p>}
        {searchHits.length > 0 && (
          <ul className="divide-y divide-ink/10 border border-ink/10 bg-white">
            {searchHits.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-ink/[0.03]"
                  onClick={() => {
                    setClient(c)
                    setSearchHits([])
                    setClientMsg('')
                  }}
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="font-mono text-xs text-ink/50">
                    {c.phone_display}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {client && (
          <p className="rounded-sm border border-ink/10 bg-white px-3 py-2 text-sm">
            <span className="font-medium">{client.name}</span>
            <span className="ml-2 font-mono text-xs text-ink/50">
              {client.phone_display}
            </span>
            <button
              type="button"
              className="ml-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/50 underline-offset-2 hover:underline"
              onClick={() => setClient(null)}
            >
              Change
            </button>
          </p>
        )}
        {!client && (
          <form
            onSubmit={onCreateClient}
            className="flex flex-col gap-2 border-t border-ink/10 pt-3 sm:flex-row sm:items-end"
          >
            <label className="block flex-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                New client name
              </span>
              <input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
                required
              />
            </label>
            <button
              type="submit"
              disabled={clientPending}
              className="rounded-sm bg-ink px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60"
            >
              {clientPending ? 'Creating…' : 'Create client'}
            </button>
          </form>
        )}
      </section>

      {/* Lines */}
      <section className="space-y-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
          Services
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={catalogPick}
            onChange={(e) => setCatalogPick(e.target.value)}
            className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
          >
            <option value="">Add from catalog…</option>
            {categories.map(([cat, services]) => (
              <optgroup key={cat} label={cat}>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ·{' '}
                    {s.from_price
                      ? `from ${formatPrice(s.price_pkr)}`
                      : formatPrice(s.price_pkr)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button
            type="button"
            onClick={addCatalogService}
            disabled={!catalogPick}
            className="rounded-sm border border-ink/20 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink disabled:opacity-40"
          >
            Add
          </button>
        </div>

        <form
          onSubmit={addCustomLine}
          className="flex flex-col gap-2 sm:flex-row sm:items-end"
        >
          <label className="block flex-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
              Custom line
            </span>
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Service name"
              className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
            />
          </label>
          <label className="block sm:w-32">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
              Final PKR
            </span>
            <input
              type="number"
              min={0}
              step={1}
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
            />
          </label>
          <button
            type="submit"
            className="rounded-sm border border-ink/20 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink"
          >
            Add custom
          </button>
        </form>

        {lines.length === 0 ? (
          <p className="text-sm text-ink/50">No lines yet.</p>
        ) : (
          <ul className="divide-y divide-ink/10 border border-ink/10 bg-white">
            {lines.map((l) => (
              <li
                key={l.key}
                className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{l.name}</p>
                  <p className="text-xs text-ink/50">
                    {l.is_from_price
                      ? l.catalog_service_id
                        ? `Floor ${formatPrice(l.unit_price_pkr)} — enter final`
                        : 'Custom'
                      : formatPrice(l.unit_price_pkr)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1 text-xs text-ink/55">
                    Qty
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={l.qty}
                      onChange={(e) =>
                        updateLine(l.key, { qty: Number(e.target.value) || 1 })
                      }
                      className="w-14 rounded-sm border border-ink/15 px-2 py-1.5 text-sm"
                    />
                  </label>
                  {l.is_from_price ? (
                    <label className="flex items-center gap-1 text-xs text-ink/55">
                      Final
                      <input
                        type="number"
                        min={l.catalog_service_id ? l.unit_price_pkr : 0}
                        step={1}
                        value={l.final_price_pkr}
                        onChange={(e) =>
                          updateLine(l.key, {
                            final_price_pkr:
                              e.target.value === ''
                                ? ''
                                : Number(e.target.value),
                          })
                        }
                        className="w-28 rounded-sm border border-ink/15 px-2 py-1.5 text-sm"
                        required
                      />
                    </label>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removeLine(l.key)}
                    className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/45 hover:text-ink"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Discount / deal */}
      <section className="space-y-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
          Discount
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="block sm:w-36">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
              PKR off
            </span>
            <input
              type="number"
              min={0}
              step={1}
              value={discountPkr}
              onChange={(e) => {
                setDiscountPkr(Number(e.target.value) || 0)
                setDealId(null)
              }}
              className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
            />
          </label>
          <label className="block flex-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
              Reason (required if discount &gt; 0)
            </span>
            <input
              value={discountNote}
              onChange={(e) => setDiscountNote(e.target.value)}
              className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
            />
          </label>
          <button
            type="button"
            onClick={onApplyDeal}
            disabled={dealPending || lines.length === 0}
            className="rounded-sm border border-ink/20 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink disabled:opacity-40"
          >
            {dealPending ? 'Applying…' : 'Apply deal'}
          </button>
        </div>
        {dealHint && <p className="text-sm text-ink/65">{dealHint}</p>}
      </section>

      {/* Payment */}
      <section className="space-y-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
          Payment
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="block sm:w-44">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
              Mode
            </span>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
            >
              {PAYMENT_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:w-40">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
              Amount paid
            </span>
            <input
              type="number"
              min={0}
              step={1}
              value={
                paymentMode === 'Credit'
                  ? 0
                  : amountPaid === '' && paymentMode !== 'Partial'
                    ? totals.net_pkr
                    : amountPaid
              }
              disabled={paymentMode === 'Credit'}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40 disabled:bg-ink/5"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
            Notes
          </span>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40"
          />
        </label>
      </section>

      {/* Totals strip */}
      <div className="sticky bottom-0 z-10 -mx-4 border-t border-ink/10 bg-[#f7f4f0]/95 px-4 py-3 backdrop-blur-sm sm:-mx-0 sm:mx-0 sm:rounded-sm sm:border sm:px-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.12em] text-ink/45">
              Subtotal
            </dt>
            <dd className="font-medium tabular-nums">
              {formatPrice(totals.subtotal_pkr)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.12em] text-ink/45">
              Discount
            </dt>
            <dd className="font-medium tabular-nums">
              {formatPrice(totals.discount_pkr)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.12em] text-ink/45">
              Net
            </dt>
            <dd className="font-medium tabular-nums">
              {formatPrice(totals.net_pkr)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.12em] text-ink/45">
              Due
            </dt>
            <dd className="font-medium tabular-nums">
              {formatPrice(totals.due_pkr)}
            </dd>
          </div>
        </dl>
        {formError && (
          <p role="alert" className="mt-2 text-sm text-red-800">
            {formError}
          </p>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={savePending || !client || lines.length === 0}
          className="mt-3 inline-flex w-full items-center justify-center rounded-sm bg-ink px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-50 sm:w-auto"
        >
          {savePending ? 'Saving…' : 'Save visit'}
        </button>
      </div>
    </div>
  )
}
