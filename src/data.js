export {
  WA_NUMBER,
  MAPS_LINK,
  GOOGLE_REVIEW_LINK,
  SALON_LAT,
  SALON_LNG,
  IG_LINK,
  WA_DEFAULT,
  waLink,
  waLinkBooking,
  PHONE_RE,
  FOUNDING_YEAR,
  YEARS_ACTIVE,
  formatPrice,
  formatDuration,
  track,
  CAT_SLUGS,
  slugToCategory,
} from './site-config.js'

/* ─── Services ────────────────────────────────────────────────── */
let _id = 1
const s = (name, category, pricePkr = null, durationMinutes = null) => ({ id: _id++, name, category, pricePkr, durationMinutes })

export const SERVICES = {

  'Threading': [
    s('Eyebrow Threading',        'Threading', 200, 10),
    s('Upper Lip Threading',      'Threading', 150, 5),
    s('Lower Lip Threading',      'Threading', 100, 5),
    s('Forehead Threading',       'Threading', 150, 10),
    s('Chin Threading',           'Threading', 100, 5),
    s('Sideburns Threading',      'Threading', 250, 10),
    s('Full Face Threading',      'Threading', 1200, 25),
  ],

  'Rica Hot Wax': [
    s('Eyebrows Rica Wax',        'Rica Hot Wax', 300, 10),
    s('Nose Rica Wax',            'Rica Hot Wax', 250, 10),
    s('Upper Lip Rica Wax',       'Rica Hot Wax', 200, 10),
    s('Lower Lip Rica Wax',       'Rica Hot Wax', 150, 10),
    s('Forehead Rica Wax',        'Rica Hot Wax', 250, 10),
    s('Chin Rica Wax',            'Rica Hot Wax', 300, 10),
    s('Face Sides Rica Wax',      'Rica Hot Wax', 300, 15),
    s('Back Neck Rica Wax',       'Rica Hot Wax', 500, 15),
    s('Full Face with Mask',      'Rica Hot Wax', 1200, 30),
  ],

  'Honey Wax': [
    s('Half Arms Honey Wax',      'Honey Wax', 600, 20),
    s('Full Arms Honey Wax',      'Honey Wax', 700, 25),
    s('Half Legs Honey Wax',      'Honey Wax', 700, 25),
    s('Full Legs Honey Wax',      'Honey Wax', 1200, 40),
    s('Hips Honey Wax',           'Honey Wax', 500, 15),
    s('Stomach Honey Wax',        'Honey Wax', 600, 20),
    s('Back Honey Wax',           'Honey Wax', 600, 20),
    s('Back Neck Honey Wax',      'Honey Wax', 400, 10),
    s('Underarms Honey Wax',      'Honey Wax', 400, 15),
    s('Under Legs Honey Wax',     'Honey Wax', 1000, 30),
    s('Full Body Honey Wax',      'Honey Wax', 2800, 60),
  ],

  'Rica Wax': [
    s('Half Arms Rica Wax',       'Rica Wax', 750, 20),
    s('Full Arms Rica Wax',       'Rica Wax', 900, 25),
    s('Half Legs Rica Wax',       'Rica Wax', 900, 25),
    s('Full Legs Rica Wax',       'Rica Wax', 1600, 40),
    s('Hips Rica Wax',            'Rica Wax', 800, 15),
    s('Stomach Rica Wax',         'Rica Wax', 800, 20),
    s('Back Rica Wax',            'Rica Wax', 800, 20),
    s('Underarms Rica Wax',       'Rica Wax', 600, 15),
    s('Under Legs Rica Wax',      'Rica Wax', 1300, 30),
    s('Full Body Rica Wax',       'Rica Wax', 4000, 60),
  ],

  'Bleach & Polish': [
    s('Hands Bleach',             'Bleach & Polish', 400, 15),
    s('Feet Bleach',              'Bleach & Polish', 500, 15),
    s('Loreal Whitening Face Bleach', 'Bleach & Polish', 650, 20),
    s('Half Arms Bleach',         'Bleach & Polish', 800, 20),
    s('Full Arms Bleach',         'Bleach & Polish', 1000, 25),
    s('Loreal Face Polish',       'Bleach & Polish', 900, 25),
    s('Diamond Face Polish',      'Bleach & Polish', 1000, 25),
    s('Sandal Face Polish',       'Bleach & Polish', 1200, 30),
    s('Body Bleach',              'Bleach & Polish', 4000, 45),
  ],

  'Massage': [
    s('Back Massage',             'Massage', 700, 15),
    s('Arms Massage',             'Massage', 700, 15),
    s('Head Massage',             'Massage', 700, 15),
    s('Half Legs Massage',        'Massage', 700, 15),
    s('Full Legs Massage',        'Massage', 1400, 30),
    s('Head Massage & Wash',      'Massage', 1500, 30),
    s('Full Body Massage',        'Massage', 2500, 40),
  ],

  'Hair Treatments': [
    s('Normal Protein Treatment',        'Hair Treatments', 2000, 45),
    s('Hair Fall Treatment with Ampule', 'Hair Treatments', 3000, 40),
    s('Dandruff Treatment with Ampule',  'Hair Treatments', 3000, 40),
    s('Olorchee Treatment',              'Hair Treatments', 2500, 45),
    s('Wellaplex Stand-Alone Treatment', 'Hair Treatments', 3000, 60),
  ],

  'Cleansing': [
    s('HD Cleansing',             'Cleansing', 1700, 40),
    s('White Glow Cleansing',     'Cleansing', 1200, 35),
    s('Acne Cleansing',           'Cleansing', 1400, 35),
    s('Janssen Whitening Cleansing', 'Cleansing', 3000, 45),
  ],

  'Facials': [
    s('Normal Facial',            'Facials', 1400, 45),
    s('Herbal Organic Facial',    'Facials', 1600, 50),
    s('Acne Facial',              'Facials', 1800, 50),
    s('Whitening Facial',         'Facials', 1900, 55),
    s('White Glow Facial',        'Facials', 2000, 55),
    s("T.J's Facial",             'Facials', 2500, 60),
    s('Whitening Fruit Facial',   'Facials', 2600, 60),
    s('Oxy Glow Facial',          'Facials', 2800, 60),
    s('HD Whitening Facial',      'Facials', 3000, 65),
    s('Ultra Brightening Facial', 'Facials', 3500, 70),
    s('Janssen Whitening Facial', 'Facials', 5500, 75),
  ],

  'Nails': [
    s('Nail Paint',               'Nails', 300, 15),
    s('Nail Filing',              'Nails', 300, 10),
    s('Nail Filing & Shining',    'Nails', 600, 20),
    s('French Tips',              'Nails', 700, 25),
    s('Normal Manicure',          'Nails', 900, 30),
    s('Normal Pedicure',          'Nails', 1000, 35),
    s('Whitening Manicure',       'Nails', 1200, 35),
    s('Whitening Pedicure',       'Nails', 1400, 40),
    s('Jessica Manicure',         'Nails', 1200, 35),
    s('Jessica Pedicure',         'Nails', 1300, 35),
    s('Paraffin Manicure',        'Nails', 1300, 40),
    s('Paraffin Pedicure',        'Nails', 1300, 40),
    s('SPA Manicure',             'Nails', 1400, 45),
    s('SPA Pedicure',             'Nails', 1400, 45),
    s('Whitening Paraffin Manicure', 'Nails', 1600, 50),
    s('Whitening Paraffin Pedicure', 'Nails', 1600, 50),
    s('French Manicure',          'Nails', 1600, 45),
    s('French Pedicure',          'Nails', 1600, 45),
  ],

  'Bridal': [
    { id: _id++, name: 'Full Bridal Package', category: 'Bridal', pricePkr: 25000, durationMinutes: 300, maxWorkers: 3,
      desc: 'Our signature all-day bridal experience — hair, makeup, draping, and touch-ups from preparation to reception.',
      includes: ['Bridal makeup', 'Hair styling', 'Dupatta draping', 'Touch-up kit', 'Event presence'] },
    { id: _id++, name: 'Bridal Trial', category: 'Bridal', pricePkr: 8000, durationMinutes: 120, maxWorkers: 3,
      desc: 'A full preview of your wedding look so you walk down the aisle knowing you look perfect.',
      includes: ['Look consultation', 'Full hair & makeup trial', 'Photos for reference'] },
    { id: _id++, name: 'Engagement Look', category: 'Bridal', pricePkr: 12000, durationMinutes: 150, maxWorkers: 3,
      desc: 'Glam-ready styling for your engagement — romantic, radiant, and completely you.',
      includes: ['Makeup application', 'Hair set', 'Lash application'] },
    { id: _id++, name: 'Mehndi / Dholki Look', category: 'Bridal', pricePkr: 10000, durationMinutes: 120, maxWorkers: 3,
      desc: 'Vibrant, colourful, and festive — a look that celebrates the joy of pre-wedding functions.',
      includes: ['Festive makeup', 'Flower or jewellery hair styling', 'Setting spray'] },
  ],

  'Hair': [
    { id: _id++, name: 'Haircut & Blowdry', category: 'Hair', pricePkr: 2000, durationMinutes: 60,
      desc: 'A precision cut and professional blowdry tailored to your face shape and hair texture.',
      includes: ['Consultation', 'Shampoo & condition', 'Cut & blowdry'] },
    { id: _id++, name: 'Hair Colour', category: 'Hair', pricePkr: 4000, durationMinutes: 120,
      desc: 'Full-colour, highlights, balayage, or toning — rich, lasting colour applied with care.',
      includes: ['Colour consultation', 'Application', 'Toning & blowdry'] },
    { id: _id++, name: 'Blowdry & Styling', category: 'Hair', pricePkr: 1500, durationMinutes: 45,
      desc: 'A salon-quality blowdry and finish — smooth, voluminous, or styled exactly as you like.',
      includes: ['Shampoo', 'Blowdry', 'Style & finish'] },
    { id: _id++, name: 'Bridal Hair Styling', category: 'Hair', pricePkr: 8000, durationMinutes: 120,
      desc: 'Elegant updos, curls, braids or sleek styles — your perfect wedding hair, exactly as you envisioned.',
      includes: ['Style consultation', 'Blowout prep', 'Full styling', 'Finishing spray'] },
  ],

  'Eyebrow Tattoo': [
    { id: _id++, name: 'Microblading', category: 'Eyebrow Tattoo', pricePkr: 20000, durationMinutes: 120,
      desc: 'Hair-stroke semi-permanent tattooing that creates naturally full, defined brows lasting 12–18 months.',
      includes: ['Brow design consultation', 'Numbing cream', 'Microblading', 'Aftercare kit'] },
    { id: _id++, name: 'Powder Brows', category: 'Eyebrow Tattoo', pricePkr: 20000, durationMinutes: 120,
      desc: 'A soft, powdered makeup look tattooed semi-permanently — ideal for oily or mature skin types.',
      includes: ['Brow mapping', 'Numbing', 'Powder shading', 'Touch-up plan'] },
    { id: _id++, name: 'Combination Brows', category: 'Eyebrow Tattoo', pricePkr: 23000, durationMinutes: 150,
      desc: 'The best of both worlds — hair strokes at the front blending into a soft powder fill at the tail.',
      includes: ['Full consultation', 'Microblading strokes', 'Powder shading', 'Aftercare pack'] },
  ],

}

