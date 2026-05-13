/* ─── Config ─────────────────────────────────────────────────── */
export const WA_NUMBER  = '923222782254'
export const MAPS_LINK  = 'https://www.google.com/maps/place/Farwa+beauty+salon/@24.8797532,67.0584185,17z/data=!3m1!4b1!4m6!3m5!1s0x3eb33f2832975c79:0xe55ba4a44d34a210!8m2!3d24.8797532!4d67.0584185!16s%2Fg%2F11hdrwg03n'
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
  const { date = '', time = '', name = '' } = extra
  const header = [`Hi! I'd like to book an appointment at Farwa Beauty Salon.`]
  const svcBlock =
    trimmed.length === 0
      ? []
      : trimmed.length === 1
        ? [``, `Service: ${trimmed[0]}`]
        : [``, `Services:`, ...trimmed.map(s => `• ${s}`)]
  const meta = []
  if (name) meta.push(`Name: ${name}`)
  if (date) meta.push(`Preferred date: ${date}`)
  if (time) meta.push(`Preferred time: ${time}`)
  const body = [...header, ...svcBlock, ...(meta.length ? [``, ...meta] : [])].join('\n')
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(body)}`
}

/* ─── Founding ─────────────────────────────────────────────────── */
export const FOUNDING_YEAR = 2008
export const YEARS_ACTIVE  = new Date().getFullYear() - FOUNDING_YEAR

/* ─── Price / duration formatting ─────────────────────────────── */
export const formatPrice = (pkr) => {
  if (pkr == null) return null
  return pkr >= 1000 ? `Rs ${(pkr / 1000).toFixed(pkr % 1000 ? 1 : 0)}k` : `Rs ${pkr}`
}
export const formatDuration = (min) => {
  if (min == null) return null
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

/* ─── Analytics helper ────────────────────────────────────────── */
export function track(event, props) {
  window.plausible?.(event, { props })
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
    { id: _id++, name: 'Full Bridal Package', category: 'Bridal', pricePkr: null, durationMinutes: null,
      desc: 'Our signature all-day bridal experience — hair, makeup, draping, and touch-ups from preparation to reception.',
      includes: ['Bridal makeup', 'Hair styling', 'Dupatta draping', 'Touch-up kit', 'Event presence'] },
    { id: _id++, name: 'Bridal Trial', category: 'Bridal', pricePkr: null, durationMinutes: null,
      desc: 'A full preview of your wedding look so you walk down the aisle knowing you look perfect.',
      includes: ['Look consultation', 'Full hair & makeup trial', 'Photos for reference'] },
    { id: _id++, name: 'Engagement Look', category: 'Bridal', pricePkr: null, durationMinutes: null,
      desc: 'Glam-ready styling for your engagement — romantic, radiant, and completely you.',
      includes: ['Makeup application', 'Hair set', 'Lash application'] },
    { id: _id++, name: 'Mehndi / Dholki Look', category: 'Bridal', pricePkr: null, durationMinutes: null,
      desc: 'Vibrant, colourful, and festive — a look that celebrates the joy of pre-wedding functions.',
      includes: ['Festive makeup', 'Flower or jewellery hair styling', 'Setting spray'] },
  ],

  'Hair': [
    { id: _id++, name: 'Haircut & Blowdry', category: 'Hair', pricePkr: null, durationMinutes: null,
      desc: 'A precision cut and professional blowdry tailored to your face shape and hair texture.',
      includes: ['Consultation', 'Shampoo & condition', 'Cut & blowdry'] },
    { id: _id++, name: 'Hair Colour', category: 'Hair', pricePkr: null, durationMinutes: null,
      desc: 'Full-colour, highlights, balayage, or toning — rich, lasting colour applied with care.',
      includes: ['Colour consultation', 'Application', 'Toning & blowdry'] },
    { id: _id++, name: 'Blowdry & Styling', category: 'Hair', pricePkr: null, durationMinutes: null,
      desc: 'A salon-quality blowdry and finish — smooth, voluminous, or styled exactly as you like.',
      includes: ['Shampoo', 'Blowdry', 'Style & finish'] },
    { id: _id++, name: 'Bridal Hair Styling', category: 'Hair', pricePkr: null, durationMinutes: null,
      desc: 'Elegant updos, curls, braids or sleek styles — your perfect wedding hair, exactly as you envisioned.',
      includes: ['Style consultation', 'Blowout prep', 'Full styling', 'Finishing spray'] },
  ],

  'Eyebrow Tattoo': [
    { id: _id++, name: 'Microblading', category: 'Eyebrow Tattoo', pricePkr: null, durationMinutes: null,
      desc: 'Hair-stroke semi-permanent tattooing that creates naturally full, defined brows lasting 12–18 months.',
      includes: ['Brow design consultation', 'Numbing cream', 'Microblading', 'Aftercare kit'] },
    { id: _id++, name: 'Powder Brows', category: 'Eyebrow Tattoo', pricePkr: null, durationMinutes: null,
      desc: 'A soft, powdered makeup look tattooed semi-permanently — ideal for oily or mature skin types.',
      includes: ['Brow mapping', 'Numbing', 'Powder shading', 'Touch-up plan'] },
    { id: _id++, name: 'Combination Brows', category: 'Eyebrow Tattoo', pricePkr: null, durationMinutes: null,
      desc: 'The best of both worlds — hair strokes at the front blending into a soft powder fill at the tail.',
      includes: ['Full consultation', 'Microblading strokes', 'Powder shading', 'Aftercare pack'] },
  ],

}

export const ALL_SERVICES = Object.values(SERVICES).flat()
export const CATEGORIES   = ['All', ...Object.keys(SERVICES)]

/*
 * CAT_META — one unique image per category, carefully mapped so no two
 * adjacent categories in the services grid share an asset.
 * All 13 categories now have unique dedicated images.
 */
export const CAT_META = {
  'Threading':       { img: '/threading.jpg',  desc: 'Precision threading for brows, lips, and full face — quick, clean, and perfectly shaped every time.' },
  'Rica Hot Wax':    { img: '/waxing.jpg',     desc: 'Rica hot wax for face and sensitive areas — gentle, effective, and long-lasting results.' },
  'Honey Wax':       { img: '/wax2.jpg',       desc: 'Smooth, hair-free skin with natural honey wax — perfect for arms, legs, and body.' },
  'Rica Wax':        { img: '/oilwax.jpg',     desc: 'Premium Rica wax for a smooth finish that conditions your skin while removing hair.' },
  'Bleach & Polish': { img: '/glow2.jpg',       desc: 'Brightening bleach and polish treatments for face and body — revealing radiant, even-toned skin.' },
  'Massage':         { img: '/massage.jpg',    desc: 'Relaxing massages for back, arms, legs, and full body — tension released, body renewed.' },
  'Hair Treatments': { img: '/hairtreatment.jpg', desc: 'Targeted treatments for protein repair, hair fall, dandruff, and deep restoration.' },
  'Cleansing':       { img: '/cleansing.jpg',      video: '/cleansing.mp4',      desc: 'Deep cleansing treatments to purify, brighten, and refresh your skin from within.' },
  'Facials':         { img: '/glow3.jpg',                                        desc: 'A full range of facials — from everyday glow to premium whitening and anti-ageing treatments.' },
  'Nails':           { img: '/pedicure.jpg',       video: '/nails.mp4',          desc: 'Manicures, pedicures, nail art, and extensions — for hands and feet that make a statement.' },
  'Bridal':          { img: '/bridal.jpg',                                        desc: 'Complete wedding packages — from trials to the big day. We make every bride feel extraordinary.' },
  'Hair':            { img: '/hairdo.jpg',                                        desc: 'Cuts, colour, blowdrys, and styling for every hair type and texture.' },
  'Eyebrow Tattoo':  { img: '/eyebrowtattoo.jpg',  video: '/eyebrowtattoo.mp4',  desc: 'Semi-permanent brow definition — microblading, powder brows, and combination brows.' },
}

/* ─── Unique meta descriptions per service category (SEO) ──── */
export const CAT_SEO = {
  'Threading':       { metaDesc: 'Professional eyebrow, lip, and full face threading at Farwa Beauty Salon, PECHS Block 2, Karachi. Precision shaping from Rs 100. Book on WhatsApp.' },
  'Rica Hot Wax':    { metaDesc: 'Gentle Rica hot wax for face and sensitive areas at Farwa Beauty Salon, Karachi. Smooth, lasting results from Rs 150. PECHS Block 2.' },
  'Honey Wax':       { metaDesc: 'Natural honey wax for arms, legs, and full body at Farwa Beauty Salon, PECHS Block 2, Karachi. Prices from Rs 400. Book on WhatsApp.' },
  'Rica Wax':        { metaDesc: 'Premium Rica body wax — arms, legs, underarms, and full body at Farwa Beauty Salon, Karachi. From Rs 600. PECHS Block 2.' },
  'Bleach & Polish': { metaDesc: 'Face and body bleach, Loreal whitening, diamond polish, and sandal polish at Farwa Beauty Salon, PECHS Block 2, Karachi. From Rs 400.' },
  'Massage':         { metaDesc: 'Relaxing back, head, and full body massage at Farwa Beauty Salon, PECHS Block 2, Karachi. Sessions from Rs 700. Book on WhatsApp.' },
  'Hair Treatments': { metaDesc: 'Protein repair, hair fall treatment, dandruff control, and Wellaplex at Farwa Beauty Salon, PECHS Block 2, Karachi. From Rs 2,000.' },
  'Cleansing':       { metaDesc: 'HD cleansing, acne cleansing, and Janssen whitening deep cleanse at Farwa Beauty Salon, PECHS Block 2, Karachi. From Rs 1,200.' },
  'Facials':         { metaDesc: 'Professional facials in Karachi — organic, whitening, HD, Janssen, and anti-ageing treatments at Farwa Beauty Salon, PECHS Block 2. From Rs 1,400.' },
  'Nails':           { metaDesc: 'Manicure, pedicure, French tips, paraffin, and SPA nail treatments at Farwa Beauty Salon, PECHS Block 2, Karachi. From Rs 300.' },
  'Bridal':          { metaDesc: 'Complete bridal makeup packages in Karachi — trials, engagement looks, mehndi styling at Farwa Beauty Salon, PECHS Block 2. Book on WhatsApp.' },
  'Hair':            { metaDesc: 'Haircuts, colour, blowdry, and bridal hair styling at Farwa Beauty Salon, PECHS Block 2, Karachi. Expert stylists since 2008.' },
  'Eyebrow Tattoo':  { metaDesc: 'Microblading, powder brows, and combination brow tattoo at Farwa Beauty Salon, PECHS Block 2, Karachi. Semi-permanent results.' },
}

/* ─── FAQ content for popular categories (SEO + user value) ──── */
export const CAT_FAQS = {
  'Bridal': [
    { q: 'How far in advance should I book my bridal package?', a: 'We recommend booking at least 2–3 months ahead, especially during wedding season (October–March). This gives time for a trial, skincare prep, and any adjustments to your look.' },
    { q: 'Do you offer a bridal trial before the wedding day?', a: 'Yes — every bridal booking includes a full trial with hair, makeup, and dupatta draping. You\'ll get reference photos so both you and our team are perfectly aligned for the big day.' },
    { q: 'Can you do makeup for engagement and mehndi events too?', a: 'Absolutely. We offer dedicated looks for engagement, mehndi/dholki, nikkah, and reception — each styled to match the event\'s mood, your outfit, and your preferences.' },
    { q: 'What is included in the Full Bridal Package?', a: 'Our signature package includes bridal makeup, hair styling, dupatta draping, a touch-up kit, and event presence so we\'re there for any adjustments throughout the day.' },
  ],
  'Facials': [
    { q: 'How often should I get a facial?', a: 'For best results, we recommend a professional facial every 4–6 weeks. This aligns with your skin\'s natural renewal cycle and helps maintain clear, glowing skin between visits.' },
    { q: 'Which facial is best for oily or acne-prone skin?', a: 'Our Acne Facial (Rs 1,800) is specifically formulated for congested, oily skin. For deeper issues, HD Cleansing (Rs 1,700) combined with the Acne Facial gives excellent results.' },
    { q: 'What is the difference between HD Whitening Facial and Janssen Whitening Facial?', a: 'The HD Whitening Facial (Rs 3,000) uses high-definition brightening serums for visible results in one session. The Janssen Whitening Facial (Rs 5,500) uses premium German cosmeceutical products for deeper, longer-lasting brightening — ideal for pigmentation and uneven skin tone.' },
    { q: 'Are your facials suitable for sensitive skin?', a: 'Yes. We assess every client\'s skin before starting and adjust products accordingly. Our Herbal Organic Facial (Rs 1,600) is specifically designed for sensitive and reactive skin types.' },
  ],
  'Threading': [
    { q: 'Is threading better than waxing for eyebrows?', a: 'For eyebrows, threading offers superior precision — individual hairs can be targeted without affecting surrounding skin. It\'s the gold standard for brow shaping and ideal for sensitive or acne-prone skin.' },
    { q: 'How long does eyebrow threading take?', a: 'Eyebrow threading at Farwa takes about 10 minutes. A Full Face Threading session takes approximately 25 minutes.' },
    { q: 'Does threading hurt more than waxing?', a: 'Threading involves a brief, sharp sensation but no heat or chemicals touch your skin. Most clients find it less irritating than waxing, especially for facial areas. Any redness typically fades within 30 minutes.' },
    { q: 'How often should I get my eyebrows threaded?', a: 'Most clients come every 2–3 weeks to maintain a clean, defined shape. The timing depends on how quickly your hair grows — we\'ll recommend a schedule that works for your growth pattern.' },
  ],
}

export const GALLERY_PHOTOS = [
  { src: '/threading.jpg',  label: 'Threading' },
  { src: '/bridal.jpg',     label: 'Bridal' },
  { src: '/hairdo.jpg',     label: 'Hair Styling' },
  { src: '/glow3.jpg',      label: 'Facial' },
  { src: '/pedicure.jpg',   label: 'Pedicure' },
  { src: '/glow2.jpg',      label: 'Glow' },
  { src: '/bridal2.jpg',    label: 'Bridal Look' },
  { src: '/hairtreatment.jpg', label: 'Radiance' },
  { src: '/oilwax.jpg',     label: 'Beauty' },
  { src: '/waxing.jpg',     label: 'Waxing' },
]
