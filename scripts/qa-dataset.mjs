/**
 * Farwa Beauty Salon — shared QA test dataset (humans + scripts).
 * Import from workflow runners, probes, and reference docs.
 */
import {
  CAT_SLUGS,
  SERVICES,
  ALL_SERVICES,
  SERVICE_ADDON_IDS,
  PHONE_RE,
  WA_NUMBER,
  getDefaultServiceIdForCategory,
} from '../src/data.js'
import { BLOG_POSTS } from '../src/blog-data.js'
import {
  NEIGHBORHOODS,
  TOP_SERVICES,
  getAllLocationServiceSlugs,
} from '../src/location-seo.js'
import { FILTERED_SLOTS } from '../lib/booking-slots.js'
import {
  getStaticSitemapEntries,
  getServiceCategorySitemapEntries,
  getBlogSitemapEntries,
  getLocationSitemapEntries,
} from '../lib/sitemap-data.js'

export const QA_BASE_URL_DEFAULT = 'http://127.0.0.1:3000'
export const QA_PRODUCTION_URL = 'https://farwasalon.com'
export const QA_PROBE_ORIGIN = 'https://farwasalon.com'

/** Local calendar date YYYY-MM-DD (avoids UTC shift from toISOString). */
export function localDateIso(ref = new Date()) {
  const y = ref.getFullYear()
  const m = String(ref.getMonth() + 1).padStart(2, '0')
  const d = String(ref.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function offsetDays(n, ref = new Date()) {
  const d = new Date(ref)
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + n)
  return localDateIso(d)
}

/** First weekday (Mon–Sat) at offset n from ref. */
export function offsetWeekday(n, ref = new Date()) {
  let d = new Date(ref)
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + n)
  while (d.getDay() === 0) d.setDate(d.getDate() + 1)
  return localDateIso(d)
}

export function isSundayIso(dateStr) {
  return new Date(`${dateStr}T12:00:00`).getDay() === 0
}

export function nextSunday(ref = new Date()) {
  let d = new Date(ref)
  d.setHours(12, 0, 0, 0)
  while (d.getDay() !== 0) d.setDate(d.getDate() + 1)
  return localDateIso(d)
}

export const PHONES = {
  regex: PHONE_RE.source,
  valid: [
    '03001234567',
    '0300 1234567',
    '0300-1234567',
    '+923001234567',
    '923001234567',
    '03151234567',
  ],
  invalid: [
    { value: '12345', reason: 'too short' },
    { value: '02134567890', reason: 'landline prefix' },
    { value: '04001234567', reason: 'invalid mobile prefix' },
    { value: 'abcdefghijk', reason: 'non-numeric' },
    { value: '', reason: 'empty' },
  ],
  probe: '03009999999',
  e2e: '03001234567',
}

export const EMAILS = {
  valid: [
    'user@example.com',
    'first.last@sub.example.com',
    'a+tag@example.co',
    'hello@farwa-salon.pk',
  ],
  invalid: [
    'no-at-sign.com',
    'two@@signs.com',
    '@nouser.com',
    'user@',
    'trailing@dot.',
  ],
  subscribeProbe: (prefix = 'qa-probe') => `${prefix}-${Date.now()}@example.com`,
  e2e: 'e2e-test@example.com',
}

export const SLOT_TIMES = {
  grid: FILTERED_SLOTS,
  first: FILTERED_SLOTS[0],
  last: FILTERED_SLOTS[FILTERED_SLOTS.length - 1],
  valid: ['11:00', '11:30', '14:00', '18:30'],
  invalid: ['09:00', '10:00', '19:00', '11:15', 'noon'],
}

export const SERVICE_CATEGORIES = Object.keys(SERVICES).map((name) => ({
  name,
  slug: CAT_SLUGS[name],
  path: `/services/${CAT_SLUGS[name]}`,
  defaultServiceId: getDefaultServiceIdForCategory(name),
  sampleService: SERVICES[name][0],
  serviceCount: SERVICES[name].length,
}))

export const SAMPLE_SERVICE_IDS = {
  eyebrowThreading: 1,
  upperLipThreading: 2,
  fullFaceThreading: 7,
  halfArmsHoney: 17,
  underarmsHoney: 25,
  bridalFullPackage: ALL_SERVICES.find((s) => s.category === 'Bridal')?.id ?? null,
}

export const ADDON_SCENARIOS = Object.entries(SERVICE_ADDON_IDS).map(([serviceId, addonIds]) => ({
  serviceId: Number(serviceId),
  serviceName: ALL_SERVICES.find((s) => s.id === Number(serviceId))?.name,
  addonIds,
  addonNames: addonIds.map((id) => ALL_SERVICES.find((s) => s.id === id)?.name).filter(Boolean),
}))

