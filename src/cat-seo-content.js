/* ─── Unique SERP title + meta description per service category ──── */
export const CAT_SEO = {
  'Threading': {
    title: 'Eyebrow Threading PECHS — From Rs 100',
    h1: 'Eyebrow Threading in PECHS, Karachi',
    metaDesc:
      'Eyebrow & face threading from Rs 100 at Farwa Beauty Salon, PECHS Karachi. Precise brows since 2008 — walk in or book online today.',
  },
  'Rica Hot Wax': {
    title: 'Rica Hot Wax PECHS — From Rs 150',
    h1: 'Rica Hot Wax in PECHS, Karachi',
    metaDesc:
      'Gentle Rica hot wax from Rs 150 at Farwa Beauty Salon, PECHS Karachi. Italian stripless wax for face & sensitive skin. Book online.',
  },
  'Honey Wax': {
    title: 'Honey Wax PECHS Karachi — From Rs 400',
    h1: 'Honey Wax in PECHS, Karachi',
    metaDesc:
      'Honey wax from Rs 400 at Farwa Beauty Salon, PECHS Karachi. Smooth arms, legs & full body — results last 3–4 weeks. Book online.',
  },
  'Rica Wax': {
    title: 'Rica Wax PECHS Karachi — From Rs 600',
    h1: 'Rica Wax in PECHS, Karachi',
    metaDesc:
      'Premium Rica body wax from Rs 600 at Farwa Beauty Salon, PECHS Karachi. Silky-smooth arms, legs & full body. Book online today.',
  },
  'Bleach & Polish': {
    title: 'Bleach & Polish PECHS — From Rs 400',
    h1: 'Bleach & Polish in PECHS, Karachi',
    metaDesc:
      'Face bleach & polish from Rs 400 at Farwa Beauty Salon, PECHS Karachi. Instant glow with Loreal & diamond treatments. Book online.',
  },
  'Massage': {
    title: 'Massage PECHS Karachi — From Rs 700',
    h1: 'Massage in PECHS, Karachi',
    metaDesc:
      'Relaxing massage from Rs 700 at Farwa Beauty Salon, PECHS Karachi. Head, back & full body tension relief. Book online today.',
  },
  'Hair Treatments': {
    title: 'Hair Treatments Karachi — From Rs 2k',
    h1: 'Hair Treatments in PECHS, Karachi',
    metaDesc:
      'Hair treatments from Rs 2,000 at Farwa Beauty Salon, PECHS Karachi. Protein, hair fall, dandruff & Wellaplex repair. Book online.',
  },
  'Cleansing': {
    title: 'Deep Cleansing PECHS — From Rs 1,200',
    h1: 'Deep Cleansing in PECHS, Karachi',
    metaDesc:
      'Deep cleansing from Rs 1,200 at Farwa Beauty Salon, PECHS Karachi. HD, acne & Janssen whitening for clear skin. Book online.',
  },
  'Facials': {
    title: 'Facials PECHS Karachi — From Rs 1,400',
    h1: 'Facials in PECHS, Karachi',
    metaDesc:
      '11 professional facials from Rs 1,400 at Farwa Beauty Salon, PECHS Karachi. Whitening, HD, organic & Janssen. Book your glow-up.',
  },
  'Nails': {
    title: 'Manicure & Pedicure PECHS — From Rs 300',
    h1: 'Manicure & Pedicure in PECHS, Karachi',
    metaDesc:
      'Manicure & pedicure from Rs 300 at Farwa Beauty Salon, PECHS Karachi. SPA, French, paraffin & nail art. Book online today.',
  },
  'Bridal': {
    title: 'Bridal Makeup PECHS — From Rs 8,000',
    h1: 'Bridal Makeup in PECHS, Karachi',
    metaDesc:
      'Bridal makeup from Rs 8,000 at Farwa Beauty Salon, PECHS Karachi. Trials, engagement & mehndi looks — 18+ years. Book your trial.',
  },
  'Hair': {
    title: 'Hair Salon PECHS Karachi — From Rs 1.5k',
    h1: 'Hair Salon in PECHS, Karachi',
    metaDesc:
      'Haircuts, colour & styling from Rs 1,500 at Farwa Beauty Salon, PECHS Karachi. Blowdry, balayage & bridal updos. Book online.',
  },
  'Eyebrow Tattoo': {
    title: 'Microblading Karachi — From Rs 20k',
    h1: 'Microblading in PECHS, Karachi',
    metaDesc:
      'Microblading & powder brows from Rs 20,000 at Farwa Beauty Salon, PECHS Karachi. Semi-permanent brows lasting 12–18 months. Book online.',
  },
}

