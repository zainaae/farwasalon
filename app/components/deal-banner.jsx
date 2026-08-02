import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getHeadlineDeal, formatDealRange } from '../../src/deals-data.js'

/* Seasonal announcement strip. LIVE accent deals only — no pre-window
   "Coming" tease on prices or other surfaces. Disappears when validUntil
   passes, without a redeploy. */

export default function DealBanner() {
  const deal = getHeadlineDeal()
  if (!deal) return null

  const range = formatDealRange(deal)

  return (
    <aside
      className="bg-ink text-white"
      aria-label="Current offer"
    >
      <div className="section-shell py-2.5 md:py-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
        <p className="text-[11px] md:text-xs font-['Inter'] tracking-wide leading-snug">
          <span className="font-semibold tracking-[0.14em] uppercase text-accent-gold">
            Now on
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
          See the offer
          <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>
    </aside>
  )
}