export function buildDateScenarios(ref = new Date()) {
  const yesterday = offsetDays(-1, ref)
  const today = localDateIso(ref)
  const plus14 = offsetDays(14, ref)
  const plus15 = offsetDays(15, ref)
  const weekday2 = offsetWeekday(2, ref)
  const sunday = nextSunday(ref)

  return {
    today: { date: today, slotsExpect: 200, bookExpect: 'context' },
    plus14: { date: plus14, slotsExpect: 200, bookExpect: 'context' },
    plus15: { date: plus15, slotsExpect: 400, bookExpect: 400, reason: 'outside 14-day window' },
    yesterday: {
      date: yesterday,
      slotsExpect: isSundayIso(yesterday) ? 200 : 400,
      slotsClosed: isSundayIso(yesterday),
      bookExpect: 400,
      reason: isSundayIso(yesterday) ? 'Sunday closed (slots return closed:true)' : 'past date',
    },
    weekdayPlus2: { date: weekday2, slotsExpect: 200, bookExpect: 'context' },
    nextSunday: {
      date: sunday,
      slotsExpect: 200,
      slotsClosed: true,
      bookExpect: 400,
      reason: 'Salon closed Sundays',
    },
  }
}

export const BOOKING_CONTACT = {
  name: 'QA Workflow Test',
  phone: PHONES.probe,
  notes: 'Automated QA probe — safe to cancel',
}

export const CANCEL_TOKENS = {
  /** Real tokens are HMAC-signed from POST /api/book responses. */
  format: 'base64url(payload).base64url(hmac-sha256)',
  bookingIdPattern: /^FBS-[A-F0-9]{4,16}$/i,
  invalid: [
    { token: '', reason: 'empty' },
    { token: 'no-dot-here', reason: 'malformed' },
    { token: 'AAAA.invalidsig', reason: 'bad signature' },
  ],
  uiSmokeQuery:
    '/book/cancel?token=smoke&date=2026-06-15&time=14:00&id=FS-SMOKE&service=Threading&name=Test',
  confirmationSmokeQuery:
    '/book/confirmation?id=smoke-001&date=2026-05-20&time=10:00&service=Eyebrow%20Threading&name=Tester&duration=10',
}

export const STATIC_ROUTES = getStaticSitemapEntries().map(({ url }) => {
  const path = url.replace('https://farwasalon.com', '') || '/'
  return path
})

export const SERVICE_CATEGORY_ROUTES = Object.values(CAT_SLUGS).map((slug) => `/services/${slug}`)

export const BLOG_SLUGS = BLOG_POSTS.map((p) => p.slug)
export const BLOG_ROUTES = BLOG_SLUGS.map((slug) => `/blog/${slug}`)

export const LOCATION_SAMPLE_SLUGS = [
  'threading-in-pechs-karachi',
  'bridal-makeup-in-pechs-karachi',
  'facials-in-pechs-karachi',
  'threading-in-gulshan',
  'bridal-makeup-in-clifton-karachi',
  'bridal-makeup-in-dha',
  'threading-in-dha',
  'threading-in-bahadurabad',
  'waxing-in-tariq-road',
  'hair-in-dha',
]

export const LOCATION_ROUTES = LOCATION_SAMPLE_SLUGS.map((slug) => `/services/${slug}`)

export const SITEMAP_COUNTS = {
  static: getStaticSitemapEntries().length,
  services: getServiceCategorySitemapEntries().length,
  blog: getBlogSitemapEntries().length,
  locations: getLocationSitemapEntries().length,
  totalUrls:
    getStaticSitemapEntries().length +
    getServiceCategorySitemapEntries().length +
    getBlogSitemapEntries().length +
    getLocationSitemapEntries().length,
  neighborhoods: NEIGHBORHOODS.length,
  topServices: TOP_SERVICES.length,
  locationFormula: '18 priority -in- hubs (legacy best-* → 301)',
}

export const NAV_FOOTER_MATRIX = {
  navigate: [
    '/',
    '/services',
    '/book',
    '/gallery',
    '/blog',
    '/about',
    '/contact',
    '/faq',
    '/bridal',
  ],
  services: SERVICE_CATEGORY_ROUTES,
  hub: '/beauty-salon-karachi',
}

export const VIEWPORTS = [
  { width: 320, height: 568, label: '320' },
  { width: 375, height: 812, label: '375' },
  { width: 390, height: 844, label: '390' },
  { width: 768, height: 1024, label: '768' },
  { width: 1024, height: 768, label: '1024' },
  { width: 1280, height: 800, label: '1280' },
]

