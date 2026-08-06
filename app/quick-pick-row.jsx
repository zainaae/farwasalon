'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SERVICES, formatPrice, track } from '../src/data.js'

const CATEGORY_COUNT = Object.keys(SERVICES).length

/** Popular shortcuts + high-value categories missing from the original six. */
const QUICK_PICK_CATEGORIES = [
  'Threading',
  'Bridal',
  'Facials',
  'Nails',
  'Hair',
  'Massage',
  'Eyebrow Tattoo',
  'Rica Hot Wax',
]

function minPriceFor(category) {
  const list = SERVICES[category]
  if (!Array.isArray(list)) return null
  const prices = list.map((s) => s.pricePkr).filter((p) => typeof p === 'number')
  return prices.length ? Math.min(...prices) : null
}

export default function QuickPickRow() {
  const items = QUICK_PICK_CATEGORIES.filter((c) => SERVICES[c]?.length).map((c) => ({
    category: c,
    minPrice: minPriceFor(c),
  }))

  if (items.length === 0) return null

  /* Raised, not another flat band. Every section on this page was a full-bleed
     strip at the same elevation, edge to edge, which is most of why the page
     reads flat — nothing sits on top of anything. Putting the shortcuts on a
     white card over the tinted ground gives the eye one object to land on
     right under the fold. No negative margin: the deal band above is
     conditional, and overlapping upward would land on the hero's buttons
     whenever the offer is off. */
  return (
    <section
      aria-labelledby="quickpick-heading"
      className="cv-auto bg-mist border-b border-border-soft py-6 md:py-9"
    >
      <div className="section-shell">
        <div className="bg-white shadow-card border border-border-soft px-4 sm:px-6 md:px-7 py-5 md:py-6">
          <div className="flex items-baseline justify-between gap-4 mb-3.5 md:mb-4">
            <div className="flex items-baseline gap-3 min-w-0">
              <h2 id="quickpick-heading" className="font-[family-name:var(--font-syne)] font-semibold text-ink text-base sm:text-lg leading-none">
                Quick pick
              </h2>
              <p className="text-stone text-[10px] sm:text-[11px] font-[family-name:var(--font-inter)] hidden sm:block">
                Tap a service to start booking in one step
              </p>
            </div>
            <Link
              href="/services"
              className="tap-safe shrink-0 inline-flex items-center gap-1 text-stone hover:text-ink text-[10px] tracking-[0.16em] uppercase font-[family-name:var(--font-inter)] transition-colors"
            >
              All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="quick-pick-grid">
            {items.map(({ category, minPrice }) => (
              <div key={category} className="min-w-0 h-full">
                <Link
                  href={`/book?category=${encodeURIComponent(category)}`}
                  onClick={() => track('QuickPick', { category })}
                  aria-label={`Book ${category}${minPrice ? ` — from ${formatPrice(minPrice)}` : ''}`}
                  className="tap-safe quick-pick-card"
                >
                  <span className="font-[family-name:var(--font-syne)] font-bold text-[11px] sm:text-[12px] text-ink uppercase leading-tight line-clamp-2 w-full">
                    {category}
                  </span>
                  {minPrice != null ? (
                    <span className="text-accent-gold-deep text-[10px] font-[family-name:var(--font-inter)] font-medium truncate w-full">
                      From {formatPrice(minPrice)}
                    </span>
                  ) : (
                    <span className="text-stone text-[10px] font-[family-name:var(--font-inter)]">View options</span>
                  )}
                </Link>
              </div>
            ))}
            <div className="min-w-0 h-full">
              <Link
                href="/services"
                onClick={() => track('QuickPick', { category: 'all' })}
                aria-label={`View all ${CATEGORY_COUNT} service categories`}
                className="tap-safe quick-pick-card quick-pick-card--all"
              >
                <span className="font-[family-name:var(--font-syne)] font-bold text-[11px] sm:text-[12px] text-ink uppercase leading-tight line-clamp-2 w-full">
                  View all {CATEGORY_COUNT}
                </span>
                <span className="text-stone text-[10px] font-[family-name:var(--font-inter)]">Categories</span>
              </Link>
            </div>
          </div>

          <p className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] tracking-[0.12em] uppercase font-[family-name:var(--font-inter)] text-stone">
            <Link href="/bridal" className="tap-safe hover:text-ink transition-colors">Bridal</Link>
            <Link href="/prices" className="tap-safe hover:text-ink transition-colors">Prices</Link>
            <Link href="/blog/bridal-beauty-timeline" className="tap-safe hover:text-ink transition-colors">Bridal timeline</Link>
          </p>
          </div>
      </div>
    </section>
  )
}