/** Tier-A cross-links between service categories (not a full matrix). */
export const CAT_RELATED = {
  Threading: ['Facials', 'Rica Hot Wax', 'Eyebrow Tattoo', 'Bridal'],
  'Rica Hot Wax': ['Threading', 'Rica Wax', 'Honey Wax', 'Facials'],
  'Honey Wax': ['Rica Wax', 'Rica Hot Wax', 'Threading', 'Bleach & Polish'],
  'Rica Wax': ['Honey Wax', 'Rica Hot Wax', 'Threading', 'Facials'],
  'Bleach & Polish': ['Facials', 'Cleansing', 'Threading', 'Bridal'],
  Massage: ['Facials', 'Hair Treatments', 'Nails', 'Bridal'],
  'Hair Treatments': ['Hair', 'Facials', 'Bridal', 'Massage'],
  Cleansing: ['Facials', 'Bleach & Polish', 'Threading', 'Bridal'],
  Facials: ['Cleansing', 'Threading', 'Bridal', 'Bleach & Polish'],
  Nails: ['Bridal', 'Facials', 'Threading', 'Hair'],
  Bridal: ['Facials', 'Hair', 'Nails', 'Threading'],
  Hair: ['Hair Treatments', 'Bridal', 'Facials', 'Nails'],
  'Eyebrow Tattoo': ['Threading', 'Facials', 'Bridal', 'Bleach & Polish'],
}

