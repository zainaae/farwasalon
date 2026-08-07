/**
 * Single source of truth for NAP + JSON-LD (must match Google Business Profile).
 * Update SALON_GBP_RATING / SALON_GBP_REVIEW_COUNT in Vercel when GBP stats change.
 */
import {
  MAPS_LINK,
  IG_LINK,
  SALON_LAT,
  SALON_LNG,
  FOUNDING_YEAR,
  SERVICES,
  CAT_SLUGS,
} from '../src/data.js'
import { GOOGLE_GBP_STATS } from '../src/google-reviews-data.js'
import { getManualReviewStats } from './google-reviews.js'

export const SITE_ORIGIN = 'https://farwasalon.com'
export const SALON_ID = `${SITE_ORIGIN}/#salon`
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`
export const BOOK_URL = `${SITE_ORIGIN}/book`
/* The founder is an entity in her own right. /about is her profile page, so the
   id anchors there rather than inventing a third URL for the same human —
   /team already redirects to /about and a separate /author page would be a
   fourth. One person, one canonical node, referenced from every article. */
export const FOUNDER_ID = `${SITE_ORIGIN}/about#rubina`
export const FOUNDER_NAME = 'Rubina'

export const SALON_NAME = 'Farwa Beauty Salon'
export const SALON_PHONE = '+923222782254'
export const SALON_PHONE_DISPLAY = '+92 322 278 2254'
export const SALON_PRICE_RANGE = '$$'

export const SALON_STREET = 'Plot 165/G-1, Saima Terrace, Block 3, PECHS'
export const SALON_LOCALITY = 'Karachi'
export const SALON_REGION = 'Sindh'
export const SALON_POSTAL = '75400'
export const SALON_COUNTRY = 'PK'

export const SALON_ADDRESS_LINES = [
  `${SALON_STREET}, ${SALON_LOCALITY} ${SALON_POSTAL}`,
  'Mon–Sat 11–7',
  'Closed Sunday',
]

/** Locked NAP string for hubs, contact, location pages, footer — match GBP. */
export const SALON_NAP =
  `${SALON_STREET}, ${SALON_LOCALITY} ${SALON_POSTAL} · Mon–Sat 11–7 · ${SALON_PHONE_DISPLAY}`

export const FB_LINK = 'https://www.facebook.com/farwasalon'
export const GOOGLE_REVIEW_LINK = 'https://g.page/farwasalon/review'

export const SAME_AS = [IG_LINK, FB_LINK, MAPS_LINK, GOOGLE_REVIEW_LINK]

export const SALON_KEYWORDS = [
  'beauty salon Karachi',
  'beauty parlour PECHS',
  'bridal makeup Karachi',
  'threading salon PECHS',
  'facial salon Karachi',
  'waxing salon PECHS',
  'Farwa Beauty Salon',
]

export const PAYMENT_ACCEPTED = ['Cash', 'JazzCash', 'EasyPaisa']
export const CURRENCIES_ACCEPTED = 'PKR'
export const SERVICES_MENU_URL = `${SITE_ORIGIN}/services`
export const PRICE_LIST_URL = `${SITE_ORIGIN}/prices`

/**
 * What this salon does NOT do.
 *
 * An assistant can only recommend a business safely if it knows the edges. Every
 * schema property is an affirmative claim, so a site that only ever says what it
 * offers reads as offering everything it has not denied — which is how a salon
 * gets recommended for laser hair removal it does not own a machine for.
 *
 * None of this is new. All of it is already written in prose somewhere on the
 * site (/beauty-salon-karachi, /contact, /areas, the salon FAQ, the category
 * FAQs); this is the extractable copy of it, in one place, so it travels with
 * the entity instead of living in a paragraph an assistant may never fetch.
 *
 * Two of these are boundaries people actively search for, so they are worth
 * stating even though "we don't do that" is an odd thing to publish:
 * HydraFacial and laser. The keratin line is the opposite case — it is offered
 * and deliberately unpriced, which without a note looks like an omission.
 */
