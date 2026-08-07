'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { GOOGLE_GBP_STATS, FACEBOOK_TESTIMONIALS } from '../src/google-reviews-data.js'
import SalonLocalBlock from './components/salon-local-block.jsx'
import QuickPickRow from './quick-pick-row.jsx'
import { SERVICES, CAT_META, YEARS_ACTIVE, WA_NUMBER, GOOGLE_REVIEW_LINK } from '../src/data.js'
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
  /* Story band with a real photo anchor — not another mist title-stack slab. */
  return (
    <section className="cv-auto bg-white border-b border-border-soft overflow-hidden">
      <div className="max-w-screen-xl mx-auto grid md:grid-cols-12 items-stretch">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-7 flex flex-col justify-center px-4 sm:px-5 md:px-10 py-16 sm:py-[4.75rem] md:py-[5.5rem]"
        >
          <div className="title-stack max-w-xl">
            <p className="eyebrow">— Est. 2008 · PECHS</p>
            <h2 className="display-page max-w-xl text-ink">
              A beauty studio with {YEARS_ACTIVE} years of care
            </h2>
          </div>
          <p className="text-body max-w-xl mt-5">
            For over {YEARS_ACTIVE}{' '}years in PECHS Block 3 — Rubina&apos;s chair, printed PKR on every service, and the same standard whether you book ten minutes or a bridal day.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-5 mt-2 border-t border-border-soft">
            <Link href="/book" className="tap-safe inline-flex items-center gap-2 text-ink text-sm font-medium font-[family-name:var(--font-inter)] group w-fit pt-4">
              <span className="link-underline">Book a visit</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <Link href="/about" className="tap-safe text-stone hover:text-ink text-[11px] tracking-wide font-[family-name:var(--font-inter)] transition-colors pt-4">
              Our story
            </Link>
          </div>
        </m.div>
        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.08 }}
          className="relative md:col-span-5 min-h-[240px] md:min-h-full aspect-[5/4] md:aspect-auto overflow-hidden"
        >
          <Image
            src="/facial.jpg"
            alt="Facial treatment at Farwa Beauty Salon, PECHS"
            fill
            quality={55}
            sizes="(max-width: 767px) 100vw, 40vw"
            className="object-cover object-[50%_25%]"
          />
        </m.div>
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
      <div className="section-shell flex items-end justify-between gap-4 pt-7 pb-4 px-4 sm:px-5 md:px-10 md:pt-8 md:pb-5">
        <p className="eyebrow mb-0 text-plum">— The work</p>
        <Link
          href="/gallery"
          className="tap-safe inline-flex items-center gap-1.5 text-[10px] tracking-[0.16em] uppercase font-[family-name:var(--font-inter)] text-plum-deep hover:text-ink transition-colors"
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
                <div className="absolute inset-0 bg-gradient-to-t from-ink/[0.88] via-ink/35 to-transparent" />
                <span className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <span className="text-white text-[10px] tracking-[0.2em] md:tracking-[0.18em] uppercase font-[family-name:var(--font-inter)] font-medium leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]">
                    {p.label}
                  </span>
                  <span className="md:hidden text-white/70 text-[9px] font-[family-name:var(--font-inter)] tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                    {String((i % EDITORIAL_PHOTOS.length) + 1).padStart(2, '0')}
                  </span>
                </span>
              </Link>
            )
          })}
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

