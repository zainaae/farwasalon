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
      'For Pakistan’s Independence Day, take 14% off when your visit totals Rs 1,400 or more, from 5 to 14 August. One service of Rs 1,400+ qualifies when you book online. To combine several services in one visit, WhatsApp us with your list — we book the basket at the counter; the online form takes one main service at a time. The discount comes off the printed rate, the same rate that has been on this page all year, not one raised for the occasion.',
    priceNote: 'Rs 1,400+ per visit — book one qualifying service online, or WhatsApp to combine. Party makeup and keratin stay individually quoted.',
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

/** Calendar day as YYYY-MM-DD in UTC — same convention as validFrom / validUntil. */
export function dealDay(now = new Date()) {
  return now.toISOString().slice(0, 10)
}

/** Deals still valid on the given date (defaults to today). */
export function getActiveDeals(now = new Date()) {
  const today = dealDay(now)
  return DEALS.filter(
    (d) => (!d.validFrom || d.validFrom <= today) && (!d.validUntil || d.validUntil >= today),
  )
}

/** Deals announced but not yet open — listed on /deals only, never on home/nav banners. */
export function getUpcomingDeals(now = new Date()) {
  const today = dealDay(now)
  return DEALS.filter(
    (d) =>
      d.teaseFrom &&
      d.teaseFrom <= today &&
      d.validFrom > today &&
      (!d.validUntil || d.validUntil >= today),
  )
}

/**
 * Sitewide promo surfaces (home strip, prices banner) — LIVE accent deals only.
 * Upcoming teasers stay off homepage / sticky / prominent CTAs so "Coming ·
 * 5–14 August" cannot linger before open or after expiry.
 */
export function getHeadlineDeal(now = new Date()) {
  return getActiveDeals(now).find((d) => d.accent) ?? null
}

/** 'upcoming' | 'live' | 'ended' — for deal landing pages that must soft-exit. */
export function getDealPhase(deal, now = new Date()) {
  if (!deal) return 'ended'
  const today = dealDay(now)
  if (deal.validFrom && deal.validFrom > today) return 'upcoming'
  if (deal.validUntil && deal.validUntil < today) return 'ended'
  return 'live'
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