export const SERVICE_BOUNDARIES = [
  {
    name: 'Clientele',
    value:
      "Women only. No men's services — a deliberate choice since 2008, not a gap waiting to be filled.",
  },
  {
    name: 'Locations',
    value: 'One studio: Plot 165/G-1, Saima Terrace, Block 3, PECHS, Karachi. No other branches.',
  },
  {
    name: 'At-home service',
    value:
      'Not offered. Every appointment happens in the PECHS studio; no therapists are sent to homes.',
  },
  {
    name: 'HydraFacial',
    value:
      'Not offered. There is no HydraFacial machine here — the facial menu runs from Rs 1,400 to Rs 5,500.',
  },
  {
    name: 'Laser hair removal',
    value: 'Not offered. Hair removal at this salon is threading and waxing only.',
  },
  {
    name: 'Keratin treatment',
    value:
      'Offered, but not printed. Quoted per client on WhatsApp because hair length and density decide the price.',
  },
]

/**
 * The Google rating, for HUMAN-READABLE copy — "4.6★ Google" in a page header.
 *
 * Deliberately not emitted as JSON-LD any more. Google does not generate review
 * rich results from self-serving `aggregateRating` on LocalBusiness or
 * Organization — markup a business writes about itself — so this node earned
 * nothing, and it had already cost something: Search Console flagged "Review has
 * multiple aggregate ratings" on /beauty-salon-karachi when a second copy of the
 * salon node appeared on the page (see the comment there). Removing it from the
 * graph removes the whole class of that error and loses no eligibility, because
 * there was none. The visible "4.6★ Google" text is unaffected and is still what
 * a reader and an assistant both see.
 *
 * Sync with the live rating when possible (env → GBP stats file → manual reviews).
 */
export function getAggregateRating() {
  const manual = getManualReviewStats()
  const ratingValue =
    process.env.SALON_GBP_RATING ||
    process.env.NEXT_PUBLIC_SALON_GBP_RATING ||
    (GOOGLE_GBP_STATS.rating != null ? String(GOOGLE_GBP_STATS.rating) : null) ||
    (manual?.rating != null ? String(manual.rating) : '4.6')
  const reviewCount =
    process.env.SALON_GBP_REVIEW_COUNT ||
    process.env.NEXT_PUBLIC_SALON_GBP_REVIEW_COUNT ||
    (GOOGLE_GBP_STATS.reviewCount != null
      ? String(GOOGLE_GBP_STATS.reviewCount)
      : null) ||
    (manual?.reviewCount != null ? String(manual.reviewCount) : null)
  if (reviewCount == null) {
    throw new Error(
      'AggregateRating needs a review count — set GOOGLE_GBP_STATS.reviewCount or SALON_GBP_REVIEW_COUNT',
    )
  }
  return {
    '@type': 'AggregateRating',
    ratingValue: String(ratingValue),
    bestRating: '5',
    worstRating: '1',
    ratingCount: String(reviewCount),
    reviewCount: String(reviewCount),
  }
}

export const OPENING_HOURS_SPECIFICATION = [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '11:00',
    closes: '19:00',
  },
]

/** Service categories that have a slug + priced menu. */
function getCatalogCategories() {
  return Object.keys(CAT_SLUGS).filter((name) => SERVICES[name]?.length)
}

