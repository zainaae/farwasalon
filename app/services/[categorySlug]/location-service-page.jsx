'use client'
import Link from 'next/link'
import { m } from 'framer-motion'
import { ArrowUpRight, ChevronRight, MapPin, Clock, Phone } from 'lucide-react'
import {
  waLink,
  SERVICES,
  CAT_SLUGS,
  formatPrice,
  YEARS_ACTIVE,
  getDefaultServiceIdForCategory,
} from '../../../src/data.js'
import { CAT_FAQS } from '../../../src/cat-seo-content.js'
import { PRIORITY_LOCATION_SLUGS, TOP_SERVICES } from '../../../src/location-seo.js'
import { getNearbyPriorityLocationLinks } from '../../../lib/location-links.js'
import { SALON_ADDRESS_LINES, SALON_PHONE_DISPLAY, GOOGLE_REVIEW_LINK, getAggregateRating } from '../../../lib/business-schema.js'

const PRIORITY_SET = new Set(PRIORITY_LOCATION_SLUGS)

export default function LocationServicePage({ data, slug }) {
  const { service, location, prefix } = data
  const heading = prefix === 'best'
    ? `Best ${service.name} in ${location.name}`
    : `${service.name} ${prefix === 'near' ? 'Near' : 'in'} ${location.name}`
  const categoryKey = Object.keys(SERVICES).find(k => k === service.category)
  const categoryServices = categoryKey ? SERVICES[categoryKey] : []
  const displayServices = categoryServices.slice(0, 6)
  const locPrices = categoryServices.map((s) => s.pricePkr).filter(Boolean)
  const locMin = locPrices.length ? Math.min(...locPrices) : null
  const priceFloor = locMin != null ? formatPrice(locMin) : null

  const relatedServices = TOP_SERVICES.filter(s => s.slug !== service.slug).slice(0, 4)
  const nearbyAreas = getNearbyPriorityLocationLinks(slug)
  const faqs = CAT_FAQS[service.category]?.slice(0, 3) ?? []
  const bookServiceId = getDefaultServiceIdForCategory(service.category)
  const bookHref = bookServiceId ? `/book?serviceId=${bookServiceId}` : '/book'
  const rating = getAggregateRating()
  const pechsSlug = `${service.slug}-in-pechs-karachi`

  return (
    <main id="main" className="page-content">
      <div className="section-shell section-pad min-h-0">
        <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
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
          <p className="text-body md:text-base max-w-2xl mb-4">
            {service.description} {location.detail}
            {priceFloor ? ` Published prices from ${priceFloor}.` : ''}
          </p>
          {location.blurb ? (
            <p className="text-body text-sm max-w-2xl mb-4">{location.blurb}</p>
          ) : null}
          <p className="text-xs text-stone font-['Inter'] font-light max-w-2xl mb-6 border-l-2 border-accent-gold/40 pl-3">
            One studio in PECHS — we welcome clients from {location.name} and nearby areas. All appointments are at our PECHS address below.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <div className="flex items-center gap-2 text-stone text-sm font-['Inter']">
              <MapPin className="w-4 h-4 shrink-0" /> {SALON_ADDRESS_LINES[0]}
            </div>
            <div className="flex items-center gap-2 text-stone text-sm font-['Inter']">
              <Clock className="w-4 h-4 shrink-0" /> {SALON_ADDRESS_LINES[1]} · {SALON_ADDRESS_LINES[2]}
            </div>
            <div className="flex items-center gap-2 text-stone text-sm font-['Inter']">
              <Phone className="w-4 h-4 shrink-0" /> {SALON_PHONE_DISPLAY}
            </div>
            <a
              href={GOOGLE_REVIEW_LINK}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-stone text-sm font-['Inter'] hover:text-ink"
            >
              ★ {rating.ratingValue} ({rating.reviewCount} Google reviews)
            </a>
          </div>
        </m.div>

        {displayServices.length > 0 && (
          <m.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12">
            <h2 className="font-['Syne'] font-bold text-lg text-ink mb-4">Our {service.name} Services</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayServices.map((svc, i) => (
                <m.div key={i} className="card-link !justify-start !flex-col !items-start hover:shadow-soft">
                  <p className="font-['Syne'] font-semibold text-sm text-ink mb-1">{svc.name}</p>
                  {svc.pricePkr != null && <p className="text-stone text-xs font-['Inter']">{formatPrice(svc.pricePkr)}</p>}
                </m.div>
              ))}
            </div>
            {categoryKey && (
              <Link href={`/services/${CAT_SLUGS[categoryKey]}`}
                className="inline-flex items-center gap-2 mt-4 text-[11px] tracking-[0.14em] uppercase font-medium font-['Inter'] text-ink hover:text-stone transition-colors">
                View all {service.name} services <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </m.section>
        )}

        <m.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12 panel-soft p-6 md:p-8 shadow-soft">
          <h2 className="font-['Syne'] font-bold text-lg text-ink mb-3">Why Choose Farwa Beauty Salon?</h2>
          <ul className="space-y-2 text-stone text-sm font-light font-['Inter']">
            <li>✓ Serving PECHS since 2008 — {YEARS_ACTIVE}+ years of experience</li>
            <li>✓ Expert {service.name.toLowerCase()} professionals</li>
            <li>✓ Hygienic, comfortable environment in PECHS</li>
            <li>✓ Book online for instant confirmation — or message us on WhatsApp</li>
            <li>✓ Clients from {location.name} and across Karachi visit us in PECHS</li>
          </ul>
        </m.section>

        <m.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12">
          <h2 className="font-['Syne'] font-bold text-lg text-ink mb-4">Getting Here from {location.name}</h2>
          <p className="text-stone text-sm font-light font-['Inter'] leading-relaxed mb-4">
            Farwa Beauty Salon — Plot 165/G-1, Saima Terrace, Block 3 PECHS, Karachi 75400.
            {' '}{location.blurb || location.detail}
            {' '}Open Monday to Saturday, 11 AM to 7 PM. Book online for instant confirmation, or WhatsApp +92 322 278 2254.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={bookHref}
              className="btn-primary"
            >
              Book online <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link href="/prices" className="btn-secondary">
              Price list
            </Link>
            <a href={waLink(service.name)} target="_blank" rel="noreferrer"
              className="btn-secondary">
              WhatsApp <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </m.section>

        {faqs.length > 0 && (
          <m.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
            className="mb-12">
            <h2 className="font-['Syne'] font-bold text-lg text-ink mb-4">Common questions</h2>
            <div className="space-y-4">
              {faqs.map((item) => (
                <div key={item.q} className="panel-soft p-4 shadow-soft">
                  <h3 className="font-['Syne'] font-semibold text-sm text-ink mb-2">{item.q}</h3>
                  <p className="text-stone text-sm font-light font-['Inter'] leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </m.section>
        )}

        {nearbyAreas.length > 0 && (
          <section className="mb-12 pt-8 border-t border-border-soft">
            <h2 className="font-['Syne'] font-bold text-base text-ink mb-3">Nearby areas</h2>
            <div className="flex flex-wrap gap-2">
              {nearbyAreas.map((area) => (
                <Link
                  key={area.slug}
                  href={area.href}
                  className="tab-pill hover:border-ink hover:text-ink"
                >
                  {area.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="pt-8 border-t border-border-soft">
          <h2 className="font-['Syne'] font-bold text-base text-ink mb-3">Also Available</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {relatedServices.map((rs) => {
              const locSlug = `${rs.slug}-in-${location.slug}`
              const href = PRIORITY_SET.has(locSlug)
                ? `/services/${locSlug}`
                : `/services/${CAT_SLUGS[rs.category]}`
              const label = PRIORITY_SET.has(locSlug)
                ? `${rs.name} in ${location.name}`
                : rs.name
              return (
                <Link key={rs.slug} href={href} className="tab-pill hover:border-ink hover:text-ink">
                  {label}
                </Link>
              )
            })}
          </div>
          <p className="text-stone text-sm font-light font-['Inter'] leading-relaxed max-w-2xl">
            We welcome clients from across Karachi at our PECHS studio — one address, one team.{' '}
            {PRIORITY_SET.has(pechsSlug) ? (
              <Link href={`/services/${pechsSlug}`} className="link-underline hover:text-ink text-ink">
                Visit us in PECHS
              </Link>
            ) : (
              <Link href="/beauty-salon-karachi" className="link-underline hover:text-ink text-ink">
                Beauty salon in Karachi
              </Link>
            )}
            {' '}or{' '}
            <Link href="/contact" className="link-underline hover:text-ink text-ink">
              get directions
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  )
}