function FeaturedServices() {
  const categories = Object.keys(SERVICES)
  const [hovered, setHovered] = useState(null)

  return (
    <section className="cv-auto bg-white section-pad border-t border-border-soft">
      <div className="section-shell">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-baseline sm:justify-between mb-10 md:mb-12 lg:mb-14">
          <m.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="title-stack">
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

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <m.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
            className="relative overflow-hidden aspect-[4/3] lg:aspect-[3/4] lg:sticky lg:top-24 shadow-soft">
            <ServiceMediaPanel hovered={hovered} />
          </m.div>

          <div>
            <div className="divide-y divide-border-soft border-t border-border-soft bg-white/70 px-3 sm:px-4 -mx-3 sm:-mx-4">
              {categories.map((cat, i) => (
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
                      <span className="text-stone text-[11px] font-[family-name:var(--font-inter)] hidden sm:block tabular-nums">
                        {SERVICES[cat].length}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-stone/40 group-hover:text-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-[transform,color] duration-200" />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustPillars() {
  /* #42 calm trust chapter — three honest claims, no CTA pile-up.
     Photo anchor kept from the later problem band so this is not a mist slab. */
  const pillars = [
    {
      num: '01',
      title: `${YEARS_ACTIVE} Years in PECHS`,
      desc: 'Since 2008 — the same chair-side standard whether you are in for ten minutes or a full bridal day.',
    },
    {
      num: '02',
      title: 'Book online · walk-ins when free',
      desc: 'Real-time slots online, WhatsApp for questions, and walk-ins when we have room.',
    },
    {
      num: '03',
      title: 'Transparent PKR Pricing',
      desc: 'Every service listed with PKR on the site — no surprise quotes at the counter.',
    },
  ]

  return (
    <section
      className="cv-auto bg-ink border-t border-white/10"
      aria-labelledby="trust-pillars-heading"
      style={{ backgroundImage: 'radial-gradient(75% 120% at 16% 0%, rgba(201,169,138,0.10), transparent 60%)' }}
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="grid lg:grid-cols-12 lg:items-stretch">
          <div className="relative lg:col-span-5 min-h-[240px] sm:min-h-[300px] lg:min-h-0 overflow-hidden">
            <div className="relative h-full min-h-[240px] lg:min-h-full aspect-[5/4] lg:aspect-auto lg:absolute lg:inset-0">
              <Image
                src="/glow3.jpg"
                alt="Facial glow treatment at Farwa Beauty Salon, PECHS"
                fill
                quality={55}
                sizes="(max-width: 1023px) 100vw, 42vw"
                className="object-cover object-[50%_30%]"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(13,13,13,0.55) 0%, rgba(13,13,13,0.08) 50%, rgba(13,13,13,0.28) 100%)',
                }}
              />
            </div>
          </div>

          <div className="lg:col-span-7 px-4 sm:px-5 md:px-10 py-14 md:py-16 lg:py-[4.5rem]">
            <m.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              id="trust-pillars-heading"
              className="text-accent-gold text-[10px] tracking-[0.28em] uppercase font-[family-name:var(--font-inter)] mb-8 md:mb-10"
            >
              — Why choose Farwa
            </m.p>
            <div className="grid sm:grid-cols-3 gap-8 md:gap-9">
              {pillars.map((p, i) => (
                <m.div
                  key={p.num}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.65 }}
                  className="border-t border-white/10 pt-6 md:pt-7"
                >
                  <p className="font-[family-name:var(--font-unbounded)] text-[10px] text-accent-gold mb-3.5">{p.num}</p>
                  <h3 className="font-[family-name:var(--font-syne)] font-bold text-base md:text-[17px] text-white mb-2.5 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-nude/90 text-sm font-light leading-relaxed font-[family-name:var(--font-inter)]">
                    {p.desc}
                  </p>
                </m.div>
              ))}
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

  /* Excerpt strip — typographic quote tiles, no circular initial avatars
     (AI-template tell). Name + date carry the attribution. */
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
            className="review-strip-card__mark w-6 h-6 rotate-180 shrink-0"
            aria-hidden="true"
          />
          <blockquote className="review-strip-card__quote flex-1 font-[family-name:var(--font-syne)] font-light italic text-ink leading-[1.4] text-[15px] sm:text-base line-clamp-4">
            {post.quote}
          </blockquote>
          <footer className="review-strip-card__foot mt-auto pt-5 flex items-end justify-between gap-3 border-t border-border-soft">
            <span className="min-w-0">
              <span className="block font-[family-name:var(--font-syne)] font-semibold text-[13px] text-ink truncate leading-tight">
                {post.name}
              </span>
              <span className="mt-1.5 flex items-center gap-1.5">
                <StarRating size={9} className="text-plum/70" />
                {post.date ? (
                  <span className="text-stone text-[10px] font-[family-name:var(--font-inter)]">
                    {post.date}
                  </span>
                ) : null}
              </span>
            </span>
            <ArrowUpRight className="review-strip-card__arrow w-4 h-4 shrink-0 mb-0.5" aria-hidden="true" />
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
          <p className="eyebrow mb-0">— {label}</p>
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
    <section className="cv-auto relative py-16 sm:py-[4.5rem] md:py-20 overflow-hidden bg-white border-t border-border-soft">
      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10">
        <m.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="flex flex-col gap-4 sm:gap-5 sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-10 md:mb-12">
          <div className="min-w-0 title-stack">
            <p className="eyebrow">— Client reviews</p>
            <h2 className="display-page text-ink">What clients say</h2>
          </div>
          <div className="reviews-rating-row shrink-0 self-start sm:self-auto">
            {/* Text only — StarRating fills five stars and would claim a perfect
                rating next to the honest 4.6★ aggregate. Per-review cards keep
                their own stars. */}
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
          className="reviews-featured relative px-6 py-10 sm:px-9 sm:py-12 md:px-14 md:py-14 mb-10 sm:mb-12 md:mb-14"
          aria-live="polite"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false)
          }}
        >
          <Quote className="reviews-featured-mark absolute top-5 left-5 sm:top-7 sm:left-7 w-8 h-8 sm:w-10 sm:h-10 rotate-180 pointer-events-none" aria-hidden="true" />
          <blockquote className={`relative z-[1] font-[family-name:var(--font-syne)] italic font-light text-white leading-[1.42] text-left sm:text-center max-w-2xl mx-auto text-xl sm:text-[1.35rem] md:text-2xl px-1 sm:px-6 ${featured.quote.length > 280 ? 'line-clamp-6' : ''}`}>
            {featured.quote}
          </blockquote>
          {featured.translation && (
            <p className="relative z-[1] text-white/65 text-left sm:text-center text-sm font-light mt-4 sm:mt-5 font-[family-name:var(--font-inter)] max-w-xl mx-auto leading-relaxed">
              {featured.translation}
            </p>
          )}
          <figcaption className="relative z-[1] flex flex-col items-start sm:items-center gap-3.5 mt-7 sm:mt-8">
            <div className="flex flex-wrap items-center justify-start sm:justify-center gap-x-2 gap-y-1">
              <span className="text-white/75 text-[10px] tracking-[0.2em] uppercase font-[family-name:var(--font-inter)]">
                {featured.name}
              </span>
              <span className="text-white/35 hidden sm:inline" aria-hidden="true">·</span>
              <a href={featured.link} target="_blank" rel="noreferrer"
                className="text-white/60 hover:text-white text-[10px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] inline-flex items-center gap-1 transition-colors">
                {featuredSourceLabel}{' '}
                <ArrowUpRight className="w-2.5 h-2.5" />
              </a>
            </div>
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
                      className={`block h-1.5 rounded-full transition-[width,background-color] ${reviewIdx === i ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`}
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
          className="reviews-cta-row pt-8 sm:pt-10 border-t border-border-soft flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          <a href={GOOGLE_REVIEW_LINK} target="_blank" rel="noreferrer"
            className="tap-safe reviews-cta-btn inline-flex items-center justify-center gap-1.5 bg-ink text-white text-[11px] tracking-[0.14em] uppercase font-semibold font-[family-name:var(--font-inter)] px-5 sm:px-6 py-3 hover:bg-plum transition-colors duration-300">
            Write a Google review <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
          </a>
          <a href="https://www.facebook.com/farwasalon" target="_blank" rel="noreferrer"
            className="tap-safe reviews-cta-btn inline-flex items-center justify-center gap-1.5 text-stone text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] hover:text-ink transition-colors border border-border-soft hover:border-ink/30 px-5 sm:px-6 py-3 bg-white">
            Follow on Facebook <ArrowUpRight className="w-3 h-3 shrink-0" />
          </a>
        </m.div>
      </div>
    </section>
  )
}

