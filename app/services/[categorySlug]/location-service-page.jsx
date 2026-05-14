'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, ChevronRight, MapPin, Clock, Phone } from 'lucide-react'
import { WA_DEFAULT, waLink, SERVICES, CAT_SLUGS, formatPrice, YEARS_ACTIVE } from '../../../src/data.js'
import { NEIGHBORHOODS, TOP_SERVICES } from '../../../src/location-seo.js'

export default function LocationServicePage({ data }) {
  const { service, location, prefix } = data
  const heading = prefix === 'best'
    ? `Best ${service.name} in ${location.name}`
    : `${service.name} ${prefix === 'near' ? 'Near' : 'in'} ${location.name}`
  const categoryKey = Object.keys(SERVICES).find(k => k === service.category)
  const categoryServices = categoryKey ? SERVICES[categoryKey] : []
  const displayServices = categoryServices.slice(0, 6)

  const relatedLocations = NEIGHBORHOODS.filter(n => n.slug !== location.slug).slice(0, 4)
  const relatedServices = TOP_SERVICES.filter(s => s.slug !== service.slug).slice(0, 4)

  return (
    <main id="main" className="pt-[calc(3.375rem+env(safe-area-inset-top,0px))] md:pt-[calc(3.5rem+env(safe-area-inset-top,0px))]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10 py-14 md:py-20 min-h-screen">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-1.5 text-[10px] text-stone font-['Inter']">
              <li><Link href="/" className="hover:text-ink transition-colors">Home</Link></li>
              <li><ChevronRight className="w-2.5 h-2.5" /></li>
              <li><Link href="/services" className="hover:text-ink transition-colors">Services</Link></li>
              <li><ChevronRight className="w-2.5 h-2.5" /></li>
              <li className="text-ink">{heading}</li>
            </ol>
          </nav>

          <h1 className="font-['Unbounded'] font-bold text-2xl md:text-4xl text-ink leading-tight mb-4">{heading}</h1>
          <p className="text-stone text-base font-light max-w-2xl mb-6 leading-relaxed">
            {service.description} {location.detail}
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <div className="flex items-center gap-2 text-stone text-sm font-['Inter']">
              <MapPin className="w-4 h-4" /> PECHS Block 3, Karachi
            </div>
            <div className="flex items-center gap-2 text-stone text-sm font-['Inter']">
              <Clock className="w-4 h-4" /> Mon–Sat 11 AM – 7 PM
            </div>
            <div className="flex items-center gap-2 text-stone text-sm font-['Inter']">
              <Phone className="w-4 h-4" /> +92 322 278 2254
            </div>
          </div>
        </motion.div>

        {displayServices.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12">
            <h2 className="font-['Syne'] font-bold text-lg text-ink mb-4">Our {service.name} Services</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayServices.map((svc, i) => (
                <div key={i} className="border border-[#e4ddd7] p-4 hover:border-ink transition-colors">
                  <p className="font-['Syne'] font-semibold text-sm text-ink mb-1">{svc.name}</p>
                  {svc.pricePkr != null && <p className="text-stone text-xs font-['Inter']">{formatPrice(svc.pricePkr)}</p>}
                </div>
              ))}
            </div>
            {categoryKey && (
              <Link href={`/services/${CAT_SLUGS[categoryKey]}`}
                className="inline-flex items-center gap-2 mt-4 text-[11px] tracking-[0.14em] uppercase font-medium font-['Inter'] text-ink hover:text-stone transition-colors">
                View all {service.name} services <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </motion.section>
        )}

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12 bg-mist p-6 md:p-8">
          <h2 className="font-['Syne'] font-bold text-lg text-ink mb-3">Why Choose Farwa Beauty Salon?</h2>
          <ul className="space-y-2 text-stone text-sm font-light font-['Inter']">
            <li>✓ Trusted since 2008 — {YEARS_ACTIVE}+ years of experience</li>
            <li>✓ Expert {service.name.toLowerCase()} professionals</li>
            <li>✓ Hygienic, comfortable environment in PECHS Block 3</li>
            <li>✓ Convenient WhatsApp booking — no calls needed</li>
            <li>✓ Serving clients from {location.name} and across Karachi</li>
          </ul>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12">
          <h2 className="font-['Syne'] font-bold text-lg text-ink mb-4">Getting Here from {location.name}</h2>
          <p className="text-stone text-sm font-light font-['Inter'] leading-relaxed mb-4">
            Farwa Beauty Salon is located in PECHS Block 3, Karachi. {location.detail} We&apos;re open Monday to Saturday, 11 AM to 7 PM. Book your appointment on WhatsApp for instant confirmation.
          </p>
          <a href={waLink(service.name)} target="_blank" rel="noreferrer"
            className="tap-safe inline-flex items-center gap-2 bg-ink text-white text-[11px] tracking-[0.14em] uppercase font-semibold font-['Inter'] px-7 py-4 hover:bg-stone transition-colors">
            Book {service.name} on WhatsApp <ArrowUpRight className="w-4 h-4" />
          </a>
        </motion.section>

        <section className="pt-8 border-t border-[#e4ddd7]">
          <h2 className="font-['Syne'] font-bold text-base text-ink mb-3">Also Available</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {relatedServices.map((rs) => (
              <Link key={rs.slug} href={`/services/${rs.slug}-in-${location.slug}`}
                className="text-[11px] font-['Inter'] px-3 py-2 border border-[#e4ddd7] hover:border-ink transition-colors">
                {rs.name} in {location.name}
              </Link>
            ))}
          </div>
          <h3 className="font-['Syne'] font-bold text-sm text-ink mb-2">{service.name} in Other Areas</h3>
          <div className="flex flex-wrap gap-2">
            {relatedLocations.map((rl) => (
              <Link key={rl.slug} href={`/services/${service.slug}-in-${rl.slug}`}
                className="text-[11px] font-['Inter'] px-3 py-2 border border-[#e4ddd7] hover:border-ink transition-colors">
                {service.name} in {rl.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
