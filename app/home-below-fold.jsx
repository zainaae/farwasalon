'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { m } from 'framer-motion'
import { ArrowUpRight, ChevronRight, Star, Quote } from 'lucide-react'
import {
  AnimatedNumber, LazyVideo, CAT_SLUGS,
  WordmarkDivider,
} from '../src/shared.jsx'
import { formatPrice } from '../src/data.js'
import { GOOGLE_GBP_STATS } from '../src/google-reviews-data.js'
import SalonLocalBlock from './components/salon-local-block.jsx'
import QuickPickRow from './quick-pick-row.jsx'
import { SERVICES, CAT_META, YEARS_ACTIVE, WA_NUMBER, SERVICE_FILTER_TABS, filterServiceCategories, GOOGLE_REVIEW_LINK } from '../src/data.js'
import { EDITORIAL_PHOTOS } from '../src/salon-media.js'
import { getGbpStatsForDisplay, getManualReviewsPayload } from '../lib/google-reviews.js'

const CATEGORY_COUNT = Object.keys(SERVICES).length
const SERVICE_COUNT  = Object.values(SERVICES).reduce((a, v) => a + v.length, 0)

const FB_POSTS = [
  {
    name: 'Tathira B.', initials: 'TB', date: 'Aug 2024', service: 'Bridal',
    quote: 'Farwa Aapi ne itni care aur detail se kaam kiya ke har visit pe ghar jaisa lagta hai. Best salon in Karachi, hands down.',
    link: 'https://www.facebook.com/tathirabid/posts/pfbid02J73qHitLiSYbpvJPJEYvNfBHyjSfKEhWL1hS6VbMupr15TzuPuGtXNTKBDMuvRyKl',
  },
  {
    name: 'Jessica J.', initials: 'JJ', date: 'May 2024', service: 'Facial & Hair',
    quote: 'Been coming here for years and the quality never drops. Rubina knows my skin better than I do — I leave glowing every single time.',
    link: 'https://www.facebook.com/jessica.joseph.522/posts/pfbid02ZCUhHYUrNBsv9yEfCY5t5MiBPWzJEs6nMwtRSGYaNViyYEEUhKiUZYuSSL8yup9Ul',
  },
  {
    name: 'Tashfeen G.', initials: 'TG', date: 'Mar 2024', service: 'Full package',
    quote: 'The attention to detail is unmatched. From brow threading to bridal — everyone on the team treats you like family. Highly recommend to every girl in PECHS.',
    link: 'https://www.facebook.com/tashfeen.ghulamali/posts/pfbid0LHJDHEFyLs7AefDCPGH6kPxL3z5Kov6sT1gdfXFvDXNZoAL1RXjpEBwzz81GMoPLl',
  },
  {
    name: 'Sumaiya M.', initials: 'SM', date: 'Feb 2024', service: 'Bridal',
    quote: 'I cannot thank Farwa Aapi enough for making me feel like a queen on my wedding day. Every step — from trials to the final look — was perfection. My family still talks about it.',
    link: 'https://www.facebook.com/Sumaiya.Mohsi/posts/pfbid02Th9Xxwdqp5WK66n9MShW4orY8WxWvrSaAA3CoGwdpFJdK4J4zKJ6dbHWsvA86TpTl',
  },
  {
    name: 'Sara K.', initials: 'SK', date: 'Jan 2024', service: 'Skincare',
    quote: 'Honestly the most calm and professional salon experience in Karachi. No rush, no shortcuts — just clean, careful, beautiful work.',
    link: 'https://www.facebook.com/cutesara.1995/posts/pfbid029WwdkbBNG5xsdX61yp4ixzDdZaFnFoxwKXPkvoECyQnfLFwbry4jUJz4y5VwqWB7l',
  },
  {
    name: 'Nadia A.', initials: 'NA', date: 'Dec 2023', service: 'Threading & Facial',
    quote: 'Always leave feeling fresh and confident. Rubina has been doing my brows for years — no one else gets the shape right the way she does.',
    link: 'https://www.facebook.com/farwasalon/reviews',
  },
]

