'use client'

import Link from 'next/link'
import ArrowUpRight from '../components/icon-sprite.jsx'
import WaCta from '../components/wa-cta.jsx'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { SERVICES, CAT_META, CAT_SLUGS, track, formatPrice, categoryMarketingFromPrice } from '../../src/data.js'
import { AREAS_HUB_HREF, getClientFacingAreaLinks } from '../../lib/location-links.js'
import LiveAvailability from './live-availability'
import PageCloseCta from '../components/page-close-cta.jsx'

function getCatMeta(cat) {
  return CAT_META[cat] || { img: '/bleachpolish.jpg', tagline: 'Expert beauty services tailored for you.' }
}

const SERVICE_COUNT = Object.values(SERVICES).reduce((a, v) => a + v.length, 0)
const POPULAR_CATS = new Set(['Threading', 'Facials', 'Bridal'])

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
  const fromPrice = categoryMarketingFromPrice(cat)
  const href = `/services/${CAT_SLUGS[cat]}`

  return (
    <Link
      href={href}
      onClick={() => track('ServiceCategoryView', { category: cat })}
      /* Four columns from md, not three. The middle column was a single 983px
         `1fr` with a tagline capped at max-w-xl, and the longest tagline in the
         menu only runs ~330px — so every row carried ~650px of dead white and
         the menu region, 1,901px tall, was about 1.2M px2 of it. The count
         moves into its own right-aligned column, which turns two edges and a
         gap into three columns of information.

         Explicitly placed rather than rendered twice: on small screens it sits
         under the tagline in column 2, at md it moves to column 3.
         Availability claims live only in LiveAvailability above — static
         "same-day" hints contradicted a fully-booked widget. */
      className="group grid grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] md:grid-cols-[4.5rem_minmax(0,1fr)_auto_auto] items-center gap-x-4 sm:gap-x-6 gap-y-1.5 py-4 sm:py-5 border-b border-border-soft hover:bg-mist/70 transition-colors duration-300 -mx-3 px-3">
      <span className="row-span-2 md:row-span-1 relative block w-14 h-[4.2rem] sm:w-[4.5rem] sm:h-[5.4rem] shrink-0 border border-border-soft p-[3px] bg-white media-zoom">
        <span className="relative block w-full h-full overflow-hidden">
          <Image
            src={meta.img}
            alt=""
            fill
            sizes="72px"
            quality={60}
            loading="lazy"
            className="object-cover"
          />
        </span>
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-[family-name:var(--font-syne)] font-semibold text-ink text-base sm:text-lg md:text-xl leading-tight">{cat}</h3>
          {POPULAR_CATS.has(cat) && (
            <span className="text-[9px] tracking-[0.18em] uppercase font-semibold font-[family-name:var(--font-inter)] text-berry">Most booked</span>
          )}
        </span>
        {meta.tagline && (
          <p className="text-stone text-[13px] sm:text-sm font-light font-[family-name:var(--font-inter)] leading-snug mt-0.5">{meta.tagline}</p>
        )}
      </span>
      <p className="col-start-2 row-start-2 md:col-start-3 md:row-start-1 md:text-right md:self-center text-stone text-[11px] font-[family-name:var(--font-inter)] whitespace-nowrap">
        {count} services
      </p>
      <span className="col-start-3 row-start-1 row-span-2 md:col-start-4 md:row-start-1 md:row-span-1 text-right shrink-0">
        {fromPrice && (
          <>
            <span className="block text-[10px] tracking-[0.18em] uppercase font-[family-name:var(--font-inter)] text-stone">from</span>
            <span className="block font-[family-name:var(--font-fraunces)] font-bold text-ink text-sm sm:text-base md:text-lg leading-tight tabular-nums">{formatPrice(fromPrice)}</span>
          </>
        )}
        <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-stone opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
        {/* One column for the whole page, centred. The menu was already
            constrained to max-w-4xl for a good reason (see below) but the
            header, the printed-price note and the areas block all ran the
            full shell — so three different widths stacked, the header's rule
            ended at x=1320 while the chapter rules ended at x=1020, and the
            leftover ~300px sat asymmetrically down one side. Same column for
            everything means one left edge, one rule length, and margins that
            read as margins. */}
        <div className="max-w-4xl mx-auto">
        <div className="mb-10 md:mb-14 border-b border-border-soft pb-8">
          {/* CSS entrances — framer's initial{opacity:0} kept this header
              invisible until hydration, making the intro paragraph a ~5.5s
              LCP (same failure mode the homepage hero had).
              No overflow-hidden: it clipped display glyphs on the title. */}
          <div className="title-stack max-w-2xl lg:max-w-[28rem] border-l-2 border-plum pl-5 lg:pl-6">
          <p className="hero-fade-up eyebrow text-plum">— Services · PECHS</p>
          <h1 className="hero-rise display-page text-ink" style={{ animationDuration: '0.9s' }}>
            Our services
          </h1>
          <p className="hero-fade-up text-body max-w-lg" style={{ animationDelay: '0.2s' }}>
            Thirteen specialities, {SERVICE_COUNT} services in PECHS, Karachi — every starting price printed from Rs 100.
            Book online in under a minute, or message us on WhatsApp.
          </p>
          <div className="hero-fade-up cta-cluster mt-8" style={{ animationDelay: '0.3s' }}>
            <span className="hidden md:contents">
              <Link href="/book" className="tap-safe btn-loud !min-h-12 !py-2.5 !px-5 !text-[12px]">
                Book online <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </span>
            <Link
              href="/book"
              className="tap-safe md:hidden inline-flex items-center gap-1.5 min-h-[44px] text-ink text-[11px] tracking-[0.14em] uppercase font-semibold font-[family-name:var(--font-inter)] link-underline"
            >
              Book online <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <span className="hidden md:contents">
              <WaCta href="https://wa.me/923222782254" from="services-index"
                className="tap-safe btn-secondary !py-2.5 !px-5">
                WhatsApp
              </WaCta>
            </span>
            <Link href="/prices"
              className="tap-safe link-underline text-stone text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] hover:text-ink transition-colors flex items-center">
              Full price list
            </Link>
          </div>
          </div>

          <ol className="hero-fade-up mt-8 pt-6 border-t border-border-soft flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-8" style={{ animationDelay: '0.35s' }} aria-label="How a visit works">
            {[
              { n: '01', title: 'Book', line: 'Pick a service and a live slot online — or WhatsApp if you prefer.' },
              { n: '02', title: 'Visit', line: 'Come to the PECHS studio. We confirm the work before we start.' },
              { n: '03', title: 'Done', line: 'Printed PKR, no surprise add-ons — leave when you feel ready.' },
            ].map((step) => (
              <li key={step.n} className="flex gap-3 min-w-0 sm:max-w-[14rem]">
                <span className="font-[family-name:var(--font-fraunces)] text-[10px] text-accent-gold-deep shrink-0 pt-0.5" aria-hidden="true">{step.n}</span>
                <span>
                  <span className="block font-[family-name:var(--font-syne)] font-semibold text-ink text-sm mb-0.5">{step.title}</span>
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
        <div>
          {MENU_CHAPTERS.map(({ name, caption, cats }) => (
            <section key={name} aria-label={name}>
              <div className="chapter-rail">
                <h2 className="section-title">{name}</h2>
                <span className="eyebrow mb-0">{caption}</span>
              </div>
              {cats.map((cat) => <MenuRow key={cat} cat={cat} />)}
            </section>
          ))}
        </div>
        <p className="mt-8 text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-stone/80">
          Every price is a printed starting figure — final quotes confirmed before your appointment, never after.
        </p>

        {/* This page measured 1 shadowed element out of 281 and a single flat
            ground end to end. "Areas we serve" is its FAQ equivalent — a block
            of a different kind at the bottom of the menu — so it takes the same
            panel-soft + shadow-soft the category pages and the blog featured
            card now use, and gives the page its one tonal step. */}
        <section className="mt-12 panel-soft shadow-soft p-6 sm:p-8 md:p-10" aria-labelledby="areas-heading">
          <h2 id="areas-heading" className="font-[family-name:var(--font-syne)] font-bold text-lg text-ink mb-3">
            Areas we serve
          </h2>
          <p className="text-stone text-sm font-light font-[family-name:var(--font-inter)] mb-4 max-w-xl">
            One PECHS studio — clients visit from across Karachi.
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {areaLinks.map(({ slug, href, label }) => (
              <li key={slug}>
                <Link href={href} className="tap-safe inline-flex items-center min-h-[44px] link-underline text-stone text-sm font-[family-name:var(--font-inter)] hover:text-ink">
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={AREAS_HUB_HREF} className="tap-safe inline-flex items-center min-h-[44px] link-underline text-ink text-sm font-[family-name:var(--font-inter)] font-medium hover:text-stone">
                See all areas →
              </Link>
            </li>
          </ul>
        </section>
        </div>
      </div>
      <PageCloseCta waFrom="services-index" />
    </main>
  )
}
