import { CAT_SLUGS } from './data.js'
import { toCanonicalUrl } from '../lib/canonical-origin.js'

export const NEIGHBORHOODS = [
  {
    slug: 'pechs-karachi',
    name: 'PECHS, Karachi',
    detail: 'Our home salon is in PECHS — visit us for all services.',
    blurb:
      'We are at Plot 165/G-1, Saima Terrace, Block 3 PECHS — minutes from Tariq Road and Jheel Park. Same studio since 2008: printed PKR prices, online booking, and a calm women-only floor for threading, facials, bridal, wax, and hair.',
  },
  {
    slug: 'gulshan',
    name: 'Gulshan-e-Iqbal',
    detail: 'Many of our regular clients travel from Gulshan — and say it\'s worth every minute.',
    blurb:
      'From Gulshan-e-Iqbal, PECHS is typically a 20–30 minute drive via University Road / Shahrah-e-Quaideen. Gulshan clients book us for monthly threading and facials plus bridal trials — transparent rates beat guessing at a parlour that will not publish prices.',
  },
  {
    slug: 'clifton-karachi',
    name: 'Clifton, Karachi',
    detail: 'We welcome clients from Clifton for bridal and special occasion bookings.',
    blurb:
      'Clifton and Sea View clients come to PECHS for bridal packages, microblading, and pre-event facials. Expect a calm trial, published starting prices from Rs 100, and one address — Plot 165/G-1, Saima Terrace Block 3 — rather than a rotating home setup.',
  },
  {
    slug: 'bahadurabad',
    name: 'Bahadurabad',
    detail: 'A short drive through PECHS brings you to our door from Bahadurabad.',
    blurb:
      'Bahadurabad is one of our closest catchments — often under 10 minutes to Plot 165/G-1, Saima Terrace Block 3. Neighbours book monthly threading, walk-in brow tidy-ups, and bridal trials without the mall-parking circus, and every PKR rate stays published online.',
  },
  {
    slug: 'dha',
    name: 'DHA (Defence)',
    detail: 'Clients from DHA trust us for premium bridal, hair, and skincare.',
    blurb:
      'DHA Phases reach our PECHS studio via Shahrah-e-Faisal in about 25–40 minutes depending on traffic. Defence clients book bridal trials, Janssen facials, and Rica wax here because every PKR rate is printed online and the appointment time is held.',
  },
  {
    slug: 'tariq-road',
    name: 'Tariq Road',
    detail: 'Our nearest shopping neighbours — stop by before or after your errands on Tariq Road.',
    blurb:
      'Tariq Road shopping and PECHS sit side by side — our studio is a short hop from the main stretch. Pair a wax or threading slot with errands, keep the quote you saw on farwasalon.com/prices, and skip salons that only reveal rates after you sit down.',
  },
  {
    slug: 'shahrah-e-faisal',
    name: 'Shahrah-e-Faisal',
    detail: 'Just minutes away via the main arterial road.',
    blurb:
      'Offices and apartments along Shahrah-e-Faisal reach Block 3 PECHS in roughly 10–20 minutes off-peak. Lunch-break threading and after-work facials are common — book a held slot online so you are not waiting on a walk-in queue.',
  },
  {
    slug: 'north-nazimabad',
    name: 'North Nazimabad',
    detail: 'Worth the trip — clients from North Nazimabad have been coming for years.',
    blurb:
      'From North Nazimabad, PECHS is typically 25–40 minutes via Shahrah-e-Quaideen / University Road depending on traffic. Regulars still make the trip for bridal trials, eyebrow threading at Rs 200, and published facial rates — one calm women-only floor instead of guessing at a neighbourhood parlour.',
  },
  {
    slug: 'saddar',
    name: 'Saddar',
    detail: 'Accessible from Saddar via any main route to PECHS.',
    blurb:
      'Saddar and MA Jinnah Road clients reach our PECHS studio in about 15–25 minutes. Book bridal makeup, facials from Rs 1,400, or a quick thread after city errands — same printed PKR menu, same Plot 165/G-1 address every visit.',
  },
  {
    slug: 'korangi',
    name: 'Korangi',
    detail: 'We serve clients from across Karachi including Korangi.',
    blurb:
      'Korangi and Landhi clients reach PECHS via Shahrah-e-Faisal in roughly 30–50 minutes. Worth the trip for bridal trials, published facial rates, and a women-only floor — one Plot 165/G-1 address, no rotating home parlour.',
  },
]

