'use client'

import Link from 'next/link'
import WaCta from '../components/wa-cta.jsx'
import Image from 'next/image'
import { ArrowUpRight, ChevronRight } from 'lucide-react'
import { SERVICES, CAT_META, CAT_SLUGS, track, formatPrice } from '../../src/data.js'
import { AREAS_HUB_HREF, getClientFacingAreaLinks } from '../../lib/location-links.js'
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
      /* Four columns from md, not three. The middle column was a single 983px
         `1fr` with a tagline capped at max-w-xl, and the longest tagline in the
         menu only runs ~330px — so every row carried ~650px of dead white and
         the menu region, 1,901px tall, was about 1.2M px2 of it. The count and
         availability move into their own right-aligned column, which turns two
         edges and a gap into three columns of information.

         Explicitly placed rather than rendered twice: on small screens it sits
         under the tagline in column 2, at md it moves to column 3. */
      className="group grid grid-cols-[3.5rem_1fr_auto] sm:grid-cols-[4.5rem_1fr_auto] md:grid-cols-[4.5rem_minmax(0,1fr)_auto_auto] items-center gap-x-4 sm:gap-x-6 gap-y-1.5 py-4 sm:py-5 border-b border-border-soft hover:bg-mist/70 transition-colors duration-300 -mx-3 px-3">
      <span className="row-span-2 md:row-span-1 relative block w-14 h-[4.2rem] sm:w-[4.5rem] sm:h-[5.4rem] shrink-0 border border-border-soft p-[3px] bg-white">
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
          <h3 className="font-[family-name:var(--font-syne)] font-semibold text-ink text-base sm:text-lg md:text-xl leading-tight">{cat}</h3>
          {POPULAR_CATS.has(cat) && (
            <span className="text-[9px] tracking-[0.18em] uppercase font-semibold font-['Inter'] text-accent-gold-deep">Most booked</span>
          )}
        </span>
        {meta.tagline && (
          <p className="text-stone text-[13px] sm:text-sm font-light font-['Inter'] leading-snug mt-0.5">{meta.tagline}</p>
        )}
      </span>
      <p className="col-start-2 row-start-2 md:col-start-3 md:row-start-1 md:text-right md:self-center text-stone text-[11px] font-['Inter'] whitespace-nowrap">
        {count} services{availability ? ` · ${availability.toLowerCase()}` : ''}
      </p>
      <span className="col-start-3 row-start-1 row-span-2 md:col-start-4 md:row-start-1 md:row-span-1 text-right shrink-0">
        {minPrice && (
          <>
            <span className="block text-[10px] tracking-[0.18em] uppercase font-['Inter'] text-stone">from</span>
            <span className="block font-[family-name:var(--font-unbounded)] font-bold text-ink text-sm sm:text-base md:text-lg leading-tight tabular-nums">{formatPrice(minPrice)}</span>
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
  const areaLinks = getClientFacingAreaLinks()

  return (
    <main id="main" className="page-content overflow-x-clip max-w-full min-w-0">
      <div className="section-shell section-pad min-h-0">
        <div className="mb-10 md:mb-14 border-b border-border-soft pb-8">
          {/* CSS entrances — framer's initial{opacity:0} kept this header
              invisible until hydration, making the intro paragraph a ~5.5s
              LCP (same failure mode the homepage hero had). */}
          <div className="overflow-hidden">
            <h1 className="hero-rise display-section text-ink mb-4" style={{ animationDuration: '0.9s' }}>
              OUR<span className="text-border-soft mx-1.5 sm:mx-3 font-light italic text-[0.6em]">—</span>SERVICES
            </h1>
          </div>
          <p className="hero-fade-up text-body max-w-lg mb-6" style={{ animationDelay: '0.2s' }}>
            Thirteen specialities, 100+ services in PECHS, Karachi — every starting price printed from Rs 100.
            Book online in under a minute, or message us on WhatsApp.
          </p>
          <div className="hero-fade-up flex flex-wrap items-center gap-3" style={{ animationDelay: '0.3s' }}>
            <Link href="/book" className="tap-safe btn-primary !py-2.5 !px-5">
              Book online <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <WaCta href="https://wa.me/923222782254" from="services-index"
              className="tap-safe btn-secondary !py-2.5 !px-5">
              WhatsApp
            </WaCta>
            <Link href="/prices"
              className="tap-safe link-underline text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors flex items-center">
              Full price list
            </Link>
          </div>

          <ol className="hero-fade-up mt-8 pt-6 border-t border-border-soft flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-8" style={{ animationDelay: '0.35s' }} aria-label="How a visit works">
            {[
              { n: '01', title: 'Book', line: 'Pick a service and a live slot online — or WhatsApp if you prefer.' },
              { n: '02', title: 'Visit', line: 'Come to the PECHS studio. We confirm the work before we start.' },
              { n: '03', title: 'Done', line: 'Printed PKR, no surprise add-ons — leave when you feel ready.' },
            ].map((step) => (
              <li key={step.n} className="flex gap-3 min-w-0 sm:max-w-[14rem]">
                <span className="font-[family-name:var(--font-unbounded)] text-[10px] text-accent-gold-deep shrink-0 pt-0.5" aria-hidden="true">{step.n}</span>
                <span>
                  <span className="block font-['Syne'] font-semibold text-ink text-sm mb-0.5">{step.title}</span>
                  <span className="block text-body text-xs leading-relaxed">{step.line}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <LiveAvailability />

        {/* The chapters below are real h2s now, so this stand-in is gone —
            it existed only because the visible chapter labels were spans.

            Constrained to max-w-4xl. At the full 1200px shell width a menu row
            carried its name and tagline at the far left and its count and price
            at the far right, ~470px apart, so the row read as scattered pieces
            rather than one line you scan. Narrowing the canvas is what fixes
            that — not moving the pieces around inside it. */}
        <div className="max-w-4xl">
          {MENU_CHAPTERS.map(({ name, caption, cats }) => (
            <section key={name} aria-label={name}>
              <div className="flex items-baseline gap-4 pt-10 pb-3 border-b border-ink/30 first:pt-2">
                <h2 className="section-title text-accent-gold-deep">{name}</h2>
                <span className="eyebrow">{caption}</span>
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
            One PECHS studio — clients visit from across Karachi.
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {areaLinks.map(({ slug, href, label }) => (
              <li key={slug}>
                <Link href={href} className="tap-safe inline-flex items-center min-h-[44px] link-underline text-stone text-sm font-['Inter'] hover:text-ink">
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={AREAS_HUB_HREF} className="tap-safe inline-flex items-center min-h-[44px] link-underline text-ink text-sm font-['Inter'] font-medium hover:text-stone">
                See all areas →
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </main>
  )
}
