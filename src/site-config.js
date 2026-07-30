/* ─── Config ─────────────────────────────────────────────────── */
export const WA_NUMBER  = '923222782254'
export const MAPS_LINK  = 'https://www.google.com/maps/place/Farwa+beauty+salon/@24.8797532,67.0584185,17z/data=!3m1!4b1!4m6!3m5!1s0x3eb33f2832975c79:0xe55ba4a44d34a210!8m2!3d24.8797532!4d67.0584185!16s%2Fg%2F11hdrwg03n'
export const GOOGLE_REVIEW_LINK = 'https://g.page/farwasalon/review'
export const SALON_LAT  = 24.8797532
export const SALON_LNG  = 67.0584185
export const IG_LINK    = 'https://www.instagram.com/farwasalon/'
export const WA_DEFAULT = `https://wa.me/${WA_NUMBER}?text=Hi%21%20I%27d%20like%20to%20book%20an%20appointment%20at%20Farwa%20Beauty%20Salon.`
export const waLink = (service = '') =>
  service
    ? `https://wa.me/${WA_NUMBER}?text=Hi%21%20I%27d%20like%20to%20book%20*${encodeURIComponent(service)}*%20at%20Farwa%20Beauty%20Salon.`
    : WA_DEFAULT

/** Pre-filled WhatsApp URL for bookings with one or many service names */
export function waLinkBooking(names = [], extra = {}) {
  const trimmed = [...names].map(n => String(n).trim()).filter(Boolean)
  const { date = '', time = '', name = '', phone = '' } = extra
  const header = [`Hi! I'd like to book an appointment at Farwa Beauty Salon.`]
  const svcBlock =
    trimmed.length === 0
      ? []
      : trimmed.length === 1
        ? [``, `Service: ${trimmed[0]}`]
        : [``, `Services:`, ...trimmed.map(s => `• ${s}`)]
  const meta = []
  if (name) meta.push(`Name: ${name}`)
  if (phone) meta.push(`Phone: ${phone}`)
  if (date) meta.push(`Preferred date: ${date}`)
  if (time) meta.push(`Preferred time: ${time}`)
  const body = [...header, ...svcBlock, ...(meta.length ? [``, ...meta] : [])].join('\n')
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(body)}`
}

/* ─── Validation ──────────────────────────────────────────────── */
export const PHONE_RE = /^(\+?92|0)?3\d{2}[\s-]?\d{7}$/

/* ─── Founding ─────────────────────────────────────────────────── */
export const FOUNDING_YEAR = 2008
export const YEARS_ACTIVE  = new Date().getFullYear() - FOUNDING_YEAR

/* ─── Price / duration formatting ─────────────────────────────── */
/** Display PKR as Rs 1,200 (comma-separated) for rate lists and SERP clarity. */
export const formatPrice = (pkr) => {
  if (pkr == null) return null
  return `Rs ${Number(pkr).toLocaleString('en-US')}`
}
export const formatDuration = (min) => {
  if (min == null) return null
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

/* ─── Analytics helper ────────────────────────────────────────── */
/* Events that mean money. Mapped to Meta's standard event names so the pixel
   can optimise delivery toward them; everything else stays Plausible-only. */
const META_EVENTS = {
  BookingCompleted: 'Schedule',
  BookingStarted: 'InitiateCheckout',
  WhatsAppIntent: 'Contact',
  CallIntent: 'Contact',
}

export function track(event, props) {
  window.plausible?.(event, { props })

  const metaEvent = META_EVENTS[event]
  if (metaEvent && typeof window.fbq === 'function') {
    /* Value + currency only where a real basket exists — Meta uses them to
       optimise for higher-value bookings, and inventing them would poison it. */
    const payload =
      props?.value != null
        ? { value: Number(props.value) || 0, currency: 'PKR', content_name: props.service }
        : { content_name: props?.service || props?.from }
    window.fbq('track', metaEvent, payload)
  }
}

/* ─── Deep-link slugs ─────────────────────────────────────────── */
export const CAT_SLUGS = {
  'Threading':       'threading',
  'Rica Hot Wax':    'rica-hot-wax',
  'Honey Wax':       'honey-wax',
  'Rica Wax':        'rica-wax',
  'Bleach & Polish': 'bleach-polish',
  'Massage':         'massage',
  'Hair Treatments': 'hair-treatments',
  'Cleansing':       'cleansing',
  'Facials':         'facials',
  'Nails':           'nails',
  'Bridal':          'bridal',
  'Hair':            'hair',
  'Eyebrow Tattoo':  'eyebrow-tattoo',
}
const _slugToCategory = Object.fromEntries(Object.entries(CAT_SLUGS).map(([k, v]) => [v, k]))
export const slugToCategory = (slug) => _slugToCategory[slug] ?? null
