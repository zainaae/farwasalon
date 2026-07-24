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

/** Sync with live Google rating when possible (env → GBP stats file → manual reviews). */
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
    (manual?.reviewCount != null ? String(manual.reviewCount) : '6')
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
    aggregateRating: getAggregateRating(),
    openingHoursSpecification: OPENING_HOURS_SPECIFICATION,
    sameAs: SAME_AS,
    foundingDate: String(FOUNDING_YEAR),
    description:
      "Karachi's trusted beauty salon since 2008. Bridal makeup, facials, hair, nails, threading, waxing, massage, and more. Book online.",
    areaServed: [
      { '@type': 'City', name: 'Karachi' },
      { '@type': 'Place', name: 'PECHS' },
    ],
    // OfferCatalog is on /services via ItemList — omit here to keep every-page JSON-LD lean.
    paymentAccepted: PAYMENT_ACCEPTED,
    currenciesAccepted: CURRENCIES_ACCEPTED,
    hasMap: MAPS_LINK,
    hasMenu: SERVICES_MENU_URL,
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
      name: post.author || 'Rubina',
      jobTitle: 'Founder',
      worksFor: { '@type': 'BeautySalon', name: SALON_NAME },
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
