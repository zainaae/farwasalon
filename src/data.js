/* ─── Config ─────────────────────────────────────────────────── */
export const WA_NUMBER  = '923222782254'
export const MAPS_LINK  = 'https://share.google/DVB5zqvtHKgPA7G6U'
export const IG_LINK    = 'https://www.instagram.com/farwasalon/'
export const WA_DEFAULT = `https://wa.me/${WA_NUMBER}?text=Hi%21%20I%27d%20like%20to%20book%20an%20appointment%20at%20Farwa%20Beauty%20Salon.`
export const waLink = (service = '') =>
  service
    ? `https://wa.me/${WA_NUMBER}?text=Hi%21%20I%27d%20like%20to%20book%20*${encodeURIComponent(service)}*%20at%20Farwa%20Beauty%20Salon.`
    : WA_DEFAULT

/* ─── Services ────────────────────────────────────────────────── */
let _id = 1
const s = (name, category) => ({ id: _id++, name, category })

export const SERVICES = {

  'Threading': [
    s('Eyebrow Threading',        'Threading'),
    s('Upper Lip Threading',      'Threading'),
    s('Chin Threading',           'Threading'),
    s('Forehead Threading',       'Threading'),
    s('Sideburns Threading',      'Threading'),
    s('Full Face Threading',      'Threading'),
    s('Neck Threading',           'Threading'),
  ],

  'Hot Wax': [
    s('Upper Lip Hot Wax',        'Hot Wax'),
    s('Chin Hot Wax',             'Hot Wax'),
    s('Underarms Hot Wax',        'Hot Wax'),
    s('Half Arms Hot Wax',        'Hot Wax'),
    s('Full Arms Hot Wax',        'Hot Wax'),
    s('Half Legs Hot Wax',        'Hot Wax'),
    s('Full Legs Hot Wax',        'Hot Wax'),
    s('Bikini Hot Wax',           'Hot Wax'),
    s('Full Body Hot Wax',        'Hot Wax'),
  ],

  'Cold Wax': [
    s('Upper Lip Cold Wax',       'Cold Wax'),
    s('Chin Cold Wax',            'Cold Wax'),
    s('Underarms Cold Wax',       'Cold Wax'),
    s('Half Arms Cold Wax',       'Cold Wax'),
    s('Full Arms Cold Wax',       'Cold Wax'),
    s('Half Legs Cold Wax',       'Cold Wax'),
    s('Full Legs Cold Wax',       'Cold Wax'),
    s('Back Cold Wax',            'Cold Wax'),
    s('Stomach Cold Wax',         'Cold Wax'),
    s('Full Body Cold Wax',       'Cold Wax'),
  ],

  'Oil Wax': [
    s('Upper Lip Oil Wax',        'Oil Wax'),
    s('Chin Oil Wax',             'Oil Wax'),
    s('Underarms Oil Wax',        'Oil Wax'),
    s('Half Arms Oil Wax',        'Oil Wax'),
    s('Full Arms Oil Wax',        'Oil Wax'),
    s('Half Legs Oil Wax',        'Oil Wax'),
    s('Full Legs Oil Wax',        'Oil Wax'),
    s('Full Body Oil Wax',        'Oil Wax'),
  ],

  'Bleach & Polish': [
    s('Face Bleach',              'Bleach & Polish'),
    s('Neck Bleach',              'Bleach & Polish'),
    s('Full Arms Bleach',         'Bleach & Polish'),
    s('Full Legs Bleach',         'Bleach & Polish'),
    s('Full Body Bleach',         'Bleach & Polish'),
    s('Face Polish',              'Bleach & Polish'),
    s('Arms Polish',              'Bleach & Polish'),
    s('Legs Polish',              'Bleach & Polish'),
    s('Back Polish',              'Bleach & Polish'),
    s('Full Body Polish',         'Bleach & Polish'),
  ],

  'Massage': [
    s('Head Massage',             'Massage'),
    s('Face Massage',             'Massage'),
    s('Shoulder Massage',         'Massage'),
    s('Back Massage',             'Massage'),
    s('Arms Massage',             'Massage'),
    s('Legs Massage',             'Massage'),
    s('Foot Massage',             'Massage'),
    s('Full Body Massage',        'Massage'),
  ],

  'Hair Treatments': [
    s('Protein Treatment',        'Hair Treatments'),
    s('Keratin Treatment',        'Hair Treatments'),
    s('Hair Fall Treatment',      'Hair Treatments'),
    s('Dandruff Treatment',       'Hair Treatments'),
    s('Deep Conditioning',        'Hair Treatments'),
  ],

  'Cleansing': [
    s('Basic Cleansing',          'Cleansing'),
    s('Deep Cleansing',           'Cleansing'),
    s('Blackhead Removal',        'Cleansing'),
    s('Pore Cleansing Facial',    'Cleansing'),
  ],

  'Facials': [
    s('Basic Facial',             'Facials'),
    s('Gold Facial',              'Facials'),
    s('Diamond Facial',           'Facials'),
    s('Whitening Facial',         'Facials'),
    s('Anti-Ageing Facial',       'Facials'),
    s('Fruit Facial',             'Facials'),
    s('Oxygen Facial',            'Facials'),
    s('D-Tan Facial',             'Facials'),
    s('Brightening Facial',       'Facials'),
    s('Hydrating Facial',         'Facials'),
    s('Premium Facial',           'Facials'),
  ],

  'Nails': [
    s('Basic Manicure',           'Nails'),
    s('French Manicure',          'Nails'),
    s('Gel Manicure',             'Nails'),
    s('Paraffin Manicure',        'Nails'),
    s('Basic Pedicure',           'Nails'),
    s('French Pedicure',          'Nails'),
    s('Gel Pedicure',             'Nails'),
    s('Paraffin Pedicure',        'Nails'),
    s('Nail Extensions (Acrylic)','Nails'),
    s('Nail Extensions (Gel)',    'Nails'),
    s('Nail Art – Simple',        'Nails'),
    s('Nail Art – Detailed',      'Nails'),
    s('Nail Art – Bridal',        'Nails'),
    s('Nail Removal',             'Nails'),
    s('Nail Repair',              'Nails'),
    s('Buff & Shine',             'Nails'),
    s('Cuticle Care',             'Nails'),
    s('Nail Wraps',               'Nails'),
  ],

  'Bridal': [
    { id: _id++, name: 'Full Bridal Package', category: 'Bridal',
      desc: 'Our signature all-day bridal experience — hair, makeup, draping, and touch-ups from preparation to reception.',
      includes: ['Bridal makeup', 'Hair styling', 'Dupatta draping', 'Touch-up kit', 'Event presence'] },
    { id: _id++, name: 'Bridal Trial', category: 'Bridal',
      desc: 'A full preview of your wedding look so you walk down the aisle knowing you look perfect.',
      includes: ['Look consultation', 'Full hair & makeup trial', 'Photos for reference'] },
    { id: _id++, name: 'Engagement Look', category: 'Bridal',
      desc: 'Glam-ready styling for your engagement — romantic, radiant, and completely you.',
      includes: ['Makeup application', 'Hair set', 'Lash application'] },
    { id: _id++, name: 'Mehndi / Dholki Look', category: 'Bridal',
      desc: 'Vibrant, colourful, and festive — a look that celebrates the joy of pre-wedding functions.',
      includes: ['Festive makeup', 'Flower or jewellery hair styling', 'Setting spray'] },
  ],

  'Hair': [
    { id: _id++, name: 'Haircut & Blowdry', category: 'Hair',
      desc: 'A precision cut and professional blowdry tailored to your face shape and hair texture.',
      includes: ['Consultation', 'Shampoo & condition', 'Cut & blowdry'] },
    { id: _id++, name: 'Hair Colour', category: 'Hair',
      desc: 'Full-colour, highlights, balayage, or toning — rich, lasting colour applied with care.',
      includes: ['Colour consultation', 'Application', 'Toning & blowdry'] },
    { id: _id++, name: 'Blowdry & Styling', category: 'Hair',
      desc: 'A salon-quality blowdry and finish — smooth, voluminous, or styled exactly as you like.',
      includes: ['Shampoo', 'Blowdry', 'Style & finish'] },
    { id: _id++, name: 'Bridal Hair Styling', category: 'Hair',
      desc: 'Elegant updos, curls, braids or sleek styles — your perfect wedding hair, exactly as you envisioned.',
      includes: ['Style consultation', 'Blowout prep', 'Full styling', 'Finishing spray'] },
  ],

  'Eyebrow Tattoo': [
    { id: _id++, name: 'Microblading', category: 'Eyebrow Tattoo',
      desc: 'Hair-stroke semi-permanent tattooing that creates naturally full, defined brows lasting 12–18 months.',
      includes: ['Brow design consultation', 'Numbing cream', 'Microblading', 'Aftercare kit'] },
    { id: _id++, name: 'Powder Brows', category: 'Eyebrow Tattoo',
      desc: 'A soft, powdered makeup look tattooed semi-permanently — ideal for oily or mature skin types.',
      includes: ['Brow mapping', 'Numbing', 'Powder shading', 'Touch-up plan'] },
    { id: _id++, name: 'Combination Brows', category: 'Eyebrow Tattoo',
      desc: 'The best of both worlds — hair strokes at the front blending into a soft powder fill at the tail.',
      includes: ['Full consultation', 'Microblading strokes', 'Powder shading', 'Aftercare pack'] },
  ],

}

