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
    title: 'Honey Wax PECHS — From Rs 400',
    h1: 'Honey Wax in PECHS, Karachi',
    metaDesc:
      'Honey wax from Rs 400 · full body Rs 2,800 at Farwa PECHS. Compare with Rica body wax — printed PKR, women-only studio. Book online.',
  },
  'Rica Wax': {
    title: 'Rica Wax PECHS Karachi — From Rs 600',
    h1: 'Rica Body Wax in PECHS, Karachi',
    metaDesc:
      'Rica body wax from Rs 600 · full body Rs 4,000 at Farwa PECHS. Gentler than honey for sensitive skin. Hygiene-first, book online.',
  },
  'Bleach & Polish': {
    title: 'Face Bleach & Polish Karachi — Rs 400',
    h1: 'Face Bleach & Polish in PECHS, Karachi',
    metaDesc:
      'Loreal face bleach Rs 650 · polish from Rs 900 at Farwa PECHS. Bleach vs polish explained — printed rates, book or WhatsApp.',
  },
  'Massage': {
    title: 'Massage Salon Karachi — From Rs 700',
    h1: 'Massage Salon in PECHS, Karachi',
    metaDesc:
      'Women’s massage salon Karachi — full body Rs 2,500, head/back from Rs 700 at Farwa PECHS. Duration menu, book online or WhatsApp.',
  },
  'Hair Treatments': {
    title: 'Hair Treatments Karachi — From Rs 2,000',
    h1: 'Hair Treatments in PECHS, Karachi',
    metaDesc:
      'Hair treatments from Rs 2,000 at Farwa Beauty Salon, PECHS Karachi. Protein, hair fall, dandruff & Wellaplex repair. Book online.',
  },
  'Cleansing': {
    title: 'Deep Cleansing Facial Karachi — Rs 1,200',
    h1: 'Deep Cleansing Facial in PECHS, Karachi',
    metaDesc:
      'Deep cleansing facial Karachi from Rs 1,200 — HD, acne & Janssen cleansing at Farwa PECHS. Duration tiers, book online today.',
  },
  'Facials': {
    title: 'Facials PECHS Karachi — From Rs 1,400',
    h1: 'Facials in PECHS, Karachi',
    metaDesc:
      '11 professional facials from Rs 1,400 at Farwa Beauty Salon, PECHS Karachi. Whitening, HD, organic & Janssen. Book your glow-up.',
  },
  'Nails': {
    title: 'Manicure Pedicure Karachi — From Rs 300',
    h1: 'Manicure & Pedicure in PECHS, Karachi',
    metaDesc:
      'Manicure & pedicure price list Karachi — SPA Rs 1,400, French Rs 1,600 at Farwa PECHS. Commercial rates, book online today.',
  },
  /* Title deliberately differs from /bridal, which owns the head term
     "Bridal Makeup Karachi" with its packages hero. This page is the service
     menu — mehndi, nikah, trials priced individually — so it targets the
     itemised and area-qualified intent instead. Both pages self-canonicalise;
     an identical title had them splitting the signal on the same query. */
  'Bridal': {
    title: 'Bridal Makeup PECHS — Mehndi & Nikah from Rs 8,000',
    h1: 'Bridal Makeup in PECHS, Karachi',
    metaDesc:
      'Every bridal service priced individually at Farwa PECHS — mehndi, nikah, engagement looks and trials from Rs 8,000. Women-only studio in Block 3.',
  },
  'Hair': {
    title: 'Haircut & Colour Karachi — Cuts from Rs 2,000',
    h1: 'Haircut, Colour & Blowdry in PECHS',
    metaDesc:
      'Haircut & blowdry Rs 2,000 · colour/balayage from Rs 4,000 at Farwa PECHS. Women hair salon Karachi — book online today.',
  },
  'Eyebrow Tattoo': {
    title: 'Microblading Karachi — From Rs 20,000',
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
    { q: 'How much does threading cost, and can I book online?', a: 'Threading starts at Rs 100 (lower lip / chin); eyebrow threading is Rs 200 and full face is Rs 1,200. Walk-ins are welcome when we have room, or book a held slot at farwasalon.com/book in under a minute.' },
    { q: 'Should I thread or wax my face before a wedding?', a: 'For brows and upper lip we recommend threading — cleaner shape, less redness for photos. Prefer wax on the face? Use Rica hot wax from Rs 150 a few days before the event. See our threading vs waxing guide, then book the look that fits your skin.' },
  ],
  'Nails': [
    { q: 'How long does a manicure or pedicure take?', a: 'A standard manicure takes about 30 minutes, while a pedicure takes around 35 minutes. SPA Manicure and SPA Pedicure (Rs 1,400 each) take about 45 minutes.' },
    { q: 'What is included in the SPA Pedicure?', a: 'Our SPA Pedicure (Rs 1,400) includes a foot soak, exfoliation scrub, cuticle care, callus removal, hydrating mask, massage, and polish application. It\'s a full pampering experience for tired feet.' },
    { q: 'What is included in the SPA Manicure?', a: 'SPA Manicure (Rs 1,400, ~45 min) covers soak, scrub, cuticle care, mask, hand massage, and polish — the upgrade from Normal Manicure (Rs 900).' },
    { q: 'Do you offer nail art and custom designs?', a: 'Yes — our nail artists create custom designs, French tips, ombre, marble effects, and seasonal styles. Bring reference photos or let our team design something unique for you.' },
    { q: 'How much is a manicure and pedicure in Karachi?', a: 'At Farwa, Normal Manicure is Rs 900 and Normal Pedicure Rs 1,000. SPA and French options run Rs 1,400–1,600. Nail paint alone is Rs 300. Full list: farwasalon.com/prices.' },
  ],
  'Hair': [
    { q: 'How much does a haircut cost at Farwa?', a: 'A haircut with professional blowdry starts at Rs 2,000. This includes a consultation, shampoo, conditioning, precision cut, and styled blowdry.' },
    { q: 'Do you do bridal hair styling?', a: 'Yes — bridal hair styling (Rs 8,000) includes a style consultation, blowout prep, full styling (updos, curls, braids, or sleek looks), and finishing spray. It\'s also part of our Full Bridal Package.' },
    { q: 'What hair colouring options do you offer?', a: 'We offer full-colour, highlights, balayage, and toning starting at Rs 4,000. Colour consultations are included to ensure the perfect shade for your skin tone and hair type.' },
    { q: 'How much is a blowdry only?', a: 'Blowdry & Styling is Rs 1,500 (~45 min). Haircut & Blowdry is Rs 2,000 when you want a cut in the same visit.' },
    { q: 'Do you offer keratin treatments?', a: 'Yes — but it is quoted per head rather than printed, because the honest price depends on your hair length and density. WhatsApp us a photo for a binding quote. Fixed-price repair options are printed: protein treatment Rs 2,000, Wellaplex Rs 3,000, hair-fall protocols Rs 3,000.' },
  ],
  'Eyebrow Tattoo': [
    { q: 'How long does microblading last?', a: 'Microblading typically lasts 12–18 months depending on skin type, sun exposure, and aftercare. Oily skin types may need a touch-up sooner. We provide a complete aftercare kit with every session.' },
    { q: 'What is the difference between microblading and powder brows?', a: 'Microblading creates individual hair-like strokes for a natural look. Powder brows give a soft, filled-in makeup effect. Combination brows blend both techniques — strokes at the front with powder shading at the tail.' },
    { q: 'Does eyebrow tattooing hurt?', a: 'We apply a topical numbing cream before the procedure so most clients feel only mild pressure. The full session takes about 2 hours including consultation, numbing, and the tattooing process.' },
    { q: 'How much does microblading cost in Karachi?', a: 'At Farwa Beauty Salon, microblading and powder brows start at Rs 20,000. Combination brows are Rs 23,000. All sessions include a brow design consultation, numbing, the procedure, and an aftercare kit.' },
    { q: 'How much is a microblading touch-up?', a: 'A light touch-up is recommended 6–8 weeks after your first session. Touch-ups are booked separately from the initial session — WhatsApp us at +92 322 2782254 for the current touch-up rate and available dates.' },
    { q: 'What is the microblading healing timeline?', a: 'Days 1–3: brows look darker and bolder. Days 4–7: light flaking — do not pick. After week 2 the colour softens to the healed shade. Keep brows dry for seven days, skip makeup on the area, use the aftercare balm we provide, and avoid swimming or saunas for the first week.' },
    { q: 'What are the risks, and who should skip microblading?', a: 'Risks include temporary redness, uneven pigment take, and rarely infection if aftercare is ignored. Skip or postpone if you are pregnant or nursing, on blood thinners, have uncontrolled diabetes, or have an active skin condition on the brow area. Very oily skin often suits powder brows better than hair-stroke microblading — we advise at consultation.' },
    { q: 'What is the numbered process on the day?', a: '1) Consultation & brow mapping you approve in the mirror. 2) Topical numbing. 3) Microblading / powder / combination work. 4) Aftercare kit + written care steps. Nothing is tattooed until you approve the map.' },
  ],
  'Massage': [
    { q: 'What types of massage do you offer?', a: 'We offer head massage, back massage, full arm massage, full leg massage, head massage & wash, and complete full body massage. All massages use professional-grade oils and techniques to release tension and improve circulation.' },
    { q: 'How long is a full body massage?', a: 'A full body massage session lasts approximately 40 minutes (Rs 2,500). Individual area massages (head, back, arms, or half legs) take about 15 minutes at Rs 700.' },
    { q: 'Can I combine massage with other treatments?', a: 'Absolutely — many clients pair a massage with a facial or waxing session for a complete pampering visit. Let us know when booking and we\'ll schedule everything together.' },
    { q: 'Is Farwa a women-only massage salon?', a: 'Yes — Farwa is a women-only beauty salon in PECHS. Massages are done in-studio only; we do not offer at-home massage visits.' },
    { q: 'How do I book a massage in Karachi?', a: 'Book online at farwasalon.com/book, or WhatsApp +92 322 2782254. Live slots Mon–Sat 11–7.' },
  ],
  'Hair Treatments': [
    { q: 'What is the best treatment for hair fall?', a: 'Our Hair Fall Treatment with Ampule (Rs 3,000) targets thinning and excessive shedding using concentrated nutrient ampules. For best results, we recommend a course of 3 monthly sessions.' },
    { q: 'What is a Wellaplex treatment?', a: 'Wellaplex (Rs 3,000) is a bond-strengthening treatment that repairs hair damaged by colour, heat, or chemical processing. It restores elasticity, shine, and strength from within the hair shaft.' },
    { q: 'How often should I get a protein treatment?', a: 'A protein treatment every 6–8 weeks is ideal for maintaining strong, healthy hair. If your hair is chemically processed or heat-styled frequently, monthly treatments give the best protection.' },
  ],
  'Cleansing': [
    { q: 'What is the difference between HD Cleansing and Acne Cleansing?', a: 'HD Cleansing (Rs 1,700, ~40 min) uses high-definition extraction techniques for general deep pore cleaning. Acne Cleansing (Rs 1,400, ~35 min) specifically targets active breakouts with antibacterial products and gentle extraction.' },
    { q: 'How often should I get a professional deep cleanse?', a: 'We recommend a deep cleansing every 4–6 weeks for oily or combination skin, and every 6–8 weeks for normal or dry skin. Regular cleansing prevents blackheads, whiteheads, and congestion.' },
    { q: 'Is the Janssen Whitening Deep Cleanse safe for sensitive skin?', a: 'The Janssen Whitening Deep Cleanse (Rs 3,000, ~45 min) uses professional German cosmeceutical products that are dermatologically tested. We always assess your skin before starting and can adjust the treatment intensity.' },
    { q: 'Deep cleansing facial vs regular facial — which first?', a: 'Congested or breakout-prone skin: book cleansing first. When pores are clear, move to a facial (from Rs 1,400) for serums and glow. See farwasalon.com/blog/deep-cleansing-vs-facial-karachi.' },
  ],
  'Bleach & Polish': [
    { q: 'What is the difference between bleach and polish?', a: 'Bleach lightens facial and body hair to make it less visible (Loreal Whitening Face Bleach Rs 650). Polish removes dead skin cells for a smoother, brighter complexion (Loreal Rs 900, Diamond Rs 1,000, Sandal Rs 1,200). Many clients combine both for a radiant, even-toned result.' },
    { q: 'Is face bleach safe for sensitive skin?', a: 'Our Loreal Whitening Face Bleach (Rs 650) is formulated for facial use and suitable for most skin types. We always do a patch check first. If you have very reactive skin, let us know and we\'ll use a gentler option or suggest polish only.' },
    { q: 'How long do bleach and polish results last?', a: 'Face bleach results typically last 2–3 weeks as new hair growth appears. Polish results are immediate and last about a week before the natural skin renewal cycle continues. Monthly sessions maintain the best results.' },
    { q: 'Do you offer HydraFacial?', a: 'No — HydraFacial is not on our menu. For glow we offer bleach, polish, cleansing, and facials with published PKR rates.' },
  ],
  'Rica Hot Wax': [
    { q: 'What is Rica hot wax and how is it different from regular wax?', a: 'Rica hot wax is a premium Italian stripless (peel) wax that adheres to hair rather than skin. It\'s gentler, less painful, and ideal for sensitive facial areas — brows, nose, lips, forehead, chin, face sides, and back neck. Strip Rica body wax is a separate menu for arms, legs, and full body.' },
    { q: 'Is Rica wax suitable for sensitive skin?', a: 'Yes — Rica hot wax is specifically designed for sensitive skin. It doesn\'t pull on the skin like strip wax, reducing redness and irritation. Many clients with eczema-prone or reactive skin prefer it.' },
    { q: 'How long should hair be before a Rica wax appointment?', a: 'Hair should be at least 5mm (about 2 weeks of growth) for the wax to grip effectively. Avoid shaving between appointments for the smoothest results.' },
    { q: 'What aftercare should I follow?', a: 'Avoid hot showers, tight clothing, and fragranced products on waxed skin for 12–24 hours. Aloe or a calming gel helps if there is redness. Exfoliate gently after 48–72 hours to reduce ingrowns.' },
  ],
  'Honey Wax': [
    { q: 'What areas can be treated with honey wax?', a: 'Honey wax is versatile and suitable for arms, legs, underarms, and larger body areas. Full Body Honey Wax is Rs 2,800. For facial areas and sensitive zones, we recommend Rica hot wax for a gentler experience.' },
    { q: 'How long do honey wax results last?', a: 'Honey wax results typically last 3–4 weeks. With regular sessions, hair grows back finer and sparser over time. We recommend booking every 3–4 weeks for consistently smooth skin.' },
    { q: 'Is honey wax painful?', a: 'There\'s a brief pulling sensation during strip removal, but it\'s quick. Our aestheticians work efficiently to minimise discomfort. After the first session, most clients find subsequent sessions much easier as the hair becomes finer.' },
    { q: 'Rica or honey wax — which should I book?', a: 'Normal skin and larger body areas: honey wax from Rs 400 (full body Rs 2,800) is excellent value. Sensitive skin, face, or lower pain tolerance: choose Rica body (from Rs 600, full body Rs 4,000) or Rica hot wax for the face (from Rs 150). Compare menus at /services/honey-wax and /services/rica-wax.' },
  ],
  'Rica Wax': [
    { q: 'What is the difference between Rica Wax and Rica Hot Wax?', a: 'Rica Wax (strip wax) is a premium Italian formula used with cloth strips — ideal for large body areas like arms, legs, and back. Rica Hot Wax is stripless/peel and applied directly — best for small, sensitive areas like face and underarms.' },
    { q: 'How much does full body Rica wax cost?', a: 'Full Body Rica Wax at Farwa Beauty Salon costs Rs 4,000 (~60 min). This includes arms, legs, underarms, and other body areas. Individual area pricing starts from Rs 600.' },
    { q: 'Can I get Rica wax during pregnancy?', a: 'Rica wax is generally safe during pregnancy as it\'s gentle and doesn\'t contain harsh chemicals. However, skin may be more sensitive during pregnancy — please let our team know so we can adjust pressure and temperature accordingly.' },
    { q: 'How do I book Rica vs honey wax?', a: 'Pick the service that matches your skin on farwasalon.com/book, or WhatsApp +92 322 2782254 with the areas you want done. We publish every rate on /prices — no surprise quotes after you are in the chair.' },
    { q: 'What hygiene standards do you follow for waxing?', a: 'Single-use applicators, no double-dipping into client-facing pots, fresh strips, and sanitised stations between guests. Ask us to walk you through the setup anytime.' },
  ],
}

