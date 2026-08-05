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
  MONTHLY_APPOINTMENTS,
  formatPrice,
  formatServicePrice,
  formatDuration,
  track,
  CAT_SLUGS,
  slugToCategory,
  PREFERRED_TIME_OPTIONS,
  SALON_HOURS,
} from './site-config.js'

/* ─── Services ────────────────────────────────────────────────── */
let _id = 1
/* `fromPrice` marks a service whose final cost genuinely depends on the head it
   is done on — hair length and density change how much product and chair time a
   colour or a treatment takes. Those prices are a floor, not a quote, and the
   site says so everywhere a price is shown rather than surprising someone at the
   counter. The blog already explained this ("Why Colour Says From Rs 4,000");
   the menu now matches it. */
const s = (name, category, pricePkr = null, durationMinutes = null, opts = {}) => ({
  id: _id++, name, category, pricePkr, durationMinutes, ...opts,
})
const HAIR_DEPENDENT = { fromPrice: true }

export const SERVICES = {

  'Threading': [
    s('Eyebrow Threading',        'Threading', 200, 10, { desc: "Cotton thread lifts individual hairs, so the brow is shaped rather than approximated. Most clients come back every two to three weeks to keep the line clean." }),
    s('Upper Lip Threading',      'Threading', 150, 5, { desc: "Five minutes for the upper lip. If the hair there is too fine or soft to grip, bleach is the better tool — threading fine hair over a wide area irritates more than it helps." }),
    s('Lower Lip Threading',      'Threading', 100, 5, { desc: "The strip below the lip, done in five minutes. Usually booked alongside the upper lip rather than on its own." }),
    s('Forehead Threading',       'Threading', 150, 10, { desc: "For hair on the forehead itself, not the brow line. If the growth is soft and widespread rather than defined, bleach handles it with less irritation." }),
    s('Chin Threading',           'Threading', 100, 5, { desc: "Five minutes for the chin. Removal lasts three to four weeks and leaves none of the shadow that bleached hair shows as it grows back." }),
    s('Sideburns Threading',      'Threading', 250, 10, { desc: "The line in front of the ears, shaped with thread rather than wax — no heat or chemicals touch the skin, which suits acne-prone or reactive faces." }),
    s('Full Face Threading',      'Threading', 1200, 25, { desc: "Every threaded area in one 25-minute sitting instead of booking them one at a time. If you only want two or three areas cleaned up, book those individually — it comes to less." }),
  ],

  'Rica Hot Wax': [
    s('Eyebrows Rica Wax',        'Rica Hot Wax', 300, 10, { desc: "Stripless wax on the brow area for anyone who prefers wax to thread. For shape work, threading gives more control over individual hairs — and costs less." }),
    s('Nose Rica Wax',            'Rica Hot Wax', 250, 10, { desc: "Ten minutes for the nose, using the same stripless Italian wax as the rest of this menu — it grips the hair rather than the skin." }),
    s('Upper Lip Rica Wax',       'Rica Hot Wax', 200, 10, { desc: "Wax rather than thread on the upper lip, clearing the whole strip in one pull instead of hair by hair. Threading the same area costs less if you do not mind the thread." }),
    s('Lower Lip Rica Wax',       'Rica Hot Wax', 150, 10, { desc: "A small area and ten minutes — the lowest-priced item on this menu. Works as an add-on to an upper lip or chin appointment." }),
    s('Forehead Rica Wax',        'Rica Hot Wax', 250, 10, { desc: "Clears the forehead in one go rather than hair by hair. Threading is the safer choice if your skin is reactive; wax is quicker if it is not." }),
    s('Chin Rica Wax',            'Rica Hot Wax', 300, 10, { desc: "Stripless wax on the chin. Chin threading costs a third of this and both pull from the root — choose wax if thread on the chin is not for you." }),
    s('Face Sides Rica Wax',      'Rica Hot Wax', 300, 15, { desc: "The cheek area, where hair is often too widespread to thread comfortably. If the growth is very fine, bleach is a better answer than either." }),
    s('Back Neck Rica Wax',       'Rica Hot Wax', 500, 15, { desc: "The nape — worth doing when you wear your hair up or off the shoulder. The honey wax menu covers the same area for less if your skin is not reactive." }),
    s('Full Face with Mask',      'Rica Hot Wax', 1200, 30, { desc: "Every face area waxed in one 30-minute session and finished with a mask. Booking those areas individually adds up to considerably more." }),
  ],

  'Honey Wax': [
    s('Half Arms Honey Wax',      'Honey Wax', 600, 20, { desc: "Half the arm rather than the full length. Honey is our standard strip wax and the better value on body areas if your skin is not reactive." }),
    s('Full Arms Honey Wax',      'Honey Wax', 700, 25, { desc: "The whole arm in one sitting — a small step up from half arms in both time and cost, so most clients booking both halves take this instead." }),
    s('Half Legs Honey Wax',      'Honey Wax', 700, 25, { desc: "Half the leg rather than the full length, in about 25 minutes. Full legs costs less than booking half legs twice." }),
    s('Full Legs Honey Wax',      'Honey Wax', 1200, 40, { desc: "Both legs, full length, in about forty minutes. Hair needs roughly two weeks of growth or the wax cannot grip and the session feels patchy." }),
    s('Hips Honey Wax',           'Honey Wax', 500, 15, { desc: "Fifteen minutes on the hips. This is one of the areas the full body session already covers, so check that first if you are booking several zones." }),
    s('Stomach Honey Wax',        'Honey Wax', 600, 20, { desc: "The stomach on its own, in about twenty minutes. Also included in the full body session if you are having three or more areas done." }),
    s('Back Honey Wax',           'Honey Wax', 600, 20, { desc: "The back, done with strip wax in about twenty minutes. One of the areas most people cannot reach themselves, and also part of the full body session." }),
    s('Back Neck Honey Wax',      'Honey Wax', 400, 10, { desc: "The nape, in ten minutes. The Rica hot wax version of this area costs more and is the one to choose if the skin there reacts easily." }),
    s('Underarms Honey Wax',      'Honey Wax', 400, 15, { desc: "Underarms with strip wax. This is the one area we usually point clients to Rica for instead — less irritation on thinner skin, for a small difference in price." }),
    s('Under Legs Honey Wax',     'Honey Wax', 1000, 30),
    s('Full Body Honey Wax',      'Honey Wax', 2800, 60, { desc: "Arms, legs, underarms, stomach, back, hips and the back of the neck in one hour rather than area by area. Booking those zones separately comes to considerably more." }),
  ],

  'Rica Wax': [
    s('Half Arms Rica Wax',       'Rica Wax', 750, 20, { desc: "The same area as the honey version, done with the Italian strip formula. Worth the difference if you wax often or your skin reddens; otherwise honey does the job." }),
    s('Full Arms Rica Wax',       'Rica Wax', 900, 25, { desc: "The whole arm with Rica strip wax. If waxing has never given your skin trouble, the honey menu covers the same area for less." }),
    s('Half Legs Rica Wax',       'Rica Wax', 900, 25, { desc: "Half the leg in the gentler formula. Full legs costs less than two half-leg bookings, so choose on how much you actually want done." }),
    s('Full Legs Rica Wax',       'Rica Wax', 1600, 40, { desc: "Both legs, full length, about forty minutes. The gentler of the two full-leg options — pick honey if your skin takes strip wax without fuss." }),
    s('Hips Rica Wax',            'Rica Wax', 800, 15, { desc: "Fifteen minutes on the hips with the Rica formula. Already covered by the full body session if you are booking several areas at once." }),
    s('Stomach Rica Wax',         'Rica Wax', 800, 20, { desc: "The stomach in the Rica formula, which is kinder on skin that has reacted to honey wax on this area before." }),
    s('Back Rica Wax',            'Rica Wax', 800, 20, { desc: "The back with Rica rather than honey. The same twenty minutes, with less irritation on skin that tends to flare after waxing." }),
    s('Underarms Rica Wax',       'Rica Wax', 600, 15, { desc: "Underarms are thinner-skinned than most areas, and this is where the Rica formula earns its extra cost for most clients." }),
    s('Under Legs Rica Wax',      'Rica Wax', 1300, 30),
    s('Full Body Rica Wax',       'Rica Wax', 4000, 60, { desc: "Every body area in one hour using the Rica formula. Honey covers exactly the same zones for less — book this if you have reactive skin or have found waxing painful before." }),
  ],

  'Bleach & Polish': [
    s('Hands Bleach',             'Bleach & Polish', 400, 15, { desc: "Lightens the visible hair on the hands so it blends with your skin tone. Bleach does not lighten skin — if uneven tone is the concern, polish or a facial is the right service." }),
    s('Feet Bleach',              'Bleach & Polish', 500, 15, { desc: "Hair lightening on the feet — the same treatment as hands bleach over a slightly larger area, in about fifteen minutes." }),
    s('Loreal Whitening Face Bleach', 'Bleach & Polish', 650, 20, { desc: "Despite the name, this lightens facial hair rather than skin. Fine upper-lip and jawline hair stops reading as shadow for two to three weeks. It will not touch pigmentation." }),
    s('Half Arms Bleach',         'Bleach & Polish', 800, 20, { desc: "Bleach on half the arm, for fine hair that is too soft or too widespread to thread or wax comfortably." }),
    s('Full Arms Bleach',         'Bleach & Polish', 1000, 25, { desc: "The full arm. With hands bleach, this covers everything anyone actually sees for a quarter of what full body bleach costs." }),
    s('Loreal Face Polish',       'Bleach & Polish', 900, 25, { desc: "An exfoliating polish that lifts dead surface cells, so skin looks brighter within the hour rather than over days. The workhorse of the three, and what most of our regulars book." }),
    s('Diamond Face Polish',      'Bleach & Polish', 1000, 25, { desc: "A finer grit than the Loreal polish, leaving a slightly crisper finish that photographs better under flash. The one to book before an event." }),
    s('Sandal Face Polish',       'Bleach & Polish', 1200, 30, { desc: "The gentlest of the three polishes, sandalwood-based, and what we reach for on skin that finds the others too brisk. Worth the difference if you redden easily." }),
    s('Body Bleach',              'Bleach & Polish', 4000, 45, { desc: "Full-body hair lightening, and the service we talk clients out of most often. It earns its cost for a bride in a sleeveless blouse; for everyday use, hands and arms cover what is seen." }),
  ],

  'Massage': [
    s('Back Massage',             'Massage', 700, 15, { desc: "Fifteen focused minutes on the back and shoulders, with oil. The best value on this menu when you already know where the stiffness is — desk work, usually." }),
    s('Arms Massage',             'Massage', 700, 15, { desc: "Fifteen minutes on the arms. One of four single-area options at the same price, so book the one that matches where you actually ache." }),
    s('Head Massage',             'Massage', 700, 15, { desc: "Fifteen minutes of scalp work, and the one clients book for tension headaches. Worth adding before a hair treatment, where it helps the product go in rather than sit on the hair." }),
    s('Half Legs Massage',        'Massage', 700, 15, { desc: "Fifteen minutes for legs tired from a day on your feet. It is the shorter half of the full legs option rather than a different treatment." }),
    s('Full Legs Massage',        'Massage', 1400, 30, { desc: "Thirty minutes across both legs. If it is general fatigue rather than one sore spot, this is where clients report the biggest difference — legs are undertreated." }),
    s('Head Massage & Wash',      'Massage', 1500, 30, { desc: "Thirty minutes of scalp work followed by a wash and dry, so you leave with clean hair rather than oiled hair to deal with at home. The most repeated booking here." }),
    s('Full Body Massage',        'Massage', 2500, 40, { desc: "Forty minutes with oil across neck and shoulders, back, arms and legs. A brisk, practical massage rather than a ninety-minute spa ritual, and we do not price it as one." }),
  ],

  'Hair Treatments': [
    s('Normal Protein Treatment',        'Hair Treatments', 2000, 45, { ...HAIR_DEPENDENT, desc: "For hair that stretches before it snaps — coloured, chemically treated or heat-styled. Results build across sessions rather than arriving in one, so every four to six weeks is the pattern." }),
    s('Hair Fall Treatment with Ampule', 'Hair Treatments', 3000, 40, { ...HAIR_DEPENDENT, desc: "Concentrated nutrient ampules aimed at shedding and thinning, usually as a course of three monthly sessions. If shedding is heavy and persistent, a dermatologist is the better first stop than a salon chair." }),
    s('Dandruff Treatment with Ampule',  'Hair Treatments', 3000, 40, { ...HAIR_DEPENDENT, desc: "The same ampule format applied to a flaky scalp rather than to shedding. Dandruff that returns within days of every wash is worth a doctor's view rather than repeat salon sessions." }),
    s('Olorchee Treatment',              'Hair Treatments', 2500, 45, { ...HAIR_DEPENDENT, desc: "Deep conditioning for hair that is dry and dull rather than damaged. The gentlest treatment here, suits all hair types, and works as maintenance between the stronger ones." }),
    s('Wellaplex Stand-Alone Treatment', 'Hair Treatments', 3000, 60, { ...HAIR_DEPENDENT, desc: "Bond repair for hair damaged by colour or bleach. Stand-alone means booked on its own — we normally run it alongside a colour service, so this is for damage already done." }),
  ],

  'Cleansing': [
    s('HD Cleansing',             'Cleansing', 1700, 40, { desc: "High-definition extraction for general deep pore clearing — blackheads, whiteheads and congestion. Forty minutes, and the step to take before a facial rather than after it." }),
    s('White Glow Cleansing',     'Cleansing', 1200, 35, { desc: "Where to start for general congestion and dullness, and what we suggest on a first visit. Book it a week before a facial and the facial works on skin that can absorb it." }),
    s('Acne Cleansing',           'Cleansing', 1400, 35, { desc: "Targets active breakouts with antibacterial products and gentle extraction, rather than the general pore clearing of HD Cleansing." }),
    s('Janssen Whitening Cleansing', 'Cleansing', 3000, 45, { desc: "German cosmeceuticals, and more product than the job needs if you simply want blackheads cleared before an event. It earns its cost on pigmented, sun-damaged skin across a course of sessions." }),
  ],

  'Facials': [
    s('Normal Facial',            'Facials', 1400, 45, { desc: "The classic cleanse, exfoliate, massage and mask. Where to start if your skin is behaving and you want it looking rested rather than treated." }),
    s('Herbal Organic Facial',    'Facials', 1600, 50, { desc: "The gentlest facial on the menu, and what we use on skin that reacts easily or has found other facials too brisk." }),
    s('Acne Facial',              'Facials', 1800, 50, { desc: "Formulated for congested, breakout-prone skin, with anti-bacterial products. If blackheads are the main problem, a cleansing beforehand does more than moving up this list." }),
    s('Whitening Facial',         'Facials', 1900, 55, { desc: "Entry-level brightening for dullness and mild unevenness. A noticeable lift without the cost of the cosmeceutical tiers." }),
    s('White Glow Facial',        'Facials', 2000, 55, { desc: "Brightening with a richer finish than the standard Whitening — the one to pick when you want the glow to read in photographs." }),
    s("T.J's Facial",             'Facials', 2500, 60),
    s('Whitening Fruit Facial',   'Facials', 2600, 60, { desc: "Fruit-enzyme based brightening, lighter on the skin than the stronger actives further up the menu. Suits skin that wants radiance without intensity." }),
    s('Oxy Glow Facial',          'Facials', 2800, 60, { desc: "An oxygenating facial for tired, city-dulled skin. The one most clients book when they cannot name what is wrong but the skin looks flat." }),
    s('HD Whitening Facial',      'Facials', 3000, 65, { desc: "Our most-booked facial above Rs 2,000. High-definition brightening serums give a visible result in a single session that holds two to three weeks — the pre-event choice." }),
    s('Ultra Brightening Facial', 'Facials', 3500, 70, { desc: "A step up from HD in strength and time, for uneven tone that has not shifted with the lighter tiers." }),
    s('Janssen Whitening Facial', 'Facials', 5500, 75, { desc: "German cosmeceutical actives that work below the surface rather than on it. Built for long-standing pigmentation across a course of visits — most clients see the change around the third. Not the one to book for a single pre-wedding glow." }),
  ],

  'Nails': [
    s('Nail Paint',               'Nails', 300, 15, { desc: "Polish applied to nails that are already in shape — no filing or cuticle work. You are welcome to bring your own colour; the price is the same, since you are paying for the work." }),
    s('Nail Filing',              'Nails', 300, 10, { desc: "Shaping only, with no colour at the end. The quickest thing on the nails menu, at ten minutes." }),
    s('Nail Filing & Shining',    'Nails', 600, 20, { desc: "Shaping plus a shine finish instead of colour. The option for anyone who wants tidy nails without polish on them." }),
    s('French Tips',              'Nails', 700, 25, { desc: "The French finish on its own, without the full manicure underneath. Book the French Manicure instead if you want the shaping and cuticle work in the same sitting." }),
    s('Normal Manicure',          'Nails', 900, 30, { desc: "Shape, cuticle work, buff and polish — a proper manicure, not a stripped-back version of something better. If your nails are in reasonable condition, stop here." }),
    s('Normal Pedicure',          'Nails', 1000, 35, { desc: "If your budget covers only one treatment, make it this one. Feet in Karachi build callus and dryness no home routine touches, and the result holds for weeks rather than days." }),
    s('Whitening Manicure',       'Nails', 1200, 35, { desc: "Aimed at uneven tone on the hands rather than at the nails themselves. If that is not your concern, the money goes further on a pedicure." }),
    s('Whitening Pedicure',       'Nails', 1400, 40, { desc: "The same tone-evening focus as the whitening manicure, on the feet. Book the SPA tier instead if what you actually want is the soak and the massage." }),
    s('Jessica Manicure',         'Nails', 1200, 35),
    s('Jessica Pedicure',         'Nails', 1300, 35),
    s('Paraffin Manicure',        'Nails', 1300, 40, { desc: "A warm wax treatment for genuinely dry hands, and the upgrade clients notice immediately. In winter it is the one worth paying for." }),
    s('Paraffin Pedicure',        'Nails', 1300, 40, { desc: "The same warm wax treatment on the feet, for dryness and callus rather than for the polish. About forty minutes." }),
    s('SPA Manicure',             'Nails', 1400, 45, { desc: "Soak, scrub, cuticle care, mask, hand massage and polish across forty-five minutes. As much about the time in the chair as about the nails." }),
    s('SPA Pedicure',             'Nails', 1400, 45, { desc: "Soak, scrub, cuticle care, callus attention, mask, massage and polish. Forty-five minutes, and what most clients book before a wedding or travel." }),
    s('Whitening Paraffin Manicure', 'Nails', 1600, 50, { desc: "The paraffin wax treatment and the whitening tier in one fifty-minute booking — for dry hands where uneven tone is also a concern." }),
    s('Whitening Paraffin Pedicure', 'Nails', 1600, 50, { desc: "Paraffin and whitening combined on the feet, covering dryness and uneven tone in a single fifty-minute booking." }),
    s('French Manicure',          'Nails', 1600, 45, { desc: "A full manicure finished with a French tip. The finish that lasts longest here, because a French tip does not show regrowth the way a solid colour does." }),
    s('French Pedicure',          'Nails', 1600, 45, { desc: "A full pedicure with the French finish. Worth the step up for a wedding week, when regrowth on a solid colour would be the first thing to show." }),
  ],

  'Bridal': [
    /* Station cap is the salon-wide MAX_WORKERS (2). Do not set maxWorkers > 2 —
       slots, book pre-check, and race tiebreak all share that number. A higher
       catalog value used to let a solo bridal book a "3rd" station that does
       not exist, then get cancelled by shouldCancelSelf → write-then-409. */
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
    { id: _id++, name: 'Haircut & Blowdry', category: 'Hair', pricePkr: 2000, durationMinutes: 60, fromPrice: true,
      desc: 'A precision cut and professional blowdry tailored to your face shape and hair texture.',
      includes: ['Consultation', 'Shampoo & condition', 'Cut & blowdry'] },
    { id: _id++, name: 'Hair Colour', category: 'Hair', pricePkr: 4000, durationMinutes: 120, fromPrice: true,
      desc: 'Full-colour, highlights, balayage, or toning — rich, lasting colour applied with care.',
      includes: ['Colour consultation', 'Application', 'Toning & blowdry'] },
    { id: _id++, name: 'Blowdry & Styling', category: 'Hair', pricePkr: 1500, durationMinutes: 45, fromPrice: true,
      desc: 'A salon-quality blowdry and finish — smooth, voluminous, or styled exactly as you like.',
      includes: ['Shampoo', 'Blowdry', 'Style & finish'] },
    { id: _id++, name: 'Bridal Hair Styling', category: 'Hair', pricePkr: 8000, durationMinutes: 120, fromPrice: true,
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

/** Default concurrent stations when a service has no maxWorkers.
 *  The salon has 2 stations — never advertise more than this in slots/book. */
export const DEFAULT_MAX_WORKERS = 2

/** Per-service station cap for slot conflict checks. Clamped to DEFAULT_MAX_WORKERS
 *  so a catalog typo (e.g. bridal maxWorkers: 3) cannot overbook real stations. */
export function getServiceMaxWorkers(service) {
  let cap = DEFAULT_MAX_WORKERS
  if (service?.maxWorkers != null && service.maxWorkers > 0) {
    cap = service.maxWorkers
  }
  return Math.min(cap, DEFAULT_MAX_WORKERS)
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
