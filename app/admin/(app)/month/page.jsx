import Link from 'next/link'
import { createClient } from '../../../../lib/supabase/server.js'
import {
  aggregateVisitMoney,
  collectedByKarachiDay,
  topServicesFromItems,
} from '../../../../lib/pos/reports.js'
import { fetchVisitsInRange } from '../../../../lib/pos/reports-fetch.js'
import {
  karachiMonthBounds,
  karachiYmd,
  moneyOrDash,
} from '../pos-format.js'
import { MoneyKpiStrip } from '../money-kpi-strip.jsx'

export const metadata = {
  title: 'Month',
  robots: { index: false, follow: false },
}

function parseYm(raw) {
  if (typeof raw === 'string' && /^\d{4}-\d{2}$/.test(raw)) return raw
  return karachiYmd().slice(0, 7)
}

function shiftYm(ym, delta) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  const yy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${yy}-${mm}`
}

export default async function AdminMonthPage({ searchParams }) {
  const sp = await searchParams
  const ym = parseYm(sp?.ym)
  const month = karachiMonthBounds(ym)
  const supabase = await createClient()
  const { visits, error } = await fetchVisitsInRange(supabase, {
    start: month.start,
    end: month.end,
  })

  const rows = visits || []
  const kpis = aggregateVisitMoney(rows)
  const top = topServicesFromItems(rows, 12)
  const days = collectedByKarachiDay(rows, month)
  const prev = shiftYm(ym, -1)
  const next = shiftYm(ym, 1)
  const loadError = error

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight text-ink">
            Month
          </h1>
          <p className="mt-1 text-sm text-ink/60">{ym} · Asia/Karachi</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/month?ym=${prev}`}
            className="inline-flex items-center justify-center rounded-sm border border-ink/15 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/70 hover:border-ink/30 hover:text-ink"
          >
            Prev
          </Link>
          <Link
            href={`/admin/month?ym=${next}`}
            className="inline-flex items-center justify-center rounded-sm border border-ink/15 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/70 hover:border-ink/30 hover:text-ink"
          >
            Next
          </Link>
          <a
            href={`/admin/export/month?ym=${encodeURIComponent(ym)}&kind=visits`}
            className="inline-flex items-center justify-center rounded-sm border border-ink/15 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/70 hover:border-ink/30 hover:text-ink"
          >
            Visits CSV
          </a>
          <a
            href={`/admin/export/month?ym=${encodeURIComponent(ym)}&kind=days`}
            className="inline-flex items-center justify-center rounded-sm border border-ink/15 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/70 hover:border-ink/30 hover:text-ink"
          >
            Days CSV
          </a>
        </div>
      </div>

      {loadError && (
        <p
          role="alert"
          className="mt-6 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          Could not load visits ({loadError}).
        </p>
      )}

      <MoneyKpiStrip kpis={kpis} showAvg />

      <p className="mt-2 text-xs text-ink/50">
        Completed only · gross = Σ subtotal (not printed floors)
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/55">
            Top services
          </h2>
          {top.length === 0 ? (
            <p className="mt-3 text-sm text-ink/50">No completed lines this month.</p>
          ) : (
            <ol className="mt-3 divide-y divide-ink/10 border-y border-ink/10">
              {top.map((s, i) => (
                <li
                  key={s.name}
                  className="flex items-baseline justify-between gap-3 py-2.5 text-sm"
                >
                  <span className="min-w-0 truncate text-ink">
                    <span className="mr-2 tabular-nums text-ink/40">{i + 1}.</span>
                    {s.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-ink/60">
                    ×{s.qty}
                    <span className="ml-2 text-ink/40">
                      {moneyOrDash(s.revenue_pkr)}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/55">
            Collected by day
          </h2>
          <div className="mt-3 max-h-[28rem] overflow-auto border-y border-ink/10">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-[#f7f4f0] text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/45">
                <tr>
                  <th className="py-2 pr-2 font-semibold">Day</th>
                  <th className="py-2 pr-2 font-semibold">Visits</th>
                  <th className="py-2 pr-2 font-semibold">Net</th>
                  <th className="py-2 font-semibold">Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {days.map((d) => (
                  <tr
                    key={d.ymd}
                    className={
                      d.visits_count === 0 ? 'text-ink/30' : 'text-ink'
                    }
                  >
                    <td className="py-1.5 pr-2 tabular-nums">
                      <Link
                        href={`/admin?ymd=${d.ymd}`}
                        className="hover:underline"
                      >
                        {d.day}
                      </Link>
                    </td>
                    <td className="py-1.5 pr-2 tabular-nums">{d.visits_count}</td>
                    <td className="py-1.5 pr-2 tabular-nums">
                      {d.visits_count ? moneyOrDash(d.net_pkr) : '—'}
                    </td>
                    <td className="py-1.5 tabular-nums">
                      {d.visits_count ? moneyOrDash(d.collected_pkr) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