/** FAQPage JSON-LD from `{ q, a }` items. Returns null when fewer than 2 Q&As. */
export function buildFaqPageSchema(faqs = []) {
  if (!Array.isArray(faqs) || faqs.length < 2) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

export function buildBeautySalonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['BeautySalon', 'HairSalon', 'LocalBusiness'],
    '@id': SALON_ID,
    name: SALON_NAME,
    image: `${SITE_ORIGIN}/logo.jpg`,
    url: `${SITE_ORIGIN}/`,
    telephone: SALON_PHONE,
    priceRange: SALON_PRICE_RANGE,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SALON_STREET,
      addressLocality: SALON_LOCALITY,
      addressRegion: SALON_REGION,
      postalCode: SALON_POSTAL,
      addressCountry: SALON_COUNTRY,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SALON_LAT,
      longitude: SALON_LNG,
    },
    // No aggregateRating: self-serving review markup earns no rich result on a
    // LocalBusiness and has already triggered a Search Console error on this
    // site. See getAggregateRating() above — the visible 4.6★ copy still uses it.
    openingHoursSpecification: OPENING_HOURS_SPECIFICATION,
    sameAs: SAME_AS,
    foundingDate: String(FOUNDING_YEAR),
    description:
      "Karachi's trusted beauty salon since 2008. Bridal makeup, facials, hair, nails, threading, waxing, massage, and more. Book online.",
    /* The boundaries, in the two forms that get read: a sentence for anything
       that summarises, and typed properties for anything that queries. */
    disambiguatingDescription:
      "Women-only salon with a single studio in Block 3, PECHS, Karachi. No branches, no at-home visits, no men's services, no HydraFacial and no laser hair removal.",
    audience: { '@type': 'PeopleAudience', suggestedGender: 'female' },
    additionalProperty: SERVICE_BOUNDARIES.map((b) => ({
      '@type': 'PropertyValue',
      name: b.name,
      value: b.value,
    })),
    areaServed: [
      { '@type': 'City', name: 'Karachi' },
      { '@type': 'Place', name: 'PECHS' },
    ],
    // OfferCatalog is on /services via ItemList — omit here to keep every-page JSON-LD lean.
    paymentAccepted: PAYMENT_ACCEPTED,
    currenciesAccepted: CURRENCIES_ACCEPTED,
    hasMap: MAPS_LINK,
    /* The menu that carries the prices, not the one that carries the category
       explainers. An assistant following `hasMenu` should land on the page that
       can answer "how much", which is /prices. */
    hasMenu: PRICE_LIST_URL,
    keywords: SALON_KEYWORDS.join(', '),
    potentialAction: [
      {
        '@type': 'ReserveAction',
        name: 'Book online',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: BOOK_URL,
          inLanguage: 'en',
          actionPlatform: [
            'http://schema.org/DesktopWebPlatform',
            'http://schema.org/MobileWebPlatform',
          ],
        },
      },
      {
        '@type': 'CommunicateAction',
        name: 'WhatsApp',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `https://wa.me/923222782254`,
        },
      },
    ],
  }
}

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_ORIGIN}/`,
    name: SALON_NAME,
    description:
      'Beauty salon in PECHS Karachi — bridal, facials, threading, waxing, nails. Book appointments online.',
    publisher: { '@id': SALON_ID },
    inLanguage: 'en-PK',
  }
}

/** Location landing pages: Service + FAQ + breadcrumbs tied to the salon entity. */
export function buildLocationPageGraph({ service, location, slug, faqs = [] }) {
  const pageUrl = `${SITE_ORIGIN}/services/${slug}`
  const graph = [
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: `${service.name} in ${location.name} — ${SALON_NAME}`,
      description: `${service.description} Serving ${location.name.includes('Karachi') ? location.name : `${location.name}, Karachi`}.`,
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': SALON_ID },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_ORIGIN}/services` },
        { '@type': 'ListItem', position: 3, name: `${service.name} in ${location.name}`, item: pageUrl },
      ],
    },
    {
      '@type': 'Service',
      name: `${service.name} in ${location.name}`,
      description: service.description,
      provider: { '@id': SALON_ID },
      areaServed: { '@type': 'Place', name: location.name },
      offers: {
        '@type': 'Offer',
        url: BOOK_URL,
        availability: 'https://schema.org/InStock',
        priceCurrency: 'PKR',
      },
    },
  ]

  if (faqs.length > 0) {
    const faqPage = buildFaqPageSchema(faqs)
    if (faqPage) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: faqPage.mainEntity,
      })
    }
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

