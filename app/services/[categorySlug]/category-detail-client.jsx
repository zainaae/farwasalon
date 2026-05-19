'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowUpRight, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { ServiceModal, formatPrice, formatDuration, CAT_SLUGS } from '../../../src/shared.jsx'
import { SERVICES, CAT_META, CAT_FAQS, slugToCategory } from '../../../src/data.js'
import JsonLd, { BreadcrumbJsonLd } from '../../json-ld.jsx'
import { buildCategoryOffersSchema } from '../../../lib/service-schema.js'
import { SITE_ORIGIN, buildSpeakableSchema } from '../../../lib/business-schema.js'

function getCatMeta(cat) {
  return CAT_META[cat] || { img: '/bleachpolish.jpg', desc: 'Expert beauty services tailored just for you.' }
}

function FaqJsonLd({ faqs }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
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

  if (!category) {
    return (
      <main id="main" className="pt-[calc(3.375rem+env(safe-area-inset-top,0px))] md:pt-[calc(3.5rem+env(safe-area-inset-top,0px))]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10 py-14 md:py-20 min-h-screen">
          <p className="text-stone text-sm">Category not found.</p>
        </div>
      </main>
    )
  }

  return (
    <main id="main" className="pt-[calc(3.375rem+env(safe-area-inset-top,0px))] md:pt-[calc(3.5rem+env(safe-area-inset-top,0px))]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10 py-14 md:py-20 min-h-screen">
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
          {faqs.length > 0 && <FaqJsonLd faqs={faqs} />}

          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-1.5 text-[10px] text-stone font-['Inter']">
              <li><Link href="/" className="hover:text-ink transition-colors">Home</Link></li>
              <li><ChevronLeft className="w-2.5 h-2.5 rotate-180" /></li>
              <li><Link href="/services" className="hover:text-ink transition-colors">Services</Link></li>
              <li><ChevronLeft className="w-2.5 h-2.5 rotate-180" /></li>
              <li className="text-ink">{category}</li>
            </ol>
          </nav>

          <motion.button initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
            onClick={onBack}
            className="flex items-center gap-2 text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors mb-8">
            <ChevronLeft className="w-3.5 h-3.5" /> All Services
          </motion.button>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="mb-8 pb-8 border-b border-[#e4ddd7]">
            <p className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-2">— {services.length} services</p>
            <h2 id="service-category-title" className="font-['Unbounded'] font-bold text-2xl md:text-3xl text-ink uppercase mb-3">{category}</h2>
            <p id="service-category-desc" className="text-stone text-sm font-light leading-relaxed max-w-lg">{meta.desc}</p>
          </motion.div>

          <ul className="divide-y divide-[#e4ddd7]">
            {services.map((s, i) => {
              const opens = canOpen(s)
              return (
                <motion.li key={s.id}
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
                        <p className="text-[#c9a98a] text-[11px] font-['Inter'] mt-0.5">
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
                        <p className="text-[#c9a98a] text-[11px] font-['Inter'] mt-0.5">
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
                    className="tap-safe shrink-0 inline-flex items-center gap-1.5 bg-ink text-white text-[10px] tracking-[0.12em] uppercase font-medium font-['Inter'] px-3.5 md:px-4 py-2.5 hover:bg-stone transition-colors duration-200">
                    Book <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </motion.li>
              )
            })}
          </ul>

          {faqs.length > 0 && (
            <section className="mt-12 pt-10 border-t border-[#e4ddd7]">
              <h3 className="font-['Unbounded'] font-bold text-lg md:text-xl text-ink mb-6 uppercase">
                Frequently Asked Questions
              </h3>
              <dl className="divide-y divide-[#e4ddd7]">
                {faqs.map((faq, i) => (
                  <div key={i} className="py-5">
                    <dt className="font-['Syne'] font-bold text-sm text-ink mb-2">{faq.q}</dt>
                    <dd className="text-stone text-sm font-light leading-relaxed font-['Inter']">{faq.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <div className="mt-8 pt-6 border-t border-[#e4ddd7] flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href={`/book?category=${encodeURIComponent(category)}`}
              className="tap-safe inline-flex items-center gap-2 bg-ink text-white text-[11px] tracking-[0.14em] uppercase font-semibold font-['Inter'] px-7 py-4 hover:bg-stone transition-colors duration-300">
              Book a {category} Service <ArrowUpRight className="w-4 h-4" />
            </Link>
            <button onClick={onBack}
              className="text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors">
              ← Back to all categories
            </button>
          </div>

          {(() => {
            const related = Object.entries(CAT_SLUGS).filter(([k]) => k !== category).slice(0, 5)
            return related.length > 0 && (
              <section className="mt-10 pt-8 border-t border-[#e4ddd7]">
                <h3 className="font-['Syne'] font-bold text-base text-ink mb-3">Related Services</h3>
                <div className="flex flex-wrap gap-2">
                  {related.map(([cat, catSlug]) => (
                    <Link key={catSlug} href={`/services/${catSlug}`}
                      className="text-[11px] font-['Inter'] px-3 py-2 border border-[#e4ddd7] hover:border-ink transition-colors">
                      {cat}
                    </Link>
                  ))}
                </div>
              </section>
            )
          })()}

          {modal && <ServiceModal service={modal} onClose={() => setModal(null)} />}
        </div>
      </div>
    </main>
  )
}
