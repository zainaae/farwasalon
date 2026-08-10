/**
 * Admin actions: import Sheets bookings + mark appointment completed.
 */
'use server'

import { revalidatePath } from 'next/cache'
import { isConfigured, listAllBookingRows } from '../../../../lib/google-sheets.js'
import { karachiYmd } from '../../../../lib/pos/karachi.js'
import { importBookingsFromRows } from '../../../../lib/pos/bookings-import-run.js'
import { createClient } from '../../../../lib/supabase/server.js'
import { requireStaff } from '../../../../lib/supabase/staff.js'

/**
 * Pull Bookings from Google Sheets into clients + appointments.
 * Idempotent on external_id (FBS-…). Never writes back to Sheets.
 *
 * @param {{ fromYmd?: string, toYmd?: string } | FormData} [input]
 */
export async function importOnlineBookingsAction(input) {
  await requireStaff()

  if (!isConfigured()) {
    return {
      ok: false,
      error:
        'Google Sheets credentials are missing. Set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_ID on the server. Public /book is unchanged.',
    }
  }

  let fromYmd = karachiYmd()
  let toYmd = null
  if (input instanceof FormData) {
    const f = String(input.get('fromYmd') || '').trim()
    const t = String(input.get('toYmd') || '').trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(f)) fromYmd = f
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) toYmd = t
  } else if (input && typeof input === 'object') {
    if (
      typeof input.fromYmd === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(input.fromYmd)
    ) {
      fromYmd = input.fromYmd
    }
    if (
      typeof input.toYmd === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(input.toYmd)
    ) {
      toYmd = input.toYmd
    }
  }

  let rows
  try {
    rows = await listAllBookingRows()
  } catch (err) {
    return {
      ok: false,
      error: `Could not read Bookings sheet: ${err?.message || String(err)}`,
    }
  }

  const supabase = await createClient()
  const { data: catalog } = await supabase
    .from('services_catalog')
    .select('id, name, category, price_pkr, from_price')
    .eq('active', true)

  const summary = await importBookingsFromRows(supabase, rows, {
    fromYmd,
    toYmd,
    catalog: catalog || [],
  })

  revalidatePath('/admin/bookings')
  revalidatePath('/admin')
  revalidatePath('/admin/clients')

  return { ok: true, summary, fromYmd, toYmd }
}

/**
 * After create_visit succeeds, link the appointment (desk Complete visit).
 * Does not touch Google Sheets.
 *
 * @param {{ appointment_id: string, visit_id: string }} input
 */
export async function markAppointmentCompletedAction(input) {
  await requireStaff()
  const appointment_id =
    typeof input?.appointment_id === 'string' ? input.appointment_id.trim() : ''
  const visit_id =
    typeof input?.visit_id === 'string' ? input.visit_id.trim() : ''
  if (!appointment_id || !visit_id) {
    return { ok: false, error: 'appointment_id and visit_id required.' }
  }

  const supabase = await createClient()
  const { data: appt, error: findErr } = await supabase
    .from('appointments')
    .select('id, status, visit_id')
    .eq('id', appointment_id)
    .maybeSingle()

  if (findErr || !appt) {
    return { ok: false, error: findErr?.message || 'Appointment not found.' }
  }

  if (appt.status === 'completed' && appt.visit_id) {
    return { ok: true, already: true, visit_id: appt.visit_id }
  }

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'completed', visit_id })
    .eq('id', appointment_id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/bookings')
  revalidatePath(`/admin/visits/${visit_id}`)
  return { ok: true, visit_id }
}