/** Optional on-page content blocks for category landers (SERP depth). */
export const CAT_PAGE_BLOCKS = {
  Massage: [
    { type: 'h2', text: 'Duration & price menu' },
    { type: 'p', text: 'Head, back, arms, or half legs — Rs 700 (~15 min). Full legs Rs 1,400 (~30 min). Head massage & wash Rs 1,500 (~30 min). Full body massage Rs 2,500 (~40 min). Women-only PECHS studio — book online or WhatsApp.' },
  ],
  Cleansing: [
    { type: 'h2', text: 'Deep cleansing duration tiers' },
    { type: 'p', text: 'White Glow / Acne cleansing ~35 min (from Rs 1,200 / Rs 1,400). HD Cleansing ~40 min (Rs 1,700). Janssen Whitening Cleansing ~45 min (Rs 3,000). Congested skin: cleanse before a full facial.' },
  ],
  'Honey Wax': [
    { type: 'h2', text: 'Honey vs Rica — pick clearly' },
    { type: 'p', text: 'Honey wax is strip wax for body zones (full body Rs 2,800). Prefer less pull or sensitive skin? Book Rica body wax (full body Rs 4,000) or Rica hot wax for the face. See the Rica wax menu for the premium strip option.' },
  ],
  'Rica Wax': [
    { type: 'h2', text: 'Strip Rica vs peel (hot) wax' },
    { type: 'p', text: 'This page is strip Rica for arms, legs, and full body. Face and small zones use Rica Hot Wax (peel/stripless). Prep: ~5mm hair growth. Aftercare: no heat or fragrance on the area for 12–24 hours.' },
  ],
  'Bleach & Polish': [
    { type: 'h2', text: 'Bleach vs polish' },
    { type: 'p', text: 'Bleach lightens hair (Loreal face bleach Rs 650). Polish exfoliates for glow (Loreal Rs 900 · Diamond Rs 1,000 · Sandal Rs 1,200). We do not offer HydraFacial — only published menu services.' },
  ],
  Nails: [
    { type: 'h2', text: 'SPA manicure & pedicure' },
    { type: 'p', text: 'SPA Manicure and SPA Pedicure are Rs 1,400 each (~45 min) — soak, scrub, mask, massage, polish. French and paraffin options run to Rs 1,600. Commercial price list on /prices.' },
  ],
  Hair: [
    { type: 'h2', text: 'Cut, colour & balayage' },
    { type: 'p', text: 'Haircut & blowdry Rs 2,000. Blowdry only Rs 1,500. Colour / highlights / balayage from Rs 4,000. Bridal hair Rs 8,000. Keratin is offered but quoted per head, not printed — send a photo on WhatsApp. Protein Rs 2,000 and Wellaplex Rs 3,000 are printed.' },
  ],
  'Eyebrow Tattoo': [
    { type: 'h2', text: 'What every session includes' },
    { type: 'ul', items: ['Brow design / mapping you approve', 'Topical numbing', 'Microblading, powder, or combination work', 'Aftercare kit + touch-up plan guidance'] },
    { type: 'h2', text: 'Touch-up policy' },
    { type: 'p', text: 'A light touch-up is recommended 6–8 weeks after the first session and is booked separately — WhatsApp for the current touch-up rate.' },
  ],
  Facials: [
    { type: 'h2', text: 'Karachi climate → which facial' },
    { type: 'p', text: 'Humid + congested: cleanse first. Event glow: HD Whitening Rs 3,000. Stubborn pigmentation: Janssen Whitening Rs 5,500. Sensitive: Herbal Organic Rs 1,600. Many clients add eyebrow threading in the same visit when timing allows — book both online.' },
  ],
  Threading: [
    { type: 'h2', text: 'Hygiene block' },
    { type: 'p', text: 'Fresh cotton thread for every client, sanitised scissors/tweezers, and a clean chair between guests. Threading vs face wax: choose thread for precision brows; Rica hot wax from Rs 150 if you prefer wax on the face.' },
  ],
}
