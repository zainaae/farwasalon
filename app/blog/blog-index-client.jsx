'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import ArrowUpRight from '../components/icon-sprite.jsx'
import WaCta from '../components/wa-cta.jsx'
import { BreadcrumbJsonLd } from '../json-ld.jsx'
import PageCloseCta from '../components/page-close-cta.jsx'
import { WA_NUMBER } from '../../src/data.js'

function formatBlogDate(dateStr) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-PK', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function BlogIndexClient({ posts }) {
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean))).sort()]
  const sorted = [...posts].sort((a, b) => String(b.date).localeCompare(String(a.date)))

  /* Filter first, then feature. Featuring sorted[0] before filtering pinned
     the newest post of ALL categories above the chips, so choosing Hair still
     led with a Seasonal article labelled "Featured · Seasonal". The feature
     slot is the newest post of whatever is being shown. */
  const inCategory = sorted.filter((p) => activeCategory === 'All' || p.category === activeCategory)

  const featured = inCategory[0]
  const list = inCategory.slice(1)

  return (
    <main id="main" className="page-content">
      <div className="section-shell pt-14 md:pt-[4.5rem] pb-10 md:pb-12 min-h-0">
        <BreadcrumbJsonLd items={[
          { name: 'Home', url: 'https://farwasalon.com/' },
          { name: 'Blog', url: 'https://farwasalon.com/blog' },
        ]} />

        <div className="mb-10 md:mb-14 border-b border-border-soft pb-8 title-stack max-w-lg">
          <p className="hero-fade-up eyebrow text-plum">— Guides from the chair</p>
          <h1 className="hero-rise display-page text-ink" style={{ animationDuration: '0.9s' }}>
            Beauty tips &amp; guides
          </h1>
          <p className="hero-fade-up text-body" style={{ animationDelay: '0.15s' }}>
            Expert advice from our team — bridal prep timelines, skincare for Karachi weather, and professional tips you can use at home.
          </p>
        </div>

        {/* The one piece of ground on this page. /blog rendered 98% white
              top to bottom with no elevation anywhere, so the featured post
              read as the first row of the list rather than as the thing above
              it — a bottom rule was doing all the work.

              Mist rather than nude, on measurement: --accent-gold-deep is
              3.98:1 on --nude, which fails the "Featured ·" eyebrow at 10px.
              It is 4.9:1 on --mist. Mist is only ΔL* 3.3 off white and would
              not separate across a full-bleed band, but inside a bounded panel
              the hairline and the shadow carry the edge and the tone only has
            to confirm it. Both tokens already exist; nothing new invented. */}
        {featured && (
          <article className="mb-12 md:mb-16">
            <Link
              href={`/blog/${featured.slug}`}
              className="group block panel-soft shadow-soft hover:shadow-card transition-shadow duration-300 p-5 sm:p-7 md:p-9"
            >
              {/* items-center, not items-start. The image column runs ~620px
                  and the title/dek/meta stack ends around 240px, so top-aligning
                  them left roughly 200px of dead white beside the tallest block
                  on the page. */}
              <div className="grid md:grid-cols-[1.6fr_1fr] gap-6 md:gap-10 items-center">
                {featured.featuredImage && (
                  <div className="relative aspect-[16/10] md:aspect-[16/11] overflow-hidden bg-mist border border-border-soft">
                    <Image
                      src={featured.featuredImage}
                      alt={featured.title}
                      fill
                      priority
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, 55vw"
                    />
                  </div>
                )}
                <div className="min-w-0 pt-1">
                  <p className="text-[10px] tracking-[0.2em] uppercase font-[family-name:var(--font-inter)] text-berry mb-3">
                    Featured · {featured.category}
                  </p>
                  <h2 className="font-[family-name:var(--font-syne)] font-bold text-xl md:text-2xl lg:text-3xl text-ink leading-snug mb-3 group-hover:text-plum transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-body mb-4 max-w-md line-clamp-3">
                    {featured.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-5 text-stone text-[10px] font-[family-name:var(--font-inter)]">
                    <time dateTime={featured.date}>{formatBlogDate(featured.date)}</time>
                    <span aria-hidden="true" className="text-border-soft">·</span>
                    <span>{featured.readTime}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.16em] uppercase font-medium font-[family-name:var(--font-inter)] text-ink group-hover:gap-2 transition-[gap]">
                    Read article <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          </article>
        )}

        {/* Toggle buttons, not tabs. role="tab" commits to the ARIA tab pattern —
            arrow-key roving focus and an owned tabpanel — and neither exists
            here; the ul/li between tablist and tab broke the required ownership
            on top of that. aria-pressed describes what these actually are. */}
        <div className="mb-8">
          {/* One scrollable row. At 15 categories the shared .tab-scroller wraps
              above md and leaves a second line holding three lonely chips. */}
          <ul className="tab-scroller blog-filter-row text-sm font-[family-name:var(--font-inter)] pb-1" aria-label="Filter articles by category">
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  type="button"
                  aria-pressed={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`tap-safe tab-pill inline-flex items-center ${activeCategory === cat ? 'tab-pill-active' : ''}`}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p className="sr-only" aria-live="polite">
          {activeCategory === 'All'
            ? `Showing all ${sorted.length} articles`
            : `Showing ${inCategory.length} ${activeCategory} article${inCategory.length === 1 ? '' : 's'}`}
        </p>

        {/* Quoti sticky panel fills the former dead right column: list scrolls,
            Book + WhatsApp stay put. Mobile keeps a single column. */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-10 xl:gap-x-14 lg:items-start">
          <div className="lg:col-span-8 min-w-0">
            {list.length > 0 && (
              <ul className="flex flex-col divide-y divide-border-soft border-t border-border-soft">
                {list.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 py-5 md:py-6"
                    >
                      {/* The date used to lead the row from a 7rem rail on the
                          left. Two things were wrong with that: the whole corpus
                          published on one day, so the rail scanned as the same
                          string repeated down the page, and it pushed the title
                          and excerpt 136px right while the actual right-hand
                          column — a "Read" affordance held at opacity-0 until
                          hover — left ~400px of the row permanently blank. Moving
                          the one piece of real information over there closes the
                          void with something worth reading and gives the title
                          back its width. */}
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] tracking-[0.16em] uppercase font-[family-name:var(--font-inter)] text-stone mb-1">
                          {post.category}
                          <span className="text-border-soft mx-2" aria-hidden="true">·</span>
                          {post.readTime}
                        </p>
                        <h2 className="font-[family-name:var(--font-syne)] font-semibold text-lg md:text-xl text-ink leading-snug group-hover:text-plum transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-body text-sm mt-2 line-clamp-2 max-w-2xl">
                          {post.description}
                        </p>
                      </div>
                      <div className="shrink-0 sm:text-right sm:w-32 flex items-center sm:items-end gap-2 sm:gap-1 sm:flex-col">
                        <time
                          dateTime={post.date}
                          className="text-stone text-[11px] font-[family-name:var(--font-inter)] tabular-nums"
                        >
                          {formatBlogDate(post.date)}
                        </time>
                        {/* Reserved space is what made the old affordance cost a
                            column; this one sits under the date it shares a cell
                            with, so hidden-until-hover costs nothing. */}
                        <span
                          aria-hidden="true"
                          className="hidden sm:inline-flex items-center gap-1 text-[10px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-ink opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Read <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {/* Gate on inCategory, not on list. list is inCategory minus the
                featured article, so any category holding exactly one post —
                Brows, Threading, Waxing, Massage, Makeup, five of the sixteen
                chips — put that post in the feature slot, left list empty, and
                fired this message directly beneath the very article it was
                denying the existence of. The page contradicted itself.
                inCategory is what "is there anything here" actually means. */}
            {inCategory.length === 0 && (
              <p className="text-body text-sm py-8">No guides in this category yet.</p>
            )}
          </div>

          <aside className="hidden lg:block lg:col-span-4">
            <div className="lg:sticky lg:top-28 panel-plum p-6 xl:p-7">
              <p className="text-accent-gold text-[10px] tracking-[0.22em] uppercase font-[family-name:var(--font-inter)] mb-3">
                — PECHS studio
              </p>
              <p
                className="font-[family-name:var(--font-fraunces)] font-bold text-white leading-snug mb-3"
                style={{ fontSize: 'clamp(1.15rem, 1.6vw, 1.45rem)', letterSpacing: '-0.02em' }}
              >
                Ready to book from a guide?
              </p>
              <p className="text-white/70 text-sm font-light font-[family-name:var(--font-inter)] leading-relaxed mb-6">
                Live slots online, or WhatsApp if you prefer a quick confirm. No prepayment.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/book"
                  className="btn-loud btn-loud--light tap-safe w-full inline-flex items-center justify-center gap-2 !min-h-12 !px-5 !py-3 !text-[12px]"
                >
                  Book a Consultation <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </Link>
                <WaCta
                  href={`https://wa.me/${WA_NUMBER}`}
                  from="blog-index-rail"
                  className="tap-safe inline-flex items-center justify-center gap-2 min-h-12 px-5 py-3 text-[12px] tracking-[0.14em] uppercase font-semibold font-[family-name:var(--font-inter)] text-white border border-white/70 hover:bg-white/10 transition-colors w-full"
                >
                  WhatsApp us
                </WaCta>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <PageCloseCta
        eyebrow="— Ready when you are"
        title="Book a consultation at the PECHS studio"
        body="Have a beauty question? Book a live slot online, or WhatsApp us."
        bookHref="/book"
        waFrom="blog-index"
        bookLabel="Book a Consultation"
      />
    </main>
  )
}
