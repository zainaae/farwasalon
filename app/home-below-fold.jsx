'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import ArrowUpRight from './components/icon-sprite.jsx'
import WaCta from './components/wa-cta.jsx'
import Link from 'next/link'
import Image from 'next/image'
import { m } from 'framer-motion'
import { ChevronRight, Quote } from 'lucide-react'
import StarRating from './components/star-rating.jsx'
import {
  LazyVideo, CAT_SLUGS,
  WordmarkDivider,
} from '../src/shared.jsx'
import { formatPrice } from '../src/data.js'
import { GOOGLE_GBP_STATS, FACEBOOK_TESTIMONIALS } from '../src/google-reviews-data.js'
import SalonLocalBlock from './components/salon-local-block.jsx'
import QuickPickRow from './quick-pick-row.jsx'
import { SERVICES, CAT_META, YEARS_ACTIVE, WA_NUMBER, SERVICE_FILTER_TABS, filterServiceCategories, GOOGLE_REVIEW_LINK } from '../src/data.js'
import { EDITORIAL_PHOTOS } from '../src/salon-media.js'
import {
  getGbpStatsForDisplay,
  getManualReviewsPayload,
  describeReviewAge,
  formatReviewDate,
  sortByRecency,
  newestPostedAt,
} from '../lib/google-reviews.js'

/* The testimonials themselves now live in src/google-reviews-data.js, with an
   absolute `postedAt` each, so the freshness tests can see them and so the
   dates on the cards are computed rather than typed. */
const FB_TESTIMONIALS_BY_RECENCY = sortByRecency(FACEBOOK_TESTIMONIALS)

/* Shown in the big pull-quote when the Google reviews are unavailable. */
const FALLBACK_FEATURED_REVIEWS = FB_TESTIMONIALS_BY_RECENCY.slice(0, 2).map((p) => ({
  name: p.name,
  quote: p.quote,
  translation: p.translation ? `"${p.translation}"` : null,
  link: p.link,
  postedAt: p.postedAt,
}))

function EditorialMedia({ item, className = '' }) {
  // Still via next/image only — raw <video poster> was pulling ~80KB JPEGs on first paint.
  return (
    <Image
      src={item.src}
      alt={item.label}
      loading="lazy"
      width={330}
      height={440}
      quality={55}
      sizes="(max-width: 768px) 70vw, 330px"
      className={`w-full h-full object-cover ${className}`}
    />
  )
}

function StatsStrip() {
  /* Story band only. The four trust figures live in ProofStrip under the hero —
     repeating years / appointments / service count here made the page feel like
     it was restating itself, and overflow-hidden on the title clipped Unbounded.

     Gutter has to match the rest of the page. Padding on the <section> plus
     the 1280 cap on the inner div puts content at x=80, because the cap is
     applied after the padding is already spent; every other band pads inside
     the cap and lands at x=120. Two sections were doing it the first way, so
     the left edge stepped in and out by 40px as you scrolled. */
  return (
    <section className="cv-auto bg-white py-14 sm:py-16 md:py-[4.5rem] border-b border-border-soft">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-end">
          <m.div initial={{ y: 28, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
            className="title-stack">
            <p className="eyebrow">— Est. 2008 · PECHS</p>
            <h2 className="display-page max-w-xl text-ink">
              A beauty studio with {YEARS_ACTIVE} years of care
            </h2>
          </m.div>
          <m.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.12 }}
            className="flex flex-col gap-5 sm:gap-6 md:pb-1">
            <p className="text-body max-w-xl">
              For over {YEARS_ACTIVE}{' '}years, Farwa Beauty Salon has been a steady favourite in PECHS, Karachi. Expert care, a warm welcome, and results that speak for themselves &mdash; every single visit.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 border-t border-border-soft">
              <Link href="/book" className="tap-safe inline-flex items-center gap-2 text-ink text-sm font-medium font-[family-name:var(--font-inter)] group w-fit pt-4">
                <span className="link-underline">Book a visit</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link href="/about" className="tap-safe text-stone hover:text-ink text-[11px] tracking-wide font-[family-name:var(--font-inter)] transition-colors pt-4">
                Our story
              </Link>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  )
}

