'use client'

import { useState } from 'react'
import ArrowUpRight from '../../components/icon-sprite.jsx'
import WaCta from '../../components/wa-cta.jsx'
import { useRouter } from 'next/navigation'
import { m } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { ServiceModal, formatPrice, formatServicePrice, formatDuration, CAT_SLUGS } from '../../../src/shared.jsx'
import { SERVICES, CAT_META, slugToCategory } from '../../../src/data.js'
import { CAT_FAQS, CAT_SEO, CAT_RELATED, CAT_PAGE_BLOCKS } from '../../../src/cat-seo-content.js'
import { CAT_META_DESC } from '../../../src/cat-meta-desc.js'
import JsonLd, { BreadcrumbJsonLd } from '../../json-ld.jsx'
import { buildCategoryOffersSchema } from '../../../lib/service-schema.js'
import { SITE_ORIGIN, buildSpeakableSchema, buildFaqPageSchema } from '../../../lib/business-schema.js'
import { AREAS_HUB_HREF, getClientFacingAreaLinksForCategory } from '../../../lib/location-links.js'
import { WA_DEFAULT, MAPS_LINK } from '../../../src/site-config.js'
import PageCloseCta from '../../components/page-close-cta.jsx'

function getCatMeta(cat) {
  const base = CAT_META[cat] || { img: '/bleachpolish.jpg' }
  return {
    ...base,
    desc: CAT_META_DESC[cat] || 'Expert beauty services tailored just for you.',
  }
}

function ServiceJsonLd({ category, services }) {
  const prices = services.map(s => s.pricePkr).filter(Boolean)
  if (!prices.length) return null
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: category,
    provider: { '@type': 'BeautySalon', name: 'Farwa Beauty Salon' },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: String(Math.min(...prices)),
      highPrice: String(Math.max(...prices)),
      priceCurrency: 'PKR',
      offerCount: String(services.length),
    },
    areaServed: { '@type': 'City', name: 'Karachi' },
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

