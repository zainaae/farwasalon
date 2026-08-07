'use client'

import Link from 'next/link'
import ArrowUpRight from './components/icon-sprite.jsx'
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

  /* Flat strip under the deal band — not a raised card dashboard. Quoti
     structure (one-tap booking shortcuts) stays; Farwa skin drops the
     nested white card + mini-tile grid that made fold 2 feel like a promo panel. */
  return (
    <section
      aria-labelledby="quickpick-heading"
      className="cv-auto bg-white border-b border-border-soft py-5 md:py-6"
    >
      <div className="section-shell">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <div className="flex items-baseline gap-3 min-w-0">
            <h2 id="quickpick-heading" className="font-[family-name:var(--font-syne)] font-semibold text-ink text-sm sm:text-base leading-none">
              Quick pick
            </h2>
            <p className="text-stone text-[10px] sm:text-[11px] font-[family-name:var(--font-inter)] hidden sm:block">
              Tap a service to start booking
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
                {/* min-h reserves both lines on every card. The card centres its
                  content, so "Eyebrow Tattoo" — the one name that wraps —
                  grew taller than its neighbours and pushed its price a line
                  below theirs, breaking the only horizontal edge this strip
                  has. 2.5em is two lines at leading-tight, and it is in em so
                  it tracks the 11px/12px breakpoint change. */}
              <span className="font-[family-name:var(--font-syne)] font-bold text-[11px] sm:text-[12px] text-ink uppercase leading-tight line-clamp-2 w-full min-h-[2.5em]">
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
              {/* Same reserved two lines as the service cards above. */}
              <span className="font-[family-name:var(--font-syne)] font-bold text-[11px] sm:text-[12px] text-ink uppercase leading-tight line-clamp-2 w-full min-h-[2.5em]">
                View all {CATEGORY_COUNT}
              </span>
              <span className="text-stone text-[10px] font-[family-name:var(--font-inter)]">Categories</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