export const TOP_SERVICES = [
  { slug: 'threading', name: 'Threading', category: 'Threading', description: 'Professional eyebrow, lip, and full face threading with precision and care.' },
  { slug: 'bridal-makeup', name: 'Bridal Makeup', category: 'Bridal', description: 'Complete bridal makeup packages — trials, engagement looks, mehndi, and full bridal transformations.' },
  { slug: 'facials', name: 'Facials', category: 'Facials', description: 'Organic, whitening, HD, and anti-ageing facials for every skin type.' },
  { slug: 'hair', name: 'Hair Services', category: 'Hair', description: 'Haircuts, colour, blowdry, styling, and treatments for all hair types.' },
  { slug: 'nails', name: 'Nail Services', category: 'Nails', description: 'Manicures, pedicures, nail art, French tips, and paraffin treatments.' },
  /* `categories` because this page promises "Rica hot wax, honey wax and body
     waxing" and used to render only the Rica menu — so the ten waxing location
     pages showed Rs 4,000 as the sole full-body price and hid the Rs 2,800
     honey option, which is the cheapest full body in the Karachi SERP and the
     reason to click. `category` stays as the primary for schema and slugs. */
  { slug: 'waxing', name: 'Waxing', category: 'Rica Wax', categories: ['Rica Wax', 'Honey Wax', 'Rica Hot Wax'], description: 'Rica hot wax, honey wax and body waxing — full body from Rs 2,800.' },
]

/**
 * Area hubs that stay indexed with real route/drive content.
 * Auditor recommendation (owner did not pick): PECHS + Tariq Road +
 * Bahadurabad + Gulshan. Everything else 301s to /areas.
 */
export const KEPT_AREA_SLUGS = [
  'pechs-karachi',
  'tariq-road',
  'bahadurabad',
  'gulshan',
]

/**
 * Full historic service × neighbourhood matrix (60). Used only to emit 301s —
 * these landers are no longer generated or sitemapped.
 *
 * Decision 30 Oct 2026: mass-redirect doorway SKUs to parent category pages;
 * keep four /areas hubs instead. See docs/indexation-worklist.md §5.
 */
export const SERVICE_AREA_MATRIX_SLUGS = TOP_SERVICES.flatMap((svc) =>
  NEIGHBORHOODS.map((loc) => `${svc.slug}-in-${loc.slug}`),
)

/** @deprecated Empty — service×area landers retired. Prefer KEPT_AREA_SLUGS. */
export const PRIORITY_LOCATION_SLUGS = []

export function categoryPathForTopService(svc) {
  return `/services/${CAT_SLUGS[svc.category] || 'services'}`
}

export function parseLocationSlug(slug) {
  const inMatch = slug.match(/^(.+)-in-(.+)$/)
  if (inMatch) {
    const [, svcPart, locPart] = inMatch
    const svc = TOP_SERVICES.find(s => s.slug === svcPart)
    const loc = NEIGHBORHOODS.find(n => n.slug === locPart)
    if (svc && loc) return { service: svc, location: loc, prefix: 'in' }
  }

  const nearMatch = slug.match(/^(.+)-near-(.+)$/)
  if (nearMatch) {
    const [, svcPart, locPart] = nearMatch
    const svc = TOP_SERVICES.find(s => s.slug === svcPart)
    const loc = NEIGHBORHOODS.find(n => n.slug === locPart)
    if (svc && loc) return { service: svc, location: loc, prefix: 'near' }
  }

  const bestMatch = slug.match(/^best-(.+)$/)
  if (bestMatch) {
    const rest = bestMatch[1]
    const byLength = [...TOP_SERVICES].sort((a, b) => b.slug.length - a.slug.length)
    for (const svc of byLength) {
      if (rest.startsWith(svc.slug + '-')) {
        const locPart = rest.slice(svc.slug.length + 1)
        const loc = NEIGHBORHOODS.find(n => n.slug === locPart)
        if (loc) return { service: svc, location: loc, prefix: 'best' }
      }
    }
  }

  return null
}

/** Crawlable location landers — none after the doorway retirement. */
export function getAllLocationServiceSlugs() {
  return [...PRIORITY_LOCATION_SLUGS]
}

/**
 * Permanent redirects for every historic `/services/{service}-in-{area}` SKU
 * → parent category page (threading, bridal, facials, hair, nails, rica-wax).
 */
export function getServiceAreaRedirects() {
  return SERVICE_AREA_MATRIX_SLUGS.map((slug) => {
    const parsed = parseLocationSlug(slug)
    const dest = parsed ? categoryPathForTopService(parsed.service) : '/services'
    return {
      source: `/services/${slug}`,
      destination: toCanonicalUrl(dest),
      permanent: true,
    }
  })
}

/**
 * Permanent redirects for legacy `best-*` matrix URLs → parent category pages
 * (same destinations as the retired `-in-*` SKUs — no hop through a lander).
 */
export function getBestLocationRedirects() {
  const redirects = []
  for (const svc of TOP_SERVICES) {
    const dest = categoryPathForTopService(svc)
    for (const loc of NEIGHBORHOODS) {
      redirects.push({
        source: `/services/best-${svc.slug}-${loc.slug}`,
        destination: toCanonicalUrl(dest),
        permanent: true,
      })
    }
  }
  return redirects
}

/**
 * Non-kept `/areas/{slug}` hubs → `/areas` (kept hubs stay live).
 */
export function getRetiredAreaRedirects() {
  const kept = new Set(KEPT_AREA_SLUGS)
  return NEIGHBORHOODS.filter((n) => !kept.has(n.slug)).map((n) => ({
    source: `/areas/${n.slug}`,
    destination: toCanonicalUrl('/areas'),
    permanent: true,
  }))
}
