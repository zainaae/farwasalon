'use client'
import Link from 'next/link'
import ArrowUpRight from '../../components/icon-sprite.jsx'
import WaCta from '../../components/wa-cta.jsx'
import { m } from 'framer-motion'
import { ChevronRight, MapPin, Clock, Phone } from 'lucide-react'
import { AREA_CONTENT } from '../../../src/area-content.js'
import {
  waLink,
  SERVICES,
  CAT_SLUGS,
  formatPrice, formatServicePrice,
  YEARS_ACTIVE,
  MAPS_LINK,
  getDefaultServiceIdForCategory,
} from '../../../src/data.js'
import { CAT_FAQS } from '../../../src/cat-seo-content.js'
import { PRIORITY_LOCATION_SLUGS, TOP_SERVICES } from '../../../src/location-seo.js'
import { AREAS_HUB_HREF, getNearbyPriorityLocationLinks } from '../../../lib/location-links.js'
import { SALON_ADDRESS_LINES, SALON_PHONE_DISPLAY, GOOGLE_REVIEW_LINK, getAggregateRating } from '../../../lib/business-schema.js'

const PRIORITY_SET = new Set(PRIORITY_LOCATION_SLUGS)

export default function LocationServicePage({ data, slug }) {
  const { service, location, prefix } = data
  /* Real route, drive time and "worth the trip" copy for this area, already
     written in src/area-content.js and — until now — imported by nobody. */
  const area = AREA_CONTENT[location.slug]
  const heading = prefix === 'best'
    ? `Best ${service.name} in ${location.name}`
    : `${service.name} ${prefix === 'near' ? 'Near' : 'in'} ${location.name}`
  /* A service may span several menu categories (waxing covers Rica, honey and
     Rica hot). Falls back to the single `category` for everything else. */
  const categoryKeys = service.categories?.length ? service.categories : [service.category]
  const categoryKey = categoryKeys.find((k) => SERVICES[k]) ?? null
  const categoryServices = categoryKeys.flatMap((k) => SERVICES[k] ?? [])
  // Cheapest first, so the six shown include the price that wins the query.
  const displayServices = [...categoryServices].sort((a, b) => a.pricePkr - b.pricePkr).slice(0, 6)
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
              <li className="text-ink px-1 line-clamp-1">{heading}</li>
            </ol>
          </nav>

          <h1 className="font-[family-name:var(--font-unbounded)] font-bold text-2xl md:text-4xl text-ink leading-tight mb-4">{heading}</h1>
          <p className="text-body md:text-base max-w-2xl mb-4">
            {service.description} {location.detail}
            {priceFloor ? ` Published prices from ${priceFloor}.` : ''}
          </p>
          {location.blurb ? (
            <p className="text-body text-sm max-w-2xl mb-4">{location.blurb}</p>
          ) : null}
          <p className="text-xs text-stone font-[family-name:var(--font-inter)] font-light max-w-2xl mb-5 border-l-2 border-accent-gold/40 pl-3">
            One studio in PECHS — we welcome clients from {location.name} and nearby areas. All appointments are at our PECHS address below.
          </p>

          <div className="cta-cluster mb-4">
            <Link href={bookHref} className="btn-primary">
              Book online <ArrowUpRight className="w-4 h-4" />
            </Link>
            <WaCta href={waLink(service.name)} from="location-hub" className="btn-secondary">
              WhatsApp
            </WaCta>
          </div>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-[family-name:var(--font-inter)] text-stone mb-10">
            <span className="inline-flex items-center gap-1.5 min-h-[44px]">
              <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden /> {SALON_ADDRESS_LINES[0]}
            </span>
            <span className="inline-flex items-center gap-1.5 min-h-[44px]">
              <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden /> {SALON_ADDRESS_LINES[1]}
            </span>
            <a href="tel:+923222782254" className="tap-safe inline-flex items-center gap-1.5 min-h-[44px] link-underline hover:text-ink">
              <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden /> {SALON_PHONE_DISPLAY}
            </a>
            <a
              href={GOOGLE_REVIEW_LINK}
              target="_blank"
              rel="noreferrer"
              className="tap-safe inline-flex items-center min-h-[44px] link-underline hover:text-ink"
            >
              ★ {rating.ratingValue} ({rating.reviewCount} reviews)
            </a>
          </p>
        </m.div>

        {displayServices.length > 0 && (
          <m.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12">
            <h2 className="font-[family-name:var(--font-syne)] font-bold text-lg text-ink mb-4">Our {service.name} Services</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayServices.map((svc, i) => (
                <m.div key={i} className="card-link !justify-start !flex-col !items-start hover:shadow-soft">
                  <p className="font-[family-name:var(--font-syne)] font-semibold text-sm text-ink mb-1">{svc.name}</p>
                  {svc.pricePkr != null && <p className="text-stone text-xs font-[family-name:var(--font-inter)]">{formatServicePrice(svc)}</p>}
                </m.div>
              ))}
            </div>
            {categoryKey && (
              <Link href={`/services/${CAT_SLUGS[categoryKey]}`}
                className="inline-flex items-center gap-2 mt-4 text-[11px] tracking-[0.14em] uppercase font-medium font-[family-name:var(--font-inter)] text-ink hover:text-stone transition-colors">
                View all {service.name} services <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </m.section>
        )}

        <m.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12 panel-soft p-6 md:p-8 shadow-soft">
          <h2 className="font-[family-name:var(--font-syne)] font-bold text-lg text-ink mb-3">Why Choose Farwa Beauty Salon?</h2>
          <ul className="space-y-2 text-stone text-sm font-light font-[family-name:var(--font-inter)]">
            <li>✓ Serving PECHS since 2008 — {YEARS_ACTIVE}+ years of experience</li>
            <li>✓ Expert {service.name.toLowerCase()} professionals</li>
            <li>✓ Hygienic, comfortable environment in PECHS</li>
            <li>✓ Book online for instant confirmation — or message us on WhatsApp</li>
            <li>✓ Clients from {location.name} and across Karachi visit us in PECHS</li>
          </ul>
        </m.section>

        <m.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12">
          {/* This heading promised directions and then printed location.blurb —
              the same 45-word paragraph already shown near the top of the page.
              Every one of these 60 pages said "Getting Here from X" and gave no
              route, no drive time and no distance, while src/area-content.js
              held exactly that for all ten areas and was never imported.

              Measured across the set, wiring it up takes template share from
              ~78% to ~57% and pairwise similarity from ~67% to ~42% — without
              a word being written or a photograph taken. */}
          <h2 className="font-[family-name:var(--font-syne)] font-bold text-lg text-ink mb-4">Getting Here from {location.name}</h2>
          {area && (
            <p className="flex flex-wrap gap-x-5 gap-y-1 mb-3 text-[11px] tracking-[0.12em] uppercase font-[family-name:var(--font-inter)] text-stone">
              <span>{area.distanceKm}</span>
              <span aria-hidden="true" className="text-stone/40">·</span>
              <span>{area.driveTime}</span>
              <span aria-hidden="true" className="text-stone/40">·</span>
              <span className="normal-case tracking-normal">{area.route}</span>
            </p>
          )}
          <p className="text-stone text-sm font-light font-[family-name:var(--font-inter)] leading-relaxed mb-4 max-w-2xl">
            Farwa Beauty Salon — Plot 165/G-1, Saima Terrace, Block 3 PECHS, Karachi 75400.
            {' '}{area ? area.gettingHere : (location.blurb || location.detail)}
            {' '}Open Monday to Saturday, 11 AM to 7 PM. Book online for instant confirmation, or WhatsApp +92 322 278 2254.
          </p>
          {area?.worthTheTrip && (
            <p className="text-stone text-sm font-light font-[family-name:var(--font-inter)] leading-relaxed mb-4 max-w-2xl">
              {area.worthTheTrip}
            </p>
          )}
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-[family-name:var(--font-inter)]">
            <Link href="/prices" className="tap-safe inline-flex items-center min-h-[44px] link-underline hover:text-ink text-stone">
              Price list
            </Link>
            <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="tap-safe inline-flex items-center min-h-[44px] link-underline hover:text-ink text-stone">
              Directions
            </a>
            {area && (
              <Link href={`/areas/${location.slug}`} className="tap-safe inline-flex items-center min-h-[44px] link-underline hover:text-ink text-stone">
                More on visiting from {location.name}
              </Link>
            )}
          </p>
        </m.section>

        {faqs.length > 0 && (
          <m.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
            className="mb-12">
            <h2 className="font-[family-name:var(--font-syne)] font-bold text-lg text-ink mb-4">Common questions</h2>
            <div className="space-y-4">
              {faqs.map((item) => (
                <div key={item.q} className="panel-soft p-4 shadow-soft">
                  <h3 className="font-[family-name:var(--font-syne)] font-semibold text-sm text-ink mb-2">{item.q}</h3>
                  <p className="text-stone text-sm font-light font-[family-name:var(--font-inter)] leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </m.section>
        )}

        {nearbyAreas.length > 0 && (
          <section className="mb-12 pt-8 border-t border-border-soft">
            <h2 className="font-[family-name:var(--font-syne)] font-bold text-base text-ink mb-3">Nearby areas</h2>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {nearbyAreas.slice(0, 5).map((area) => (
                <li key={area.slug}>
                  <Link
                    href={area.href}
                    className="tap-safe inline-flex items-center min-h-[44px] link-underline text-stone text-sm font-[family-name:var(--font-inter)] hover:text-ink"
                  >
                    {area.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={AREAS_HUB_HREF}
                  className="tap-safe inline-flex items-center min-h-[44px] link-underline text-ink text-sm font-[family-name:var(--font-inter)] font-medium hover:text-stone"
                >
                  See all areas →
                </Link>
              </li>
            </ul>
          </section>
        )}

        <section className="pt-8 border-t border-border-soft">
          <h2 className="font-[family-name:var(--font-syne)] font-bold text-base text-ink mb-3">Also Available</h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 mb-6">
            {relatedServices.map((rs) => {
              const locSlug = `${rs.slug}-in-${location.slug}`
              const href = PRIORITY_SET.has(locSlug)
                ? `/services/${locSlug}`
                : `/services/${CAT_SLUGS[rs.category]}`
              return (
                <li key={rs.slug}>
                  <Link href={href} className="tap-safe inline-flex items-center min-h-[44px] link-underline text-stone text-sm font-[family-name:var(--font-inter)] hover:text-ink">
                    {rs.name}
                  </Link>
                </li>
              )
            })}
          </ul>
          <p className="text-stone text-sm font-light font-[family-name:var(--font-inter)] leading-relaxed max-w-2xl">
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
