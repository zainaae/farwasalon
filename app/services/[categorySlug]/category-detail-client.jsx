'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { m } from 'framer-motion'
import { ArrowUpRight, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { ServiceModal, formatPrice, formatDuration, CAT_SLUGS } from '../../../src/shared.jsx'
import { SERVICES, CAT_META, slugToCategory } from '../../../src/data.js'
import { CAT_FAQS, CAT_SEO, CAT_RELATED } from '../../../src/cat-seo-content.js'
import { getRelatedBlogPostsForCategory } from '../../../src/blog-data.js'
import { CAT_META_DESC } from '../../../src/cat-meta-desc.js'
import JsonLd, { BreadcrumbJsonLd } from '../../json-ld.jsx'
import { buildCategoryOffersSchema } from '../../../lib/service-schema.js'
import { SITE_ORIGIN, buildSpeakableSchema, buildFaqPageSchema } from '../../../lib/business-schema.js'
import { getPriorityLocationLinksForCategory } from '../../../lib/location-links.js'

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

export default function CategoryDetailClient({ categorySlug }) {
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
  const areaLinks = category ? getPriorityLocationLinksForCategory(category) : []
  const prices = services.map((s) => s.pricePkr).filter(Boolean)
  const minPrice = prices.length ? Math.min(...prices) : null
  const seo = CAT_SEO[category]
  const pageH1 = seo?.h1 || `${category} in PECHS, Karachi`
  const relatedCats = (CAT_RELATED[category] || [])
    .filter((cat) => CAT_SLUGS[cat])
    .slice(0, 4)
  const relatedBlogs = category ? getRelatedBlogPostsForCategory(category, 3) : []

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
      <div className="section-shell section-pad min-h-0">
        <div className="max-w-3xl">
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

          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-1.5 text-[10px] text-stone font-['Inter']">
              <li><Link href="/" className="hover:text-ink transition-colors">Home</Link></li>
              <li><ChevronLeft className="w-2.5 h-2.5 rotate-180" /></li>
              <li><Link href="/services" className="hover:text-ink transition-colors">Services</Link></li>
              <li><ChevronLeft className="w-2.5 h-2.5 rotate-180" /></li>
              <li className="text-ink">{category}</li>
            </ol>
          </nav>

          <m.button initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
            onClick={onBack}
            className="flex items-center gap-2 text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors mb-8">
            <ChevronLeft className="w-3.5 h-3.5" /> All Services
          </m.button>

          <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="mb-8 pb-8 border-b border-border-soft">
            <p className="eyebrow mb-2">
              — {services.length} services{minPrice != null ? ` · from ${formatPrice(minPrice)}` : ''}
            </p>
            <h1 id="service-category-title" className="section-title text-2xl md:text-3xl mb-3">{pageH1}</h1>
            <p id="service-category-desc" className="text-body max-w-lg">{meta.desc}</p>
            <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] tracking-[0.12em] uppercase font-['Inter']">
              <Link href="/prices" className="link-underline hover:text-ink text-stone">Full price list</Link>
              <Link href={`/book?category=${encodeURIComponent(category)}`} className="link-underline hover:text-ink text-stone">Book online</Link>
              {areaLinks[0] && (
                <Link href={areaLinks[0].href} className="link-underline hover:text-ink text-stone">{areaLinks[0].label}</Link>
              )}
            </p>
          </m.div>

          <ul className="divide-y divide-border-soft">
            {services.map((s, i) => {
              const opens = canOpen(s)
              return (
                <m.li key={s.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.025 }}
                  className="flex items-center justify-between py-4 gap-4">
                  {opens ? (
                    <button type="button" onClick={() => openFor(s)}
                      className="min-w-0 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2">
                      <p className="font-['Syne'] font-bold text-[13px] text-ink uppercase leading-tight group-hover:text-stone transition-colors">
                        {s.name}
                      </p>
                      {(s.pricePkr != null || s.durationMinutes != null) && (
                        <p className="text-accent-gold-deep text-[11px] font-['Inter'] mt-0.5">
                          {s.pricePkr != null && formatPrice(s.pricePkr)}
                          {s.pricePkr != null && s.durationMinutes != null && ' · '}
                          {s.durationMinutes != null && formatDuration(s.durationMinutes)}
                        </p>
                      )}
                      {s.desc && (
                        <p className="text-stone text-[11px] font-light mt-0.5 line-clamp-1 hidden sm:block">{s.desc}</p>
                      )}
                    </button>
                  ) : (
                    <div className="min-w-0">
                      <p className="font-['Syne'] font-bold text-[13px] text-ink uppercase leading-tight">
                        {s.name}
                      </p>
                      {(s.pricePkr != null || s.durationMinutes != null) && (
                        <p className="text-accent-gold-deep text-[11px] font-['Inter'] mt-0.5">
                          {s.pricePkr != null && formatPrice(s.pricePkr)}
                          {s.pricePkr != null && s.durationMinutes != null && ' · '}
                          {s.durationMinutes != null && formatDuration(s.durationMinutes)}
                        </p>
                      )}
                    </div>
                  )}
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
              <h2 className="font-['Unbounded'] font-bold text-lg md:text-xl text-ink mb-6 uppercase">
                Frequently Asked Questions
              </h2>
              <dl className="divide-y divide-border-soft">
                {faqs.map((faq, i) => (
                  <div key={i} className="py-5">
                    <dt className="font-['Syne'] font-bold text-sm text-ink mb-2">{faq.q}</dt>
                    <dd className="text-stone text-sm font-light leading-relaxed font-['Inter']">{faq.a}</dd>
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
            <button onClick={onBack}
              className="text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors">
              ← Back to all categories
            </button>
          </div>

          {relatedCats.length > 0 && (
              <section className="mt-10 pt-8 border-t border-border-soft">
                <h2 className="font-['Syne'] font-bold text-base text-ink mb-3">Related Services</h2>
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
              <h2 className="font-['Syne'] font-bold text-base text-ink mb-3">Related Guides</h2>
              <ul className="space-y-3">
                {relatedBlogs.map((post) => (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`} className="group block">
                      <span className="font-['Syne'] font-bold text-sm text-ink group-hover:text-stone transition-colors leading-snug">
                        {post.title}
                      </span>
                      <span className="block text-stone text-xs font-['Inter'] mt-0.5 line-clamp-1">
                        {post.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] tracking-[0.12em] uppercase font-['Inter']">
                <Link href="/prices" className="link-underline hover:text-ink text-stone">Price list</Link>
                <Link href="/book" className="link-underline hover:text-ink text-stone">Book online</Link>
                <Link href="/beauty-salon-karachi" className="link-underline hover:text-ink text-stone">Beauty salon Karachi</Link>
              </p>
            </section>
          )}

          {areaLinks.length > 0 && (
            <section className="mt-10 pt-8 border-t border-border-soft">
              <h2 className="font-['Syne'] font-bold text-base text-ink mb-3">Areas we serve</h2>
              <div className="flex flex-wrap gap-2">
                {areaLinks.map(({ slug: areaSlug, href, label }) => (
                  <Link key={areaSlug} href={href} className="tab-pill hover:border-ink hover:text-ink">
                    {label}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {modal && <ServiceModal service={modal} onClose={() => setModal(null)} />}
        </div>
      </div>
    </main>
  )
}
