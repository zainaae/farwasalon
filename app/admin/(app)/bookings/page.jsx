import Link from 'next/link'
import { createClient } from '../../../../lib/supabase/server.js'
import { karachiYmd } from '../../../../lib/pos/karachi.js'
import { filterUpcomingScheduled } from '../../../../lib/pos/bookings-import.js'
import { formatVisitDateTime } from '../pos-format.js'
import ImportBookingsButton from './import-button.jsx'

export const metadata = {
  title: 'Online bookings',
  robots: { index: false, follow: false },
}

export default async function AdminBookingsPage({ searchParams }) {
  const sp = await searchParams
  const today = karachiYmd()
  const fromParam =
    typeof sp?.from === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(sp.from)
      ? sp.from
      : today

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('appointments')
    .select(
      `
      id, external_id, scheduled_at, service_name, category, duration_min,
      status, source, sheet_status, notes, catalog_service_id, visit_id,
      clients ( id, name, phone_display, phone_e164 )
    `,
    )
    .eq('source', 'online')
    .gte('scheduled_at', `${fromParam}T00:00:00+05:00`)
    .order('scheduled_at', { ascending: true })
    .limit(200)

  const upcoming = filterUpcomingScheduled(data || [], fromParam)
  const other = (data || []).filter((a) => a.status !== 'scheduled')

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight text-ink">
            Online bookings
          </h1>
          <p className="mt-1 max-w-xl text-sm text-ink/60">
            Import-first from Google Sheets. Completing a visit creates a POS
            ticket — money is never written back to the sheet.
          </p>
        </div>
        <ImportBookingsButton defaultFrom={fromParam} />
      </div>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          Could not load appointments ({error.message}). Apply the Slice 6
          appointments migration if the table is missing.
        </p>
      )}

      <h2 className="mt-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/50">
        Upcoming scheduled
      </h2>

      {upcoming.length === 0 && !error ? (
        <div className="mt-3 rounded-sm border border-dashed border-ink/20 bg-white/60 px-5 py-10 text-center text-sm text-ink/50">
          No scheduled online bookings from {fromParam}. Import from Sheets or
          check the date filter.
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10 bg-white/50">
          {upcoming.map((a) => {
            const client = a.clients
            const completeHref = `/admin/visits/new?appointment=${encodeURIComponent(a.id)}`
            return (
              <li
                key={a.id}
                className="flex flex-col gap-2 px-3 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">
                    {formatVisitDateTime(a.scheduled_at)}
                    <span className="ml-2 font-normal text-ink/50">
                      {a.external_id}
                    </span>
                  </p>
                  <p className="mt-0.5 truncate text-sm text-ink/75">
                    {client?.name || '—'} · {client?.phone_display || '—'}
                  </p>
                  <p className="mt-0.5 text-xs text-ink/55">
                    {a.service_name}
                    {a.category ? ` · ${a.category}` : ''}
                    {a.duration_min ? ` · ${a.duration_min} min` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {client?.id ? (
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="rounded-sm border border-ink/15 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/70 hover:border-ink/30"
                    >
                      Client
                    </Link>
                  ) : null}
                  <Link
                    href={completeHref}
                    className="rounded-sm bg-ink px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white"
                  >
                    Complete visit
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {other.length > 0 ? (
        <>
          <h2 className="mt-10 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/50">
            Other statuses (same window)
          </h2>
          <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10 bg-white/40 text-sm">
            {other.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2.5 text-ink/70"
              >
                <span>
                  {formatVisitDateTime(a.scheduled_at)} · {a.external_id} ·{' '}
                  {a.clients?.name || '—'} · {a.service_name}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                  {a.status}
                  {a.visit_id ? (
                    <>
                      {' '}
                      ·{' '}
                      <Link
                        href={`/admin/visits/${a.visit_id}`}
                        className="underline"
                      >
                        visit
                      </Link>
                    </>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  )
}