const FALLBACK_FEATURED_REVIEWS = [
  {
    name: 'Tathira B.',
    quote: 'Farwa Aapi ne itni care aur detail se kaam kiya ke har visit pe ghar jaisa lagta hai. Best salon in Karachi, hands down.',
    translation: '"Farwa Aapi works with such care and detail that every visit feels like home. Best salon in Karachi, hands down."',
    link: 'https://www.facebook.com/tathirabid/posts/pfbid02J73qHitLiSYbpvJPJEYvNfBHyjSfKEhWL1hS6VbMupr15TzuPuGtXNTKBDMuvRyKl',
  },
  {
    name: 'Jessica J.',
    quote: 'Been coming here for years and the quality never drops. Rubina knows my skin better than I do — I leave glowing every single time.',
    translation: null,
    link: 'https://www.facebook.com/jessica.joseph.522/posts/pfbid02ZCUhHYUrNBsv9yEfCY5t5MiBPWzJEs6nMwtRSGYaNViyYEEUhKiUZYuSSL8yup9Ul',
  },
]

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
  return (
    <section className="cv-auto bg-white py-14 sm:py-16 md:py-[4.5rem] px-4 sm:px-5 md:px-10">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div className="overflow-hidden">
            <m.div initial={{ y: '40%', opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1.0, ease: [0.16,1,0.3,1] }}>
              <p className="eyebrow mb-3">— Est. 2008 · PECHS</p>
              <h2 className="display-section max-w-2xl">
                A beauty studio with {YEARS_ACTIVE} years of care
              </h2>
            </m.div>
          </div>
          <m.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.15 }}
            className="flex flex-col gap-6 sm:gap-7">
            <p className="text-stone text-[15px] sm:text-base leading-relaxed font-light max-w-xl">
              For over {YEARS_ACTIVE} years, Farwa Beauty Salon has been a steady favourite in PECHS, Karachi. Expert care, a warm welcome, and results that speak for themselves &mdash; every single visit.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-4 border-t border-border-soft pt-6 sm:pt-7">
              {[
                { display: `${YEARS_ACTIVE}+`,  final: YEARS_ACTIVE, label: 'Years of expertise' },
                { display: String(CATEGORY_COUNT), final: CATEGORY_COUNT, label: 'Specialities, one roof' },
                { display: String(SERVICE_COUNT) + '+', final: SERVICE_COUNT, label: 'Services, every price printed' },
                { display: `${GOOGLE_GBP_STATS.rating}★`, final: null, label: 'Rated by Karachi on Google' },
              ].map(({ display, final, label }) => (
                <div key={label} className="min-w-0">
                  <p className="font-['Unbounded'] font-bold text-2xl sm:text-3xl md:text-4xl text-ink mb-1.5 leading-none">
                    {final !== null
                      ? <AnimatedNumber display={display} final={final} ariaLabel={`${display} ${label}`} />
                      : display}
                  </p>
                  <p className="text-stone text-[11px] tracking-wide font-['Inter'] leading-tight">{label}</p>
                </div>
              ))}
            </div>
            <Link href="/about" className="tap-safe inline-flex items-center gap-2 text-ink text-sm font-medium font-['Inter'] group w-fit">
              <span className="link-underline">Read Our Story</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </m.div>
        </div>
      </div>
    </section>
  )
}

