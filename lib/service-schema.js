import {
  SITE_ORIGIN,
  SALON_ID,
  BOOK_URL,
} from './business-schema.js'

/** Per-service Offer JSON-LD for category pages. */
export function buildCategoryOffersSchema(category, services, categorySlug) {
  const pageUrl = `${SITE_ORIGIN}/services/${categorySlug}`
  const offers = services
    .filter((s) => s.pricePkr != null)
    .map((s) => ({
      '@type': 'Offer',
      name: s.name,
      url: `${BOOK_URL}?serviceId=${s.id}`,
      price: String(s.pricePkr),
      priceCurrency: 'PKR',
      availability: 'https://schema.org/InStock',
      itemOffered: {
        '@type': 'Service',
        name: s.name,
        serviceType: category,
        provider: { '@id': SALON_ID },
      },
      ...(s.durationMinutes
        ? {
            eligibleDuration: {
              '@type': 'QuantitativeValue',
              value: s.durationMinutes,
              unitCode: 'MIN',
            },
          }
        : {}),
    }))

  if (!offers.length) return null

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: category,
        url: pageUrl,
        provider: { '@id': SALON_ID },
        areaServed: { '@type': 'City', name: 'Karachi' },
        offers,
      },
    ],
  }
}