function CtaBand() {
  /* Photo-backed close — not another flat plum slab. Same loud Book + WhatsApp
     pair as PageCloseCta; tertiary links stay quiet underneath. */
  return (
    <section className="cv-auto cta-band relative overflow-hidden border-t border-white/10">
      <Image
        src="/bridal.jpg"
        alt=""
        fill
        quality={55}
        sizes="100vw"
        className="object-cover object-[50%_28%] pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute inset-0 grain-on-dark"
        style={{
          background:
            'linear-gradient(105deg, rgba(63,22,49,0.94) 0%, rgba(63,22,49,0.82) 42%, rgba(13,6,9,0.72) 100%)',
        }}
      />
      <div className="relative z-[2] max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10 py-16 sm:py-20 md:py-[5rem]">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-end">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7"
          >
            <p className="text-accent-gold text-[10px] sm:text-[11px] tracking-[0.28em] uppercase font-[family-name:var(--font-inter)] mb-4">&mdash; Visit us in PECHS</p>
            <h2
              className="font-[family-name:var(--font-unbounded)] font-bold text-white leading-[1.12] text-balance"
              style={{ fontSize: 'clamp(1.9rem, 5vw + 0.4rem, 3.5rem)', letterSpacing: '-0.02em', maxWidth: '14ch' }}
            >
              Book online in under a minute
            </h2>
            <p className="text-body mt-4 max-w-md text-white/70">
              No prepayment. Cancel free up to 2 hours before. Or message us on WhatsApp — whichever is easier for you.
            </p>
          </m.div>
          <m.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-5 flex flex-col gap-5"
          >
            <div className="cta-cluster w-full">
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
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
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
          </m.div>
        </div>
      </div>
    </section>
  )
}

