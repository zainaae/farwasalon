'use client'

import Link from 'next/link'
import { m } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { SERVICES, formatPrice, track } from '../src/data.js'

/** Top 6 categories worth a 1-tap shortcut from the home page. Order matters: most popular first. */
const QUICK_PICK_CATEGORIES = ['Threading', 'Bridal', 'Facials', 'Nails', 'Hair', 'Massage']

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

  return (
    <section
      aria-labelledby="quickpick-heading"
      className="cv-auto bg-white border-b border-border-soft py-5 md:py-7"
    >
      <div className="section-shell">
        <div className="flex items-baseline justify-between gap-4 mb-3.5 md:mb-4">
          <div className="flex items-baseline gap-3 min-w-0">
            <h2 id="quickpick-heading" className="eyebrow font-medium tracking-[0.32em]">
              — Quick pick
            </h2>
            <p className="text-stone/60 text-[10px] sm:text-[11px] font-['Inter'] hidden sm:block">
              Tap a service to start booking in one step
            </p>
          </div>
          <Link
            href="/services"
            className="tap-safe shrink-0 inline-flex items-center gap-1 text-stone hover:text-ink text-[10px] tracking-[0.16em] uppercase font-['Inter'] transition-colors"
          >
            All <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory scrollbar-none">
          {items.map(({ category, minPrice }, i) => (
            <m.div
              key={category}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/book?category=${encodeURIComponent(category)}`}
                onClick={() => track('QuickPick', { category })}
                aria-label={`Book ${category}${minPrice ? ` — from ${formatPrice(minPrice)}` : ''}`}
                className="tap-safe snap-start shrink-0 inline-flex flex-col items-start gap-0.5 border border-border-soft hover:border-ink hover:bg-mist hover:shadow-soft transition-all px-4 py-2.5 min-w-[7rem]"
              >
                <span className="font-['Syne'] font-bold text-[12px] text-ink uppercase leading-tight">
                  {category}
                </span>
                {minPrice != null ? (
                  <span className="text-accent-gold text-[10px] font-['Inter'] font-medium">
                    From {formatPrice(minPrice)}
                  </span>
                ) : (
                  <span className="text-stone text-[10px] font-['Inter']">View options</span>
                )}
              </Link>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  )
}
