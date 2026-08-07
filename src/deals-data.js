/* Dates here are Asia/Karachi dates, not UTC ones.

   These five helpers each computed `today` with now.toISOString().slice(0,10),
   which is the UTC date. Karachi is UTC+5, so between midnight and 5 AM local
   the UTC date is still yesterday — and the campaign therefore kept
   advertising itself for the first five hours of the day AFTER it ended, and
   stayed dark for the first five hours of the day it opened. Proven against
   2026-08-14T21:00:00Z, which is 2 AM on the 15th in Karachi: getActiveDeals
   still returned freedom-deal-2026.

   salonTodayString() is the salon's own date and already existed in
   lib/date-local.js for exactly this reason. */
/** Real, honest deals only — no fake urgency, no "today only" that renews
 *  daily. Each deal the owner adds here appears on /deals with Offer schema;
 *  expired deals drop off automatically at build/render time.
 *
 *  Shape: validUntil (YYYY-MM-DD, inclusive) or null for evergreen. */

import { salonTodayString } from '../lib/date-local.js'
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
    /* Basket threshold for 14% — keep in sync with poster and book-page meter. */
    thresholdPkr: 1400,
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
  /* first-facial-10 retired: it promised 10% with no staff/code/ESP backup.
     Do not re-add a public % offer until the salon can honour it at the counter. */
]

/** Deals still valid on the given date (defaults to today). */
export function getActiveDeals(now = new Date()) {
  const today = salonTodayString(now)
  return DEALS.filter(
    (d) => (!d.validFrom || d.validFrom <= today) && (!d.validUntil || d.validUntil >= today),
  )
}

/** Deals announced but not yet open — shown as "starts <date>", never claimable. */
export function getUpcomingDeals(now = new Date()) {
  const today = salonTodayString(now)
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

/** True while validFrom…validUntil (inclusive) covers today. */
export function isDealActive(deal, now = new Date()) {
  if (!deal) return false
  const today = salonTodayString(now)
  return (
    (!deal.validFrom || deal.validFrom <= today) &&
    (!deal.validUntil || deal.validUntil >= today)
  )
}

/** True in the tease window: announced, not yet claimable. */
export function isDealUpcoming(deal, now = new Date()) {
  if (!deal?.teaseFrom || !deal?.validFrom) return false
  const today = salonTodayString(now)
  return (
    deal.teaseFrom <= today &&
    deal.validFrom > today &&
    (!deal.validUntil || deal.validUntil >= today)
  )
}

/** True after validUntil (inclusive window ended). Upcoming deals are not ended. */
export function isDealEnded(deal, now = new Date()) {
  if (!deal?.validUntil) return false
  const today = salonTodayString(now)
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
