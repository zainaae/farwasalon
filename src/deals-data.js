/** Real, honest deals only — no fake urgency, no "today only" that renews
 *  daily. Each deal the owner adds here appears on /deals with Offer schema;
 *  expired deals drop off automatically at build/render time.
 *
 *  Shape: validUntil (YYYY-MM-DD, inclusive) or null for evergreen. */
export const DEALS = [
  {
    /* Terms taken from the published poster (public/freedom-deal-2026.jpg):
       20% off services Rs 1,400 and above, 5–14 August 2026. */
    id: 'freedom-deal-2026',
    title: 'Freedom Deal — 20% off',
    description:
      'For Pakistan’s Independence Day, every service priced Rs 1,400 and above comes down by 20% from 5 to 14 August. The discount comes off the printed rate — the same rate that has been on this page all year, not one raised for the occasion.',
    priceNote: 'All services Rs 1,400 and above. Party makeup and keratin stay individually quoted.',
    category: 'Independence Day',
    href: '/prices',
    image: '/freedom-deal-2026.jpg',
    imageAlt: 'Farwa Beauty Salon Freedom Deal — 20% off services Rs 1,400 and above, 5 to 14 August 2026',
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
