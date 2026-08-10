/**
 * Admin POS server actions — clients, create/void visit.
 * Money is validated with lib/pos before create_visit RPC.
 */
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { suggestDiscountForVisit } from '../../../../lib/pos/deals.js'
import { validateRecordPayment } from '../../../../lib/pos/payments.js'
import {
  normalizePhoneDisplay,
  normalizePhoneE164,
} from '../../../../lib/pos/phone.js'
import { buildReceiptText } from '../../../../lib/pos/receipt.js'
import { validateVisit } from '../../../../lib/pos/totals.js'
import { createClient } from '../../../../lib/supabase/server.js'
import { requireStaff } from '../../../../lib/supabase/staff.js'

function trimStr(v) {
  return typeof v === 'string' ? v.trim() : ''
}

/**
 * Normalize payment amount conventions for tenders.
 * Cash / JazzCash / EasyPaisa → always full net.
 * Credit → 0 paid. Partial → staff amount as given.
 */
function applyPaymentConventions(payment_mode, amount_paid_pkr, net_pkr) {
  if (payment_mode === 'Credit') return 0
  if (
    payment_mode === 'Cash' ||
    payment_mode === 'JazzCash' ||
    payment_mode === 'EasyPaisa'
  ) {
    return net_pkr
  }
  return Number(amount_paid_pkr ?? 0)
}

/**
 * @param {string} phone
 * @returns {Promise<{ ok: true, clients: object[] } | { ok: false, error: string }>}
 */
