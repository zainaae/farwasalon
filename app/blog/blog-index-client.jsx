'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { useBooking } from '../../src/shared.jsx'
import { BreadcrumbJsonLd } from '../json-ld.jsx'
import PageCloseCta from '../components/page-close-cta.jsx'

function formatBlogDate(dateStr) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-PK', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function BlogIndexClient({ posts }) {
  const booking = useBooking()
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
          <p className="hero-fade-up eyebrow">— Guides from the chair</p>
          <h1 className="hero-rise display-page text-ink" style={{ animationDuration: '0.9s' }}>
            Beauty tips &amp; guides
          </h1>
          <p className="hero-fade-up text-body" style={{ animationDelay: '0.15s' }}>
            Expert advice from our team — bridal prep timelines, skincare for Karachi weather, and professional tips you can use at home.
          </p>
        </div>

        {featured && (
          <article className="mb-12 md:mb-16 border-b border-border-soft pb-12">
            <Link href={`/blog/${featured.slug}`} className="group block">
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
                  <p className="text-[10px] tracking-[0.2em] uppercase font-[family-name:var(--font-inter)] text-accent-gold-deep mb-3">
                    Featured · {featured.category}
                  </p>
                  <h2 className="font-[family-name:var(--font-syne)] font-bold text-xl md:text-2xl lg:text-3xl text-ink leading-snug mb-3 group-hover:text-stone transition-colors">
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

        {list.length > 0 && (
          <ul className="flex flex-col divide-y divide-border-soft border-t border-border-soft">
            {list.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 py-5 md:py-6"
                >
                  <time
                    dateTime={post.date}
                    className="shrink-0 text-stone text-[11px] font-[family-name:var(--font-inter)] tabular-nums sm:w-28"
                  >
                    {formatBlogDate(post.date)}
                  </time>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] tracking-[0.16em] uppercase font-[family-name:var(--font-inter)] text-stone mb-1">
                      {post.category}
                      <span className="text-border-soft mx-2" aria-hidden="true">·</span>
                      {post.readTime}
                    </p>
                    <h2 className="font-[family-name:var(--font-syne)] font-semibold text-lg md:text-xl text-ink leading-snug group-hover:text-stone transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-body text-sm mt-2 line-clamp-2 max-w-2xl">
                      {post.description}
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-stone opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    Read <ChevronRight className="w-3 h-3" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {list.length === 0 && (
          <p className="text-body text-sm py-8">No guides in this category yet.</p>
        )}
      </div>

      <PageCloseCta
        eyebrow="— Ready when you are"
        title="Book a consultation at the PECHS studio"
        body="Have a beauty question? Book a live slot online, or WhatsApp us."
        waFrom="blog-index"
        onBookClick={() => booking.open()}
        bookLabel="Book a Consultation"
      />
    </main>
  )
}
