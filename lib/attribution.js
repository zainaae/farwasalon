/** Lead attribution — answers "where did this booking come from?"
 *
 *  A booking row previously recorded nothing about its origin, so a Meta-ad
 *  lead was indistinguishable from a walk-in. This captures the campaign
 *  parameters on the first page a visitor lands on, holds them for the
 *  session, and attaches them to the booking that eventually gets written to
 *  the sheet. First-touch wins: the ad that earned the visit gets the credit,
 *  not the last internal page they happened to be on.
 *
 *  No cookies, no third parties — sessionStorage only. */

const KEY = 'farwa-attribution'
const MAX_LEN = 120

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']

/** Meta/Google click ids are worth keeping — they identify the exact ad click. */
const CLICK_IDS = ['fbclid', 'gclid', 'ttclid']

const clean = (v) => (typeof v === 'string' ? v.trim().slice(0, MAX_LEN) : '')

/** Classify the visit when no UTMs are present, from the referrer. */
export function inferChannel(referrer, host) {
  if (!referrer) return 'direct'
  let refHost = ''
  try {
    refHost = new URL(referrer).hostname.replace(/^www\./, '')
  } catch {
    return 'direct'
  }
  if (host && refHost === host.replace(/^www\./, '')) return 'internal'
  if (/facebook|fb\.com|instagram|messenger/.test(refHost)) return 'meta-organic'
  if (/wa\.me|whatsapp/.test(refHost)) return 'whatsapp'
  if (/google|bing|duckduckgo|yahoo|ecosia/.test(refHost)) return 'search'
  if (/t\.co|twitter|x\.com|linkedin|tiktok|snapchat/.test(refHost)) return 'social'
  return refHost
}

/** Read campaign data out of a URL + referrer. Returns null when there is
 *  nothing worth recording beyond a plain internal navigation. */
export function readAttribution({ search = '', referrer = '', host = '', landing = '' } = {}) {
  const params = new URLSearchParams(search)
  const out = {}
  for (const k of UTM_KEYS) {
    const v = clean(params.get(k))
    if (v) out[k] = v
  }
  for (const k of CLICK_IDS) {
    const v = clean(params.get(k))
    if (v) out[k] = v
  }
  const channel = inferChannel(referrer, host)
  if (!Object.keys(out).length && (channel === 'internal' || !channel)) return null
  return {
    ...out,
    channel: out.utm_source ? `${out.utm_source}${out.utm_medium ? '/' + out.utm_medium : ''}` : channel,
    landing: clean(landing),
    firstSeen: new Date().toISOString(),
  }
}

/** Persist first-touch attribution. Later visits in the same session do not
 *  overwrite it — the ad that earned the session keeps the credit. */
export function captureAttribution() {
  if (typeof window === 'undefined') return null
  try {
    const existing = window.sessionStorage.getItem(KEY)
    if (existing) return JSON.parse(existing)
    const data = readAttribution({
      search: window.location.search,
      referrer: document.referrer,
      host: window.location.hostname,
      landing: window.location.pathname,
    })
    if (!data) return null
    window.sessionStorage.setItem(KEY, JSON.stringify(data))
    return data
  } catch {
    return null
  }
}

export function getAttribution() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** One compact cell for the sheet: "meta/paid · freedom-deal-2026 · /freedom-deal" */
export function formatAttributionCell(a) {
  if (!a) return ''
  const parts = [a.channel, a.utm_campaign, a.landing].filter(Boolean)
  const cell = parts.join(' · ')
  return a.fbclid ? `${cell} · fbclid` : cell
}
