import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { getHeadlineDeal, getActiveDeals, formatDealRange } from '../../src/deals-data.js'

/* Home-page campaign band. Renders only while the headline offer is announced
   or running, so it removes itself on 15 August without a deploy — no stale
   sale banner left up in September.

   In normal flow (not fixed): the header is position:fixed with page offsets
   derived from it, and a fixed band would misalign every one of them. */
export default function DealStrip() {
  const deal = getHeadlineDeal()
  if (!deal) return null

  const live = getActiveDeals().some((d) => d.id === deal.id)
  const range = formatDealRange(deal)
  const href = deal.id === 'freedom-deal-2026' ? '/freedom-deal' : '/deals'

  return (
    <aside className="azadi-strip" aria-label={live ? 'Current offer' : 'Upcoming offer'}>
      <div className="section-shell py-8 md:py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-10">
          {deal.image && (
            <Link href={href} className="shrink-0 self-center sm:self-auto" tabIndex={-1} aria-hidden="true">
              <Image
                src={deal.image}
                alt=""
                width={1000}
                height={1414}
                loading="lazy"
                quality={70}
                sizes="120px"
                className="w-[92px] md:w-[120px] h-auto shadow-soft"
              />
            </Link>
          )}

          <p className="azadi-strip-figure shrink-0" aria-hidden="true">
            14<span>%</span>
          </p>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] md:text-[11px] tracking-[0.24em] uppercase font-semibold font-['Inter'] text-[color:var(--azadi-green)] mb-1.5">
              {live ? 'Now on' : 'Coming'} · {range}
            </p>
            <p className="font-['Unbounded'] font-bold text-[color:var(--azadi-deep)] text-lg md:text-2xl leading-tight mb-1.5">
              Freedom Deal — 14% off
            </p>
            <p className="text-[color:var(--azadi-deep)]/70 text-[13px] md:text-sm font-['Inter'] font-light max-w-md">
              Independence Day offer — when your visit totals Rs 1,400 or more.
              Combine any services to get there.
            </p>
          </div>

          <Link href={href} className="tap-safe azadi-btn shrink-0 self-stretch sm:self-auto justify-center">
            {live ? 'See the offer' : 'Details'}
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  )
}
