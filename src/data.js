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

/** Before/after pairs for gallery compare slider */
export const GALLERY_COMPARE_PAIRS = [
  { before: '/threading.jpg', after: '/glow3.jpg', label: 'Threading & glow facial' },
  { before: '/bridal.jpg', after: '/bridal2.jpg', label: 'Bridal transformation' },
  { before: '/hairdo.jpg', after: '/hairtreatment.jpg', label: 'Hair styling & treatment' },
]

/*
 * CAT_META — one unique image per category, carefully mapped so no two
 * adjacent categories in the services grid share an asset.
 * All 13 categories now have unique dedicated images.
 */
export const CAT_META = {
  'Threading':       { img: '/threading.jpg',
    tagline: 'Precise brow & face threading from Rs 200',
    desc: 'Professional eyebrow and facial threading starting from Rs 200 at Farwa Beauty Salon in PECHS, Karachi. Threading uses a twisted cotton thread to remove unwanted hair with pinpoint precision, making it the gold standard for shaping brows, upper lip, chin, sideburns, and full face. This gentle technique is perfect for clients with sensitive, acne-prone, or reactive skin because no chemicals, wax, or heat ever touch the face — just a clean thread and our skilled hands. Expect perfectly sculpted, symmetrical brows and silky-smooth skin that lasts two to three weeks between visits. Our experienced aestheticians have been perfecting brow arches since 2008, tailoring every shape to complement your unique face structure and personal style. For best aftercare, avoid touching the freshly threaded area for a few hours and apply a gentle, alcohol-free moisturiser to soothe any temporary redness. Walk-ins are always welcome in PECHS, or book online at farwasalon.com/book for instant confirmation.' },
  'Rica Hot Wax':    { img: '/waxing.jpg',
    tagline: 'Gentle Rica stripless wax for face from Rs 150',
    desc: 'Rica hot wax facial hair removal starting from Rs 150 at Farwa Beauty Salon in PECHS, Karachi. Rica is a premium Italian stripless wax that adheres to hair rather than skin, making the process significantly less painful than traditional wax — especially on delicate areas like brows, upper lip, chin, and sideburns. This service is best suited for clients with sensitive or reactive skin who want a smoother, gentler alternative to regular strip wax on the face. The wax is applied warm and peeled off directly, removing even the shortest hairs from the root for results that last up to four weeks. Our full face Rica wax with mask treatment leaves skin smooth, hair-free, and deeply nourished in a single 30-minute session. After your appointment, avoid sun exposure and hot showers for 24 hours, and apply a calming aloe-based gel to keep the skin cool and irritation-free. Visit us in PECHS or book online or on WhatsApp.' },
  'Honey Wax':       { img: '/wax2.jpg',
    tagline: 'Body waxing — arms, legs & full body from Rs 400',
    desc: 'Honey wax hair removal starting from Rs 400 at Farwa Beauty Salon in PECHS, Karachi. Honey wax is a natural, resin-based strip wax that effectively removes hair from larger body areas including arms, legs, underarms, stomach, back, and hips. It is an excellent choice for clients who want smooth, hair-free skin at an affordable price, with results that typically last three to four weeks. The warm honey formula is applied thinly and removed with cloth strips, pulling hair from the root for a cleaner finish than shaving. With regular sessions, hair grows back finer and sparser over time, making each visit more comfortable than the last. Our full body honey wax package covers all major areas in a single one-hour appointment for maximum convenience. For best aftercare, exfoliate gently two to three days after your session and moisturise daily to prevent ingrown hairs. Book your appointment in PECHS book online at farwasalon.com/book or walk in anytime.' },
  'Rica Wax':        { img: '/oilwax.jpg',
    tagline: 'Premium Rica body wax from Rs 600',
    desc: 'Premium Rica body wax starting from Rs 600 at Farwa Beauty Salon in PECHS, Karachi. Rica strip wax is a professional Italian formula enriched with natural plant-based ingredients that removes body hair efficiently while being kinder to the skin than standard waxes. This service is ideal for clients who want a premium waxing experience for arms, legs, underarms, hips, stomach, back, and full body areas. Rica wax grips hair firmly while minimising skin irritation, delivering smooth results that last three to four weeks. The formula is suitable for all skin types including sensitive skin, and works even on shorter hair growth for a consistently clean finish. Our full body Rica wax package covers every major area in a single appointment, saving you time and ensuring a flawless result from head to toe. After your session, avoid tight clothing on waxed areas, skip hot baths for 24 hours, and moisturise daily to keep skin soft and prevent ingrown hairs. Visit us in PECHS or book online or on WhatsApp.' },
  'Bleach & Polish': { img: '/bleachpolish.jpg',
    tagline: 'Instant glow bleach & polish from Rs 400',
    desc: 'Face and body bleach and polish treatments starting from Rs 400 at Farwa Beauty Salon in PECHS, Karachi. Bleaching lightens unwanted facial and body hair to make it less visible, while polish treatments exfoliate dead skin cells to reveal a brighter, more even complexion underneath. These services are perfect for clients looking for an instant glow before events, weddings, or as part of a regular skincare routine. Choose from Loreal Whitening Face Bleach, Diamond Face Polish, or our luxurious Sandal Face Polish for a radiant, dewy finish that lasts up to two weeks. Many clients combine bleach and polish in a single session for maximum brightening results on hands, feet, arms, and face. For aftercare, avoid direct sunlight for 24 hours after treatment and apply sunscreen when heading outdoors to protect your freshly treated skin. Our experienced team has been delivering flawless glow treatments since 2008 in PECHS — book online or walk in.' },
  'Massage':         { img: '/massage.jpg',
    tagline: 'Head, back & full body massage from Rs 700',
    desc: 'Professional massage therapy starting from Rs 700 at Farwa Beauty Salon in PECHS, Karachi. Our massage services include targeted treatments for the head, back, arms, and legs, as well as a comprehensive full body massage for complete relaxation and tension relief. Massage is ideal for clients dealing with muscle stiffness, stress, headaches, or general fatigue — whether you need a quick 15-minute back session to ease office tension or a full 40-minute body treatment for deep rejuvenation. Our trained therapists use professional-grade oils and pressure-point techniques to improve blood circulation, release tight muscles, and promote overall well-being. Expect to feel noticeably lighter, more relaxed, and energised after every visit. Our popular head massage and wash combination is perfect for clients who want scalp relief plus freshly cleansed, conditioned hair. After your massage, drink plenty of water to flush out toxins and avoid strenuous activity for a few hours to maximise the benefits. Book online at farwasalon.com/book or on WhatsApp.' },
  'Hair Treatments': { img: '/hairtreatment.jpg',
    tagline: 'Protein, repair & scalp treatments from Rs 2,000',
    desc: 'Professional hair treatments starting from Rs 2,000 at Farwa Beauty Salon in PECHS, Karachi. We offer targeted solutions for common hair concerns including protein repair for dry and brittle hair, ampule-based treatments for hair fall and dandruff, Olorchee deep conditioning, and Wellaplex bond-strengthening therapy for chemically processed or heat-damaged strands. These treatments are best suited for anyone experiencing thinning, breakage, excessive shedding, flaky scalp, or dull, lifeless hair that needs professional intervention beyond regular home care. Expect visibly stronger, shinier, and more manageable hair after just one session — with optimal results building over a course of three to four monthly treatments. Our stylists assess your hair and scalp condition before recommending the right treatment plan tailored to your specific needs. For aftercare, avoid washing your hair for at least 48 hours after treatment and use a sulphate-free shampoo to prolong results. book online at farwasalon.com/book or walk in for a consultation.' },
  'Cleansing':       { img: '/facialcleansing.jpg',      video: '/cleansing.mp4',
    tagline: 'Deep pore cleansing facials from Rs 1,200',
    desc: 'Professional deep cleansing facials starting from Rs 1,200 at Farwa Beauty Salon in PECHS, Karachi. Deep cleansing goes beyond a regular face wash — our aestheticians use steam, extraction, and professional-grade products to remove blackheads, whiteheads, excess oil, and impurities trapped deep within your pores. This service is ideal for clients with oily, combination, or congested skin, as well as anyone preparing their complexion before a special event or maintaining a monthly skincare routine. Choose from HD Cleansing for high-definition pore extraction, Acne Cleansing for breakout-prone skin, White Glow Cleansing for a brightening boost, or our premium Janssen Whitening Cleansing using German cosmeceutical products for advanced skin clarity. Expect cleaner, tighter pores, reduced breakouts, and a visibly fresher complexion after every session. For aftercare, avoid heavy makeup for 24 hours, keep the skin hydrated with a light moisturiser, and apply sunscreen when going outdoors to protect freshly cleansed skin. Visit us in PECHS or book online or on WhatsApp.' },
  'Facials':         { img: '/glow3.jpg',
    tagline: '11 facials for every skin type from Rs 1,400',
    desc: 'Professional facials starting from Rs 1,400 at Farwa Beauty Salon in PECHS, Karachi, with 11 specialised treatments to suit every skin type and concern. Our facial menu ranges from gentle Herbal Organic Facials for sensitive skin to advanced Janssen Whitening Facials using premium German cosmeceuticals for stubborn pigmentation and dullness. Facials are perfect for anyone who wants to maintain healthy, glowing skin, address specific concerns like acne, dark spots, or uneven texture, or simply enjoy a relaxing, rejuvenating skincare experience. Each session includes cleansing, exfoliation, targeted treatment serums, massage, and a finishing mask tailored to your skin\'s unique needs. Expect a brighter, more hydrated complexion with improved tone and texture — visible results from the very first session, with cumulative benefits from regular visits every four to six weeks. For best aftercare, avoid direct sun exposure for 24 hours, skip harsh products for a day, and keep your skin well-moisturised. Our expert team has been delivering glowing results since 2008 — book online at farwasalon.com/book.' },
  'Nails':           { img: '/pedicure.jpg',       video: '/nails.mp4',
    tagline: 'Manicure, pedicure & nail art from Rs 300',
    desc: 'Professional manicure, pedicure, and nail art services starting from Rs 300 at Farwa Beauty Salon in PECHS, Karachi. Our nail menu covers everything from basic nail paint and filing to luxurious SPA manicures, paraffin treatments, French tips, and whitening pedicures — a complete range for beautifully groomed hands and feet. These services are perfect for clients who want well-maintained nails for daily confidence, special occasions, or as a regular self-care ritual. Each treatment includes careful cuticle care, shaping, and a polished finish, while our premium options add exfoliation, hydrating masks, and massage for the ultimate pampering experience. Expect salon-smooth hands and soft, refreshed feet with long-lasting colour that stays chip-free for days. Our whitening manicure and pedicure options also help even out skin tone on hands and feet for a brighter appearance. For best aftercare, wear gloves when washing dishes, apply cuticle oil daily, and moisturise your hands and feet every night to maintain results between visits. book online at farwasalon.com/book or walk in.' },
  'Bridal':          { img: '/bridal.jpg',
    tagline: 'Bridal makeup & trials from Rs 8,000',
    desc: 'Bridal makeup and styling packages starting from Rs 8,000 at Farwa Beauty Salon in PECHS, Karachi — backed by over 18 years of dedicated bridal artistry. Our bridal services cover every event in your wedding journey, from the engagement and mehndi to the nikkah and reception, ensuring you look stunning at every function. These packages are designed for brides who want a stress-free, all-inclusive beauty experience with a professional team handling makeup, hair styling, dupatta draping, and on-site touch-ups throughout the day. Our signature Full Bridal Package includes everything you need, while standalone options for engagement looks, mehndi styling, and bridal trials let you customise your wedding beauty plan. Expect flawless, long-lasting makeup that photographs beautifully under all lighting conditions, with styles tailored to your outfit, complexion, and personal preferences. We recommend booking two to three months in advance, especially during peak wedding season. Start with a full bridal trial so you walk down the aisle with total confidence — book your consultation online or on WhatsApp.' },
  'Hair':            { img: '/hairdo.jpg',
    tagline: 'Cuts, colour & styling from Rs 1,500',
    desc: 'Professional haircut, colour, and styling services starting from Rs 1,500 at Farwa Beauty Salon in PECHS, Karachi. Whether you need a precision cut tailored to your face shape, a fresh colour transformation with highlights or balayage, a salon-quality blowdry for a special occasion, or elegant bridal hair styling for your wedding day, our experienced stylists deliver beautiful results every time. Our hair services are ideal for anyone looking to refresh their look, maintain healthy ends, try a bold new colour, or need event-ready styling that holds all day and evening. Every appointment begins with a personal consultation to understand your hair texture, lifestyle, and desired outcome — because great hair starts with understanding what works uniquely for you. Expect vibrant, lasting colour, smooth and voluminous blowouts, and cuts that grow out gracefully between visits. For aftercare, use sulphate-free products to preserve colour, avoid excessive heat styling at home, and book a trim every six to eight weeks to keep your style looking fresh. Visit us in PECHS or book online or on WhatsApp.' },
  'Eyebrow Tattoo':  { img: '/eyebrowtattoo.jpg',  video: '/eyebrowtattoo.mp4',
    tagline: 'Microblading & powder brows from Rs 15,000',
    desc: 'Semi-permanent eyebrow tattooing starting from Rs 15,000 at Farwa Beauty Salon in PECHS, Karachi — including microblading, powder brows, and combination brow techniques. Eyebrow tattooing is a cosmetic procedure that implants pigment into the skin to create naturally fuller, perfectly shaped brows that last 12 to 18 months without daily makeup. This service is ideal for clients with sparse, over-plucked, or uneven brows, as well as anyone who wants to save time on their daily brow routine. Choose microblading for realistic hair-stroke detail, powder brows for a soft filled-in makeup look, or combination brows that blend both techniques for the most natural result. Every session includes a thorough brow design consultation, topical numbing for comfort, the tattooing procedure, and a complete aftercare kit. Expect beautifully defined brows that frame your face and enhance your features from the moment you leave the salon. For best results, avoid getting the brows wet for seven days after treatment, skip makeup on the area during healing, and apply the provided aftercare balm as directed. Book online at farwasalon.com/book or on WhatsApp.' },
}