function EditorialSlideshow() {
  const doubled = [...EDITORIAL_PHOTOS, ...EDITORIAL_PHOTOS]

  return (
    <section className="cv-auto bg-white border-y border-[#e4ddd7] overflow-x-clip max-w-full" aria-label="Editorial photo showcase">
      <div className="md:hidden py-3 w-full max-w-full overflow-x-clip">
        <div className="flex w-max max-w-none" style={{ animation: 'marquee 45s linear infinite' }}>
          {doubled.map((p, i) => (
            <figure key={i}
              className="relative shrink-0 overflow-hidden mx-[5px]"
              style={{ width: 'min(62vw, 230px)', height: 'min(82vw, 306px)' }}>
              <EditorialMedia item={p} />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <figcaption className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <span className="text-white text-[10px] tracking-[0.2em] uppercase font-['Inter'] font-medium leading-none">
                  {p.label}
                </span>
                <span className="text-white/60 text-[9px] font-['Inter'] tabular-nums">
                  {String((i % EDITORIAL_PHOTOS.length) + 1).padStart(2, '0')}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="hidden md:block py-2 w-full max-w-full overflow-x-clip isolate">
        <div className="flex w-max max-w-none will-change-transform" style={{ animation: 'marquee 65s linear infinite' }}>
          {doubled.map((p, i) => (
            <div key={i} className="relative shrink-0 w-[260px] lg:w-[300px] xl:w-[330px] aspect-[3/4] mx-1.5 overflow-hidden group cursor-default">
              <EditorialMedia item={p} className="transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 text-white text-[10px] tracking-[0.18em] uppercase font-['Inter'] font-medium">
                {p.label}
              </span>
            </div>
          ))}
        </div>
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
        src="/bridal2.jpg"
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
        <p className="text-white/60 text-[10px] tracking-[0.24em] uppercase font-['Inter'] transition-colors duration-300">
          {hovered ?? 'Farwa Beauty Salon'}
        </p>
        <p className="text-white font-['Syne'] font-bold text-sm transition-colors duration-300">
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
    <section className="cv-auto bg-white section-pad border-t border-border-soft">
      <div className="section-shell">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10 md:mb-12">
          <m.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <p className="eyebrow mb-2">— What we do</p>
            <h2 className="display-section">Our Services</h2>
          </m.div>
          <m.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            className="shrink-0 self-start sm:self-auto">
            <Link href="/services"
              className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] tracking-[0.14em] uppercase font-medium font-['Inter'] text-ink border border-ink px-4 md:px-5 py-2.5 hover:bg-ink hover:text-white transition-colors duration-300">
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </m.div>
        </div>

        <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 md:gap-12 items-start">
          <m.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
            className="relative overflow-hidden aspect-[4/3] md:aspect-[3/4] md:sticky md:top-24">
            <ServiceMediaPanel hovered={hovered} />
          </m.div>

          <div>
            <m.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="service-filter-grid mb-6"
              role="tablist"
              aria-label="Filter service categories"
            >
              {HOME_SERVICE_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
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
            <div className="divide-y divide-border-soft border-t border-border-soft">
              {visibleCategories.map((cat, i) => (
                <m.div key={cat}
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.04 }}>
                  <Link href={`/services/${CAT_SLUGS[cat]}`}
                    onMouseEnter={() => setHovered(cat)}
                    onMouseLeave={() => setHovered(null)}
                    className="group flex items-center justify-between py-4 md:py-5 gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="font-['Unbounded'] text-[10px] text-stone shrink-0 w-5 tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-['Syne'] font-bold text-sm md:text-base uppercase text-ink group-hover:text-stone transition-colors duration-200 truncate">
                          {cat}
                        </span>
                        {CAT_META[cat]?.tagline && (
                          <span className="block text-stone text-[11px] font-['Inter'] mt-0.5 truncate">
                            {CAT_META[cat].tagline}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-stone text-[11px] font-['Inter'] hidden sm:block">
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
                </m.div>
              ))}
            </div>

            <m.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
              className="mt-8 pt-6 border-t border-[#e4ddd7]">
              <p className="text-stone text-xs font-['Inter'] font-light">
                Book any service online — or <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer" className="underline hover:text-ink transition-colors">reach us on WhatsApp</a>.
              </p>
            </m.div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustPillars() {
  return (
    <section className="cv-auto bg-ink py-14 md:py-16 px-4 sm:px-5 md:px-10">
      <div className="max-w-screen-xl mx-auto">
        <m.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-accent-gold text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-10">— Why choose Farwa</m.p>
        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {[
            { num: '01', title: `${YEARS_ACTIVE} Years in PECHS`, desc: 'Since 2008 — the same chair-side standard whether you are in for ten minutes or a full bridal day.' },
            { num: '02', title: 'Book Online, Walk In Welcome', desc: 'Real-time slots on farwasalon.com/book, WhatsApp for questions, and walk-ins when we have room.' },
            { num: '03', title: 'Transparent PKR Pricing', desc: 'Every service listed with PKR on the site — no surprise quotes at the counter.' },
          ].map((p, i) => (
            <m.div key={p.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.7 }}
              className="border-t border-white/10 pt-7">
              <p className="font-['Unbounded'] text-[10px] text-accent-gold mb-4">{p.num}</p>
              <h3 className="font-['Syne'] font-bold text-base md:text-lg text-white mb-3 leading-snug">{p.title}</h3>
              <p className="text-nude/90 text-sm font-light leading-relaxed font-['Inter']">{p.desc}</p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ReviewCard({ post, compact = false, excerpt = false }) {
  const sourceLabel = post.source === 'google' ? 'Google' : 'Facebook'
  const clampQuote = excerpt || compact

  return (
    <article
      className={`group panel-soft shadow-soft flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-card ${
        compact ? 'shrink-0 snap-start w-[85vw] max-w-[320px]' : 'h-full min-h-[260px] sm:min-h-[272px]'
      }`}
    >
      <header className="flex items-center justify-between px-5 py-3.5 sm:py-4 border-b border-border-soft">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-mist border border-border-soft flex items-center justify-center shrink-0">
            <span className="text-ink font-['Syne'] font-semibold text-[11px]">{post.initials}</span>
          </div>
          <div className="min-w-0">
            <p className="font-['Syne'] font-semibold text-[13px] text-ink truncate leading-tight">{post.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="flex gap-0.5 text-stone/70" aria-hidden="true">
                {[...Array(5)].map((_, s) => <Star key={s} className="w-2 h-2 fill-current" />)}
              </div>
              <span className="text-stone text-[9px] font-['Inter']">· {post.date}</span>
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
          className={`text-stone text-[13px] md:text-sm font-light leading-relaxed font-['Inter'] flex-1 ${
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
        <div className="flex items-center justify-between gap-3 mt-auto pt-4 border-t border-border-soft">
          <span className="text-stone text-[9px] tracking-[0.18em] uppercase font-['Inter'] truncate">
            {post.service}
          </span>
          <span className="inline-flex items-center gap-1 text-stone text-[9px] tracking-[0.16em] uppercase font-['Inter'] shrink-0">
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

function toFbCard(post) {
  return {
    name: post.name,
    initials: post.initials || reviewInitials(post.name),
    date: post.date || post.relativeTime || '',
    service: post.service || (post.source === 'google' ? 'Google review' : 'Facebook'),
    quote: post.quote,
    link: post.link,
    source: post.source || 'facebook',
  }
}

function toGoogleCards(reviews) {
  return reviews.slice(0, 6).map((r) =>
    toFbCard({
      ...r,
      service: r.relativeTime || 'Google review',
      source: 'google',
    }),
  )
}

const FB_GRID_POSTS = FB_POSTS.map((post) => toFbCard(post))

const manualPayload = getManualReviewsPayload()
const gbpStats = getGbpStatsForDisplay()
const initialRatingLabel =
  gbpStats.rating != null && gbpStats.reviewCount != null
    ? `${gbpStats.rating}★ · ${gbpStats.reviewCount} Google reviews`
    : 'Reviews on Google'

const initialGoogleGrid = manualPayload?.reviews?.length
  ? toGoogleCards(manualPayload.reviews)
  : []

function ReviewGridSection({ label, viewAllHref, posts, className = '', divided = true }) {
  if (!posts.length) return null

  const desktopCols = posts.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
  const desktopLimit = posts.length >= 3 ? posts.length : 2

  return (
    <div className={`reviews-block-divider ${divided ? '' : 'border-t-0 pt-0'} ${className}`}>
      <div className="flex items-center justify-between gap-4 mb-4 sm:mb-5 md:mb-6">
        <p className="eyebrow mb-0">— {label}</p>
        <a href={viewAllHref} target="_blank" rel="noreferrer"
          className="text-stone hover:text-ink text-[10px] tracking-[0.14em] uppercase font-['Inter'] transition-colors inline-flex items-center gap-1 shrink-0">
          View all <ArrowUpRight className="w-2.5 h-2.5" />
        </a>
      </div>

      <p className="md:hidden text-stone text-[9px] tracking-[0.18em] uppercase font-['Inter'] mb-2.5">
        Swipe for more reviews →
      </p>
      <div className="md:hidden flex gap-3.5 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
        {posts.map((post) => (
          <ReviewCard key={`${label}-${post.name}-${post.quote.slice(0, 24)}`} post={post} compact excerpt />
        ))}
      </div>

      <div className={`hidden md:grid ${desktopCols} gap-4 sm:gap-5 max-w-5xl items-stretch`}>
        {posts.slice(0, desktopLimit).map((post, i) => (
          <m.div key={`${label}-${post.name}`} className="h-full"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.07, duration: 0.6, ease: [0.16,1,0.3,1] }}>
            <ReviewCard post={post} excerpt />
          </m.div>
        ))}
      </div>
    </div>
  )
}

function TestimonialsPreview() {
  const [reviewIdx, setReviewIdx] = useState(0)
  const [ratingLabel, setRatingLabel] = useState(initialRatingLabel)
  const [featuredReviews, setFeaturedReviews] = useState(
    manualPayload?.reviews?.length ? manualPayload.reviews : FALLBACK_FEATURED_REVIEWS,
  )
  const [googleGridPosts, setGoogleGridPosts] = useState(initialGoogleGrid)

  useEffect(() => {
    let cancelled = false

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
        setGoogleGridPosts(toGoogleCards(data.reviews))
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
  }, [])

  useEffect(() => {
    if (featuredReviews.length <= 1) return undefined
    const id = setInterval(() => {
      setReviewIdx((i) => (i + 1) % featuredReviews.length)
    }, 8000)
    return () => clearInterval(id)
  }, [featuredReviews.length])

  const featured = featuredReviews[reviewIdx]
  const featuredSourceLabel = featured.source === 'google' ? 'Google' : 'Facebook'

  return (
    <section className="cv-auto relative py-16 sm:py-[4.5rem] md:py-20 overflow-hidden bg-mist border-t border-border-soft">
      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10">
        <m.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="flex flex-col gap-4 sm:gap-5 sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-10 md:mb-12">
          <div className="min-w-0">
            <p className="eyebrow mb-2">— Client reviews</p>
            <h2 className="display-section">What clients say</h2>
          </div>
          <div className="reviews-rating-row shrink-0 self-start sm:self-auto">
            <div className="flex gap-0.5 text-stone/80" role="img" aria-label={`${GOOGLE_GBP_STATS.rating} out of 5 stars`}>
              {[...Array(5)].map((_, s) => <Star key={s} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />)}
            </div>
            <span className="text-stone text-[10px] sm:text-[11px] font-['Inter'] leading-snug whitespace-nowrap">
              {ratingLabel}
            </span>
          </div>
        </m.div>

        <m.figure initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
          className="reviews-featured relative px-6 py-9 sm:px-9 sm:py-10 md:px-12 md:py-11 mb-8 sm:mb-10 md:mb-12"
          aria-live="polite">
          <Quote className="reviews-featured-mark absolute top-4 left-4 sm:top-6 sm:left-6 w-8 h-8 sm:w-10 sm:h-10 rotate-180 pointer-events-none" aria-hidden="true" />
          <blockquote className={`relative z-[1] font-['Syne'] italic font-light text-ink leading-[1.42] text-center max-w-2xl mx-auto text-xl sm:text-[1.35rem] md:text-2xl px-2 sm:px-6 ${featured.quote.length > 280 ? 'line-clamp-6 sm:line-clamp-none' : ''}`}>
            {featured.quote}
          </blockquote>
          {featured.translation && (
            <p className="relative z-[1] text-stone text-center text-sm font-light mt-4 sm:mt-5 font-['Inter'] max-w-xl mx-auto leading-relaxed">
              {featured.translation}
            </p>
          )}
          <figcaption className="relative z-[1] flex flex-col items-center gap-3.5 mt-7 sm:mt-8">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <span className="text-stone text-[10px] tracking-[0.2em] uppercase font-['Inter']">
                {featured.name}
              </span>
              <span className="text-stone/40 hidden sm:inline" aria-hidden="true">·</span>
              <a href={featured.link} target="_blank" rel="noreferrer"
                className="text-stone/70 hover:text-ink text-[10px] tracking-[0.14em] uppercase font-['Inter'] inline-flex items-center gap-1 transition-colors">
                {featuredSourceLabel}{' '}
                <ArrowUpRight className="w-2.5 h-2.5" />
              </a>
            </div>
            {featuredReviews.length > 1 && (
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Featured reviews">
                {featuredReviews.map((r, i) => (
                  <button
                    key={r.name}
                    type="button"
                    role="tab"
                    aria-selected={reviewIdx === i}
                    aria-label={`Show review by ${r.name}`}
                    onClick={() => setReviewIdx(i)}
                    className={`h-1.5 rounded-full transition-[width,background-color] ${reviewIdx === i ? 'w-6 bg-ink' : 'w-1.5 bg-stone/30 hover:bg-stone/50'}`}
                  />
                ))}
              </div>
            )}
          </figcaption>
        </m.figure>

        <ReviewGridSection
          label="From Google"
          viewAllHref={GOOGLE_REVIEW_LINK}
          posts={googleGridPosts}
          className={googleGridPosts.length ? 'mb-6 sm:mb-8 md:mb-10' : ''}
        />
        <ReviewGridSection
          label="From Facebook"
          viewAllHref="https://www.facebook.com/farwasalon/reviews"
          posts={FB_GRID_POSTS}
          className="mb-8 sm:mb-10 md:mb-12"
        />

        <m.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="reviews-cta-row pt-8 sm:pt-10 border-t border-border-soft flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 sm:gap-6">
          <p className="text-stone text-[11px] sm:text-xs font-light font-['Inter'] tracking-wide max-w-sm">
            Loved your visit? Help us spread the word.
          </p>
          <div className="reviews-cta-actions flex flex-col min-[480px]:flex-row sm:flex-row items-stretch gap-3 w-full lg:w-auto lg:max-w-xl">
            <a href={GOOGLE_REVIEW_LINK} target="_blank" rel="noreferrer"
              className="tap-safe reviews-cta-btn inline-flex flex-1 items-center justify-center gap-1.5 bg-ink text-white text-[11px] tracking-[0.14em] uppercase font-semibold font-['Inter'] px-5 sm:px-6 py-3 hover:bg-stone transition-colors duration-300">
              Write a Google review <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            </a>
            <a href="https://www.facebook.com/farwasalon" target="_blank" rel="noreferrer"
              className="tap-safe reviews-cta-btn inline-flex flex-1 items-center justify-center gap-1.5 text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors border border-border-soft hover:border-ink/30 px-5 sm:px-6 py-3 bg-white">
              Follow on Facebook <ArrowUpRight className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </m.div>
      </div>
    </section>
  )
}


function CtaBand() {
  return (
    <section className="cv-auto bg-ink py-14 sm:py-16 md:py-[4.5rem] px-4 sm:px-5 md:px-10">
      <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12 xl:gap-14">
        <m.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full lg:flex-1 lg:min-w-0"
        >
          <p className="text-accent-gold text-[10px] sm:text-[11px] tracking-[0.28em] uppercase font-['Inter'] mb-3">&mdash; Visit us in PECHS</p>
          <h2
            className="font-['Unbounded'] font-bold text-white leading-[1.05] text-balance max-w-2xl lg:max-w-none"
            style={{ fontSize: 'clamp(1.9rem, 5.5vw + 0.5rem, 4rem)' }}
          >
            Ready for your glow? We&apos;re ready for you.
          </h2>
        </m.div>
        <m.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="flex flex-col gap-3 w-full lg:w-auto lg:shrink-0"
        >
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
            <Link
              href="/book"
              className="tap-safe inline-flex items-center gap-2 bg-white text-ink text-[11px] sm:text-[12px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-6 sm:px-7 md:px-8 py-3.5 md:py-4 hover:bg-nude active:scale-[0.97] transition-[background-color,transform] duration-300 w-full sm:w-auto justify-center sm:justify-start"
            >
              Book an Appointment <ArrowUpRight className="w-4 h-4 shrink-0" />
            </Link>
            <Link
              href="/prices"
              className="tap-safe link-underline text-white/60 text-[11px] sm:text-[12px] tracking-[0.14em] uppercase font-['Inter'] hover:text-white transition-colors flex items-center justify-center sm:justify-start whitespace-nowrap"
            >
              Price list
            </Link>
            <Link
              href="/bridal"
              className="tap-safe link-underline text-white/60 text-[11px] sm:text-[12px] tracking-[0.14em] uppercase font-['Inter'] hover:text-white transition-colors flex items-center justify-center sm:justify-start whitespace-nowrap"
            >
              Bridal
            </Link>
            <Link
              href="/beauty-salon-karachi"
              className="tap-safe link-underline text-white/60 text-[11px] sm:text-[12px] tracking-[0.14em] uppercase font-['Inter'] hover:text-white transition-colors flex items-center justify-center sm:justify-start whitespace-nowrap"
            >
              Beauty salon Karachi
            </Link>
          </div>
          <a
            href={`https://wa.me/${WA_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="tap-safe text-white/60 text-[10px] tracking-[0.12em] uppercase font-['Inter'] hover:text-white transition-colors flex items-center justify-center sm:justify-start lg:justify-end min-w-0"
          >
            Or reach us on WhatsApp
          </a>
        </m.div>
      </div>
    </section>
  )
}

function FounderNote() {
  return (
    <section className="cv-auto bg-mist border-t border-border-soft py-16 sm:py-20 md:py-24 px-4 sm:px-5 md:px-10">
      <div className="max-w-3xl mx-auto text-center">
        <p className="eyebrow mb-6">— The House</p>
        <blockquote
          className="font-['Syne'] italic text-ink text-balance leading-[1.3]"
          style={{ fontSize: 'clamp(1.35rem, 3.6vw, 2.25rem)' }}>
          &ldquo;Trends visit Karachi every season. Grace stays. I opened this
          salon in 2008 to give every woman on this street both.&rdquo;
        </blockquote>
        <p className="mt-6 text-[11px] tracking-[0.28em] uppercase font-['Inter'] text-stone">
          Rubina · Founder, Farwa Beauty Salon
        </p>
      </div>
    </section>
  )
}

export default function HomeBelowFold() {
  return (
    <>
      <QuickPickRow />
      <StatsStrip />
      <EditorialSlideshow />
      <WordmarkDivider />
      <FeaturedServices />
      <TrustPillars />
      <SalonLocalBlock />
      <FounderNote />
      <TestimonialsPreview />
      <CtaBand />
    </>
  )
}