export const HTML_EXPECTATIONS = {
  '/': ['Farwa Beauty Salon', 'PECHS'],
  '/services': ['Services', 'ItemList'],
  '/book': ['Book an Appointment', 'id="main"'],
  '/gallery': ['Gallery'],
  '/blog': ['Blog'],
  '/bridal': ['Bridal'],
  '/contact': ['Book Appointment', 'wa.me'],
  '/beauty-salon-karachi': ['Karachi'],
  '/services/threading': ['Threading', 'Rs'],
  '/faq': ['Frequently', 'id="main"'],
  '/about': ['OUR', 'STORY'],
  '/privacy': ['Privacy Policy'],
}

export const API_SCENARIOS = (ref = new Date()) => {
  const dates = buildDateScenarios(ref)
  const sid = SAMPLE_SERVICE_IDS.eyebrowThreading
  const weekday = dates.weekdayPlus2.date

  return [
    {
      id: 'slots-today',
      method: 'GET',
      path: `/api/slots?date=${dates.today.date}&serviceId=${sid}`,
      expectStatus: 200,
    },
    {
      id: 'slots-plus14',
      method: 'GET',
      path: `/api/slots?date=${dates.plus14.date}&serviceId=${sid}`,
      expectStatus: 200,
    },
    {
      id: 'slots-plus15-reject',
      method: 'GET',
      path: `/api/slots?date=${dates.plus15.date}&serviceId=${sid}`,
      expectStatus: 400,
    },
    {
      id: dates.yesterday.slotsClosed ? 'slots-yesterday-sunday' : 'slots-yesterday-reject',
      method: 'GET',
      path: `/api/slots?date=${dates.yesterday.date}&serviceId=${sid}`,
      expectStatus: dates.yesterday.slotsExpect,
      bodyCheck: dates.yesterday.slotsClosed
        ? (b) => b?.closed === true
        : undefined,
    },
    {
      id: 'slots-addon',
      method: 'GET',
      path: `/api/slots?date=${weekday}&serviceId=${sid}&addonIds=2`,
      expectStatus: 200,
    },
    {
      id: 'subscribe-valid',
      method: 'POST',
      path: '/api/subscribe',
      body: {
        email: EMAILS.subscribeProbe('qa-workflow'),
        firstName: 'QA',
        source: 'qa-workflow-run',
      },
      expectStatusIn: [200, 503],
    },
    {
      id: 'subscribe-invalid-email',
      method: 'POST',
      path: '/api/subscribe',
      body: { email: 'not-an-email', firstName: 'QA', source: 'qa-workflow-run' },
      expectStatus: 400,
    },
    {
      id: 'book-past-date',
      method: 'POST',
      path: '/api/book',
      body: {
        serviceId: sid,
        date: dates.yesterday.date,
        time: SLOT_TIMES.valid[0],
        clientName: BOOKING_CONTACT.name,
        clientPhone: BOOKING_CONTACT.phone,
      },
      expectStatus: 400,
    },
    {
      id: 'book-invalid-time',
      method: 'POST',
      path: '/api/book',
      body: {
        serviceId: sid,
        date: weekday,
        time: SLOT_TIMES.invalid[0],
        clientName: BOOKING_CONTACT.name,
        clientPhone: BOOKING_CONTACT.phone,
      },
      expectStatus: 400,
    },
    {
      id: 'book-invalid-phone',
      method: 'POST',
      path: '/api/book',
      body: {
        serviceId: sid,
        date: weekday,
        time: SLOT_TIMES.valid[0],
        clientName: BOOKING_CONTACT.name,
        clientPhone: PHONES.invalid[0].value,
      },
      expectStatus: 400,
    },
    {
      id: 'cancel-invalid-token',
      method: 'POST',
      path: '/api/book/cancel',
      body: { token: 'invalid.token' },
      expectStatus: 400,
    },
    {
      id: 'cancel-invalid-booking-id',
      method: 'POST',
      path: '/api/book/cancel',
      body: { bookingId: 'BAD-ID', date: weekday },
      expectStatus: 400,
    },
  ]
}

export const ROUTE_CRAWL_PATHS = [
  ...STATIC_ROUTES,
  ...SERVICE_CATEGORY_ROUTES,
  '/blog/rss.xml',
  '/sitemap.xml',
  '/sitemap-static.xml',
  '/sitemap-services.xml',
  '/sitemap-blog.xml',
  '/sitemap-locations.xml',
  ...BLOG_ROUTES,
  ...LOCATION_ROUTES,
]

export const WHATSAPP = {
  number: WA_NUMBER,
  defaultLinkPattern: /wa\.me\/923222782254/,
}

export const DATASET_META = {
  generatedFrom: ['src/data.js', 'src/blog-data.js', 'src/location-seo.js', 'lib/sitemap-data.js'],
  categoryCount: SERVICE_CATEGORIES.length,
  serviceCount: ALL_SERVICES.length,
  blogPostCount: BLOG_POSTS.length,
  locationPageCount: getAllLocationServiceSlugs().length,
}
