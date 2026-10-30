/**
 * Pure helpers for importing Google Sheets Bookings into POS appointments.
 * Sheets remain the online booking ledger; CRM never writes money back.
 */
import { normalizePhoneDisplay, normalizePhoneE164 } from './phone.js'

const FBS_RE = /^FBS-[0-9A-F]{8,}$/i

/**
 * Map Sheets status cell → appointments.status.
 * @param {string} sheetStatus
 * @returns {'scheduled' | 'cancelled'}
 */
export function mapSheetStatusToAppointment(sheetStatus) {
  const s = String(sheetStatus || '')
    .trim()
    .toLowerCase()
  if (s === 'cancelled' || s === 'canceled' || s === 'no-show' || s === 'no_show') {
    return 'cancelled'
  }
  return 'scheduled'
}

/**
 * Build Asia/Karachi timestamptz ISO from Sheet date + HH:MM.
 * @param {string} ymd YYYY-MM-DD
 * @param {string} hm HH:MM
 * @returns {string | null}
 */
export function sheetDateTimeToIso(ymd, hm) {
  const d = String(ymd || '').trim()
  const t = String(hm || '').trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null
  const m = t.match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const hh = m[1].padStart(2, '0')
  const mm = m[2]
  const iso = new Date(`${d}T${hh}:${mm}:00+05:00`)
  if (Number.isNaN(iso.getTime())) return null
  return iso.toISOString()
}

/**
 * Normalize a free-text service label for fuzzy catalog match.
 * @param {string} name
 */
