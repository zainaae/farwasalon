/** Real, honest deals only — no fake urgency, no "today only" that renews
 *  daily. Each deal the owner adds here appears on /deals with Offer schema;
 *  expired deals drop off automatically at build/render time.
 *
 *  Shape: validUntil (YYYY-MM-DD, inclusive) or null for evergreen. */
export const DEALS = [
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
