import Link from 'next/link'
import { createClient } from '../../../../lib/supabase/server.js'
import ClientsSearch from './clients-search.jsx'

export const metadata = {
  title: 'Clients',
  robots: { index: false, follow: false },
}

export default async function ClientsPage({ searchParams }) {
  const sp = await searchParams
  const q = typeof sp?.q === 'string' ? sp.q.trim() : ''
  const supabase = await createClient()

  let clients = []
  let loadError = null

  if (q.length >= 2) {
    const safe = q.replace(/[%_,.()]/g, '').slice(0, 64)
    const digits = q.replace(/\D/g, '').slice(0, 15)
    const parts = [`name.ilike.%${safe}%`, `phone_display.ilike.%${safe}%`]
    if (digits.length >= 4) parts.push(`phone_e164.ilike.%${digits}%`)
    const { data, error } = await supabase
      .from('clients')
      .select('id, name, phone_display, phone_e164, created_at')
      .or(parts.join(','))
      .order('name')
      .limit(40)
    clients = data || []
    loadError = error?.message || null
  } else {
    const { data, error } = await supabase
      .from('clients')
      .select('id, name, phone_display, phone_e164, created_at')
      .order('created_at', { ascending: false })
      .limit(30)
    clients = data || []
    loadError = error?.message || null
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight text-ink">
            Clients
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Search by name or phone. Open a profile to record dues payments.
          </p>
        </div>
        <Link
          href="/admin/visits/new"
          className="inline-flex items-center justify-center rounded-sm bg-ink px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white"
        >
          New visit
        </Link>
      </div>

      <div className="mt-6">
        <ClientsSearch initialQuery={q} />
      </div>

      {loadError && (
        <p
          role="alert"
          className="mt-4 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {loadError}
        </p>
      )}

      {clients.length === 0 ? (
        <div className="mt-6 rounded-sm border border-dashed border-ink/20 bg-white/60 px-5 py-10 text-center text-sm text-ink/50">
          {q ? 'No clients match that search.' : 'No clients yet — log a visit to create one.'}
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10 bg-white/50">
          {clients.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/clients/${c.id}`}
                className="flex items-center justify-between gap-3 px-3 py-3.5 hover:bg-ink/[0.03]"
              >
                <span className="truncate text-sm font-medium text-ink">
                  {c.name}
                </span>
                <span className="shrink-0 font-mono text-xs text-ink/50">
                  {c.phone_display}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