export function normalizeServiceLabel(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Best-effort match Sheet service name → services_catalog row.
 * Exact (case-insensitive) first, then includes either way.
 * @param {string} serviceName
 * @param {Array<{ id: number, name: string, category?: string, price_pkr?: number, from_price?: boolean }>} catalog
 * @returns {{ id: number, name: string, category?: string, price_pkr?: number, from_price?: boolean } | null}
 */
export function matchCatalogService(serviceName, catalog) {
  const needle = normalizeServiceLabel(serviceName)
  if (!needle || !Array.isArray(catalog) || catalog.length === 0) return null

  const exact = catalog.find((s) => normalizeServiceLabel(s.name) === needle)
  if (exact) return exact

  const includes = catalog.filter((s) => {
    const n = normalizeServiceLabel(s.name)
    return n.includes(needle) || needle.includes(n)
  })
  if (includes.length === 1) return includes[0]
  return null
}

/**
 * Validate + normalize one Sheet booking row for import.
 * @param {object} row parseBookingSheetRow shape
 * @param {{ fromYmd?: string, toYmd?: string, catalog?: object[] }} [opts]
 * @returns {{ ok: true, booking: object } | { ok: false, skip: true, reason: string } | { ok: false, skip: false, error: string }}
 */
export function normalizeImportRow(row, opts = {}) {
  const bookingId = String(row?.bookingId || '').trim()
  if (!bookingId) {
    return { ok: false, skip: true, reason: 'missing bookingId' }
  }
  if (!FBS_RE.test(bookingId)) {
    return { ok: false, skip: true, reason: `non-FBS id: ${bookingId}` }
  }

  const ymd = String(row?.date || '').trim()
  if (opts.fromYmd && ymd < opts.fromYmd) {
    return { ok: false, skip: true, reason: 'before fromYmd' }
  }
  if (opts.toYmd && ymd > opts.toYmd) {
    return { ok: false, skip: true, reason: 'after toYmd' }
  }

  const phone_e164 = normalizePhoneE164(row?.clientPhone)
  if (!phone_e164) {
    return {
      ok: false,
      skip: false,
      error: `Invalid phone for ${bookingId}: ${row?.clientPhone || '(empty)'}`,
    }
  }

  const scheduled_at = sheetDateTimeToIso(ymd, row?.timeSlot)
  if (!scheduled_at) {
    return {
      ok: false,
      skip: false,
      error: `Invalid date/time for ${bookingId}: ${ymd} ${row?.timeSlot || ''}`,
    }
  }

  const service_name = String(row?.service || '').trim()
  if (!service_name) {
    return {
      ok: false,
      skip: false,
      error: `Missing service for ${bookingId}`,
    }
  }

  const sheet_status = String(row?.status || '').trim()
  const status = mapSheetStatusToAppointment(sheet_status)
  const catalogHit = matchCatalogService(service_name, opts.catalog || [])

  const name = String(row?.clientName || '').trim() || 'Online client'
  const phone_display = normalizePhoneDisplay(row?.clientPhone) || `0${phone_e164.slice(2)}`
  const duration_min = Number(row?.duration) > 0 ? Number(row.duration) : 30
  const category = String(row?.category || catalogHit?.category || '').trim() || null
  const notes = String(row?.notes || '').trim() || null

  return {
    ok: true,
    booking: {
      external_id: bookingId.toUpperCase(),
      phone_e164,
      phone_display,
      client_name: name,
      scheduled_at,
      service_name,
      category,
      duration_min,
      status,
      sheet_status: sheet_status || null,
      notes,
      source: 'online',
      catalog_service_id: catalogHit?.id ?? null,
      catalog_match: catalogHit
        ? {
            id: catalogHit.id,
            name: catalogHit.name,
            category: catalogHit.category ?? null,
            price_pkr: catalogHit.price_pkr ?? null,
            from_price: Boolean(catalogHit.from_price),
          }
        : null,
      ymd,
    },
  }
}

/**
 * Filter appointments that are upcoming for the desk (scheduled, from today).
 * @param {Array<{ status: string, scheduled_at: string }>} rows
 * @param {string} fromYmd Karachi YYYY-MM-DD inclusive lower bound
 */
export function filterUpcomingScheduled(rows, fromYmd) {
  const list = Array.isArray(rows) ? rows : []
  return list
    .filter((a) => a.status === 'scheduled')
    .filter((a) => {
      if (!a.scheduled_at) return false
      /* Compare Karachi calendar day via offset ISO already stored as UTC. */
      const khi = new Date(a.scheduled_at).toLocaleDateString('en-CA', {
        timeZone: 'Asia/Karachi',
      })
      return !fromYmd || khi >= fromYmd
    })
    .sort((a, b) => String(a.scheduled_at).localeCompare(String(b.scheduled_at)))
}

/**
 * Prefill payload for New visit from an appointment + optional catalog row.
 * @param {object} appointment
 * @param {object | null} [catalogRow]
 */
export function appointmentToVisitPrefill(appointment, catalogRow = null) {
  const phone =
    appointment?.clients?.phone_display ||
    appointment?.phone_display ||
    appointment?.phone_e164 ||
    ''
  const lines = []
  const svcName = appointment?.service_name
  const match = catalogRow || appointment?.catalog_match || null
  if (match?.id) {
    lines.push({
      catalog_service_id: match.id,
      name: match.name,
      category: match.category || appointment?.category || null,
      unit_price_pkr: Number(match.price_pkr ?? 0),
      qty: 1,
      is_from_price: Boolean(match.from_price),
      final_price_pkr: match.from_price ? undefined : Number(match.price_pkr ?? 0),
    })
  } else if (svcName) {
    lines.push({
      catalog_service_id: null,
      name: svcName,
      category: appointment?.category || null,
      unit_price_pkr: 0,
      qty: 1,
      is_from_price: false,
      final_price_pkr: 0,
    })
  }

  return {
    appointment_id: appointment?.id || null,
    external_id: appointment?.external_id || null,
    phone,
    client_id: appointment?.client_id || appointment?.clients?.id || null,
    client_name: appointment?.clients?.name || appointment?.client_name || null,
    notes: [
      appointment?.external_id ? `Online ${appointment.external_id}` : null,
      appointment?.notes || null,
    ]
      .filter(Boolean)
      .join(' — ') || null,
    lines,
  }
}
