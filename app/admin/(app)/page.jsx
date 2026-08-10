import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server.js'
import { aggregateVisitMoney } from '../../../lib/pos/reports.js'
import { fetchVisitsInRange } from '../../../lib/pos/reports-fetch.js'
import {
  formatVisitTime,
  karachiDayBounds,
  moneyOrDash,
} from './pos-format.js'
import { MoneyKpiStrip } from './money-kpi-strip.jsx'

export const metadata = {
  title: 'Today',
  robots: { index: false, follow: false },
}

function dayBoundsFromParam(raw) {
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return karachiDayBounds(new Date(`${raw}T12:00:00+05:00`))
  }
  return karachiDayBounds()
}

export default async function AdminTodayPage({ searchParams }) {
  const sp = await searchParams
  const { start, end, ymd } = dayBoundsFromParam(sp?.ymd)
  const supabase = await createClient()
  const { visits, error } = await fetchVisitsInRange(supabase, { start, end })

  const rows = visits || []
  const completed = rows.filter((v) => v.status === 'completed')
  const kpis = aggregateVisitMoney(rows)
  const loadError = error

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            Today
          </h1>
          <p className="mt-1 text-sm text-ink/60">{ymd} · Asia/Karachi</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/admin/export/day?ymd=${encodeURIComponent(ymd)}`}
            className="inline-flex items-center justify-center rounded-sm border border-ink/15 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/70 hover:border-ink/30 hover:text-ink"
          >
            CSV
          </a>
          <Link
            href="/admin/visits/new"
            className="inline-flex items-center justify-center rounded-sm bg-ink px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white"
          >
            New visit
          </Link>
        </div>
      </div>

      {loadError && (
        <p
          role="alert"
          className="mt-6 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          Could not load visits ({loadError}). Apply the clients/visits migration
          if tables are missing.
        </p>
      )}

      <MoneyKpiStrip kpis={kpis} />

      <p className="mt-2 text-xs text-ink/50">
        Completed only · gross = Σ subtotal (not printed floors)
        {rows.length !== completed.length
          ? ` · ${rows.length - completed.length} voided excluded`
          : null}
      </p>

      {rows.length === 0 && !loadError ? (
        <div className="mt-6 rounded-sm border border-dashed border-ink/20 bg-white/60 px-5 py-10 text-center text-sm text-ink/50">
          No visits logged today yet.
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10 bg-white/50">
          {rows.map((v) => {
            const names = (v.visit_items || [])
              .map((i) => i.name_snapshot)
              .filter(Boolean)
            const preview =
              names.length === 0
                ? '—'
                : names.length <= 2
                  ? names.join(', ')
                  : `${names.slice(0, 2).join(', ')} +${names.length - 2}`
            const voided = v.status === 'voided'
            return (
              <li key={v.id}>
                <Link
                  href={`/admin/visits/${v.id}`}
                  className="flex flex-col gap-1 px-3 py-3.5 hover:bg-ink/[0.03] sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-xs font-medium tabular-nums text-ink/55">
                        {formatVisitTime(v.visit_at)}
                      </span>
                      <span
                        className={`truncate text-sm font-medium ${voided ? 'text-ink/40 line-through' : 'text-ink'}`}
                      >
                        {v.clients?.name || 'Client'}
                      </span>
                      {voided && (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700/80">
                          Voided
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink/55">
                      {preview}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-baseline gap-3 text-sm sm:text-right">
                    <span
                      className={`tabular-nums font-medium ${voided ? 'text-ink/35' : 'text-ink'}`}
                    >
                      {moneyOrDash(v.net_pkr)}
                    </span>
                    {!voided && Number(v.due_pkr) > 0 ? (
                      <span className="text-[11px] tabular-nums text-ink/50">
                        due {moneyOrDash(v.due_pkr)}
                      </span>
                    ) : null}
                    <span className="text-[11px] uppercase tracking-[0.08em] text-ink/45">
                      {v.payment_mode}
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
