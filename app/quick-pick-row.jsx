'use client'

import Link from 'next/link'
import ArrowUpRight from './components/icon-sprite.jsx'
import { SERVICES, formatPrice, track } from '../src/data.js'

const CATEGORY_COUNT = Object.keys(SERVICES).length

/* Six shortcuts — eight made fold 2 a spreadsheet. Full menu stays one tap away. */
const QUICK_PICK_CATEGORIES = [
  'Threading',
  'Bridal',
  'Facials',
  'Nails',
  'Hair',
  'Massage',
]

function minPriceFor(category) {
  const list = SERVICES[category]
  if (!Array.isArray(list)) return null
  const prices = list.map((s) => s.pricePkr).filter((p) => typeof p === 'number')
  return prices.length ? Math.min(...prices) : null
}

function maxPriceFor(category) {
  const list = SERVICES[category]
  if (!Array.isArray(list)) return null
  const prices = list.map((s) => s.pricePkr).filter((p) => typeof p === 'number')
  return prices.length ? Math.max(...prices) : null
}

export default function QuickPickRow() {
  const items = QUICK_PICK_CATEGORIES.filter((c) => SERVICES[c]?.length).map((c) => {
    /* Bridal marketing leads with the Full Package ceiling, not the trial floor. */
    if (c === 'Bridal') {
      const ceiling = maxPriceFor(c)
      return {
        category: c,
        priceLabel: ceiling != null ? `Package ${formatPrice(ceiling)}` : null,
        ariaPrice: ceiling != null ? `package ${formatPrice(ceiling)}` : '',
      }
    }
    const minPrice = minPriceFor(c)
    return {
      category: c,
      priceLabel: minPrice != null ? `From ${formatPrice(minPrice)}` : null,
      ariaPrice: minPrice != null ? `from ${formatPrice(minPrice)}` : '',
    }
  })

  if (items.length === 0) return null

  /* Flat strip under the deal band. StickyMobileCTA owns the spacer for the
     Call/WA/Book bar — do not double-pad here or fold 2 reads as empty white. */
  return (
    <section
      aria-labelledby="quickpick-heading"
      className="cv-auto bg-white border-b border-border-soft pt-6 md:pt-8 pb-6 md:pb-8"
    >
      <div className="section-shell">
        <div className="flex items-baseline justify-between gap-4 mb-3.5 md:mb-4">
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
          {items.map(({ category, priceLabel, ariaPrice }) => (
            <div key={category} className="min-w-0 h-full">
              <Link
                href={`/book?category=${encodeURIComponent(category)}`}
                onClick={() => track('QuickPick', { category })}
                aria-label={`Book ${category}${ariaPrice ? ` — ${ariaPrice}` : ''}`}
                className="tap-safe quick-pick-card"
              >
                <span className="font-[family-name:var(--font-syne)] font-bold text-[11px] sm:text-[12px] text-ink uppercase leading-tight line-clamp-2 w-full min-h-[2.5em]">
                  {category}
                </span>
                {priceLabel ? (
                  <span className="text-accent-gold-deep text-[10px] font-[family-name:var(--font-inter)] font-medium truncate w-full">
                    {priceLabel}
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
