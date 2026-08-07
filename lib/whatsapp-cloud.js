/**
 * WhatsApp Cloud API helper — disabled unless env credentials exist.
 *
 * When WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID are unset (the default), every
 * send is a no-op that logs and returns { ok: false, skipped: true }. That lets
 * /api/book call us safely before Meta templates are approved.
 *
 * Templates must be approved in Meta Business Manager before live sends work.
 * See docs/whatsapp-business-setup.md §5c and docs/integrations-execution.md.
 */
import { logger, errCtx } from './logger.js'

const GRAPH_VERSION = 'v21.0'

/** True when Cloud API credentials are present (still may fail if templates pending). */
export function isWhatsAppCloudConfigured() {
  return Boolean(
    process.env.WHATSAPP_TOKEN?.trim() && process.env.WHATSAPP_PHONE_NUMBER_ID?.trim(),
  )
}

/**
 * Normalize a Pakistan mobile to digits-only E.164 without '+'.
 * Accepts 03xx…, +92…, 92…. Returns null if unusable.
 */
export function toWhatsAppE164(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return null
  let n = digits
  if (n.startsWith('0')) n = `92${n.slice(1)}`
  else if (!n.startsWith('92')) n = `92${n}`
  if (!/^923\d{9}$/.test(n)) return null
  return n
}

/**
 * Send an approved template message via Meta Cloud API.
 * No-ops (skipped) when credentials are missing.
 *
 * @param {object} opts
 * @param {string} opts.toPhone — client phone as entered on the booking form
 * @param {string} opts.templateName — approved template name (e.g. booking_confirmed)
 * @param {string} [opts.languageCode='en']
 * @param {Array<{type:string,parameters:object[]}>} [opts.components]
 * @returns {Promise<{ok:boolean,skipped?:boolean,status?:number,messageId?:string,error?:string}>}
 */
export async function sendWhatsAppTemplate({
  toPhone,
  templateName,
  languageCode = 'en',
  components = [],
}) {
  if (!isWhatsAppCloudConfigured()) {
    logger.info('/whatsapp-cloud', 'skip-unconfigured', { templateName })
    return { ok: false, skipped: true }
  }

  const to = toWhatsAppE164(toPhone)
  if (!to) {
    logger.warn('/whatsapp-cloud', 'invalid-phone', { templateName })
    return { ok: false, error: 'invalid_phone' }
  }

  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID.trim()
  const token = process.env.WHATSAPP_TOKEN.trim()
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${phoneId}/messages`

  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      ...(components.length ? { components } : {}),
    },
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const raw = await res.text()
    let parsed = null
    try {
      parsed = raw ? JSON.parse(raw) : null
    } catch {
      parsed = null
    }

    if (!res.ok) {
      logger.warn('/whatsapp-cloud', 'send-failed', {
        templateName,
        status: res.status,
        error: parsed?.error?.message || raw.slice(0, 200),
      })
      return {
        ok: false,
        status: res.status,
        error: parsed?.error?.message || `http_${res.status}`,
      }
    }

    const messageId = parsed?.messages?.[0]?.id
    logger.info('/whatsapp-cloud', 'sent', { templateName, messageId: messageId || null })
    return { ok: true, status: res.status, messageId }
  } catch (err) {
    logger.error('/whatsapp-cloud', 'send-threw', { templateName, ...errCtx(err) })
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/**
 * Best-effort booking confirmation. Never throws; never blocks booking success.
 * Uses template `booking_confirmed` with body params: name, service, date, time.
 * Skips when WHATSAPP_SEND_BOOKING_CONFIRM is not "1"/"true" (off by default).
 */
export async function maybeSendBookingConfirmed({
  clientName,
  clientPhone,
  service,
  date,
  time,
}) {
  const flag = String(process.env.WHATSAPP_SEND_BOOKING_CONFIRM || '')
    .trim()
    .toLowerCase()
  if (flag !== '1' && flag !== 'true') {
    return { ok: false, skipped: true, reason: 'flag_off' }
  }

  const templateName =
    process.env.WHATSAPP_TEMPLATE_BOOKING_CONFIRMED?.trim() || 'booking_confirmed'

  return sendWhatsAppTemplate({
    toPhone: clientPhone,
    templateName,
    languageCode: process.env.WHATSAPP_TEMPLATE_LANG?.trim() || 'en',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: String(clientName || 'there').slice(0, 60) },
          { type: 'text', text: String(service || 'appointment').slice(0, 100) },
          { type: 'text', text: String(date || '').slice(0, 20) },
          { type: 'text', text: String(time || '').slice(0, 10) },
        ],
      },
    ],
  })
}