function EditorialSlideshow() {
  /* The list is doubled so the strip can loop seamlessly. The second copy is
     the same 13 photos, so it is presentational: without aria-hidden a screen
     reader reads the gallery twice, and without tabIndex -1 a keyboard user
     tabs 26 stops through 13 destinations — inside a strip that is still
     moving. Only the first copy is reachable. */
  const doubled = [...EDITORIAL_PHOTOS, ...EDITORIAL_PHOTOS]
  const isClone = (i) => i >= EDITORIAL_PHOTOS.length

  return (
    <section
      className="cv-auto editorial-marquee bg-mist border-y border-[#e4ddd7] overflow-x-clip max-w-full"
      aria-label="Editorial photo showcase"
    >
      <div className="section-shell flex items-end justify-between gap-4 pt-5 pb-2 px-4 sm:px-5 md:px-10">
        <p className="eyebrow mb-0">— The work</p>
        <Link
          href="/gallery"
          className="tap-safe inline-flex items-center gap-1.5 text-[10px] tracking-[0.16em] uppercase font-[family-name:var(--font-inter)] text-ink hover:text-stone transition-colors"
        >
          See the work <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {/* One track, restyled per breakpoint. This was two — a md:hidden
          scroller and a hidden md:block one — over the same doubled list, so
          all 13 photos shipped four times (2 breakpoints x the loop clone) as
          52 cards, and ~30 KB of the document was display:none on any given
          device. That is the same bug the reviews grid below already had; the
          comment there explains it at length.

          The two differed in ways that are all expressible responsively: card
          size, margin, gradient depth, and a mobile-only index numeral. The
          track speed differed too (45s vs 65s) — that now lives in one class
          with a media query, in globals.css. */}
      <div className="py-3 md:py-2 w-full max-w-full overflow-x-clip md:isolate">
        <div className="editorial-marquee-track flex w-max max-w-none will-change-transform">
          {doubled.map((p, i) => {
            const href = p.href || '/gallery'
            return (
              <Link
                key={i}
                href={href}
                className="relative shrink-0 overflow-hidden group mx-[5px] md:mx-1.5 w-[min(62vw,230px)] h-[min(82vw,306px)] md:w-[260px] md:h-auto md:aspect-[3/4] lg:w-[300px] xl:w-[330px]"
                aria-label={`${p.label} — see gallery`}
                aria-hidden={isClone(i) || undefined}
                tabIndex={isClone(i) ? -1 : undefined}
              >
                <EditorialMedia item={p} className="transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                <span className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <span className="text-white text-[10px] tracking-[0.2em] md:tracking-[0.18em] uppercase font-[family-name:var(--font-inter)] font-medium leading-none">
                    {p.label}
                  </span>
                  <span className="md:hidden text-white/60 text-[9px] font-[family-name:var(--font-inter)] tabular-nums">
                    {String((i % EDITORIAL_PHOTOS.length) + 1).padStart(2, '0')}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="section-shell px-4 sm:px-5 md:px-10 pb-5 pt-1">
        <Link
          href="/gallery"
          className="tap-safe link-underline text-stone hover:text-ink text-[11px] font-[family-name:var(--font-inter)] transition-colors"
        >
          Browse the full gallery
        </Link>
      </div>
    </section>
  )
}

/** The panel's video exists only to answer a hover. A touch device never
 *  hovers, so on mobile it was 753 KB of metered data — more than three times
 *  the page's entire gzipped JS — downloaded to sit still behind a text list.
 *  `(hover: hover)` is the exact capability it depends on, so that is the gate.
 *  Same reduced-motion and desktop checks as the hero video, for the same
 *  reasons. */
function useHoverVideoEnabled() {
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    queueMicrotask(() => {
      const canHover = window.matchMedia('(hover: hover)').matches
      const desktop = window.matchMedia('(min-width: 768px)').matches
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (canHover && desktop && !reduce) setEnabled(true)
    })
  }, [])
  return enabled
}

function ServiceMediaPanel({ hovered }) {
  const activeVideo = hovered ? CAT_META[hovered]?.video : null
  const videoEnabled = useHoverVideoEnabled()

  return (
    <div className="relative w-full h-full bg-[#0d0609]">
      <Image
        src="/threading.jpg"
        alt=""
        fill
        quality={50}
        sizes="(max-width: 768px) 100vw, 45vw"
        className="object-cover object-center transition-opacity duration-500 pointer-events-none"
        style={{ opacity: (hovered && activeVideo) ? 0 : 1 }}
        aria-hidden
      />
      {videoEnabled && (
        <LazyVideo
          src="/ct.mp4"
          muted
          loop
          playsInline
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500"
          style={{ opacity: (hovered && activeVideo) ? 0 : 1 }}
        />
      )}
      {hovered && !CAT_META[hovered]?.video && (
        <Image
          key={hovered}
          src={CAT_META[hovered]?.img || '/bleachpolish.jpg'}
          alt={hovered}
          fill
          quality={65}
          sizes="(max-width: 768px) 100vw, 45vw"
          className="absolute inset-0 object-cover transition-opacity duration-500 pointer-events-none"
          aria-hidden="true"
        />
      )}
      {activeVideo && videoEnabled && (
        <video
          key={activeVideo}
          src={activeVideo}
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none animate-fadeIn"
          aria-hidden="true"
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 bg-gradient-to-t from-ink/80 to-transparent z-10">
        <p className="text-white/60 text-[10px] tracking-[0.24em] uppercase font-[family-name:var(--font-inter)] transition-colors duration-300">
          {hovered ?? 'Farwa Beauty Salon'}
        </p>
        <p className="text-white font-[family-name:var(--font-syne)] font-bold text-sm transition-colors duration-300">
          {hovered ? `${SERVICES[hovered]?.length} services` : 'PECHS, Karachi'}
        </p>
      </div>
    </div>
  )
}

const HOME_SERVICE_TABS = SERVICE_FILTER_TABS

function FeaturedServices() {
  const categories = Object.keys(SERVICES)
  const [hovered, setHovered] = useState(null)
  const [activeTab, setActiveTab] = useState('All')
  const visibleCategories = filterServiceCategories(categories, activeTab)

  return (
    <section className="cv-auto bg-mist section-pad border-t border-border-soft">
      <div className="section-shell">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between mb-8 md:mb-10">
          <m.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="title-stack">
            <p className="eyebrow">— What we do</p>
            <h2 className="display-page text-ink">Our services</h2>
          </m.div>
          <m.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            className="shrink-0 self-start sm:self-auto">
            <Link href="/services"
              className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] tracking-[0.14em] uppercase font-medium font-[family-name:var(--font-inter)] text-ink border border-ink px-4 md:px-5 py-2.5 hover:bg-ink hover:text-white transition-colors duration-300">
              Full menu <ArrowUpRight className="w-3 h-3" />
            </Link>
          </m.div>
        </div>

        <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-start">
          <m.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
            className="relative overflow-hidden aspect-[4/3] md:aspect-[3/4] md:sticky md:top-24 shadow-soft">
            <ServiceMediaPanel hovered={hovered} />
          </m.div>

          <div>
            <m.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="service-filter-grid mb-6"
              role="group"
              aria-label="Filter service categories"
            >
              {/* aria-pressed, not role=tab. The tab pattern commits to
                  arrow-key roving focus and an owned tabpanel; there is no
                  keydown handler in this file and no role=tabpanel anywhere in
                  it. The blog index already made this call. */}
              {HOME_SERVICE_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  aria-pressed={activeTab === tab}
                  onClick={() => {
                    setActiveTab(tab)
                    setHovered(null)
                  }}
                  className={`tap-safe tab-pill ${activeTab === tab ? 'tab-pill-active' : ''}`}
                >
                  <span className="line-clamp-2 leading-tight">{tab}</span>
                </button>
              ))}
            </m.div>
            <div className="divide-y divide-border-soft border-t border-border-soft bg-white/70 px-3 sm:px-4 -mx-3 sm:-mx-4">
              {visibleCategories.map((cat, i) => (
                <div key={cat}>
                  <Link href={`/services/${CAT_SLUGS[cat]}`}
                    onMouseEnter={() => setHovered(cat)}
                    onMouseLeave={() => setHovered(null)}
                    className="group flex items-center justify-between py-4 md:py-5 gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="font-[family-name:var(--font-unbounded)] text-[10px] text-stone shrink-0 w-5 tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-[family-name:var(--font-syne)] font-bold text-sm md:text-base uppercase text-ink group-hover:text-stone transition-colors duration-200 truncate">
                          {cat}
                        </span>
                        {CAT_META[cat]?.tagline && (
                          <span className="block text-stone text-[11px] font-[family-name:var(--font-inter)] mt-0.5 truncate">
                            {CAT_META[cat].tagline}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-stone text-[11px] font-[family-name:var(--font-inter)] hidden sm:block">
                        {(() => {
                          const prices = SERVICES[cat].map((s) => s.pricePkr).filter(Boolean)
                          return prices.length
                            ? `${SERVICES[cat].length} · from ${formatPrice(Math.min(...prices))}`
                            : `${SERVICES[cat].length} services`
                        })()}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-stone/40 group-hover:text-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-[transform,color] duration-200" />
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-[#e4ddd7]">
              <p className="text-body text-xs">
                Book any service online — or <WaCta href={`https://wa.me/${WA_NUMBER}`} from="services-blurb" className="underline hover:text-ink transition-colors">reach us on WhatsApp</WaCta>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProblemBand() {
  /* Friction chapter — Quoti rhythm, Farwa craft.
     Giant indices + plum-edge cards + loud CTA so the band isn't a dead-end. */
  const problems = [
    {
      num: '01',
      title: 'Prices you only learn at the counter',
      fix: 'Every starting price printed — from Rs 100 — before you book.',
      href: '/prices',
      cta: 'See prices',
    },
    {
      num: '02',
      title: 'Back-and-forth to get a slot',
      fix: 'Pick a live slot online in under a minute. No WhatsApp ping-pong.',
      href: '/book',
      cta: 'Book a slot',
    },
    {
      num: '03',
      title: 'Walk-ins mean waiting',
      fix: 'A booked slot is yours. Cancel free up to 2 hours before.',
      href: '/book',
      cta: 'Reserve yours',
    },
  ]

  return (
    <section
      className="problem-band grain-on-dark py-16 sm:py-20 md:py-24 border-t border-white/10"
      aria-labelledby="problem-band-heading"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16 lg:items-end mb-10 md:mb-14">
          <m.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 title-stack"
          >
            <p className="eyebrow eyebrow--on-dark mb-4">— The salon problem</p>
            <h2
              id="problem-band-heading"
              className="font-[family-name:var(--font-unbounded)] font-bold text-white leading-[1.08] text-balance max-w-[14ch]"
              style={{ fontSize: 'clamp(2rem, 4.8vw, 3.75rem)', letterSpacing: '-0.03em' }}
            >
              The hard part isn&apos;t the service.
            </h2>
          </m.div>
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 mt-5 lg:mt-0 lg:pb-1"
          >
            <p className="text-white/70 text-[15px] md:text-base font-light leading-relaxed font-[family-name:var(--font-inter)] max-w-sm">
              It&apos;s the guessing, the waiting, the back-and-forth. We took those out.
            </p>
          </m.div>
        </div>

        {/* Mobile: horizontal snap. Desktop: staggered card row. */}
        <div
          className="problem-band-rail flex max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:pb-2 max-md:-mx-4 max-md:px-4 sm:max-md:-mx-5 sm:max-md:px-5 md:grid md:grid-cols-3 md:gap-5 gap-4"
          role="list"
        >
          {problems.map((p, i) => (
            <m.article
              key={p.num}
              role="listitem"
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className={`problem-card group max-md:snap-center max-md:shrink-0 max-md:w-[78vw] max-md:max-w-[300px] ${
                i === 1 ? 'md:mt-6' : i === 2 ? 'md:mt-3' : ''
              }`}
              style={{ animationDelay: `${0.08 + i * 0.1}s` }}
            >
              <span
                className="problem-card-index font-[family-name:var(--font-unbounded)] font-bold text-white/15 group-hover:text-berry/50 transition-colors duration-500"
                aria-hidden="true"
              >
                {p.num}
              </span>
              <h3 className="font-[family-name:var(--font-syne)] font-semibold text-[17px] md:text-lg text-white leading-snug mt-3 mb-3 relative">
                {p.title}
              </h3>
              <p className="text-white/65 text-[13.5px] font-light leading-relaxed font-[family-name:var(--font-inter)] relative grow">
                {p.fix}
              </p>
              <Link
                href={p.href}
                className="tap-safe relative mt-6 inline-flex items-center gap-1.5 text-[11px] tracking-[0.16em] uppercase font-semibold font-[family-name:var(--font-inter)] text-accent-gold hover:text-white transition-colors self-start"
              >
                {p.cta} <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </m.article>
          ))}
        </div>

        <m.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="cta-cluster mt-10 md:mt-14 pt-8 border-t border-white/15"
        >
          <Link href="/book" className="btn-loud btn-loud--light tap-safe">
            Book a slot <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </Link>
          <Link href="/prices" className="btn-ghost-on-dark tap-safe">
            See all prices
          </Link>
        </m.div>
      </div>
    </section>
  )
}

const BOOKING_STEPS = [
  {
    n: '01',
    t: 'Pick your service',
    l: 'Thirteen specialities, every starting price printed. No calling to ask what a facial costs.',
    img: '/glow3.jpg',
    alt: 'Facial glow treatment at Farwa Beauty Salon',
  },
  {
    n: '02',
    t: 'Pick a live slot',
    l: 'Real availability, Mon–Sat 11:00–19:00. Book in under a minute; cancel free up to 2 hours before.',
    img: '/pedicure.jpg',
    alt: 'Nail finish at Farwa Beauty Salon',
  },
  {
    n: '03',
    t: 'Walk in, sit down',
    l: 'We confirm the work before we start. Printed PKR, no surprise add-ons.',
    img: '/threading.jpg',
    alt: 'Threading at Farwa Beauty Salon',
  },
]

function BookingStory() {
  /* Sticky how-booking-works — Quoti energy, Farwa plum accents + loud CTAs. */
  const [active, setActive] = useState(0)
  const listRef = useRef(null)

  useEffect(() => {
    const root = listRef.current
    if (!root) return undefined
    const nodes = [...root.querySelectorAll('[data-booking-step]')]
    if (!nodes.length) return undefined
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = Number(e.target.getAttribute('data-booking-step'))
            if (!Number.isNaN(i)) setActive(i)
          }
        })
      },
      { rootMargin: '-40% 0px -40% 0px' },
    )
    nodes.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section
      className="booking-story bg-mist border-t border-border-soft section-pad"
      aria-labelledby="booking-story-heading"
    >
      <div className="section-shell">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
          <div className="title-stack">
            <p className="eyebrow">— How booking works</p>
            <h2 id="booking-story-heading" className="display-page text-ink max-w-[16ch]">
              Booked while you get on with your day
            </h2>
          </div>
          {/* Progress rail — shows which beat is live */}
          <ol
            className="flex items-center gap-2 self-start md:self-end"
            aria-label={`Step ${active + 1} of ${BOOKING_STEPS.length}`}
          >
            {BOOKING_STEPS.map((s, i) => (
              <li key={s.n} className="flex items-center gap-2">
                <span
                  className={`booking-progress-dot font-[family-name:var(--font-unbounded)] text-[11px] font-bold tabular-nums transition-colors duration-500 ${
                    i === active ? 'text-plum' : i < active ? 'text-ink' : 'text-stone'
                  }`}
                >
                  {s.n}
                </span>
                {i < BOOKING_STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`block w-8 h-px transition-colors duration-500 ${
                      i < active ? 'bg-plum' : 'bg-border-soft'
                    }`}
                  />
                )}
              </li>
            ))}
          </ol>
        </div>

        <div className="grid md:grid-cols-2 gap-10 md:gap-14 lg:gap-16 items-start">
          <div ref={listRef}>
            {BOOKING_STEPS.map((s, i) => (
              <div
                key={s.n}
                data-booking-step={i}
                className={`booking-story-step flex flex-col justify-center py-10 md:py-0 md:min-h-[58vh] ${
                  active === i ? 'booking-story-step--active' : 'booking-story-step--inactive'
                }`}
              >
                <span
                  className={`booking-story-num font-[family-name:var(--font-unbounded)] font-bold leading-none transition-colors duration-500 ${
                    active === i ? 'text-plum' : 'text-stone'
                  }`}
                  style={{ fontSize: 'clamp(2.75rem, 6vw, 4.5rem)' }}
                  aria-hidden="true"
                >
                  {s.n}
                </span>
                <h3
                  className={`font-[family-name:var(--font-unbounded)] font-bold mt-4 mb-3.5 leading-[1.15] transition-colors duration-500 ${
                    active === i ? 'text-ink' : 'text-stone'
                  }`}
                  style={{ fontSize: 'clamp(1.35rem, 2.4vw, 2rem)', letterSpacing: '-0.02em' }}
                >
                  {s.t}
                </h3>
                <p className="text-body max-w-md mb-6">{s.l}</p>
                {active === i && (
                  <Link
                    href="/book"
                    className="btn-primary tap-safe self-start !min-h-12"
                  >
                    Book online <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                )}
                {/* Mobile: image rides with the step — no second sticky fight. */}
                <div
                  className={`md:hidden mt-7 booking-story-frame media-zoom border border-border-soft bg-white p-1 ${
                    active === i ? 'booking-story-frame--live shadow-card' : 'shadow-soft opacity-55'
                  }`}
                >
                  <Image
                    src={s.img}
                    alt={s.alt}
                    width={640}
                    height={800}
                    loading="lazy"
                    quality={55}
                    sizes="90vw"
                    className={`w-full aspect-[4/5] object-cover transition-transform duration-700 ${
                      active === i ? 'scale-100' : 'scale-[1.02]'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block sticky top-[calc(50vh-280px)] h-[560px]">
            <div
              className={`booking-story-frame relative h-full border border-border-soft bg-white p-1.5 overflow-hidden ${
                active >= 0 ? 'booking-story-frame--live shadow-card' : 'shadow-card'
              }`}
            >
              {BOOKING_STEPS.map((s, i) => (
                <Image
                  key={s.n}
                  src={s.img}
                  alt={s.alt}
                  fill
                  loading="lazy"
                  quality={55}
                  sizes="(min-width: 768px) 40vw, 0px"
                  className={`object-cover transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    active === i
                      ? 'opacity-100 scale-100 booking-story-img--live'
                      : 'opacity-0 scale-[1.06]'
                  }`}
                />
              ))}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <span className="bg-plum-deep/90 text-white text-[10px] tracking-[0.18em] uppercase font-semibold font-[family-name:var(--font-inter)] px-3 py-2">
                  Step {BOOKING_STEPS[active]?.n} · {BOOKING_STEPS[active]?.t}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ReviewCard({ post, compact = false, excerpt = false }) {
  const sourceLabel = post.source === 'google' ? 'Google' : 'Facebook'
  const clampQuote = excerpt || compact

  /* Excerpt strip under the featured pull-quote — quote-forward tiles with
     plum edge, not the old header-only mist chips. */
  if (excerpt) {
    return (
      <m.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="review-strip-card group shrink-0 snap-start w-[82vw] max-w-[300px] md:shrink md:w-auto md:max-w-none md:h-full"
      >
        <a
          href={post.link}
          target="_blank"
          rel="noreferrer"
          className="review-strip-card__link tap-safe flex h-full flex-col"
          aria-label={`${post.name}'s review on ${sourceLabel}`}
        >
          <Quote
            className="review-strip-card__mark w-7 h-7 rotate-180 shrink-0"
            aria-hidden="true"
          />
          <blockquote className="review-strip-card__quote flex-1 font-[family-name:var(--font-syne)] font-light italic text-ink leading-[1.4] text-[15px] sm:text-base line-clamp-4">
            {post.quote}
          </blockquote>
          <footer className="review-strip-card__foot mt-auto pt-5 flex items-center gap-3">
            <span
              className="review-strip-card__avatar shrink-0 w-10 h-10 flex items-center justify-center font-[family-name:var(--font-syne)] font-semibold text-[11px] tracking-wide"
              aria-hidden="true"
            >
              {post.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-[family-name:var(--font-syne)] font-semibold text-[13px] text-ink truncate leading-tight">
                {post.name}
              </span>
              <span className="mt-1 flex items-center gap-1.5">
                <StarRating size={9} className="text-plum/70" />
                {post.date ? (
                  <span className="text-stone text-[10px] font-[family-name:var(--font-inter)]">
                    {post.date}
                  </span>
                ) : null}
              </span>
            </span>
            <ArrowUpRight className="review-strip-card__arrow w-4 h-4 shrink-0" aria-hidden="true" />
          </footer>
        </a>
      </m.article>
    )
  }

  return (
    <article
      className={`group panel-soft shadow-soft flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-card ${
        compact
          ? 'shrink-0 snap-start w-[85vw] max-w-[320px]'
          : /* swipe card on mobile, equal-height grid cell from md up */
            'shrink-0 snap-start w-[85vw] max-w-[320px] md:shrink md:w-auto md:max-w-none md:h-full md:min-h-[272px]'
      }`}
    >
      <header className="flex items-center justify-between px-5 py-3.5 sm:py-4 border-b border-border-soft">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-mist border border-border-soft flex items-center justify-center shrink-0">
            <span className="text-ink font-[family-name:var(--font-syne)] font-semibold text-[11px]">{post.initials}</span>
          </div>
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-syne)] font-semibold text-[13px] text-ink truncate leading-tight">{post.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <StarRating size={8} className="text-stone/70" />
              <span className="text-stone text-[9px] font-[family-name:var(--font-inter)]">· {post.date}</span>
            </div>
          </div>
        </div>
        <a href={post.link} target="_blank" rel="noreferrer"
          aria-label={`View ${post.name}'s review on ${sourceLabel}`}
          className="shrink-0 text-stone/50 group-hover:text-ink transition-colors">
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </header>

      <div className="flex-1 px-5 py-4 sm:py-5 flex flex-col bg-white min-h-0">
        <Quote className="w-3.5 h-3.5 text-accent-gold/35 mb-2.5 rotate-180 shrink-0" aria-hidden="true" />
        <blockquote
          className={`text-stone text-[13px] md:text-sm font-light leading-relaxed font-[family-name:var(--font-inter)] flex-1 ${
            clampQuote ? 'line-clamp-4 sm:line-clamp-5' : ''
          }`}
        >
          {post.quote}
        </blockquote>
        {clampQuote && (
          <a
            href={post.link}
            target="_blank"
            rel="noreferrer"
            className="review-excerpt-link mt-3 inline-flex items-center gap-1 self-start"
          >
            Read on {sourceLabel}
            <ArrowUpRight className="w-2.5 h-2.5" />
          </a>
        )}
        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border-soft">
          {post.service && (
            <span className="text-stone text-[9px] tracking-[0.18em] uppercase font-[family-name:var(--font-inter)] truncate">
              {post.service}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-stone text-[9px] tracking-[0.16em] uppercase font-[family-name:var(--font-inter)] shrink-0 ml-auto">
            {sourceLabel}
          </span>
        </div>
      </div>
    </article>
  )
}

function reviewInitials(name) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return (parts[0]?.slice(0, 2) || '??').toUpperCase()
}

/**
 * `now === null` means "render the wording that does not depend on the clock".
 *
 * This page is server-rendered and its HTML is cached. If the server baked a
 * relative phrase into that HTML, the cached copy would repeat it for as long
 * as it lived — which is the frozen-clock bug in a new costume. So the server
 * pass emits the absolute date, and the client swaps in relative wording after
 * mount, against a clock that is actually ticking. Today every testimonial is
 * old enough that both passes produce the same string; the hook matters for
 * the first genuinely recent review, not for these.
 */
function reviewCardDate(post, now) {
  if (post.postedAt) {
    if (now === null) return formatReviewDate(post.postedAt) ?? ''
    return describeReviewAge(post.postedAt, now).label ?? ''
  }
  // Live Places API responses only. Google recomputes that string on every
  // fetch, so it is as current as the fetch is — unlike one typed into a file.
  return post.relativeTime || ''
}

function toReviewCard(post, now) {
  return {
    name: post.name,
    initials: post.initials || reviewInitials(post.name),
    date: reviewCardDate(post, now),
    /* null, not the source name. This slot holds the service the reviewer
       actually had — "Facials", "Threading" — which is the only reason a
       footer line is worth the space. Defaulting it to the platform meant a
       Google card read "Read on Google", then "GOOGLE REVIEW", then "GOOGLE",
       three times over, under a section header already saying "FROM GOOGLE".
       When there is no service to name, the line simply does not render. */
    service: post.service || null,
    quote: post.quote,
    link: post.link,
    source: post.source || 'facebook',
    postedAt: post.postedAt ?? null,
  }
}

function toGoogleCards(reviews, now) {
  return sortByRecency(reviews)
    .slice(0, 6)
    .map((r) => toReviewCard({ ...r, source: 'google' }, now))
}

/** null on the server and the first client render, the real clock after mount. */
function useClientNow() {
  const [now, setNow] = useState(null)
  useEffect(() => {
    // Client clock only — relative review ages must not bake into SSR HTML.
    setNow(Date.now()) // eslint-disable-line react-hooks/set-state-in-effect -- intentional: post-hydration clock
  }, [])
  return now
}

const manualPayload = getManualReviewsPayload()
const gbpStats = getGbpStatsForDisplay()
const initialRatingLabel =
  gbpStats.rating != null && gbpStats.reviewCount != null
    ? `${gbpStats.rating}★ · ${gbpStats.reviewCount} Google reviews`
    : 'Reviews on Google'

const initialGoogleReviews = manualPayload?.reviews?.length ? manualPayload.reviews : []

/**
 * The dating line under each block's heading.
 *
 * Deliberately says the same thing whatever the date is: it names the newest
 * one on show and points at the live listing. Nothing here is conditional on
 * how old the reviews happen to be, so there is no threshold at which the site
 * quietly stops mentioning their age — which is the failure mode this whole
 * change exists to prevent. It also costs nothing to render on the server,
 * because it never reads the clock.
 */
function ReviewDatingNote({ posts, sourceName }) {
  const newest = newestPostedAt(posts)
  if (!newest) return null
  const absolute = formatReviewDate(newest)
  if (!absolute) return null

  return (
    <p className="text-stone text-[10px] sm:text-[11px] font-[family-name:var(--font-inter)] font-light leading-relaxed mb-4 sm:mb-5 max-w-xl">
      Newest here is from {absolute}. Each is shown with the month it was
      posted, newest first — anything more recent is on {sourceName}.
    </p>
  )
}

function ReviewGridSection({ label, viewAllHref, posts, sourceName, className = '', divided = true }) {
  if (!posts.length) return null

  const desktopCols = posts.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'

  return (
    <div className={`reviews-block-divider reviews-strip ${divided ? '' : 'border-t-0 pt-0'} ${className}`}>
      <div className="flex items-end justify-between gap-4 mb-2 sm:mb-3">
        <div className="min-w-0">
          <p className="eyebrow mb-1.5">— {label}</p>
          <p className="hidden sm:block text-ink font-[family-name:var(--font-syne)] font-semibold text-sm sm:text-[15px] leading-snug">
            More voices, newest first
          </p>
        </div>
        <a
          href={viewAllHref}
          target="_blank"
          rel="noreferrer"
          className="tap-safe review-strip-viewall shrink-0 inline-flex items-center gap-1.5 text-[10px] tracking-[0.16em] uppercase font-[family-name:var(--font-inter)] font-semibold"
        >
          View all <ArrowUpRight className="w-3 h-3" />
        </a>
      </div>

      <ReviewDatingNote posts={posts} sourceName={sourceName} />

      <p className="md:hidden text-plum text-[9px] tracking-[0.18em] uppercase font-[family-name:var(--font-inter)] mb-3">
        Swipe for more →
      </p>
      {/* One render, restyled per breakpoint — mobile snap scroller, md+ grid.
          Excerpt cards use whileInView rise; off-screen swipe cards animate
          when they enter, which is fine for this denser quote-forward strip. */}
      <div
        className={`reviews-strip-rail flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scrollbar-none md:mx-0 md:px-0 md:pb-0 md:overflow-visible md:grid ${desktopCols} md:gap-5 md:max-w-5xl md:items-stretch`}
      >
        {posts.map((post) => (
          <ReviewCard
            key={`${label}-${post.name}-${post.quote.slice(0, 24)}`}
            post={post}
            excerpt
          />
        ))}
      </div>
    </div>
  )
}

function TestimonialsPreview({ placesEnabled }) {
  const [reviewIdx, setReviewIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const [ratingLabel, setRatingLabel] = useState(initialRatingLabel)
  const [featuredReviews, setFeaturedReviews] = useState(
    manualPayload?.reviews?.length ? manualPayload.reviews : FALLBACK_FEATURED_REVIEWS,
  )
  const [googleReviews, setGoogleReviews] = useState(initialGoogleReviews)
  const now = useClientNow()

  const googleGridPosts = useMemo(() => toGoogleCards(googleReviews, now), [googleReviews, now])
  const fbGridPosts = useMemo(
    () => FB_TESTIMONIALS_BY_RECENCY.map((post) => toReviewCard(post, now)),
    [now],
  )

  useEffect(() => {
    let cancelled = false

    /* Skip the round trip entirely when the Places API is not wired. Production
       returns {"source":"google-manual","configured":false} with review data
       byte-identical to what was already server-rendered from
       src/google-reviews-data.js — so this was a fetch, a JSON parse and a full
       re-render of the reviews subtree that could not change a pixel, fired on
       every visit to the page whose LCP we care about most. It starts doing
       real work the moment GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID are set. */
    if (!placesEnabled) return undefined

    async function loadReviews() {
      try {
        const res = await fetch('/api/reviews')
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (cancelled) return
        const isGoogle =
          (data.source === 'google' || data.source === 'google-manual') &&
          data.reviews?.length
        if (!isGoogle) return

        setFeaturedReviews(data.reviews)
        setGoogleReviews(data.reviews)
        if (data.rating != null && data.reviewCount != null) {
          setRatingLabel(`${data.rating}★ · ${data.reviewCount} Google reviews`)
        }
      } catch {
        /* keep manual / Facebook fallback */
      }
    }

    loadReviews()
    return () => {
      cancelled = true
    }
  }, [placesEnabled])

  useEffect(() => {
    if (featuredReviews.length <= 1 || paused) return undefined
    const id = setInterval(() => {
      setReviewIdx((i) => (i + 1) % featuredReviews.length)
    }, 8000)
    return () => clearInterval(id)
  }, [featuredReviews.length, paused])

  const featured = featuredReviews[reviewIdx]
  const featuredSourceLabel = featured.source === 'google' ? 'Google' : 'Facebook'

  return (
    <section className="cv-auto relative py-16 sm:py-[4.5rem] md:py-20 overflow-hidden bg-mist border-t border-border-soft">
      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10">
        <m.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="flex flex-col gap-4 sm:gap-5 sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-10 md:mb-12">
          <div className="min-w-0 title-stack">
            <p className="eyebrow">— Client reviews</p>
            <h2 className="display-page text-ink">What clients say</h2>
          </div>
          <div className="reviews-rating-row shrink-0 self-start sm:self-auto">
            <StarRating size={11} className="text-stone/80" label={`${GOOGLE_GBP_STATS.rating} out of 5 stars`} />
            <span className="text-stone text-[10px] sm:text-[11px] font-[family-name:var(--font-inter)] leading-snug whitespace-nowrap">
              {ratingLabel}
            </span>
          </div>
        </m.div>

        <m.figure
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
          className="reviews-featured relative px-6 py-9 sm:px-9 sm:py-10 md:px-12 md:py-11 mb-8 sm:mb-10 md:mb-12"
          aria-live="polite"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false)
          }}
        >
          <Quote className="reviews-featured-mark absolute top-4 left-4 sm:top-6 sm:left-6 w-8 h-8 sm:w-10 sm:h-10 rotate-180 pointer-events-none" aria-hidden="true" />
          <blockquote className={`relative z-[1] font-[family-name:var(--font-syne)] italic font-light text-ink leading-[1.42] text-center max-w-2xl mx-auto text-xl sm:text-[1.35rem] md:text-2xl px-2 sm:px-6 ${featured.quote.length > 280 ? 'line-clamp-6' : ''}`}>
            {featured.quote}
          </blockquote>
          {featured.translation && (
            <p className="relative z-[1] text-stone text-center text-sm font-light mt-4 sm:mt-5 font-[family-name:var(--font-inter)] max-w-xl mx-auto leading-relaxed">
              {featured.translation}
            </p>
          )}
          <figcaption className="relative z-[1] flex flex-col items-center gap-3.5 mt-7 sm:mt-8">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <span className="text-stone text-[10px] tracking-[0.2em] uppercase font-[family-name:var(--font-inter)]">
                {featured.name}
              </span>
              <span className="text-stone/40 hidden sm:inline" aria-hidden="true">·</span>
              <a href={featured.link} target="_blank" rel="noreferrer"
                className="text-stone/70 hover:text-ink text-[10px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] inline-flex items-center gap-1 transition-colors">
                {featuredSourceLabel}{' '}
                <ArrowUpRight className="w-2.5 h-2.5" />
              </a>
            </div>
              {/* Was role=tablist/role=tab with aria-selected, and the dot itself
                  was the hit box: 6x6 px, a quarter of the WCAG 2.5.8 floor.
                  role=tab also promises arrow-key roving focus and an owned
                  tabpanel, neither of which exists here.

                  Both are solved the way the photo dots in shared.jsx already
                  solve them — a 44px padded button wrapping a small visual bar,
                  in a labelled group with aria-current. */}
            {featuredReviews.length > 1 && (
              <div className="flex items-center" role="group" aria-label="Featured reviews">
                {featuredReviews.map((r, i) => (
                  <button
                    key={r.name}
                    type="button"
                    aria-current={reviewIdx === i ? 'true' : undefined}
                    aria-label={`Show review by ${r.name}`}
                    onClick={() => setReviewIdx(i)}
                    className="tap-safe min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                  >
                    <span
                      className={`block h-1.5 rounded-full transition-[width,background-color] ${reviewIdx === i ? 'w-6 bg-ink' : 'w-1.5 bg-stone/30'}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </figcaption>
        </m.figure>

        <ReviewGridSection
          label="From Google"
          viewAllHref={GOOGLE_REVIEW_LINK}
          posts={googleGridPosts}
          sourceName="Google"
          className={googleGridPosts.length ? 'mb-6 sm:mb-8 md:mb-10' : ''}
        />
        <ReviewGridSection
          label="From Facebook"
          viewAllHref="https://www.facebook.com/farwasalon/reviews"
          posts={fbGridPosts}
          sourceName="Facebook"
          className="mb-8 sm:mb-10 md:mb-12"
        />

        <m.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="reviews-cta-row pt-8 sm:pt-10 border-t border-border-soft flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 sm:gap-6">
          <p className="text-stone text-[11px] sm:text-xs font-light font-[family-name:var(--font-inter)] tracking-wide max-w-sm">
            Loved your visit? Help us spread the word.
          </p>
          <div className="reviews-cta-actions flex flex-col min-[480px]:flex-row sm:flex-row items-stretch gap-3 w-full lg:w-auto lg:max-w-xl">
            <a href={GOOGLE_REVIEW_LINK} target="_blank" rel="noreferrer"
              className="tap-safe reviews-cta-btn inline-flex flex-1 items-center justify-center gap-1.5 bg-ink text-white text-[11px] tracking-[0.14em] uppercase font-semibold font-[family-name:var(--font-inter)] px-5 sm:px-6 py-3 hover:bg-plum transition-colors duration-300">
              Write a Google review <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            </a>
            <a href="https://www.facebook.com/farwasalon" target="_blank" rel="noreferrer"
              className="tap-safe reviews-cta-btn inline-flex flex-1 items-center justify-center gap-1.5 text-stone text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] hover:text-ink transition-colors border border-border-soft hover:border-ink/30 px-5 sm:px-6 py-3 bg-white">
              Follow on Facebook <ArrowUpRight className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </m.div>
      </div>
    </section>
  )
}

function CtaBand() {
  /* Same plum close language as PageCloseCta — home keeps a quieter tertiary
     link row under the Book + WhatsApp pair. */
  return (
    <section className="cv-auto cta-band grain-on-dark bg-plum-deep py-16 sm:py-20 md:py-[5rem] px-4 sm:px-5 md:px-10 border-t border-white/10">
      <div className="max-w-screen-xl mx-auto flex flex-col items-center text-center gap-8">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-2xl title-stack"
        >
          <p className="text-accent-gold text-[10px] sm:text-[11px] tracking-[0.28em] uppercase font-[family-name:var(--font-inter)] mb-4">&mdash; Visit us in PECHS</p>
          <h2
            className="font-[family-name:var(--font-unbounded)] font-bold text-white leading-[1.12] text-balance mx-auto"
            style={{ fontSize: 'clamp(1.9rem, 5vw + 0.4rem, 3.5rem)', letterSpacing: '-0.02em', maxWidth: '18ch' }}
          >
            Book online in under a minute
          </h2>
          <p className="text-body mt-4 mx-auto max-w-md text-white/70">
            No prepayment. Cancel free up to 2 hours before. Or message us on WhatsApp — whichever is easier for you.
          </p>
        </m.div>
        <m.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="cta-cluster justify-center w-full max-w-xl"
        >
          <Link
            href="/book"
            className="btn-loud btn-loud--light tap-safe w-full sm:w-auto"
          >
            Book an Appointment <ArrowUpRight className="w-4 h-4 shrink-0" />
          </Link>
          <WaCta
            href={`https://wa.me/${WA_NUMBER}`}
            from="cta-band"
            className="btn-ghost-on-dark tap-safe w-full sm:w-auto"
          >
            WhatsApp us
          </WaCta>
        </m.div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-2">
          <Link
            href="/prices"
            className="tap-safe link-underline text-white/55 text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] hover:text-white transition-colors"
          >
            Price list
          </Link>
          <Link
            href="/bridal"
            className="tap-safe link-underline text-white/55 text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] hover:text-white transition-colors"
          >
            Bridal
          </Link>
        </div>
      </div>
    </section>
  )
}

function FounderNote() {
  return (
    <section className="cv-auto bg-white border-t border-border-soft py-16 sm:py-20 md:py-24 px-4 sm:px-5 md:px-10">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto text-center"
      >
        <p className="eyebrow mb-6">— The House</p>
        <blockquote
          className="font-[family-name:var(--font-syne)] font-medium text-ink text-balance leading-[1.3]"
          style={{ fontSize: 'clamp(1.35rem, 3.6vw, 2.25rem)' }}>
          &ldquo;Trends visit Karachi every season. Grace stays. I opened this
          salon in 2008 to give every woman on this street both.&rdquo;
        </blockquote>
        <p className="mt-6 text-[11px] tracking-[0.28em] uppercase font-[family-name:var(--font-inter)] text-stone">
          Rubina · Founder, Farwa Beauty Salon
        </p>
        <Link
          href="/about"
          className="tap-safe mt-8 inline-flex items-center gap-1.5 text-[11px] tracking-[0.16em] uppercase font-[family-name:var(--font-inter)] text-ink hover:text-stone transition-colors"
        >
          Meet Rubina <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </m.div>
    </section>
  )
}

/* Server-rendered. This used to load through a `dynamic(..., { ssr: false })`
   wrapper behind a requestIdleCallback gate, which meant the site's most
   important URL shipped 55 words of HTML and not a single <h2> — no services,
   no reviews, no internal links — while every other page on the site rendered
   its content server-side. The Performance export has / at 262 impressions and
   3.4% CTR, the highest-impression page on the site.

   It is still a client component (filter state, the review carousel), and
   client components server-render unless you opt out. The opt-out was the
   whole problem. The eight sections already carry `.cv-auto`
   (content-visibility: auto), so offscreen ones cost nothing to render. */
export default function HomeBelowFold({ placesEnabled = false }) {
  return (
    <>
      <QuickPickRow />
      <StatsStrip />
      <EditorialSlideshow />
      <WordmarkDivider />
      <FeaturedServices />
      <ProblemBand />
      <BookingStory />
      <SalonLocalBlock />
      <FounderNote />
      <TestimonialsPreview placesEnabled={placesEnabled} />
      <CtaBand />
    </>
  )
}
