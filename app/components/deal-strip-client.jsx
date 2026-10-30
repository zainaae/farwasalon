'use client'

import Link from 'next/link'
import ArrowUpRight from './icon-sprite.jsx'
import Image from 'next/image'
import { track } from '../../src/site-config.js'

/**
 * Presentational deal band. The server gate decides whether to render this
 * at all — never call getHeadlineDeal() here, or a static build can bake a
 * live "Now on" strip into HTML for months after the offer ends.
 */
export default function DealStripClient({
  from = 'home',
  dealId,
  image,
  imageAlt,
  href,
  live,
  range,
  pct,
  blurb,
}) {
  const onDealClick = () => track('DealStripClick', { from, deal: dealId, live })
  const eyebrow = live ? `Now on · ${range}` : `Coming · ${range}`

  return (
    <aside className="azadi-strip" aria-label={live ? 'Current offer' : 'Upcoming offer'}>
      <div className="section-shell py-4 md:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          {image ? (
            <Link
              href={href}
              onClick={onDealClick}
              className="shrink-0 self-start border border-[color:var(--azadi-tint)] bg-white/50 p-1"
              aria-label={`${blurb} — view offer`}
            >
              <Image
                src={image}
                alt={imageAlt || 'Current salon offer poster'}
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
            {pct ? (
              <p
                className="azadi-strip-figure azadi-strip-figure--soft shrink-0 leading-none"
                aria-hidden="true"
              >
                {pct}
                <span>%</span>
              </p>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="mb-1 font-[family-name:var(--font-inter)] text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--azadi-green)]">
                {eyebrow}
              </p>
              <p className="font-[family-name:var(--font-fraunces)] text-[15px] font-bold leading-snug text-[color:var(--azadi-deep)] md:text-base">
                {blurb}
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
