/** Real, honest deals only — no fake urgency, no "today only" that renews
 *  daily. Each deal the owner adds here appears on /deals with Offer schema;
 *  expired deals drop off automatically at build/render time.
 *
 *  Shape: validUntil (YYYY-MM-DD, inclusive) or null for evergreen. */
export const DEALS = [
  {
    /* 14% for Pakistan's Independence Day on the 14th. Terms otherwise per the
       poster: basket total of Rs 1,400+, 5–14 August 2026. */
    id: 'freedom-deal-2026',
    title: 'Freedom Deal — 14% off',
    description:
      'For Pakistan’s Independence Day, take 14% off whenever your visit totals Rs 1,400 or more, from 5 to 14 August. Combine anything on the menu to get there — threading with a cleansing, a manicure with a massage. The discount comes off the printed rate, the same rate that has been on this page all year, not one raised for the occasion.',
    priceNote: 'Any combination of services totalling Rs 1,400+. Party makeup and keratin stay individually quoted.',
    category: 'Independence Day',
    href: '/prices',
    /* Filename carries the rate on purpose. The 20% version shipped first and
       Next serves optimised images with max-age=2592000, so every browser that
       loaded the site that day held the wrong poster for thirty days — the URL
       never changed, so nothing invalidated it. Renaming is the only thing that
       reaches a cache already on someone's phone. Rename again if the offer
       changes. */
    image: '/freedom-deal-2026-14pc.jpg',
    imageAlt: 'Farwa Beauty Salon Freedom Deal — 14% off when your visit totals Rs 1,400 or more, 5 to 14 August 2026',
    validFrom: '2026-08-05',
    validUntil: '2026-08-14',
    /* Announce from today; teaser copy only, never claimable before the 5th. */
    teaseFrom: '2026-07-29',
    accent: true,
  },
  {
    id: 'first-facial-10',
    title: '10% off your first facial',
    description:
      'New to Farwa? Join the newsletter (form in the footer of any page) and your 10% code for any first facial — from a Normal Facial to Janssen Whitening — arrives by email.',
    priceNote: 'Facials from Rs 1,400 — code applies to your first one',
    category: 'Facials',
    href: '/services/facials',
    validFrom: '2026-05-14',
    validUntil: null, // evergreen welcome offer
  },
]

/** Deals still valid on the given date (defaults to today). */
export function getActiveDeals(now = new Date()) {
  const today = now.toISOString().slice(0, 10)
  return DEALS.filter(
    (d) => (!d.validFrom || d.validFrom <= today) && (!d.validUntil || d.validUntil >= today),
  )
}

/** Deals announced but not yet open — shown as "starts <date>", never claimable. */
export function getUpcomingDeals(now = new Date()) {
  const today = now.toISOString().slice(0, 10)
  return DEALS.filter(
    (d) =>
      d.teaseFrom &&
      d.teaseFrom <= today &&
      d.validFrom > today &&
      (!d.validUntil || d.validUntil >= today),
  )
}

/** The one deal worth announcing sitewide right now: live first, else upcoming. */
export function getHeadlineDeal(now = new Date()) {
  return getActiveDeals(now).find((d) => d.accent) ?? getUpcomingDeals(now).find((d) => d.accent) ?? null
}

/** True after validUntil (inclusive window ended). Upcoming deals are not ended. */
export function isDealEnded(deal, now = new Date()) {
  if (!deal?.validUntil) return false
  const today = now.toISOString().slice(0, 10)
  return deal.validUntil < today
}

/** "5–19 August" / "14 August" — compact human range for banner copy. */
export function formatDealRange(deal) {
  if (!deal?.validFrom) return ''
  const fmt = (iso, withMonth = true) => {
    const d = new Date(`${iso}T00:00:00Z`)
    const day = d.getUTCDate()
    const month = d.toLocaleDateString('en-GB', { month: 'long', timeZone: 'UTC' })
    return withMonth ? `${day} ${month}` : String(day)
  }
  if (!deal.validUntil) return `from ${fmt(deal.validFrom)}`
  const sameMonth = deal.validFrom.slice(0, 7) === deal.validUntil.slice(0, 7)
  return sameMonth
    ? `${fmt(deal.validFrom, false)}–${fmt(deal.validUntil)}`
    : `${fmt(deal.validFrom)} – ${fmt(deal.validUntil)}`
}
