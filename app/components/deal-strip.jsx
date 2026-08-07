'use client'

import Link from 'next/link'
import ArrowUpRight from './icon-sprite.jsx'
import Image from 'next/image'
import { track } from '../../src/site-config.js'
import { getHeadlineDeal, getActiveDeals, formatDealRange } from '../../src/deals-data.js'

/**
 * Single Freedom Deal band for home + prices (+ anywhere else).
 * Poster + copy + CTA share one row language — no separate ink DealBanner.
 */
export default function DealStrip({ from = 'home' } = {}) {
  const deal = getHeadlineDeal()
  if (!deal) return null

  const live = getActiveDeals().some((d) => d.id === deal.id)
  const range = formatDealRange(deal)
  const href = deal.id === 'freedom-deal-2026' ? '/freedom-deal' : '/deals'
  const onDealClick = () => track('DealStripClick', { from, deal: deal.id, live })

  return (
    <aside className="azadi-strip" aria-label={live ? 'Current offer' : 'Upcoming offer'}>
      <div className="section-shell py-4 md:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          {deal.image ? (
            <Link
              href={href}
              onClick={onDealClick}
              className="shrink-0 self-start border border-[color:var(--azadi-tint)] bg-white/50 p-1"
              aria-label={`${deal.title} — view offer`}
            >
              <Image
                src={deal.image}
                alt={deal.imageAlt || 'Freedom Deal poster'}
                width={1000}
                height={1414}
                loading="lazy"
                quality={65}
                sizes="80px"
                className="block h-auto w-[72px] md:w-[80px]"
              />
            </Link>
          ) : null}

          <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
            <p
              className="azadi-strip-figure azadi-strip-figure--soft shrink-0 leading-none"
              aria-hidden="true"
            >
              14<span>%</span>
            </p>
            <div className="min-w-0 flex-1">
              <p className="mb-1 font-[family-name:var(--font-inter)] text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--azadi-green)]">
                {live ? `Now on · ${range}` : `Starts 5 August · ${range}`}
              </p>
              <p className="font-[family-name:var(--font-unbounded)] text-[15px] font-bold leading-snug text-[color:var(--azadi-deep)] md:text-base">
                Freedom Deal — 14% off when your visit hits Rs 1,400
              </p>
            </div>
          </div>

          <Link
            href={href}
            onClick={onDealClick}
            className="azadi-btn tap-safe !min-h-11 !px-5 !py-2.5 text-[11px] self-stretch sm:self-auto sm:shrink-0 justify-center"
          >
            {live ? 'See the offer' : 'Details'}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  )
}
