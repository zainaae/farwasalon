import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '../../../../../lib/supabase/server.js'
import {
  formatVisitDateTime,
  moneyOrDash,
} from '../../pos-format.js'
import RecordPaymentForm from './record-payment-form.jsx'

export const metadata = {
  title: 'Client',
  robots: { index: false, follow: false },
}

function visitPreview(visit) {
  const names = (visit.visit_items || [])
    .map((i) => i.name_snapshot)
    .filter(Boolean)
  if (names.length === 0) return visit.txn_ref
  if (names.length <= 2) return names.join(', ')
  return `${names.slice(0, 2).join(', ')} +${names.length - 2}`
}

export default async function ClientDetailPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: client, error } = await supabase
    .from('clients')
    .select('id, name, phone_display, phone_e164, notes, created_at, updated_at')
    .eq('id', id)
    .maybeSingle()

  if (error || !client) notFound()

  const { data: visits } = await supabase
    .from('visits')
    .select(
      `
      id, txn_ref, visit_at, status, net_pkr, due_pkr, payment_mode,
      amount_paid_pkr,
      visit_items ( name_snapshot )
    `,
    )
    .eq('client_id', id)
    .order('visit_at', { ascending: false })
    .limit(50)

  const { data: payments } = await supabase
    .from('payments')
    .select(
      'id, amount_pkr, mode, paid_at, notes, visit_id, visits ( txn_ref )',
    )
    .eq('client_id', id)
    .order('paid_at', { ascending: false })
    .limit(30)

  const rows = visits || []
  const paymentRows = payments || []
  const outstanding = rows
    .filter((v) => v.status === 'completed' && v.due_pkr > 0)
    .map((v) => ({
      id: v.id,
      txn_ref: v.txn_ref,
      due_pkr: v.due_pkr,
      visit_at: v.visit_at,
      label: `${formatVisitDateTime(v.visit_at)} · ${visitPreview(v)}`,
    }))
  const openDue = outstanding.reduce((s, v) => s + v.due_pkr, 0)

  return (
    <section>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/50">
        <Link href="/admin/clients" className="hover:text-ink">
          Clients
        </Link>
        <span className="mx-1.5">/</span>
        Profile
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight text-ink">
        {client.name}
      </h1>
      <p className="mt-1 font-mono text-sm text-ink/60">{client.phone_display}</p>
      {client.notes && (
        <p className="mt-3 max-w-xl text-sm text-ink/65">{client.notes}</p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin/visits/new"
          className="inline-flex items-center justify-center rounded-sm bg-ink px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white"
        >
          New visit
        </Link>
      </div>

      <div className="mt-8 border-y border-ink/10 bg-white/50 px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">
          Open dues
        </p>
        <p className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold tabular-nums text-ink">
          {moneyOrDash(openDue)}
        </p>
        {outstanding.length > 0 ? (
          <ul className="mt-4 divide-y divide-ink/10 border-t border-ink/10">
            {outstanding.map((v) => (
              <li
                key={v.id}
                className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/visits/${v.id}`}
                    className="text-ink hover:underline"
                  >
                    {v.label}
                  </Link>
                  <p className="font-mono text-[11px] text-ink/40">{v.txn_ref}</p>
                </div>
                <span className="tabular-nums font-medium text-ink">
                  {moneyOrDash(v.due_pkr)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink/50">All clear — no open dues.</p>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
          Record payment
        </h2>
        <p className="mt-1 text-sm text-ink/55">
          Settle Credit / Partial dues with Cash, JazzCash, or EasyPaisa. Amounts
          cannot exceed the remaining due.
        </p>
        <RecordPaymentForm clientId={client.id} outstanding={outstanding} />
      </div>

      <h2 className="mt-12 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
        Payment history
      </h2>
      {paymentRows.length === 0 ? (
        <p className="mt-4 text-sm text-ink/50">No payments recorded yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10 bg-white/50">
          {paymentRows.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-1 px-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-xs text-ink/50">
                  {formatVisitDateTime(p.paid_at)}
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/45">
                    {p.mode}
                  </span>
                </p>
                <p className="truncate text-sm text-ink">
                  {p.visits?.txn_ref ? (
                    <Link
                      href={`/admin/visits/${p.visit_id}`}
                      className="hover:underline"
                    >
                      {p.visits.txn_ref}
                    </Link>
                  ) : (
                    'Payment'
                  )}
                  {p.notes ? (
                    <span className="text-ink/45"> — {p.notes}</span>
                  ) : null}
                </p>
              </div>
              <span className="tabular-nums text-sm font-medium">
                {moneyOrDash(p.amount_pkr)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-12 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
        Visit history
      </h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-ink/50">No visits yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10 bg-white/50">
          {rows.map((v) => {
            const preview = visitPreview(v)
            const voided = v.status === 'voided'
            const hasDue = !voided && v.due_pkr > 0
            return (
              <li key={v.id}>
                <Link
                  href={`/admin/visits/${v.id}`}
                  className="flex flex-col gap-1 px-3 py-3.5 hover:bg-ink/[0.03] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-ink/50">
                      {formatVisitDateTime(v.visit_at)}
                      {voided && (
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700/80">
                          Voided
                        </span>
                      )}
                      {hasDue && (
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-800/90">
                          Due {moneyOrDash(v.due_pkr)}
                        </span>
                      )}
                    </p>
                    <p
                      className={`truncate text-sm ${voided ? 'text-ink/40 line-through' : 'text-ink'}`}
                    >
                      {preview}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-3 text-sm">
                    <span className="tabular-nums font-medium">
                      {moneyOrDash(v.net_pkr)}
                    </span>
                    <span className="font-mono text-[11px] text-ink/40">
                      {v.txn_ref}
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