export const ALL_SERVICES = Object.values(SERVICES).flat()
export const CATEGORIES   = ['All', ...Object.keys(SERVICES)]

/** Wax submenu categories grouped under a single "Waxing" filter tab. */
export const WAXING_CATEGORIES = new Set(['Rica Hot Wax', 'Honey Wax', 'Rica Wax'])

/** Filter tabs covering all 13 service categories (Waxing groups three wax menus). */
export const SERVICE_FILTER_TABS = [
  'All',
  'Bridal',
  'Facials',
  'Threading',
  'Nails',
  'Hair',
  'Massage',
  'Waxing',
  'Cleansing',
  'Eyebrow Tattoo',
  'Hair Treatments',
  'Bleach & Polish',
]

export function filterServiceCategories(categories, activeTab) {
  if (activeTab === 'All') return categories
  if (activeTab === 'Waxing') return categories.filter((c) => WAXING_CATEGORIES.has(c))
  return categories.filter((c) => c === activeTab)
}

/** Default concurrent stations when a service has no maxWorkers */
export const DEFAULT_MAX_WORKERS = 2

/** Per-service station cap for slot conflict checks (bridal uses more chairs) */
export function getServiceMaxWorkers(service) {
  if (service?.maxWorkers != null && service.maxWorkers > 0) return service.maxWorkers
  if (service?.category === 'Bridal') return 3
  return DEFAULT_MAX_WORKERS
}

