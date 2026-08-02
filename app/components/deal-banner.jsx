import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getHeadlineDeal, getActiveDeals, formatDealRange } from '../../src/deals-data.js'

/* Seasonal announcement strip. Renders nothing when no headline deal is
   running or announced, so it disappears on its own the day the offer ends —
   no stale "sale now on" left up in September.

   Deliberately in normal document flow rather than fixed above the header:
   the header is position:fixed with page offsets derived from --nav-h, and a
   fixed banner would push every one of those out of alignment. */
export default function DealBanner() {
  const deal = getHeadlineDeal()
  if (!deal) return null

  const live = getActiveDeals().some((d) => d.id === deal.id)
  const range = formatDealRange(deal)

  return (
    <aside
      className="bg-ink text-white"
      aria-label={live ? 'Current offer' : 'Upcoming offer'}
    >
      <div className="section-shell py-2.5 md:py-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
        <p className="text-[11px] md:text-xs font-['Inter'] tracking-wide leading-snug">
          <span className="font-semibold tracking-[0.14em] uppercase text-accent-gold">
            {live ? 'Now on' : 'Coming'}
          </span>
          <span className="mx-2 text-white/30" aria-hidden="true">·</span>
          <span className="font-medium">{deal.title}</span>
          <span className="mx-2 text-white/30" aria-hidden="true">·</span>
          <span className="text-white/70">{range}</span>
        </p>
        <Link
          href={deal.id === 'freedom-deal-2026' ? '/freedom-deal' : '/deals'}
          className="tap-safe inline-flex items-center gap-1 text-[11px] md:text-xs tracking-[0.14em] uppercase font-semibold font-['Inter'] text-white underline underline-offset-4 decoration-accent-gold hover:decoration-white transition-colors"
        >
          {live ? 'See the offer' : 'Details'}
          <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>
    </aside>
  )
}
