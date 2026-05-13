import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, ChevronRight, ChevronLeft } from 'lucide-react'
import { Navbar, Footer, StickyWA, ServiceModal, usePageMeta, useBooking, SkipLink, formatPrice, formatDuration } from '../shared.jsx'
import { SERVICES, CAT_META, CAT_SLUGS, CAT_SEO, CAT_FAQS, slugToCategory, track } from '../data.js'

function getCatMeta(cat) {
  return CAT_META[cat] || { img: '/glow2.png', desc: 'Expert beauty services tailored just for you.' }
}

/* ─── Category grid ────────────────────────────────────────────── */
function CategoryGrid() {
  const navigate = useNavigate()
  const categories = Object.keys(SERVICES)
  return (
    <div>
      <div className="mb-10 md:mb-14 border-b border-[#e4ddd7] pb-8">
        <div className="overflow-hidden">
          <motion.h1 initial={{ y: '60%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
            className="display-section text-ink mb-4">
            OUR<span className="text-[#e4ddd7] mx-3 font-light italic text-[0.6em]">—</span>SERVICES
          </motion.h1>
        </div>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
          className="text-stone text-sm font-light max-w-lg">
          From threading to bridal packages — select a category to explore our full menu. Book anything directly on WhatsApp.
        </motion.p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {categories.map((cat, i) => {
          const meta = getCatMeta(cat)
          const count = SERVICES[cat].length
          return (
            <motion.button type="button" key={cat} onClick={() => { track('ServiceCategoryView', { category: cat }); navigate(`/services/${CAT_SLUGS[cat]}`) }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.05 }}
              className="relative overflow-hidden group text-left" style={{ aspectRatio: '3/4' }}>
              <img src={meta.img} alt={cat} loading="lazy" decoding="async" width="900" height="1200"
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105${meta.video ? ' group-hover:opacity-0' : ''}`} />
              {meta.video && (
                <video src={meta.video} autoPlay muted loop playsInline
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/5" />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors duration-300" />
              <div className="absolute top-3 right-3">
                <span className="text-[9px] tracking-widest uppercase text-white/50 font-['Inter'] bg-ink/30 backdrop-blur-sm px-2 py-1">{count} services</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-['Syne'] font-bold text-xs sm:text-sm uppercase leading-tight mb-1 line-clamp-2">{cat}</p>
                <p className="text-white/50 text-[10px] font-['Inter'] leading-snug hidden md:block line-clamp-2">{meta.desc}</p>
                <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-white text-[10px] tracking-widest uppercase font-['Inter']">View services</span>
                  <ChevronRight className="w-3 h-3 text-white" />
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── JSON-LD helpers ──────────────────────────────────────────── */
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

function BreadcrumbJsonLd({ items }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

/* ─── Category detail ──────────────────────────────────────────── */
function CategoryDetail({ category }) {
  const [modal, setModal] = useState(null)
  const booking  = useBooking()
  const navigate = useNavigate()
  const services = SERVICES[category] || []
  const meta     = getCatMeta(category)
  const faqs     = CAT_FAQS[category] || []
  const canOpen  = s => !!(s.desc || (Array.isArray(s.includes) && s.includes.length))
  const openFor  = s => { if (canOpen(s)) setModal(s) }
  const onBack   = () => navigate('/services')
  const slug     = Object.entries(CAT_SLUGS).find(([k]) => k === category)?.[1]

  return (
    <div className="max-w-3xl">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: 'https://farwasalon.com/' },
        { name: 'Services', url: 'https://farwasalon.com/services' },
        { name: category, url: `https://farwasalon.com/services/${slug}` },
      ]} />
      {faqs.length > 0 && <FaqJsonLd faqs={faqs} />}

      {/* Back */}
      <motion.button initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
        onClick={onBack}
        className="flex items-center gap-2 text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors mb-8">
        <ChevronLeft className="w-3.5 h-3.5" /> All Services
      </motion.button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="mb-8 pb-8 border-b border-[#e4ddd7]">
        <p className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-2">— {services.length} services</p>
        <h2 className="font-['Unbounded'] font-bold text-2xl md:text-3xl text-ink uppercase mb-3">{category}</h2>
        <p className="text-stone text-sm font-light leading-relaxed max-w-lg">{meta.desc}</p>
      </motion.div>

      {/* Service list */}
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
              <button
                onClick={() => booking.open(category)}
                aria-label={`Book ${s.name}`}
                className="tap-safe shrink-0 inline-flex items-center gap-1.5 bg-ink text-white text-[10px] tracking-[0.12em] uppercase font-medium font-['Inter'] px-3.5 md:px-4 py-2.5 hover:bg-stone transition-colors duration-200">
                Book <ArrowUpRight className="w-3 h-3" />
              </button>
            </motion.li>
          )
        })}
      </ul>

      {/* FAQ section */}
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

      {/* Footer CTA */}
      <div className="mt-8 pt-6 border-t border-[#e4ddd7] flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <button onClick={() => booking.open(category)}
          className="tap-safe inline-flex items-center gap-2 bg-ink text-white text-[11px] tracking-[0.14em] uppercase font-semibold font-['Inter'] px-7 py-4 hover:bg-stone transition-colors duration-300">
          Book a {category} Service <ArrowUpRight className="w-4 h-4" />
        </button>
        <button onClick={onBack}
          className="text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors">
          ← Back to all categories
        </button>
      </div>

      {modal && <ServiceModal service={modal} onClose={() => setModal(null)} />}
    </div>
  )
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function Services() {
  const { categorySlug } = useParams()
  const selected = categorySlug ? slugToCategory(categorySlug) : null

  const canonical = selected
    ? `https://farwasalon.com/services/${categorySlug}`
    : 'https://farwasalon.com/services'

  usePageMeta({
    title: selected
      ? `${selected} — Farwa Beauty Salon, Karachi`
      : 'Services — Farwa Beauty Salon, Karachi',
    description: selected
      ? (CAT_SEO[selected]?.metaDesc || `${selected} services at Farwa Beauty Salon, PECHS Block 2, Karachi. Book on WhatsApp.`)
      : 'Explore our full menu — bridal packages, facials, hair, nails, threading, waxing, massage and more. Book any service directly on WhatsApp.',
    canonical,
    ogImage: 'https://farwasalon.com/logo.jpg',
  })

  useEffect(() => { window.scrollTo(0, 0) }, [selected])

  return (
    <div className="bg-white overflow-x-hidden">
      <SkipLink />
      <Navbar />
      <div className="pt-[calc(3.375rem+env(safe-area-inset-top,0px))] md:pt-[calc(3.5rem+env(safe-area-inset-top,0px))]">
        <main id="main" className="max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10 py-14 md:py-20 min-h-screen">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <CategoryDetail category={selected} />
              </motion.div>
            ) : (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <CategoryGrid />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      <Footer />
      <StickyWA />
    </div>
  )
}