/** First bookable service id in a category (for SEO landing CTAs) */
export function getDefaultServiceIdForCategory(categoryName) {
  const list = SERVICES[categoryName]
  return list?.[0]?.id ?? null
}

/** Bookable service id by exact name (for CTA labels that target a specific service) */
export function getServiceIdByName(name) {
  return ALL_SERVICES.find((s) => s.name === name)?.id ?? null
}

/** Optional add-on service ids shown during booking confirm step */
export const SERVICE_ADDON_IDS = {
  1: [2],       // Eyebrow Threading → Upper Lip
  7: [2, 4],    // Full Face → Upper Lip, Forehead
  17: [25],     // Half Arms Honey → Underarms Honey
}

export function getAddonsForService(serviceId) {
  const ids = SERVICE_ADDON_IDS[serviceId] || []
  return ids
    .map((id) => ALL_SERVICES.find((s) => s.id === id))
    .filter(Boolean)
}

/** Featured service samples for gallery showcase (single image per service — not before/after pairs) */
export const GALLERY_SHOWCASE_ITEMS = [
  { src: '/glow3.jpg', label: 'Threading & glow facial', alt: 'Facial glow treatment at Farwa Beauty Salon' },
  { src: '/bridal.jpg', label: 'Bridal styling', alt: 'Bridal makeup and styling at Farwa Beauty Salon' },
  { src: '/pedicure.jpg', label: 'Manicure & pedicure', alt: 'Nail services at Farwa Beauty Salon', video: '/manicurephotography.mp4' },
]

