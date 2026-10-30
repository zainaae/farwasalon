import { createClient } from '../../../../../lib/supabase/server.js'
import {
  appointmentToVisitPrefill,
} from '../../../../../lib/pos/bookings-import.js'
import NewVisitForm from './new-visit-form.jsx'

export const metadata = {
  title: 'New visit',
  robots: { index: false, follow: false },
}

export default async function NewVisitPage({ searchParams }) {
  const sp = await searchParams
  const appointmentId =
    typeof sp?.appointment === 'string' ? sp.appointment.trim() : ''

  const supabase = await createClient()
  const { data: catalog, error } = await supabase
    .from('services_catalog')
    .select('id, name, category, price_pkr, from_price, active')
    .eq('active', true)
    .order('category')
    .order('name')

  let prefill = null
  let prefillWarning = null

  if (appointmentId) {
    const { data: appt, error: apptErr } = await supabase
      .from('appointments')
      .select(
        `
        id, external_id, client_id, scheduled_at, service_name, category,
        status, notes, catalog_service_id, visit_id,
        clients ( id, name, phone_display, phone_e164 )
      `,
      )
      .eq('id', appointmentId)
      .maybeSingle()

    if (apptErr || !appt) {
      prefillWarning =
        apptErr?.message || 'Appointment not found — start a blank visit.'
    } else if (appt.status === 'completed' && appt.visit_id) {
      prefillWarning = `This booking is already completed (visit ${appt.visit_id}).`
    } else {
      const catalogRow =
        (catalog || []).find((s) => s.id === appt.catalog_service_id) ||
        (catalog || []).find(
          (s) =>
            s.name.toLowerCase() === String(appt.service_name || '').toLowerCase(),
        ) ||
        null
      const built = appointmentToVisitPrefill(appt, catalogRow)
      prefill = {
        ...built,
        client: appt.clients
          ? {
              id: appt.clients.id,
              name: appt.clients.name,
              phone_e164: appt.clients.phone_e164,
              phone_display: appt.clients.phone_display,
            }
          : null,
      }
    }
  }

  return (
    <section>
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight text-ink">
        New visit
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/65">
        Search the client, add services, set finals for from-price lines, then
        take payment.
      </p>
      {prefill?.external_id ? (
        <p className="mt-3 text-xs text-ink/55">
          Completing online booking{' '}
          <span className="font-mono">{prefill.external_id}</span>
          {' — '}
          POS money stays in Supabase (not written to Sheets).
        </p>
      ) : null}
      {prefillWarning && (
        <p
          role="alert"
          className="mt-4 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
        >
          {prefillWarning}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
        >
          Catalog unavailable ({error.message}). Sync services_catalog or add
          custom lines only.
        </p>
      )}
      <NewVisitForm catalog={catalog || []} prefill={prefill} />
    </section>
  )
}
