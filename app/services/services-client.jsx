'use client'

import Link from 'next/link'
import Image from 'next/image'
import { m } from 'framer-motion'
import { ArrowUpRight, ChevronRight } from 'lucide-react'
import { SERVICES, CAT_META, CAT_SLUGS, track, formatPrice } from '../../src/data.js'
import { getPriorityLocationLinks } from '../../lib/location-links.js'
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

/* The menu is grouped into editorial chapters instead of a card grid —
   a ruled, priced list reads like a couture menu and prints every
   starting price (the big salons make you call to ask). */
const MENU_CHAPTERS = [
  { name: 'The Face', caption: 'Glow & skin rituals', cats: ['Facials', 'Cleansing', 'Bleach & Polish'] },
  { name: 'The Brow & The Silk', caption: 'Shaping & hair removal', cats: ['Threading', 'Eyebrow Tattoo', 'Rica Hot Wax', 'Honey Wax', 'Rica Wax'] },
  { name: 'The Hair', caption: 'Cut · colour · repair', cats: ['Hair', 'Hair Treatments'] },
  { name: 'The Hands & The Calm', caption: 'Nails · body · rest', cats: ['Nails', 'Massage'] },
  { name: 'The Bride', caption: 'The flagship', cats: ['Bridal'] },
]

function MenuRow({ cat }) {
  const meta = getCatMeta(cat)
  const services = SERVICES[cat] || []
  const count = services.length
  const prices = services.map(s => s.pricePkr).filter(Boolean)
  const minPrice = prices.length ? Math.min(...prices) : null
  const href = `/services/${CAT_SLUGS[cat]}`
  const availability = AVAILABILITY_HINTS[cat]

  return (
    <Link
      href={href}
      onClick={() => track('ServiceCategoryView', { category: cat })}
      className="group grid grid-cols-[3.5rem_1fr_auto] sm:grid-cols-[4.5rem_1fr_auto] items-center gap-4 sm:gap-6 py-4 sm:py-5 border-b border-border-soft hover:bg-mist/70 transition-colors duration-300 -mx-3 px-3">
      <span className="relative block w-14 h-[4.2rem] sm:w-[4.5rem] sm:h-[5.4rem] shrink-0 border border-border-soft p-[3px] bg-white">
        <span className="relative block w-full h-full overflow-hidden">
          <Image
            src={meta.img}
            alt=""
            fill
            sizes="72px"
            quality={60}
            loading="lazy"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </span>
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="font-['Syne'] font-semibold text-ink text-lg sm:text-xl md:text-2xl leading-tight">{cat}</h2>
          {POPULAR_CATS.has(cat) && (
            <span className="text-[9px] tracking-[0.18em] uppercase font-semibold font-['Inter'] text-accent-gold-deep">Most booked</span>
          )}
        </span>
        {meta.tagline && (
          <p className="text-stone text-[13px] sm:text-sm font-light font-['Inter'] leading-snug mt-0.5 max-w-xl">{meta.tagline}</p>
        )}
        <p className="text-stone/70 text-[11px] font-['Inter'] mt-1">
          {count} services{availability ? ` · ${availability.toLowerCase()}` : ''}
        </p>
      </span>
      <span className="text-right shrink-0">
        {minPrice && (
          <>
            <span className="block text-[10px] tracking-[0.18em] uppercase font-['Inter'] text-stone">from</span>
            <span className="block font-['Unbounded'] font-bold text-ink text-sm sm:text-base md:text-lg leading-tight">{formatPrice(minPrice)}</span>
          </>
        )}
        <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] tracking-[0.14em] uppercase font-['Inter'] text-stone opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          View <ChevronRight className="w-3 h-3" />
        </span>
      </span>
    </Link>
  )
}

export default function ServicesClient() {
  const areaLinks = getPriorityLocationLinks()

  return (
    <main id="main" className="page-content overflow-x-clip max-w-full min-w-0">
      <div className="section-shell section-pad min-h-0">
        <div className="mb-10 md:mb-14 border-b border-border-soft pb-8">
          <div className="overflow-hidden">
            <m.h1 initial={{ y: '60%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
              className="display-section text-ink mb-4">
              OUR<span className="text-border-soft mx-1.5 sm:mx-3 font-light italic text-[0.6em]">—</span>SERVICES
            </m.h1>
          </div>
          <m.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
            className="text-body max-w-lg mb-6">
            Thirteen specialities, one hundred plus services — every starting price printed below.
            Book online in under a minute, or message us on WhatsApp.
          </m.p>
          <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-wrap items-center gap-3">
            <Link href="/book" className="tap-safe btn-primary !py-2.5 !px-5">
              Book online <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <a href="https://wa.me/923222782254" target="_blank" rel="noreferrer"
              className="tap-safe btn-secondary !py-2.5 !px-5">
              WhatsApp
            </a>
            <Link href="/prices"
              className="tap-safe link-underline text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors flex items-center">
              Full price list
            </Link>
          </m.div>
        </div>

        <LiveAvailability />

        <h2 className="sr-only">Browse all service categories</h2>
        <div>
          {MENU_CHAPTERS.map(({ name, caption, cats }) => (
            <section key={name} aria-label={name}>
              <div className="flex items-baseline gap-4 pt-10 pb-3 border-b border-ink/30 first:pt-2">
                <span className="font-['Syne'] italic font-semibold text-accent-gold-deep text-base sm:text-lg">{name}</span>
                <span className="eyebrow !text-[9px]">{caption}</span>
              </div>
              {cats.map((cat) => <MenuRow key={cat} cat={cat} />)}
            </section>
          ))}
        </div>
        <p className="mt-8 text-[11px] tracking-[0.14em] uppercase font-['Inter'] text-stone/80">
          Every price is a printed starting figure — final quotes confirmed before your appointment, never after.
        </p>

        <section className="mt-12 pt-10 border-t border-border-soft" aria-labelledby="areas-heading">
          <h2 id="areas-heading" className="font-['Syne'] font-bold text-lg text-ink mb-3">
            Areas we serve
          </h2>
          <p className="text-stone text-sm font-light font-['Inter'] mb-4 max-w-xl">
            Visit us in PECHS from anywhere in Karachi — local pages for popular treatments nearby.
          </p>
          <ul className="flex flex-wrap gap-2">
            {areaLinks.map(({ slug, href, label }) => (
              <li key={slug}>
                <Link href={href} className="tab-pill hover:border-ink hover:text-ink">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