export const ALL_SERVICES = Object.values(SERVICES).flat()
export const CATEGORIES   = ['All', ...Object.keys(SERVICES)]

/*
 * CAT_META — one unique image per category, carefully mapped so no two
 * adjacent categories in the services grid share an asset.
 * Intentional family-share (replace when a dedicated asset arrives):
 *   Hair + Hair Treatments → hairdo.jpg (hair family)
 */
export const CAT_META = {
  'Threading':       { img: '/threading.jpg',  desc: 'Precision threading for brows, lips, and full face — quick, clean, and perfectly shaped every time.' },
  'Hot Wax':         { img: '/waxing.png',     desc: 'Hot wax for sensitive areas — gentle, effective, and long-lasting results.' },
  'Cold Wax':        { img: '/wax2.jpg',       desc: 'Smooth, hair-free skin with our cold wax formulation — perfect for arms, legs, and body.' },
  'Oil Wax':         { img: '/glow3.jpg',      desc: 'Nourishing oil wax for a smooth finish that conditions your skin while removing hair.' },
  'Bleach & Polish': { img: '/glow.jpg',       desc: 'Brightening bleach and polish treatments for face and body — revealing radiant, even-toned skin.' },
  'Massage':         { img: '/massage.jpg',    desc: 'Relaxing massages for back, arms, legs, and full body — tension released, body renewed.' },
  'Hair Treatments': { img: '/hairdo.jpg',     desc: 'Targeted treatments for protein repair, hair fall, dandruff, and deep restoration.' },
  'Cleansing':       { img: '/cleansing.jpg',  desc: 'Deep cleansing treatments to purify, brighten, and refresh your skin from within.' },
  'Facials':         { img: '/glow2.png',      desc: 'A full range of facials — from everyday glow to premium whitening and anti-ageing treatments.' },
  'Nails':           { img: '/pedicure.jpg',   desc: 'Manicures, pedicures, nail art, and extensions — for hands and feet that make a statement.' },
  'Bridal':          { img: '/bridal.jpg',     desc: 'Complete wedding packages — from trials to the big day. We make every bride feel extraordinary.' },
  'Hair':            { img: '/hairdo.jpg',     desc: 'Cuts, colour, blowdrys, and styling for every hair type and texture.' },
  'Eyebrow Tattoo':  { img: '/eyebrowtattoo.jpg', desc: 'Semi-permanent brow definition — microblading, powder brows, and combination brows.' },
}

