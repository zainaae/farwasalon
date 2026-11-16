import Link from 'next/link'
import { GOOGLE_GBP_STATS } from '../../src/google-reviews-data.js'
import { GOOGLE_REVIEW_LINK, PAYMENT_ACCEPTED } from '../../lib/business-schema.js'
import { FOUNDING_YEAR, YEARS_ACTIVE } from '../../src/site-config.js'

/**
 * Peer-inspired legitimacy strip (Areeba Google badge + Kashee’s contact
 * reassurance + payment callout) — only real Farwa facts. No plugins, no
 * invented review counts, no competitor assets.
 *
 * Use under money-page titles (bridal / book / contact / gallery). Home already
 * has ProofStrip; /prices already prints the same facts inline.
 */
export default function TrustSignalsBar({ className = '' }) {
  const payments = PAYMENT_ACCEPTED.join(' · ')
  const items = [
    {
      key: 'google',
      label: `${GOOGLE_GBP_STATS.rating}★ · ${GOOGLE_GBP_STATS.reviewCount} Google reviews`,
      href: GOOGLE_REVIEW_LINK,
      external: true,
    },
    { key: 'years', label: `Est. ${FOUNDING_YEAR} · ${YEARS_ACTIVE}+ years in PECHS` },
    { key: 'women', label: 'Women-only studio' },
    { key: 'pay', label: payments },
    { key: 'prices', label: 'Every price printed', href: '/prices' },
    {
      key: 'write',
      label: 'Leave a Google review',
      href: GOOGLE_REVIEW_LINK,
      external: true,
    },
  ]

  return (
    <aside
      className={`border-y border-border-soft bg-mist/60 ${className}`}
      aria-label="Trust and visit facts"
    >
      <ul className="section-shell flex gap-2 overflow-x-auto py-3 scrollbar-none snap-x snap-mandatory md:flex-wrap md:overflow-visible md:justify-center md:gap-x-1 md:gap-y-2">
        {items.map((item, i) => {
          const chip = (
            <span className="inline-flex items-center min-h-[36px] px-3 py-1.5 text-[11px] sm:text-xs font-[family-name:var(--font-inter)] text-ink/85 tracking-wide whitespace-nowrap">
              {item.label}
            </span>
          )
          return (
            <li key={item.key} className="snap-start shrink-0 flex items-center">
              {i > 0 ? (
                <span aria-hidden="true" className="hidden md:inline text-border-soft mx-1">
                  ·
                </span>
              ) : null}
              {item.href ? (
                <Link
                  href={item.href}
                  {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className="tap-safe rounded-sm border border-border-soft bg-white hover:border-ink/40 transition-colors"
                >
                  {chip}
                </Link>
              ) : (
                <span className="rounded-sm border border-transparent">{chip}</span>
              )}
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