export async function searchClientsByPhone(phone) {
  await requireStaff()
  const e164 = normalizePhoneE164(phone)
  if (!e164) {
    return { ok: false, error: 'Enter a valid Pakistan mobile (03xxxxxxxxx).' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('id, name, phone_e164, phone_display, notes')
    .eq('phone_e164', e164)
    .limit(5)

  if (error) {
    return { ok: false, error: error.message || 'Client search failed.' }
  }
  return { ok: true, clients: data || [] }
}

/**
 * Broader client search for /admin/clients (phone digits or name ilike).
 * @param {string} query
 */
export async function searchClients(query) {
  await requireStaff()
  const q = trimStr(query)
  if (q.length < 2) {
    return { ok: true, clients: [] }
  }

  const supabase = await createClient()
  const e164 = normalizePhoneE164(q)
  const safe = q.replace(/[%_,.()]/g, '').slice(0, 64)

  if (e164) {
    const { data, error } = await supabase
      .from('clients')
      .select('id, name, phone_e164, phone_display, notes, created_at')
      .eq('phone_e164', e164)
      .limit(20)
    if (error) return { ok: false, error: error.message }
    return { ok: true, clients: data || [] }
  }

  const digits = q.replace(/\D/g, '').slice(0, 15)
  if (digits.length >= 4) {
    const { data, error } = await supabase
      .from('clients')
      .select('id, name, phone_e164, phone_display, notes, created_at')
      .or(`phone_display.ilike.%${digits}%,phone_e164.ilike.%${digits}%`)
      .order('name')
      .limit(20)
    if (error) return { ok: false, error: error.message }
    return { ok: true, clients: data || [] }
  }

  if (!safe) return { ok: true, clients: [] }

  const { data, error } = await supabase
    .from('clients')
    .select('id, name, phone_e164, phone_display, notes, created_at')
    .ilike('name', `%${safe}%`)
    .order('name')
    .limit(20)

  if (error) return { ok: false, error: error.message }
  return { ok: true, clients: data || [] }
}

/**
 * @param {{ name: string, phone: string, notes?: string }} input
 */
export async function createClientRecord(input) {
  await requireStaff()
  const name = trimStr(input?.name)
  const e164 = normalizePhoneE164(input?.phone)
  const display = normalizePhoneDisplay(input?.phone)
  const notes = trimStr(input?.notes) || null

  if (!name) return { ok: false, error: 'Client name is required.' }
  if (!e164 || !display) {
    return { ok: false, error: 'Enter a valid Pakistan mobile (03xxxxxxxxx).' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .insert({
      name,
      phone_e164: e164,
      phone_display: display,
      notes,
    })
    .select('id, name, phone_e164, phone_display, notes')
    .single()

  if (error) {
    if (error.code === '23505') {
      const existing = await searchClientsByPhone(display)
      if (existing.ok && existing.clients?.[0]) {
        return {
          ok: true,
          client: existing.clients[0],
          existed: true,
        }
      }
      return { ok: false, error: 'A client with this phone already exists.' }
    }
    return { ok: false, error: error.message || 'Could not create client.' }
  }

  revalidatePath('/admin/clients')
  return { ok: true, client: data, existed: false }
}

/**
 * Suggest deal discount for current ticket lines (server-side active deals).
 * @param {{ lines: object[] }} input
 */
export async function suggestDealAction(input) {
  await requireStaff()
  const suggestion = suggestDiscountForVisit({ lines: input?.lines || [] })
  return { ok: true, suggestion }
}

/**
 * Create a completed visit via validateVisit → create_visit RPC.
 * @param {object} input
 */
export async function createVisitAction(input) {
  await requireStaff()

  const client_id = trimStr(input?.client_id)
  const idempotency_key = trimStr(input?.idempotency_key)
  if (!client_id) return { ok: false, error: 'Select or create a client first.' }
  if (!idempotency_key) {
    return { ok: false, error: 'Missing idempotency key — refresh and try again.' }
  }

  const rawLines = Array.isArray(input?.lines) ? input.lines : []
  const lines = rawLines.map((line) => {
    const isFrom = Boolean(line.is_from_price || line.fromPrice)
    const catalogId = line.catalog_service_id ?? null
    const unit = Number(line.unit_price_pkr ?? 0)
    const finalRaw = line.final_price_pkr
    const final =
      finalRaw == null || finalRaw === ''
        ? isFrom || catalogId == null
          ? undefined
          : unit
        : Number(finalRaw)
    return {
      catalog_service_id: catalogId,
      name: trimStr(line.name),
      category: trimStr(line.category) || null,
      unit_price_pkr: Number.isFinite(unit) ? unit : 0,
      qty: Number(line.qty ?? 1),
      is_from_price: isFrom,
      fromPrice: isFrom,
      final_price_pkr: final,
    }
  })

  const discount_pkr = Number(input?.discount_pkr ?? 0)
  const discount_note = trimStr(input?.discount_note)
  const payment_mode = input?.payment_mode
  const deal_id = trimStr(input?.deal_id) || null
  const notes = trimStr(input?.notes) || null

  const draft = validateVisit({
    lines,
    discount_pkr,
    discount_note,
    amount_paid_pkr: Number(input?.amount_paid_pkr ?? 0),
    payment_mode,
  })

  if (!draft.ok) {
    return { ok: false, error: draft.errors.join('; ') }
  }

  const amount_paid_pkr = applyPaymentConventions(
    draft.payment_mode,
    input?.amount_paid_pkr,
    draft.totals.net_pkr,
  )

  const finalCheck = validateVisit({
    lines,
    discount_pkr,
    discount_note,
    amount_paid_pkr,
    payment_mode: draft.payment_mode,
  })
  if (!finalCheck.ok) {
    return { ok: false, error: finalCheck.errors.join('; ') }
  }

  const { totals } = finalCheck
  const items = totals.lines.map((l, i) => ({
    catalog_service_id: l.catalog_service_id,
    name_snapshot: l.name,
    category_snapshot: lines[i]?.category || null,
    unit_price_pkr: l.unit_price_pkr,
    qty: l.qty,
    is_from_price: l.is_from_price,
    final_price_pkr: l.final_price_pkr,
  }))

  const supabase = await createClient()
  const payload = {
    client_id,
    visit_at: input?.visit_at || new Date().toISOString(),
    subtotal_pkr: totals.subtotal_pkr,
    discount_pkr: totals.discount_pkr,
    discount_note: finalCheck.discount_note || null,
    deal_id,
    net_pkr: totals.net_pkr,
    payment_mode: finalCheck.payment_mode,
    amount_paid_pkr: totals.amount_paid_pkr,
    due_pkr: totals.due_pkr,
    notes,
    idempotency_key,
    items,
  }

  const { data, error } = await supabase.rpc('create_visit', { payload })

  if (error) {
    return { ok: false, error: error.message || 'Save failed.' }
  }

  if (!data?.ok || !data?.visit_id) {
    return { ok: false, error: 'Save failed — empty RPC response.' }
  }

  /* Link online appointment after money ticket exists — never write back to Sheets. */
  const appointment_id = trimStr(input?.appointment_id)
  if (appointment_id) {
    const { error: apptErr } = await supabase
      .from('appointments')
      .update({ status: 'completed', visit_id: data.visit_id })
      .eq('id', appointment_id)
      .neq('status', 'completed')
    if (apptErr) {
      /* Visit already saved; surface soft warning rather than rolling back money. */
      revalidatePath('/admin/bookings')
      revalidatePath('/admin')
      revalidatePath(`/admin/visits/${data.visit_id}`)
      revalidatePath(`/admin/clients/${client_id}`)
      revalidatePath('/admin/clients')
      return {
        ok: true,
        visit_id: data.visit_id,
        txn_ref: data.txn_ref,
        idempotent: Boolean(data.idempotent),
        totals,
        payment_mode: finalCheck.payment_mode,
        discount_note: finalCheck.discount_note,
        appointment_link_error: apptErr.message,
      }
    }
    revalidatePath('/admin/bookings')
  }

  revalidatePath('/admin')
  revalidatePath(`/admin/visits/${data.visit_id}`)
  revalidatePath(`/admin/clients/${client_id}`)
  revalidatePath('/admin/clients')

  return {
    ok: true,
    visit_id: data.visit_id,
    txn_ref: data.txn_ref,
    idempotent: Boolean(data.idempotent),
    totals,
    payment_mode: finalCheck.payment_mode,
    discount_note: finalCheck.discount_note,
  }
}

/**
 * Build WhatsApp receipt text for a saved visit id.
 * @param {string} visitId
 */
export async function getVisitReceiptText(visitId) {
  await requireStaff()
  const supabase = await createClient()
  const { data: visit, error } = await supabase
    .from('visits')
    .select(
      `
      id, txn_ref, visit_at, status,
      subtotal_pkr, discount_pkr, discount_note, net_pkr,
      payment_mode, amount_paid_pkr, due_pkr,
      clients ( name, phone_display ),
      visit_items (
        name_snapshot, qty, final_price_pkr, unit_price_pkr, is_from_price
      )
    `,
    )
    .eq('id', visitId)
    .maybeSingle()

  if (error || !visit) {
    return { ok: false, error: error?.message || 'Visit not found.' }
  }

  const lines = (visit.visit_items || []).map((row) => ({
    name: row.name_snapshot,
    qty: row.qty,
    final_price_pkr: row.final_price_pkr,
    line_total: row.final_price_pkr * row.qty,
  }))

  const text = buildReceiptText({
    clientName: visit.clients?.name,
    clientPhone: visit.clients?.phone_display,
    lines,
    subtotal_pkr: visit.subtotal_pkr,
    discount_pkr: visit.discount_pkr,
    discount_note: visit.discount_note,
    net_pkr: visit.net_pkr,
    amount_paid_pkr: visit.amount_paid_pkr,
    due_pkr: visit.due_pkr,
    payment_mode: visit.payment_mode,
    txn_ref: visit.txn_ref,
    visit_at: visit.visit_at
      ? new Date(visit.visit_at).toLocaleString('en-PK', {
          timeZone: 'Asia/Karachi',
        })
      : undefined,
  })

  return { ok: true, text, txn_ref: visit.txn_ref, status: visit.status }
}

/**
 * Record a settlement against an outstanding visit due (atomic RPC).
 * Rejects overpay — no credit wallet in v1.
 *
 * @param {{
 *   visit_id: string,
 *   client_id?: string,
 *   amount_pkr: number,
 *   mode: string,
 *   notes?: string,
 *   idempotency_key: string,
 *   due_pkr?: number,
 * }} input
 */
export async function recordPaymentAction(input) {
  await requireStaff()

  const draft = validateRecordPayment({
    visit_id: input?.visit_id,
    client_id: input?.client_id,
    amount_pkr: Number(input?.amount_pkr),
    mode: input?.mode,
    notes: input?.notes,
    idempotency_key: input?.idempotency_key,
    due_pkr:
      input?.due_pkr == null || input?.due_pkr === ''
        ? undefined
        : Number(input.due_pkr),
  })

  if (!draft.ok) {
    return { ok: false, error: draft.errors.join('; ') }
  }

  const supabase = await createClient()
  const payload = {
    visit_id: draft.visit_id,
    amount_pkr: draft.amount_pkr,
    mode: draft.mode,
    notes: draft.notes,
    idempotency_key: draft.idempotency_key,
  }
  if (trimStr(input?.client_id)) {
    payload.client_id = trimStr(input.client_id)
  }

  const { data, error } = await supabase.rpc('record_payment', { payload })

  if (error) {
    const msg = error.message || 'Payment failed.'
    if (/overpay/i.test(msg)) {
      return { ok: false, error: 'Amount exceeds remaining due — overpay rejected.' }
    }
    return { ok: false, error: msg }
  }

  if (!data?.ok || !data?.payment_id) {
    return { ok: false, error: 'Payment failed — empty RPC response.' }
  }

  const clientId = data.client_id || trimStr(input?.client_id)
  const visitId = data.visit_id || draft.visit_id

  revalidatePath('/admin')
  if (visitId) revalidatePath(`/admin/visits/${visitId}`)
  if (clientId) revalidatePath(`/admin/clients/${clientId}`)
  revalidatePath('/admin/clients')

  return {
    ok: true,
    payment_id: data.payment_id,
    visit_id: visitId,
    client_id: clientId,
    amount_pkr: data.amount_pkr,
    due_pkr: data.due_pkr,
    amount_paid_pkr: data.amount_paid_pkr,
    idempotent: Boolean(data.idempotent),
  }
}

/**
 * @param {string} visitId
 * @param {string} [redirectTo]
 */
export async function voidVisitAction(visitId, redirectTo) {
  await requireStaff()
  if (!visitId) return { ok: false, error: 'Missing visit id.' }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('void_visit', {
    p_visit_id: visitId,
  })

  if (error) {
    return { ok: false, error: error.message || 'Void failed.' }
  }

  revalidatePath('/admin')
  revalidatePath(`/admin/visits/${visitId}`)

  if (redirectTo) {
    redirect(redirectTo)
  }

  return {
    ok: true,
    visit_id: data?.visit_id,
    txn_ref: data?.txn_ref,
    already_voided: Boolean(data?.already_voided),
  }
}
