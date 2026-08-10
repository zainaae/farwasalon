/**
 * Shared online-booking import runner (Sheets → clients + appointments).
 * Used by scripts/import-online-bookings.mjs and admin server actions.
 * Never writes money or status back to Google Sheets.
 */
import { normalizeImportRow } from './bookings-import.js'

/**
 * Upsert client by phone_e164; update name if blank-ish / missing.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ phone_e164: string, phone_display: string, client_name: string }} booking
 */
export async function upsertClientByPhone(supabase, booking) {
  const { data: existing, error: findErr } = await supabase
    .from('clients')
    .select('id, name, phone_e164, phone_display')
    .eq('phone_e164', booking.phone_e164)
    .maybeSingle()

  if (findErr) {
    return { ok: false, error: findErr.message }
  }

  if (existing?.id) {
    const name = String(existing.name || '').trim()
    if (
      (!name || name === 'Online client') &&
      booking.client_name &&
      booking.client_name !== 'Online client'
    ) {
      await supabase
        .from('clients')
        .update({ name: booking.client_name })
        .eq('id', existing.id)
    }
    return { ok: true, client_id: existing.id, created: false }
  }

  const { data: created, error: insertErr } = await supabase
    .from('clients')
    .insert({
      name: booking.client_name,
      phone_e164: booking.phone_e164,
      phone_display: booking.phone_display,
      notes: booking.external_id
        ? `Imported from online booking ${booking.external_id}`
        : null,
    })
    .select('id')
    .single()

  if (insertErr) {
    /* Race: unique phone — fetch again. */
    if (insertErr.code === '23505') {
      const { data: again } = await supabase
        .from('clients')
        .select('id')
        .eq('phone_e164', booking.phone_e164)
        .maybeSingle()
      if (again?.id) return { ok: true, client_id: again.id, created: false }
    }
    return { ok: false, error: insertErr.message }
  }

  return { ok: true, client_id: created.id, created: true }
}

/**
 * Decide next appointment status when re-importing an existing row.
 * Completed desk tickets are never downgraded by Sheet Confirmed.
 * @param {string | null} existingStatus
 * @param {string} incomingStatus
 */
export function mergeAppointmentStatus(existingStatus, incomingStatus) {
  if (existingStatus === 'completed' || existingStatus === 'no_show') {
    return existingStatus
  }
  return incomingStatus
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {object} booking normalizeImportRow().booking
 * @param {string} clientId
 */
export async function upsertAppointment(supabase, booking, clientId) {
  const { data: existing, error: findErr } = await supabase
    .from('appointments')
    .select('id, status, visit_id')
    .eq('external_id', booking.external_id)
    .maybeSingle()

  if (findErr) return { ok: false, error: findErr.message }

  const nextStatus = mergeAppointmentStatus(existing?.status, booking.status)

  const patch = {
    client_id: clientId,
    scheduled_at: booking.scheduled_at,
    service_name: booking.service_name,
    category: booking.category,
    duration_min: booking.duration_min,
    status: nextStatus,
    source: 'online',
    sheet_status: booking.sheet_status,
    notes: booking.notes,
    catalog_service_id: booking.catalog_service_id,
  }

  if (existing?.id) {
    /* Do not clear visit_id when status stays completed. */
    const { error: updErr } = await supabase
      .from('appointments')
      .update(patch)
      .eq('id', existing.id)
    if (updErr) return { ok: false, error: updErr.message }
    return { ok: true, appointment_id: existing.id, created: false }
  }

  const { data: created, error: insertErr } = await supabase
    .from('appointments')
    .insert({
      ...patch,
      external_id: booking.external_id,
    })
    .select('id')
    .single()

  if (insertErr) {
    if (insertErr.code === '23505') {
      const { data: again } = await supabase
        .from('appointments')
        .select('id')
        .eq('external_id', booking.external_id)
        .maybeSingle()
      if (again?.id) {
        await supabase.from('appointments').update(patch).eq('id', again.id)
        return { ok: true, appointment_id: again.id, created: false }
      }
    }
    return { ok: false, error: insertErr.message }
  }

  return { ok: true, appointment_id: created.id, created: true }
}

/**
 * Import an array of Sheet booking row objects into CRM.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {object[]} sheetRows
 * @param {{ fromYmd?: string, toYmd?: string, catalog?: object[] }} [opts]
 */
export async function importBookingsFromRows(supabase, sheetRows, opts = {}) {
  const summary = {
    scanned: 0,
    skipped: 0,
    clients_created: 0,
    appointments_created: 0,
    appointments_updated: 0,
    errors: /** @type {string[]} */ ([]),
  }

  for (const row of sheetRows || []) {
    summary.scanned += 1
    const normalized = normalizeImportRow(row, opts)
    if (!normalized.ok) {
      if (normalized.skip) {
        summary.skipped += 1
        continue
      }
      summary.errors.push(normalized.error)
      continue
    }

    const clientRes = await upsertClientByPhone(supabase, normalized.booking)
    if (!clientRes.ok) {
      summary.errors.push(
        `${normalized.booking.external_id}: client ${clientRes.error}`,
      )
      continue
    }
    if (clientRes.created) summary.clients_created += 1

    const apptRes = await upsertAppointment(
      supabase,
      normalized.booking,
      clientRes.client_id,
    )
    if (!apptRes.ok) {
      summary.errors.push(
        `${normalized.booking.external_id}: appointment ${apptRes.error}`,
      )
      continue
    }
    if (apptRes.created) summary.appointments_created += 1
    else summary.appointments_updated += 1
  }

  return summary
}
