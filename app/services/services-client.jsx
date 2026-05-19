'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { CAT_SLUGS, LazyVideo } from '../../src/shared.jsx'
import { SERVICES, CAT_META, track, formatPrice } from '../../src/data.js'
import LiveAvailability from './live-availability'

function getCatMeta(cat) {
  return CAT_META[cat] || { img: '/bleachpolish.jpg', tagline: 'Expert beauty services tailored for you.' }
}

const POPULAR_CATS = new Set(['Threading', 'Facials', 'Bridal'])

const AVAILABILITY_HINTS = {
  'Threading': 'Usually available same-day',
  'Rica Hot Wax': 'Usually available same-day',
  'Honey Wax': 'Usually available same-day',
  'Rica Wax': 'Usually available same-day',
  'Bleach & Polish': 'Usually available same-day',
  'Massage': 'Usually available same-day',
  'Hair Treatments': 'Book 1–2 days ahead',
  'Cleansing': 'Book 1–2 days ahead',
  'Facials': 'Book 1–2 days ahead',
  'Nails': 'Book 1–2 days ahead',
  'Bridal': 'Book 1–2 weeks ahead',
  'Hair': 'Book 1–2 days ahead',
  'Eyebrow Tattoo': 'Book 3–5 days ahead',
}

export default function ServicesClient() {
  const categories = Object.keys(SERVICES)

  return (
    <main id="main" className="page-content overflow-x-clip max-w-full min-w-0">
      <div className="section-shell section-pad min-h-0">
        <div className="mb-10 md:mb-14 border-b border-border-soft pb-8">
          <div className="overflow-hidden">
            <motion.h1 initial={{ y: '60%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
              className="display-section text-ink mb-4">
              OUR<span className="text-border-soft mx-1.5 sm:mx-3 font-light italic text-[0.6em]">—</span>SERVICES
            </motion.h1>
          </div>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
            className="text-body max-w-lg">
            From threading to bridal packages — select a category to explore our full menu. Book online in under a minute, or message us on WhatsApp.
          </motion.p>
        </div>

        <LiveAvailability />

        <h2 className="sr-only">Browse all service categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {categories.map((cat, i) => {
            const meta = getCatMeta(cat)
            const services = SERVICES[cat]
            const count = services.length
            const prices = services.map(s => s.pricePkr).filter(Boolean)
            const minPrice = prices.length ? Math.min(...prices) : null
            const href = `/services/${CAT_SLUGS[cat]}`
            const isPopular = POPULAR_CATS.has(cat)
            const availability = AVAILABILITY_HINTS[cat]
            return (
              <motion.article key={cat}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.05 }}
                className="relative overflow-hidden group text-left" style={{ aspectRatio: '3/4' }}>
                <Link href={href} onClick={() => track('ServiceCategoryView', { category: cat })} className="absolute inset-0 z-10" aria-label={`${cat} — ${count} services${minPrice ? `, from ${formatPrice(minPrice)}` : ''}`}>
                  <span className="sr-only">View {cat} services</span>
                </Link>
                <Image src={meta.img} alt={cat} loading="lazy" width={900} height={1200}
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105${meta.video ? ' group-hover:opacity-0' : ''}`} />
                {meta.video && (
                  <LazyVideo
                    src={meta.video}
                    poster={meta.img}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/5" />
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors duration-300" />
                <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                  {isPopular && (
                    <span className="text-[8px] tracking-[0.18em] uppercase font-semibold font-['Inter'] text-[#faf7f5] bg-accent-gold/90 backdrop-blur-sm px-2.5 py-1">Most Booked</span>
                  )}
                  <span className="text-[9px] tracking-widest uppercase text-white/50 font-['Inter'] bg-ink/30 backdrop-blur-sm px-2 py-1">{count} services</span>
                  {minPrice && (
                    <span className="text-[9px] tracking-wider text-white/80 font-['Inter'] bg-ink/40 backdrop-blur-sm px-2 py-1">From {formatPrice(minPrice)}</span>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="text-white font-['Syne'] font-bold text-xs sm:text-sm uppercase leading-tight mb-1 line-clamp-2">{cat}</h2>
                  {meta.tagline && (
                    <p className="text-white/55 text-[10px] font-['Inter'] leading-snug line-clamp-1">{meta.tagline}</p>
                  )}
                  {availability && (
                    <p className="text-white/40 text-[9px] font-['Inter'] mt-1">{availability}</p>
                  )}
                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-white text-[10px] tracking-widest uppercase font-['Inter']">View services</span>
                    <ChevronRight className="w-3 h-3 text-white" />
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </main>
  )
}
