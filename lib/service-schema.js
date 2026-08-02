import { SERVICES, CAT_SLUGS } from '../src/data.js'
import {
  SITE_ORIGIN,
  SALON_ID,
  BOOK_URL,
} from './business-schema.js'

export const PRICE_CURRENCY = 'PKR'
export const PRICES_URL = `${SITE_ORIGIN}/prices`
export const PRICE_CATALOG_ID = `${PRICES_URL}#catalog`

/**
 * Menu totals, counted rather than remembered.
 *
 * The "102 services" figure is the salon's signature claim and it has shipped
 * wrong before, because a number typed into a paragraph does not move when
 * somebody adds a facial. Everything that states the size of the menu — the
 * page copy, the JSON-LD, llms.txt via its test — reads it from here, so the
 * claim cannot drift away from the list that proves it.
 */
export function getMenuStats() {
  const all = Object.values(SERVICES).flat()
  const priced = all.filter((s) => s.pricePkr != null)
  const startingFrom = priced.filter((s) => s.fromPrice)
  return {
    categories: Object.keys(SERVICES).length,
    total: all.length,
    priced: priced.length,
    /** Services whose printed figure is the exact charge. */
    fixed: priced.length - startingFrom.length,
    /** Services whose printed figure is a floor (see `fromPrice` in src/data.js). */
    startingFrom: startingFrom.length,
    unpriced: all.length - priced.length,
  }
}

/**
 * One service as a single machine-quotable Offer.
 *
 * A `fromPrice` service — hair and hair treatments, where length and density
 * genuinely decide the final cost — must never be emitted as `price`. That
 * publishes a fixed figure the salon has not agreed to and that the page itself
 * does not claim: the menu says "from Rs 4,000" and an assistant quoting
 * "Rs 4,000" would be misquoting it. schema.org's construct for a floor is a
 * PriceSpecification carrying `minPrice` and no `price`, so a parser reads
 * "at least Rs 4,000" instead of "Rs 4,000 exactly".
 */
export function buildServiceOffer(service, { category } = {}) {
  if (service?.pricePkr == null) return null

  const offer = {
    '@type': 'Offer',
    name: service.name,
    url: `${BOOK_URL}?serviceId=${service.id}`,
    priceCurrency: PRICE_CURRENCY,
    availability: 'https://schema.org/InStock',
    itemOffered: {
      '@type': 'Service',
      name: service.name,
      serviceType: category ?? service.category,
      provider: { '@id': SALON_ID },
    },
  }

  if (service.fromPrice) {
    offer.priceSpecification = {
      '@type': 'PriceSpecification',
      minPrice: String(service.pricePkr),
      priceCurrency: PRICE_CURRENCY,
    }
    offer.description =
      'Starting price. Hair length and density decide the final cost, which is confirmed before any work begins.'
  } else {
    offer.price = String(service.pricePkr)
  }

  if (service.durationMinutes) {
    offer.eligibleDuration = {
      '@type': 'QuantitativeValue',
      value: service.durationMinutes,
      unitCode: 'MIN',
    }
  }

  return offer
}

/** Per-service Offer JSON-LD for category pages. */
export function buildCategoryOffersSchema(category, services, categorySlug) {
  const pageUrl = `${SITE_ORIGIN}/services/${categorySlug}`
  const offers = services
    .map((s) => buildServiceOffer(s, { category }))
    .filter(Boolean)

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

/**
 * The whole printed menu as individual Offers, for /prices.
 *
 * /services already carries 13 AggregateOffer nodes — one price range per
 * category — and those stay exactly where they are. But a range answers "how
 * much is a facial?" with "between Rs 1,400 and Rs 5,500", which is not a
 * quotable price; getting to "Whitening Facial, Rs 1,900" meant parsing the
 * HTML table. This is the other half: every service, individually priced, on
 * the one page that claims to print them all.
 *
 * Nested OfferCatalogs (category → offers) are the shape Google documents for
 * hasOfferCatalog, and the first graph node merges the catalog into the salon
 * entity the root layout already emits, so it hangs off the business rather
 * than floating loose on the page.
 */
export function buildPriceListSchema() {
  const stats = getMenuStats()
  const categories = Object.keys(SERVICES).filter(
    (name) => SERVICES[name]?.length && CAT_SLUGS[name],
  )

  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@id': SALON_ID, hasOfferCatalog: { '@id': PRICE_CATALOG_ID } },
      {
        '@type': 'OfferCatalog',
        '@id': PRICE_CATALOG_ID,
        name: 'Farwa Beauty Salon published price list',
        description:
          `All ${stats.total} services on the menu, every one of them with a published price in Pakistani Rupees. ` +
          `${stats.fixed} are fixed rates; ${stats.startingFrom} hair and hair-treatment services publish a starting price ` +
          'because length and density change the work involved.',
        url: PRICES_URL,
        numberOfItems: stats.total,
        itemListElement: categories.map((name) => ({
          '@type': 'OfferCatalog',
          '@id': `${PRICE_CATALOG_ID}-${CAT_SLUGS[name]}`,
          name,
          url: `${SITE_ORIGIN}/services/${CAT_SLUGS[name]}`,
          numberOfItems: SERVICES[name].length,
          itemListElement: SERVICES[name]
            .map((s) => buildServiceOffer(s, { category: name }))
            .filter(Boolean),
        })),
      },
    ],
  }
}