/** SpeakableSpecification for voice/search assistants (cssSelector targets). */
export function buildSpeakableSchema({ pageUrl, cssSelectors }) {
  const selectors = Array.isArray(cssSelectors) ? cssSelectors : [cssSelectors]
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: selectors,
    },
  }
}

/** ItemList of service categories for /services. */
export function buildServicesItemListSchema() {
  const categories = getCatalogCategories()
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Salon Service Categories',
    numberOfItems: categories.length,
    itemListElement: categories.map((name, i) => {
      const slug = CAT_SLUGS[name]
      const list = SERVICES[name]
      const prices = list.map((s) => s.pricePkr).filter(Boolean)
      return {
        '@type': 'ListItem',
        position: i + 1,
        name,
        url: `${SITE_ORIGIN}/services/${slug}`,
        item: {
          '@type': 'Service',
          name,
          url: `${SITE_ORIGIN}/services/${slug}`,
          provider: { '@id': SALON_ID },
          ...(prices.length
            ? {
                offers: {
                  '@type': 'AggregateOffer',
                  lowPrice: String(Math.min(...prices)),
                  highPrice: String(Math.max(...prices)),
                  priceCurrency: 'PKR',
                  offerCount: String(list.length),
                },
              }
            : {}),
        },
      }
    }),
  }
}

/** The founder as a linkable entity. Emitted in full on /about; articles
 *  reference it by @id so search engines and AI assistants resolve every
 *  byline to the same person rather than to a dozen unrelated "Rubina"s.
 *  knowsAbout is what makes her citable on a topic rather than just named. */
export function buildFounderSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': FOUNDER_ID,
    name: FOUNDER_NAME,
    url: `${SITE_ORIGIN}/about`,
    jobTitle: 'Founder & Lead Beautician',
    description: `Founded ${SALON_NAME} in Block 3, PECHS in ${FOUNDING_YEAR} and has worked in bridal makeup, skincare and brow shaping in Karachi ever since.`,
    /* No `image` until there is an actual photograph of her. Pointing a Person
       node at the salon logo tells Google the logo is her face, which is both
       wrong and against the Person guidelines. An absent property is honest;
       a wrong one is a defect. */
    knowsAbout: [
      'Bridal makeup',
      'Party makeup',
      'Facials and skincare',
      'Eyebrow threading and shaping',
      'Hair treatments',
      'Waxing',
    ],
    worksFor: { '@id': SALON_ID },
    homeLocation: { '@type': 'Place', name: 'PECHS, Karachi' },
    sameAs: [IG_LINK],
  }
}

/** Article schema with wordCount, articleSection, keywords. */
export function buildArticleSchema(post, { wordCount }) {
  const pageUrl = `${SITE_ORIGIN}/blog/${post.slug}`
  const keywords = [post.category, 'beauty salon Karachi', 'Farwa Beauty Salon', post.title]
    .filter(Boolean)
    .join(', ')

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.featuredImage ? `${SITE_ORIGIN}${post.featuredImage}` : undefined,
    datePublished: post.date,
    dateModified: post.lastModified || post.date,
    wordCount,
    articleSection: post.category,
    keywords,
    author: {
      '@type': 'Person',
      '@id': FOUNDER_ID,
      name: post.author || FOUNDER_NAME,
      url: `${SITE_ORIGIN}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: SALON_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/logo.jpg` },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  }
}

export function countBlogWords(content = []) {
  let n = 0
  for (const block of content) {
    if (block.text) n += block.text.split(/\s+/).filter(Boolean).length
    if (block.items) {
      for (const item of block.items) {
        n += String(item).split(/\s+/).filter(Boolean).length
      }
    }
  }
  return n
}

/** Category min price for location snippets */
export function getCategoryPriceRange(category) {
  const list = SERVICES[category] || []
  const prices = list.map((s) => s.pricePkr).filter(Boolean)
  if (!prices.length) return null
  return { min: Math.min(...prices), max: Math.max(...prices) }
}