/* ─── FAQ content for popular categories (SEO + user value) ──── */
export const CAT_FAQS = {
  'Bridal': [
    { q: 'How far in advance should I book my bridal package?', a: 'We recommend booking at least 2–3 months ahead, especially during wedding season (October–March). This gives time for a trial, skincare prep, and any adjustments to your look.' },
    { q: 'Do you offer a bridal trial before the wedding day?', a: 'Yes — book a Bridal Trial (Rs 8,000) about 2–4 weeks before the wedding. It includes a full hair and makeup preview with reference photos so both you and our team are aligned for the big day.' },
    { q: 'What is the difference between Nikkah, Barat, and Walima makeup?', a: 'Nikkah looks are usually softer and more elegant. Barat (baraat) looks are fuller glam for stage and photos. Walima looks are polished and radiant for the celebration that follows. Our published menu lists Engagement Look (Rs 12,000), Mehndi/Dholki Look (Rs 10,000), Bridal Trial (Rs 8,000), and Full Bridal Package (Rs 25,000) — tell us which event you need and we style to that mood and outfit.' },
    { q: 'Can you do makeup for engagement and mehndi events too?', a: 'Absolutely. We offer dedicated Engagement and Mehndi/Dholki looks on the menu, and we style nikkah, barat, and walima moods within the Full Bridal Package or by event when you WhatsApp us your schedule.' },
    { q: 'What is included in the Full Bridal Package?', a: 'Our signature package (Rs 25,000) includes bridal makeup, hair styling, dupatta draping, a touch-up kit, and event presence so we\'re there for any adjustments throughout the day.' },
  ],
  'Facials': [
    { q: 'How often should I get a facial?', a: 'For best results, we recommend a professional facial every 4–6 weeks. This aligns with your skin\'s natural renewal cycle and helps maintain clear, glowing skin between visits.' },
    { q: 'Which facial is best for oily or acne-prone skin?', a: 'Our Acne Facial (Rs 1,800) is specifically formulated for congested, oily skin. For deeper issues, HD Cleansing (Rs 1,700) combined with the Acne Facial gives excellent results.' },
    { q: 'What is the difference between HD Whitening Facial and Janssen Whitening Facial?', a: 'The HD Whitening Facial (Rs 3,000) uses high-definition brightening serums for visible results in one session. The Janssen Whitening Facial (Rs 5,500) uses premium German cosmeceutical products for deeper, longer-lasting brightening — ideal for pigmentation and uneven skin tone.' },
    { q: 'Are your facials suitable for sensitive skin?', a: 'Yes. We assess every client\'s skin before starting and adjust products accordingly. Our Herbal Organic Facial (Rs 1,600) is specifically designed for sensitive and reactive skin types.' },
    { q: 'Do you offer HydraFacial?', a: 'No — we do not use HydraFacial machines. Our facial menu runs from Normal Facial (Rs 1,400) through HD Whitening (Rs 3,000) to Janssen Whitening Facial (Rs 5,500) with German cosmeceuticals. See farwasalon.com/prices for every option.' },
  ],
  'Threading': [
    { q: 'Is threading better than waxing for eyebrows?', a: 'For eyebrows, threading offers superior precision — individual hairs can be targeted without affecting surrounding skin. It\'s the gold standard for brow shaping and ideal for sensitive or acne-prone skin.' },
    { q: 'How long does eyebrow threading take?', a: 'Eyebrow threading at Farwa takes about 10 minutes. A Full Face Threading session takes approximately 25 minutes.' },
    { q: 'Does threading hurt more than waxing?', a: 'Threading involves a brief, sharp sensation but no heat or chemicals touch your skin. Most clients find it less irritating than waxing, especially for facial areas. Any redness typically fades within 30 minutes.' },
    { q: 'How often should I get my eyebrows threaded?', a: 'Most clients come every 2–3 weeks to maintain a clean, defined shape. The timing depends on how quickly your hair grows — we\'ll recommend a schedule that works for your growth pattern.' },
  ],
  'Nails': [
    { q: 'How long does a manicure or pedicure take?', a: 'A standard manicure takes about 30 minutes, while a pedicure takes around 40 minutes. Spa treatments and nail art sessions may take 45–60 minutes depending on complexity.' },
    { q: 'What is included in the SPA Pedicure?', a: 'Our SPA Pedicure (Rs 1,400) includes a foot soak, exfoliation scrub, cuticle care, callus removal, hydrating mask, massage, and polish application. It\'s a full pampering experience for tired feet.' },
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
    { q: 'How much does microblading cost in Karachi?', a: 'At Farwa Beauty Salon, microblading and powder brows start at Rs 20,000. Combination brows are Rs 23,000. All sessions include a brow design consultation, numbing, the procedure, and an aftercare kit.' },
    { q: 'How much is a microblading touch-up?', a: 'A light touch-up is recommended 6–8 weeks after your first session. Touch-ups are booked separately from the initial session — WhatsApp us at +92 322 2782254 for the current touch-up rate and available dates.' },
    { q: 'What is the microblading healing timeline?', a: 'Days 1–3: brows look darker and bolder. Days 4–7: light flaking — do not pick. After week 2 the colour softens to the healed shade. Keep brows dry for seven days, skip makeup on the area, use the aftercare balm we provide, and avoid swimming or saunas for the first week.' },
    { q: 'What are the risks, and who should skip microblading?', a: 'Risks include temporary redness, uneven pigment take, and rarely infection if aftercare is ignored. Skip or postpone if you are pregnant or nursing, on blood thinners, have uncontrolled diabetes, or have an active skin condition on the brow area. Very oily skin often suits powder brows better than hair-stroke microblading — we advise at consultation.' },
  ],
  'Massage': [
    { q: 'What types of massage do you offer?', a: 'We offer head massage, back massage, full arm massage, full leg massage, and complete full body massage. All massages use professional-grade oils and techniques to release tension and improve circulation.' },
    { q: 'How long is a full body massage?', a: 'A full body massage session lasts approximately 40 minutes. Individual area massages (head, back, arms, or legs) take 15–30 minutes each.' },
    { q: 'Can I combine massage with other treatments?', a: 'Absolutely — many clients pair a massage with a facial or waxing session for a complete pampering visit. Let us know when booking and we\'ll schedule everything together.' },
  ],
  'Hair Treatments': [
    { q: 'What is the best treatment for hair fall?', a: 'Our Hair Fall Treatment with Ampule (Rs 3,000) targets thinning and excessive shedding using concentrated nutrient ampules. For best results, we recommend a course of 3 monthly sessions.' },
    { q: 'What is a Wellaplex treatment?', a: 'Wellaplex (Rs 3,000) is a bond-strengthening treatment that repairs hair damaged by colour, heat, or chemical processing. It restores elasticity, shine, and strength from within the hair shaft.' },
    { q: 'How often should I get a protein treatment?', a: 'A protein treatment every 6–8 weeks is ideal for maintaining strong, healthy hair. If your hair is chemically processed or heat-styled frequently, monthly treatments give the best protection.' },
  ],
  'Cleansing': [
    { q: 'What is the difference between HD Cleansing and Acne Cleansing?', a: 'HD Cleansing (Rs 1,700) uses high-definition extraction techniques for general deep pore cleaning. Acne Cleansing (Rs 1,400) specifically targets active breakouts with antibacterial products and gentle extraction.' },
    { q: 'How often should I get a professional deep cleanse?', a: 'We recommend a deep cleansing every 4–6 weeks for oily or combination skin, and every 6–8 weeks for normal or dry skin. Regular cleansing prevents blackheads, whiteheads, and congestion.' },
    { q: 'Is the Janssen Whitening Deep Cleanse safe for sensitive skin?', a: 'The Janssen Whitening Deep Cleanse (Rs 2,800) uses professional German cosmeceutical products that are dermatologically tested. We always assess your skin before starting and can adjust the treatment intensity.' },
  ],
  'Bleach & Polish': [
    { q: 'What is the difference between bleach and polish?', a: 'Bleach lightens facial and body hair to make it less visible, while polish removes dead skin cells for a smoother, brighter complexion. Many clients combine both for a radiant, even-toned result.' },
    { q: 'Is face bleach safe for sensitive skin?', a: 'Our Loreal Whitening Face Bleach (Rs 650) is formulated for facial use and suitable for most skin types. We always do a patch check first. If you have very reactive skin, let us know and we\'ll use a gentler option.' },
    { q: 'How long do bleach and polish results last?', a: 'Face bleach results typically last 2–3 weeks as new hair growth appears. Polish results are immediate and last about a week before the natural skin renewal cycle continues. Monthly sessions maintain the best results.' },
  ],
  'Rica Hot Wax': [
    { q: 'What is Rica hot wax and how is it different from regular wax?', a: 'Rica hot wax is a premium Italian stripless wax that adheres to hair rather than skin. It\'s gentler, less painful, and ideal for sensitive facial areas and smaller zones — we use it for brows, nose, lips, forehead, chin, face sides, and back neck.' },
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
