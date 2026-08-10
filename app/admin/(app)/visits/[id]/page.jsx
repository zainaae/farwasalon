import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '../../../../../lib/supabase/server.js'
import {
  formatVisitDateTime,
  moneyOrDash,
} from '../../pos-format.js'
import VisitReceiptActions from './receipt-actions.jsx'
import VoidVisitButton from './void-button.jsx'

export const metadata = {
  title: 'Visit',
  robots: { index: false, follow: false },
}

export default async function VisitDetailPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: visit, error } = await supabase
    .from('visits')
    .select(
      `
      id, txn_ref, visit_at, status, notes, deal_id,
      subtotal_pkr, discount_pkr, discount_note, net_pkr,
      payment_mode, amount_paid_pkr, due_pkr, created_at,
      clients ( id, name, phone_display ),
      visit_items (
        id, name_snapshot, category_snapshot,
        unit_price_pkr, qty, is_from_price, final_price_pkr, catalog_service_id
      )
    `,
    )
    .eq('id', id)
    .maybeSingle()

  if (error || !visit) notFound()

  const voided = visit.status === 'voided'
  const items = visit.visit_items || []

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/50">
            <Link href="/admin" className="hover:text-ink">
              Today
            </Link>
            <span className="mx-1.5">/</span>
            Visit
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight text-ink">
            <span className="font-mono text-2xl">{visit.txn_ref}</span>
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            {formatVisitDateTime(visit.visit_at)}
            {voided && (
              <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700">
                Voided
              </span>
            )}
          </p>
        </div>
        {!voided && <VoidVisitButton visitId={visit.id} />}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
            Client
          </h2>
          {visit.clients ? (
            <p className="mt-2 text-sm">
              <Link
                href={`/admin/clients/${visit.clients.id}`}
                className="font-medium text-ink underline-offset-2 hover:underline"
              >
                {visit.clients.name}
              </Link>
              <span className="ml-2 font-mono text-xs text-ink/50">
                {visit.clients.phone_display}
              </span>
            </p>
          ) : (
            <p className="mt-2 text-sm text-ink/50">—</p>
          )}
        </div>
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
            Payment
          </h2>
          <p className="mt-2 text-sm text-ink">
            {visit.payment_mode} · paid {moneyOrDash(visit.amount_paid_pkr)} ·
            due {moneyOrDash(visit.due_pkr)}
          </p>
        </div>
      </div>

      <h2 className="mt-10 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
        Lines
      </h2>
      <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10 bg-white/50">
        {items.map((item) => {
          const lineTotal = item.final_price_pkr * item.qty
          return (
            <li
              key={item.id}
              className="flex items-baseline justify-between gap-3 px-1 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className={`font-medium ${voided ? 'text-ink/40 line-through' : 'text-ink'}`}>
                  {item.name_snapshot}
                  {item.qty > 1 ? ` × ${item.qty}` : ''}
                </p>
                <p className="text-xs text-ink/50">
                  {item.is_from_price
                    ? `Final ${moneyOrDash(item.final_price_pkr)} (floor ${moneyOrDash(item.unit_price_pkr)})`
                    : moneyOrDash(item.unit_price_pkr)}
                  {item.category_snapshot ? ` · ${item.category_snapshot}` : ''}
                </p>
              </div>
              <span
                className={`shrink-0 tabular-nums ${voided ? 'text-ink/35' : 'text-ink'}`}
              >
                {moneyOrDash(lineTotal)}
              </span>
            </li>
          )
        })}
      </ul>

      <dl className="mt-6 grid max-w-sm grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-ink/55">Subtotal</dt>
        <dd className="text-right tabular-nums">{moneyOrDash(visit.subtotal_pkr)}</dd>
        <dt className="text-ink/55">
          Discount
          {visit.discount_note ? (
            <span className="block text-xs text-ink/40">{visit.discount_note}</span>
          ) : null}
          {visit.deal_id ? (
            <span className="block text-xs text-ink/40">Deal: {visit.deal_id}</span>
          ) : null}
        </dt>
        <dd className="text-right tabular-nums">{moneyOrDash(visit.discount_pkr)}</dd>
        <dt className="font-medium text-ink">Net</dt>
        <dd className="text-right font-medium tabular-nums">
          {moneyOrDash(visit.net_pkr)}
        </dd>
      </dl>

      {visit.notes && (
        <p className="mt-6 text-sm text-ink/65">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/50">
            Notes
          </span>
          <br />
          {visit.notes}
        </p>
      )}

      <div className="mt-10">
        <VisitReceiptActions visitId={visit.id} />
      </div>
    </section>
  )
}
