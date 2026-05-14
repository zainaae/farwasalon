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
    { id: _id++, name: 'Full Bridal Package', category: 'Bridal', pricePkr: 25000, durationMinutes: 300,
      desc: 'Our signature all-day bridal experience — hair, makeup, draping, and touch-ups from preparation to reception.',
      includes: ['Bridal makeup', 'Hair styling', 'Dupatta draping', 'Touch-up kit', 'Event presence'] },
    { id: _id++, name: 'Bridal Trial', category: 'Bridal', pricePkr: 8000, durationMinutes: 120,
      desc: 'A full preview of your wedding look so you walk down the aisle knowing you look perfect.',
      includes: ['Look consultation', 'Full hair & makeup trial', 'Photos for reference'] },
    { id: _id++, name: 'Engagement Look', category: 'Bridal', pricePkr: 12000, durationMinutes: 150,
      desc: 'Glam-ready styling for your engagement — romantic, radiant, and completely you.',
      includes: ['Makeup application', 'Hair set', 'Lash application'] },
    { id: _id++, name: 'Mehndi / Dholki Look', category: 'Bridal', pricePkr: 10000, durationMinutes: 120,
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
    { id: _id++, name: 'Microblading', category: 'Eyebrow Tattoo', pricePkr: 15000, durationMinutes: 120,
      desc: 'Hair-stroke semi-permanent tattooing that creates naturally full, defined brows lasting 12–18 months.',
      includes: ['Brow design consultation', 'Numbing cream', 'Microblading', 'Aftercare kit'] },
    { id: _id++, name: 'Powder Brows', category: 'Eyebrow Tattoo', pricePkr: 15000, durationMinutes: 120,
      desc: 'A soft, powdered makeup look tattooed semi-permanently — ideal for oily or mature skin types.',
      includes: ['Brow mapping', 'Numbing', 'Powder shading', 'Touch-up plan'] },
    { id: _id++, name: 'Combination Brows', category: 'Eyebrow Tattoo', pricePkr: 18000, durationMinutes: 150,
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
  'Threading':       { img: '/threading.jpg',  desc: 'Eyebrow threading from Rs 200 in PECHS Karachi — precision shaping for brows, lips & full face. Expert results since 2008.' },
  'Rica Hot Wax':    { img: '/waxing.jpg',     desc: 'Rica hot wax from Rs 150 in PECHS Karachi — gentle Italian stripless wax for face and sensitive areas. Less pain, smoother skin.' },
  'Honey Wax':       { img: '/wax2.jpg',       desc: 'Honey wax from Rs 400 in PECHS Karachi — smooth, hair-free arms, legs and body with natural honey strip wax.' },
  'Rica Wax':        { img: '/oilwax.jpg',     desc: 'Rica body wax from Rs 600 in PECHS Karachi — premium Italian strip wax for arms, legs, underarms and full body.' },
  'Bleach & Polish': { img: '/glow2.jpg',       desc: 'Face bleach & polish from Rs 400 in PECHS Karachi — Loreal whitening, diamond polish and sandal glow for radiant skin.' },
  'Massage':         { img: '/massage.jpg',    desc: 'Massage from Rs 700 in PECHS Karachi — head, back, full body. Professional pressure-point therapy to release tension.' },
  'Hair Treatments': { img: '/hairtreatment.jpg', desc: 'Hair treatments from Rs 2,000 in PECHS Karachi — protein repair, hair fall control, Wellaplex and keratin at Farwa Salon.' },
  'Cleansing':       { img: '/cleansing.jpg',      video: '/cleansing.mp4',      desc: 'Deep cleansing from Rs 1,200 in PECHS Karachi — HD cleansing, acne treatment and Janssen whitening at Farwa Salon.' },
  'Facials':         { img: '/glow3.jpg',                                        desc: 'Professional facials from Rs 1,400 in PECHS Karachi — 11 treatments including whitening, HD, gold & Janssen. Expert skincare since 2008.' },
  'Nails':           { img: '/pedicure.jpg',       video: '/nails.mp4',          desc: 'Manicure & pedicure from Rs 300 in PECHS Karachi — nail art, SPA pedicure, French tips and paraffin treatments.' },
  'Bridal':          { img: '/bridal.jpg',                                        desc: 'Bridal makeup packages in Karachi from Rs 8,000 — trials, engagement, mehndi & full-day styling. 18+ years of bridal expertise.' },
  'Hair':            { img: '/hairdo.jpg',                                        desc: 'Haircut & styling from Rs 1,500 in PECHS Karachi — cuts, colour, blowdry & bridal updos by expert stylists.' },
  'Eyebrow Tattoo':  { img: '/eyebrowtattoo.jpg',  video: '/eyebrowtattoo.mp4',  desc: 'Microblading & powder brows from Rs 15,000 in Karachi — semi-permanent brow definition with numbing and aftercare kit.' },
}

/* ─── Unique meta descriptions per service category (SEO) ──── */
export const CAT_SEO = {
  'Threading':       { metaDesc: 'Eyebrow threading from Rs 100 at Farwa Beauty Salon, PECHS Block 2, Karachi. Precision brow, lip & full-face threading since 2008. Book on WhatsApp — walk-ins welcome.' },
  'Rica Hot Wax':    { metaDesc: 'Rica hot wax from Rs 150 at Farwa Beauty Salon, PECHS Block 2, Karachi. Gentle Italian stripless wax for face, underarms & sensitive areas. Book on WhatsApp.' },
  'Honey Wax':       { metaDesc: 'Honey wax from Rs 400 at Farwa Beauty Salon, PECHS Block 2, Karachi. Natural strip wax for arms, legs & full body — smooth results lasting 3–4 weeks. Book on WhatsApp.' },
  'Rica Wax':        { metaDesc: 'Rica body wax from Rs 600 at Farwa Beauty Salon, PECHS Block 2, Karachi. Premium Italian strip wax for arms, legs, underarms & full body. Book on WhatsApp.' },
  'Bleach & Polish': { metaDesc: 'Face bleach & polish from Rs 400 at Farwa Beauty Salon, PECHS Block 2, Karachi. Loreal whitening bleach, diamond & sandal polish for radiant skin. Book on WhatsApp.' },
  'Massage':         { metaDesc: 'Massage from Rs 700 at Farwa Beauty Salon, PECHS Block 2, Karachi. Head, back & full body massage — professional pressure-point relief. Book on WhatsApp.' },
  'Hair Treatments': { metaDesc: 'Hair treatments from Rs 2,000 at Farwa Beauty Salon, PECHS Block 2, Karachi. Protein repair, hair fall ampule, dandruff control & Wellaplex. Book on WhatsApp.' },
  'Cleansing':       { metaDesc: 'Deep cleansing from Rs 1,200 at Farwa Beauty Salon, PECHS Block 2, Karachi. HD cleansing, acne extraction & Janssen whitening cleanse. Book on WhatsApp.' },
  'Facials':         { metaDesc: '11 professional facials from Rs 1,400 at Farwa Beauty Salon, PECHS Block 2, Karachi. Whitening, HD, gold, Janssen & organic facials — expert skincare since 2008. Book on WhatsApp.' },
  'Nails':           { metaDesc: 'Manicure & pedicure from Rs 300 at Farwa Beauty Salon, PECHS Block 2, Karachi. Nail art, SPA pedicure, French tips, paraffin & gel. Book on WhatsApp.' },
  'Bridal':          { metaDesc: 'Bridal makeup packages from Rs 8,000 at Farwa Beauty Salon, PECHS Block 2, Karachi. Full trials, engagement, mehndi & reception looks — 18+ years of bridal artistry. Book on WhatsApp.' },
  'Hair':            { metaDesc: 'Haircuts, colour & styling from Rs 1,500 at Farwa Beauty Salon, PECHS Block 2, Karachi. Cuts, blowdry, bridal updos & balayage — expert stylists since 2008. Book on WhatsApp.' },
  'Eyebrow Tattoo':  { metaDesc: 'Microblading & powder brows from Rs 15,000 at Farwa Beauty Salon, PECHS Block 2, Karachi. Semi-permanent brows with numbing, aftercare kit & 2-hour session. Book on WhatsApp.' },
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
  'Nails': [
    { q: 'How long does a manicure or pedicure take?', a: 'A standard manicure takes about 30 minutes, while a pedicure takes around 40 minutes. Spa treatments and nail art sessions may take 45–60 minutes depending on complexity.' },
    { q: 'What is included in the SPA Pedicure?', a: 'Our SPA Pedicure (Rs 1,200) includes a foot soak, exfoliation scrub, cuticle care, callus removal, hydrating mask, massage, and polish application. It\'s a full pampering experience for tired feet.' },
    { q: 'Do you offer nail art and custom designs?', a: 'Yes — our nail artists create custom designs, French tips, ombre, marble effects, and seasonal styles. Bring reference photos or let our team design something unique for you.' },
  ],
  'Hair': [
    { q: 'How much does a haircut cost at Farwa?', a: 'A haircut with professional blowdry starts at Rs 2,000. This includes a consultation, shampoo, conditioning, precision cut, and styled blowdry.' },
    { q: 'Do you do bridal hair styling?', a: 'Yes — bridal hair styling (Rs 8,000) includes a style consultation, blowout prep, full styling (updos, curls, braids, or sleek looks), and finishing spray. It\'s also part of our Full Bridal Package.' },
    { q: 'What hair colouring options do you offer?', a: 'We offer full-colour, highlights, balayage, and toning starting at Rs 4,000. Colour consultations are included to ensure the perfect shade for your skin tone and hair type.' },
  ],
  'Eyebrow Tattoo': [
    { q: 'How long does microblading last?', a: 'Microblading typically lasts 12–18 months depending on skin type, sun exposure, and aftercare. Oily skin types may need a touch-up sooner. We provide a complete aftercare kit with every session.' },
    { q: 'What is the difference between microblading and powder brows?', a: 'Microblading creates individual hair-like strokes for a natural look. Powder brows give a soft, filled-in makeup effect. Combination brows blend both techniques — strokes at the front with powder shading at the tail.' },
    { q: 'Does eyebrow tattooing hurt?', a: 'We apply a topical numbing cream before the procedure so most clients feel only mild pressure. The full session takes about 2 hours including consultation, numbing, and the tattooing process.' },
    { q: 'How much does microblading cost in Karachi?', a: 'At Farwa Beauty Salon, microblading and powder brows start at Rs 15,000. Combination brows are Rs 18,000. All sessions include a brow design consultation, numbing, the procedure, and an aftercare kit.' },
  ],
  'Massage': [
    { q: 'What types of massage do you offer?', a: 'We offer head massage, back massage, full arm massage, full leg massage, and complete full body massage. All massages use professional-grade oils and techniques to release tension and improve circulation.' },
    { q: 'How long is a full body massage?', a: 'A full body massage session lasts approximately 60 minutes. Individual area massages (head, back, arms, or legs) take 15–30 minutes each.' },
    { q: 'Can I combine massage with other treatments?', a: 'Absolutely — many clients pair a massage with a facial or waxing session for a complete pampering visit. Let us know when booking and we\'ll schedule everything together.' },
  ],
  'Hair Treatments': [
    { q: 'What is the best treatment for hair fall?', a: 'Our Hair Fall Treatment with Ampule (Rs 3,000) targets thinning and excessive shedding using concentrated nutrient ampules. For best results, we recommend a course of 3 monthly sessions.' },
    { q: 'What is a Wellaplex treatment?', a: 'Wellaplex (Rs 3,000) is a bond-strengthening treatment that repairs hair damaged by colour, heat, or chemical processing. It restores elasticity, shine, and strength from within the hair shaft.' },
    { q: 'How often should I get a protein treatment?', a: 'A protein treatment every 6–8 weeks is ideal for maintaining strong, healthy hair. If your hair is chemically processed or heat-styled frequently, monthly treatments give the best protection.' },
  ],
  'Cleansing': [
    { q: 'What is the difference between HD Cleansing and Acne Cleansing?', a: 'HD Cleansing (Rs 1,700) uses high-definition extraction techniques for general deep pore cleaning. Acne Cleansing (Rs 1,200) specifically targets active breakouts with antibacterial products and gentle extraction.' },
    { q: 'How often should I get a professional deep cleanse?', a: 'We recommend a deep cleansing every 4–6 weeks for oily or combination skin, and every 6–8 weeks for normal or dry skin. Regular cleansing prevents blackheads, whiteheads, and congestion.' },
    { q: 'Is the Janssen Whitening Deep Cleanse safe for sensitive skin?', a: 'The Janssen Whitening Deep Cleanse (Rs 2,800) uses professional German cosmeceutical products that are dermatologically tested. We always assess your skin before starting and can adjust the treatment intensity.' },
  ],
  'Bleach & Polish': [
    { q: 'What is the difference between bleach and polish?', a: 'Bleach lightens facial and body hair to make it less visible, while polish removes dead skin cells for a smoother, brighter complexion. Many clients combine both for a radiant, even-toned result.' },
    { q: 'Is face bleach safe for sensitive skin?', a: 'Our Loreal Whitening Face Bleach (Rs 650) is formulated for facial use and suitable for most skin types. We always do a patch check first. If you have very reactive skin, let us know and we\'ll use a gentler option.' },
    { q: 'How long do bleach and polish results last?', a: 'Face bleach results typically last 2–3 weeks as new hair growth appears. Polish results are immediate and last about a week before the natural skin renewal cycle continues. Monthly sessions maintain the best results.' },
  ],
  'Rica Hot Wax': [
    { q: 'What is Rica hot wax and how is it different from regular wax?', a: 'Rica hot wax is a premium Italian stripless wax that adheres to hair rather than skin. It\'s gentler, less painful, and ideal for sensitive areas like the face, underarms, and bikini line.' },
    { q: 'Is Rica wax suitable for sensitive skin?', a: 'Yes — Rica hot wax is specifically designed for sensitive skin. It doesn\'t pull on the skin like strip wax, reducing redness and irritation. Many clients with eczema-prone or reactive skin prefer it.' },
    { q: 'How long should hair be before a Rica wax appointment?', a: 'Hair should be at least 5mm (about 2 weeks of growth) for the wax to grip effectively. Avoid shaving between appointments for the smoothest results.' },
  ],
  'Honey Wax': [
    { q: 'What areas can be treated with honey wax?', a: 'Honey wax is versatile and suitable for arms, legs, underarms, and larger body areas. For facial areas and sensitive zones, we recommend Rica hot wax for a gentler experience.' },
    { q: 'How long do honey wax results last?', a: 'Honey wax results typically last 3–4 weeks. With regular sessions, hair grows back finer and sparser over time. We recommend booking every 3–4 weeks for consistently smooth skin.' },
    { q: 'Is honey wax painful?', a: 'There\'s a brief pulling sensation during strip removal, but it\'s quick. Our aestheticians work efficiently to minimise discomfort. After the first session, most clients find subsequent sessions much easier as the hair becomes finer.' },
  ],
  'Rica Wax': [
    { q: 'What is the difference between Rica Wax and Rica Hot Wax?', a: 'Rica Wax (strip wax) is a premium Italian formula used with cloth strips — ideal for large body areas like arms, legs, and back. Rica Hot Wax is stripless and applied directly — best for small, sensitive areas like face and underarms.' },
    { q: 'How much does full body Rica wax cost?', a: 'Full Body Rica Wax at Farwa Beauty Salon costs Rs 4,000. This includes arms, legs, underarms, and other body areas. Individual area pricing starts from Rs 600.' },
    { q: 'Can I get Rica wax during pregnancy?', a: 'Rica wax is generally safe during pregnancy as it\'s gentle and doesn\'t contain harsh chemicals. However, skin may be more sensitive during pregnancy — please let our team know so we can adjust pressure and temperature accordingly.' },
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