function FounderNote() {
  return (
    <section className="cv-auto bg-mist border-t border-border-soft">
      <div className="max-w-screen-xl mx-auto grid md:grid-cols-12 md:gap-0 items-stretch">
        <m.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative md:col-span-5 min-h-[280px] md:min-h-[420px] overflow-hidden"
        >
          <Image
            src="/hairdo.jpg"
            alt="Hair styling at Farwa Beauty Salon with founder Rubina"
            fill
            quality={60}
            sizes="(max-width: 767px) 100vw, 42vw"
            className="object-cover object-[50%_20%]"
          />
        </m.div>
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-7 flex flex-col justify-center px-5 sm:px-8 md:px-12 lg:px-16 py-14 sm:py-16 md:py-20 bg-white md:border-l border-border-soft"
        >
          <p className="eyebrow mb-6">— The House</p>
          <blockquote
            className="font-[family-name:var(--font-syne)] font-medium text-ink text-balance leading-[1.3]"
            style={{ fontSize: 'clamp(1.25rem, 3.2vw, 2rem)', maxWidth: '22ch' }}>
            &ldquo;Trends visit Karachi every season. Grace stays. I opened this
            salon in 2008 to give every woman on this street both.&rdquo;
          </blockquote>
          <p className="mt-6 text-[11px] tracking-[0.28em] uppercase font-[family-name:var(--font-inter)] text-stone">
            Rubina · Founder, Farwa Beauty Salon
          </p>
          <Link
            href="/about"
            className="tap-safe mt-8 inline-flex items-center gap-1.5 text-[11px] tracking-[0.16em] uppercase font-[family-name:var(--font-inter)] text-ink hover:text-stone transition-colors self-start"
          >
            Meet Rubina <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </m.div>
      </div>
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
      <TrustPillars />
      <SalonLocalBlock />
      <FounderNote />
      <TestimonialsPreview placesEnabled={placesEnabled} />
      <CtaBand />
    </>
  )
}