/*
 * CAT_META — one unique image per category, carefully mapped so no two
 * adjacent categories in the services grid share an asset.
 * All 13 categories now have unique dedicated images.
 */
export const CAT_META = {
  'Threading':       { img: '/threading.jpg',    video: '/threading.mp4',
    tagline: 'Precise brow & face threading from Rs 100' },
  'Rica Hot Wax':    { img: '/waxing.jpg',
    tagline: 'Gentle Rica stripless wax for face from Rs 150' },
  'Honey Wax':       { img: '/wax2.jpg',
    tagline: 'Body waxing — arms, legs & full body from Rs 400' },
  'Rica Wax':        { img: '/oilwax.jpg',
    tagline: 'Premium Rica body wax from Rs 600' },
  'Bleach & Polish': { img: '/bleachpolish.jpg',
    tagline: 'Instant glow bleach & polish from Rs 400' },
  'Massage':         { img: '/massage.jpg',      video: '/massage.mp4',
    tagline: 'Head, back & full body massage from Rs 700' },
  'Hair Treatments': { img: '/hairtreatment.jpg',
    tagline: 'Protein, repair & scalp treatments from Rs 2,000' },
  'Cleansing':       { img: '/facialcleansing.jpg',      video: '/cleansing.mp4',
    tagline: 'Deep pore cleansing facials from Rs 1,200' },
  'Facials':         { img: '/glow3.jpg',        video: '/facials.mp4',
    tagline: '11 facials for every skin type from Rs 1,400' },
  'Nails':           { img: '/pedicure.jpg',       video: '/manicurephotography.mp4',
    tagline: 'Manicure, pedicure & nail art from Rs 300' },
  'Bridal':          { img: '/bridal.jpg',       video: '/bridal-makeup.mp4',
    tagline: 'Bridal makeup & trials from Rs 8,000' },
  'Hair':            { img: '/hairdo.jpg',       video: '/hairstyling.mp4',
    tagline: 'Cuts, colour & styling from Rs 1,500' },
  'Eyebrow Tattoo':  { img: '/eyebrowtattoo.jpg',  video: '/eyebrowtattoo.mp4',
    tagline: 'Microblading & powder brows from Rs 20,000' },
}


export const GALLERY_PHOTOS = [
  { src: '/threading.jpg',  label: 'Threading' },
  { src: '/bridal.jpg',     label: 'Bridal' },
  { src: '/hairdo.jpg',     label: 'Hair Styling' },
  { src: '/glow3.jpg',      label: 'Facial' },
  { src: '/pedicure.jpg',   label: 'Pedicure' },
  { src: '/bleachpolish.jpg',      label: 'Glow' },
  { src: '/bridal2.jpg',    label: 'Bridal Look' },
  { src: '/hairtreatment.jpg', label: 'Radiance' },
  { src: '/oilwax.jpg',     label: 'Beauty' },
  { src: '/waxing.jpg',     label: 'Waxing' },
]