/* ─── Unique meta descriptions per service category (SEO) ──── */
export const CAT_SEO = {
  'Threading':       { metaDesc: 'Expert eyebrow & face threading from Rs 200 at Farwa Salon, PECHS Karachi. Flawless brows since 2008. Book online today!' },
  'Rica Hot Wax':    { metaDesc: 'Gentle Rica hot wax from Rs 150 at Farwa Salon, PECHS Karachi. Italian stripless wax for face & sensitive skin. Book online today!' },
  'Honey Wax':       { metaDesc: 'Honey wax from Rs 400 at Farwa Salon, PECHS Karachi. Smooth arms, legs & full body — results last 3\u20134 weeks. Book online now!' },
  'Rica Wax':        { metaDesc: 'Premium Rica body wax from Rs 600 at Farwa Salon, PECHS Karachi. Silky-smooth arms, legs & full body. Book online today!' },
  'Bleach & Polish': { metaDesc: 'Face bleach & polish from Rs 400 at Farwa Salon, PECHS Karachi. Instant glow with Loreal & diamond treatments. Book online today!' },
  'Massage':         { metaDesc: 'Relaxing massage from Rs 700 at Farwa Salon, PECHS Karachi. Head, back & full body tension relief by experts. Book online today!' },
  'Hair Treatments': { metaDesc: 'Hair treatments from Rs 2,000 at Farwa Salon, PECHS Karachi. Protein, hair fall, dandruff & Wellaplex repair. Book online today!' },
  'Cleansing':       { metaDesc: 'Deep cleansing from Rs 1,200 at Farwa Salon, PECHS Karachi. HD, acne & Janssen whitening for clear, glowing skin. Book online now!' },
  'Facials':         { metaDesc: '11 professional facials from Rs 1,400 at Farwa Salon, PECHS Karachi. Whitening, HD, organic & Janssen options. Book your glow-up today!' },
  'Nails':           { metaDesc: 'Manicure & pedicure from Rs 300 at Farwa Salon, PECHS Karachi. SPA, French, paraffin & nail art for perfect nails. Book online!' },
  'Bridal':          { metaDesc: 'Bridal makeup from Rs 8,000 at Farwa Salon, PECHS Karachi. Trials, engagement & mehndi looks — 18+ years expertise. Book your trial now!' },
  'Hair':            { metaDesc: 'Haircuts, colour & styling from Rs 1,500 at Farwa Salon, PECHS Karachi. Cuts, blowdry, balayage & bridal updos. Book online today!' },
  'Eyebrow Tattoo':  { metaDesc: 'Microblading & powder brows from Rs 15,000 at Farwa Salon, PECHS Karachi. Semi-permanent brows lasting 12\u201318 months. Book online!' },
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
  { src: '/bleachpolish.jpg',      label: 'Glow' },
  { src: '/bridal2.jpg',    label: 'Bridal Look' },
  { src: '/hairtreatment.jpg', label: 'Radiance' },
  { src: '/oilwax.jpg',     label: 'Beauty' },
  { src: '/waxing.jpg',     label: 'Waxing' },
]
