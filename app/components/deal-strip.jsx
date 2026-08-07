'use client'

import Link from 'next/link'
import ArrowUpRight from './icon-sprite.jsx'
import Image from 'next/image'
import { track } from '../../src/site-config.js'
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
  const onDealClick = () => track('DealStripClick', { from: 'home', deal: deal.id, live })

  return (
    <aside className="azadi-strip" aria-label={live ? 'Current offer' : 'Upcoming offer'}>
      <div className="section-shell py-5 md:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
          {deal.image && (
            <Link href={href} onClick={onDealClick} className="shrink-0 self-center sm:self-auto" tabIndex={-1} aria-hidden="true">
              <Image
                src={deal.image}
                alt=""
                width={1000}
                height={1414}
                loading="lazy"
                quality={70}
                sizes="72px"
                className="w-[64px] md:w-[72px] h-auto"
              />
            </Link>
          )}

          <p className="azadi-strip-figure azadi-strip-figure--soft shrink-0" aria-hidden="true">
            14<span>%</span>
          </p>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] tracking-[0.2em] uppercase font-semibold font-[family-name:var(--font-inter)] text-[color:var(--azadi-green)] mb-1">
              {live ? `Now on · ${range}` : `Starts 5 August · ${range}`}
            </p>
            <p className="font-[family-name:var(--font-unbounded)] font-bold text-[color:var(--azadi-deep)] text-base md:text-lg leading-tight mb-1">
              Freedom Deal — 14% off
            </p>
            <p className="text-[color:var(--azadi-deep)]/70 text-[12px] md:text-[13px] font-[family-name:var(--font-inter)] font-light max-w-md">
              When your visit totals Rs 1,400 or more — combine any services.
            </p>
          </div>

          <Link href={href} onClick={onDealClick} className="tap-safe azadi-btn shrink-0 self-stretch sm:self-auto justify-center !py-2.5 !px-5 text-[12px]">
            {live ? 'See the offer' : 'Details'}
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  )
}