export const GALLERY_PHOTOS = [
  { src: '/threading.jpg',  label: 'Threading' },
  { src: '/bridal.jpg',     label: 'Bridal' },
  { src: '/hairdo.jpg',     label: 'Hair Styling' },
  { src: '/facial.jpg',     label: 'Facial' },
  { src: '/pedicure.jpg',   label: 'Pedicure' },
  { src: '/glow.jpg',       label: 'Glow' },
  { src: '/bridal2.jpg',    label: 'Bridal Look' },
  { src: '/glow3.jpg',      label: 'Radiance' },
  { src: '/glow2.png',      label: 'Beauty' },
  { src: '/waxing.png',     label: 'Waxing' },
]

/*
 * TESTIMONIALS — PLACEHOLDER content awaiting real Google/Facebook reviews.
 * Replace via one of:
 *   A. Google Places API — set VITE_GOOGLE_PLACES_KEY + VITE_GOOGLE_PLACE_ID
 *      in .env.local; the Home page will fetch fresh reviews on load.
 *   B. Manual paste — swap the objects below, keep the shape.
 *   C. Third-party widget — replace TestimonialsPreview in Home.jsx.
 *
 * Shape: { id, source, stars, date, name, role, company, content, avatar }
 *   source: 'google' | 'facebook' | 'direct'
 *   stars:  1–5
 *   date:   ISO string (optional)
 */
export const TESTIMONIALS = [
  { id: 1, source: 'google', stars: 5, date: '2024-08-12',
    name: 'Aisha K.', role: 'Bride', company: 'Full Bridal Package',
    content: 'Rubina Aapi made my wedding day absolutely perfect. I had been her client for years but nothing prepared me for how I felt on my nikah. Every bride in Karachi deserves this kind of care.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
  { id: 2, source: 'google', stars: 5, date: '2024-05-03',
    name: 'Sana R.', role: 'Regular Client', company: 'Since 2019',
    content: 'I have been coming to Farwa for over 5 years and I will never go anywhere else. The team genuinely cares, the work is flawless, and the standard never slips — visit after visit.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face' },
  { id: 3, source: 'facebook', stars: 5, date: '2024-02-18',
    name: 'Mehwish T.', role: 'Monthly Member', company: 'Skincare & Nails',
    content: 'Best salon in PECHS — no question. My skin has transformed since I started doing monthly Gold Facials here. The nail art is always exactly what I asked for.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face' },
]
