import { moneyOrDash } from './pos-format.js'

/**
 * Compact money KPI strip for Today / Month.
 * @param {{
 *   visits_count: number,
 *   gross_pkr: number,
 *   discount_pkr: number,
 *   net_pkr: number,
 *   collected_pkr: number,
 *   dues_opened_pkr: number,
 *   avg_net_ticket_pkr?: number,
 * }} kpis
 * @param {{ showAvg?: boolean }} [opts]
 */
export function MoneyKpiStrip({ kpis, showAvg = false }) {
  const items = [
    { label: 'Visits', value: String(kpis.visits_count) },
    { label: 'Gross', value: moneyOrDash(kpis.gross_pkr) },
    { label: 'Discounts', value: moneyOrDash(kpis.discount_pkr) },
    { label: 'Net', value: moneyOrDash(kpis.net_pkr) },
    { label: 'Collected', value: moneyOrDash(kpis.collected_pkr) },
    { label: 'Dues opened', value: moneyOrDash(kpis.dues_opened_pkr) },
  ]
  if (showAvg) {
    items.push({
      label: 'Avg net ticket',
      value: moneyOrDash(kpis.avg_net_ticket_pkr),
    })
  }

  const cols = showAvg
    ? 'sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7'
    : 'sm:grid-cols-3 lg:grid-cols-6'

  return (
    <dl
      className={`mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-ink/10 py-5 ${cols}`}
    >
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45">
            {item.label}
          </dt>
          <dd className="mt-1 text-lg font-medium tabular-nums tracking-tight text-ink sm:text-xl">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