export default function CategoryDetailClient({ categorySlug, relatedBlogs = [] }) {
  const category = slugToCategory(categorySlug)
  const [modal, setModal] = useState(null)
  const router   = useRouter()
  const services = SERVICES[category] || []
  const meta     = getCatMeta(category)
  const faqs     = CAT_FAQS[category] || []
  const canOpen  = s => !!(s.desc || (Array.isArray(s.includes) && s.includes.length))
  const openFor  = s => { if (canOpen(s)) setModal(s) }
  const onBack   = () => router.push('/services')
  const slug     = Object.entries(CAT_SLUGS).find(([k]) => k === category)?.[1]
  const areaLinks = category ? getClientFacingAreaLinksForCategory(category, 5) : []
  const prices = services.map((s) => s.pricePkr).filter(Boolean)
  const minPrice = prices.length ? Math.min(...prices) : null
  const seo = CAT_SEO[category]
  const pageH1 = seo?.h1 || `${category} in PECHS, Karachi`
  const relatedCats = (CAT_RELATED[category] || [])
    .filter((cat) => CAT_SLUGS[cat])
    .slice(0, 4)
  const pageBlocks = CAT_PAGE_BLOCKS[category] || []

  if (!category) {
    return (
      <main id="main" className="page-content">
        <m.div className="section-shell section-pad min-h-0">
          <p className="text-body">Category not found.</p>
        </m.div>
      </main>
    )
  }

  return (
    <main id="main" className="page-content">
      <div className="section-shell pt-14 md:pt-[4.5rem] pb-10 md:pb-12 min-h-0">
        {/* Centred, and one step wider than it was. This column was max-w-3xl
            with no mx-auto, so on a 1440px screen every one of these 13 pages
            put 767px of content against the left rule and left ~430px of dead
            canvas down the right — an amputation, not a margin. Widening the
            prose was never the risk: the description carries its own
            max-w-prose and the intro blocks their own max-w-2xl, so the only
            thing this wrapper actually governs is the price list, which is
            tabular and wants the room. */}
        <div className="max-w-4xl mx-auto">
          <BreadcrumbJsonLd items={[
            { name: 'Home', url: 'https://farwasalon.com/' },
            { name: 'Services', url: 'https://farwasalon.com/services' },
            { name: category, url: `https://farwasalon.com/services/${slug}` },
          ]} />
          <ServiceJsonLd category={category} services={services} />
          {slug && (() => {
            const offers = buildCategoryOffersSchema(category, services, slug)
            return offers ? <JsonLd data={offers} /> : null
          })()}
          <JsonLd
            data={buildSpeakableSchema({
              pageUrl: `${SITE_ORIGIN}/services/${slug}`,
              cssSelectors: ['#service-category-title', '#service-category-desc'],
            })}
          />
          {faqs.length > 0 && (() => {
            const faqSchema = buildFaqPageSchema(faqs)
            return faqSchema ? <JsonLd data={faqSchema} /> : null
          })()}

          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[11px] text-stone font-[family-name:var(--font-inter)]">
              <li>
                <Link href="/" className="tap-safe inline-flex items-center min-h-[44px] px-1 -mx-1 hover:text-ink transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden className="text-stone/50">/</li>
              <li>
                <Link href="/services" className="tap-safe inline-flex items-center min-h-[44px] px-1 -mx-1 hover:text-ink transition-colors">
                  Services
                </Link>
              </li>
              <li aria-hidden className="text-stone/50">/</li>
              <li className="text-ink px-1">{category}</li>
            </ol>
          </nav>

          <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="mb-8 pb-8 border-b border-border-soft title-stack">
            <p className="eyebrow">
              — {services.length} services{minPrice != null ? ` · from ${formatPrice(minPrice)}` : ''}
            </p>
            <h1 id="service-category-title" className="display-page text-ink">{pageH1}</h1>
            <p id="service-category-desc" className="text-body max-w-prose leading-[1.7]">{meta.desc}</p>
            <div className="cta-cluster mt-5">
              <Link href={`/book?category=${encodeURIComponent(category)}`} className="tap-safe btn-primary">
                Book online <ArrowUpRight className="w-4 h-4" />
              </Link>
              <WaCta href={WA_DEFAULT} from="service-category" className="tap-safe btn-secondary">
                WhatsApp
              </WaCta>
            </div>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-[family-name:var(--font-inter)]">
              <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="tap-safe inline-flex items-center min-h-[44px] link-underline hover:text-ink text-stone">
                Directions
              </a>
              <Link href="/prices" className="tap-safe inline-flex items-center min-h-[44px] link-underline hover:text-ink text-stone">
                Full price list
              </Link>
              {areaLinks[0] && (
                <Link href={areaLinks[0].href} className="tap-safe inline-flex items-center min-h-[44px] link-underline hover:text-ink text-stone">
                  {areaLinks[0].label}
                </Link>
              )}
            </p>
          </m.div>

          {pageBlocks.length > 0 && (
            <section className="mb-10 space-y-4 max-w-2xl">
              {pageBlocks.map((block, i) => {
                if (block.type === 'h2') {
                  return (
                    <h2 key={i} className="font-[family-name:var(--font-syne)] font-bold text-lg text-ink pt-2">
                      {block.text}
                    </h2>
                  )
                }
                if (block.type === 'ul' && Array.isArray(block.items)) {
                  return (
                    <ul key={i} className="list-disc pl-5 space-y-1 text-stone text-sm font-[family-name:var(--font-inter)] font-light">
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )
                }
                return (
                  <p key={i} className="text-body text-sm">
                    {block.text}
                  </p>
                )
              })}
            </section>
          )}

          <ul className="divide-y divide-border-soft">
            {services.map((s, i) => {
              const opens = canOpen(s)

              /* Price flush right, at the name's weight, in its own cell.
                 It used to sit under the name as an 11px gold line, which put
                 every figure on a ragged left edge behind a heading — so
                 comparing the Rs 1,800 facial against the Rs 5,500 one meant
                 reading the whole list instead of running an eye down a rail.
                 Position now carries "this is the price"; ink instead of gold
                 also takes it from 3.4:1 to full contrast at the size people
                 actually squint at. */
              const priceCell = (s.pricePkr != null || s.durationMinutes != null) && (
                <div className="shrink-0 text-right">
                  {s.pricePkr != null && (
                    <p className="font-[family-name:var(--font-syne)] font-bold text-[13px] text-ink leading-tight tabular-nums">
                      {formatServicePrice(s)}
                    </p>
                  )}
                  {s.durationMinutes != null && (
                    <p className="text-stone text-[11px] font-[family-name:var(--font-inter)] font-light mt-0.5 tabular-nums">
                      {formatDuration(s.durationMinutes)}
                    </p>
                  )}
                </div>
              )

              return (
                <m.li key={s.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.025 }}
                  className="flex items-center py-4 gap-5 sm:gap-8">
                  {opens ? (
                    <button type="button" onClick={() => openFor(s)}
                      className="flex-1 min-w-0 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2">
                      <p className="font-[family-name:var(--font-syne)] font-bold text-[13px] text-ink uppercase leading-tight group-hover:text-stone transition-colors">
                        {s.name}
                      </p>
                      {s.desc && (
                        /* max-sm:hidden, not `hidden sm:block`. The old pair set
                           display:block at sm and up, which overrode the
                           display:-webkit-box that line-clamp needs — so the
                           clamp never applied and rows ran 1 or 2 lines at
                           random. Touching display only below sm lets it work. */
                        <p className="text-stone text-[12px] font-light mt-1 leading-relaxed max-w-[30rem] line-clamp-3 max-sm:hidden">{s.desc}</p>
                      )}
                    </button>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="font-[family-name:var(--font-syne)] font-bold text-[13px] text-ink uppercase leading-tight">
                        {s.name}
                      </p>
                    </div>
                  )}
                  {priceCell}
                  <Link
                    href={`/book?serviceId=${s.id}`}
                    aria-label={`Book ${s.name}`}
                    className="btn-primary shrink-0 !px-3.5 md:!px-4 !py-2.5 !text-[10px] !tracking-[0.12em]">
                    Book <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </m.li>
              )
            })}
          </ul>

          {faqs.length > 0 && (
            <section className="mt-12 pt-10 border-t border-border-soft">
              <h2 className="font-[family-name:var(--font-unbounded)] font-bold text-lg md:text-xl text-ink mb-6 uppercase">
                Frequently Asked Questions
              </h2>
              <dl className="divide-y divide-border-soft">
                {faqs.map((faq, i) => (
                  <div key={i} className="py-5">
                    <dt className="font-[family-name:var(--font-syne)] font-bold text-sm text-ink mb-2">{faq.q}</dt>
                    <dd className="text-stone text-sm font-light leading-relaxed font-[family-name:var(--font-inter)]">{faq.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <div className="mt-8 pt-6 border-t border-border-soft flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href={`/book?category=${encodeURIComponent(category)}`}
              className="btn-primary">
              Book a {category} Service <ArrowUpRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={onBack}
              className="tap-safe inline-flex items-center text-stone text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] hover:text-ink transition-colors"
            >
              ← Back to all categories
            </button>
          </div>

          {relatedCats.length > 0 && (
              <section className="mt-10 pt-8 border-t border-border-soft">
                <h2 className="font-[family-name:var(--font-syne)] font-bold text-base text-ink mb-3">Related Services</h2>
                <div className="flex flex-wrap gap-2">
                  {relatedCats.map((cat) => (
                    <Link key={cat} href={`/services/${CAT_SLUGS[cat]}`}
                      className="tab-pill hover:border-ink hover:text-ink">
                      {cat === 'Eyebrow Tattoo' ? 'Microblading' : cat}
                    </Link>
                  ))}
                  <Link href="/prices" className="tab-pill hover:border-ink hover:text-ink">
                    Price list
                  </Link>
                  {category !== 'Bridal' && (
                    <Link href="/bridal" className="tab-pill hover:border-ink hover:text-ink">
                      Bridal
                    </Link>
                  )}
                </div>
              </section>
            )}

          {relatedBlogs.length > 0 && (
            <section className="mt-10 pt-8 border-t border-border-soft">
              <h2 className="font-[family-name:var(--font-syne)] font-bold text-base text-ink mb-3">Related Guides</h2>
              <ul className="space-y-3">
                {relatedBlogs.map((post) => (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`} className="group block">
                      <span className="font-[family-name:var(--font-syne)] font-bold text-sm text-ink group-hover:text-stone transition-colors leading-snug">
                        {post.title}
                      </span>
                      <span className="block text-stone text-xs font-[family-name:var(--font-inter)] mt-0.5 line-clamp-1">
                        {post.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] tracking-[0.12em] uppercase font-[family-name:var(--font-inter)]">
                <Link href="/prices" className="link-underline hover:text-ink text-stone">Price list</Link>
                <Link href="/book" className="link-underline hover:text-ink text-stone">Book online</Link>
                <Link href="/beauty-salon-karachi" className="link-underline hover:text-ink text-stone">Beauty salon Karachi</Link>
              </p>
            </section>
          )}

          {areaLinks.length > 0 && (
            <section className="mt-10 pt-8 border-t border-border-soft" aria-labelledby="cat-areas-heading">
              <h2 id="cat-areas-heading" className="font-[family-name:var(--font-syne)] font-bold text-base text-ink mb-3">
                Areas we serve
              </h2>
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {areaLinks.map(({ slug: areaSlug, href, label }) => (
                  <li key={areaSlug}>
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
          )}

          {modal && <ServiceModal service={modal} onClose={() => setModal(null)} />}
        </div>
      </div>

      <PageCloseCta
        eyebrow={`— ${category} · PECHS`}
        title="Book online in under a minute"
        body="Live slots for this category, or WhatsApp if you prefer a quick confirm."
        bookHref={`/book?category=${encodeURIComponent(category)}`}
        waHref={WA_DEFAULT}
        waFrom="service-category-close"
      />
    </main>
  )
}
