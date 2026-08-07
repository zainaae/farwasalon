'use client'

import Link from 'next/link'
import ArrowUpRight from './icon-sprite.jsx'
import { track } from '../../src/site-config.js'
import { getHeadlineDeal, getActiveDeals, formatDealRange } from '../../src/deals-data.js'

/* Home campaign line — typographic, not a promo dashboard.
   Poster thumbnail + giant % figure made fold 2 read as three competing
   bands (proof / deal / quick-pick). One calm row keeps Azadi colour without
   stealing the story band below. Self-removes when the deal expires. */
export default function DealStrip() {
  const deal = getHeadlineDeal()
  if (!deal) return null

  const live = getActiveDeals().some((d) => d.id === deal.id)
  const range = formatDealRange(deal)
  const href = deal.id === 'freedom-deal-2026' ? '/freedom-deal' : '/deals'
  const onDealClick = () => track('DealStripClick', { from: 'home', deal: deal.id, live })

  return (
    <aside className="azadi-strip azadi-strip--slim" aria-label={live ? 'Current offer' : 'Upcoming offer'}>
      <div className="section-shell py-3.5 md:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] tracking-[0.2em] uppercase font-semibold font-[family-name:var(--font-inter)] text-[color:var(--azadi-green)] mb-1">
              {live ? `Now on · ${range}` : `Starts 5 August · ${range}`}
            </p>
            <p className="font-[family-name:var(--font-unbounded)] font-bold text-[color:var(--azadi-deep)] text-[15px] md:text-base leading-snug">
              Freedom Deal — 14% off when your visit hits Rs 1,400
            </p>
          </div>

          <Link
            href={href}
            onClick={onDealClick}
            className="tap-safe azadi-btn shrink-0 self-start sm:self-auto !min-h-11 !py-2.5 !px-5 text-[11px]"
          >
            {live ? 'See the offer' : 'Details'}
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  )
}
