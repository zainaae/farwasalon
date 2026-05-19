import Link from 'next/link'
import { ArrowUpRight, MapPin, Clock, Phone } from 'lucide-react'
import JsonLd from '../json-ld'
import { pageSocialMeta } from '../../lib/page-metadata.js'
import { getPriorityLocationLinks } from '../../lib/location-links.js'
import {
  SALON_ADDRESS_LINES,
  SALON_PHONE_DISPLAY,
  GOOGLE_REVIEW_LINK,
  buildBeautySalonSchema,
  getAggregateRating,
} from '../../lib/business-schema.js'
import { CAT_SLUGS, YEARS_ACTIVE, MAPS_LINK } from '../../src/data.js'

const title = 'Beauty Salon in Karachi — PECHS | Farwa Beauty Salon'
const description =
  'Looking for a trusted beauty salon in Karachi? Farwa Beauty Salon in PECHS offers bridal makeup, facials, threading, waxing, hair and nails since 2008. Book online.'

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/beauty-salon-karachi' },
  ...pageSocialMeta({
    title,
    description,
    path: '/beauty-salon-karachi',
    image: '/bridal.jpg',
    imageAlt: 'Beauty salon in PECHS Karachi — Farwa Beauty Salon',
  }),
}

export default function BeautySalonKarachiPage() {
  const locationLinks = getPriorityLocationLinks().slice(0, 12)
  const rating = getAggregateRating()

  return (
    <>
      <JsonLd data={buildBeautySalonSchema()} />
      <main id="main" className="page-content">
        <div className="section-shell section-pad min-h-0">
          <p className="eyebrow mb-4">— Karachi beauty salon</p>
          <h1 className="font-['Unbounded'] font-bold text-3xl md:text-[2.5rem] text-ink mb-6 max-w-3xl leading-tight tracking-tight">
            Beauty Salon in Karachi — PECHS
          </h1>
          <p className="text-body md:text-lg max-w-3xl mb-8">
            Farwa Beauty Salon has been a home for bridal makeup, facials, threading, waxing, hair, and nail
            services in PECHS Block 3 since 2008. Clients travel from Gulshan, Clifton, DHA, Bahadurabad, and
            across Karachi for consistent quality, transparent pricing from Rs 100, and online booking.
          </p>

          <div className="flex flex-wrap gap-3 mb-12">
            <Link href="/book" className="btn-primary">
              Book Online <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link href="/services" className="btn-secondary">
              View All Services
            </Link>
          </div>

          <section className="mb-12" aria-labelledby="why-heading">
            <h2 id="why-heading" className="section-title mb-4">
              Why choose Farwa in Karachi
            </h2>
            <ul className="space-y-3 text-body max-w-3xl list-disc pl-5 marker:text-accent-gold">
              <li>
                <strong className="font-medium text-ink">{YEARS_ACTIVE}+ years</strong> in PECHS with bridal
                trials, mehndi, and full wedding packages.
              </li>
              <li>
                <strong className="font-medium text-ink">100+ services</strong> — threading, Rica wax, organic
                facials, hair colour, manicures, and massage under one roof.
              </li>
              <li>
                <strong className="font-medium text-ink">{rating.ratingValue}★ Google rating</strong> (
                {rating.reviewCount}+ reviews) — book online or WhatsApp.
              </li>
              <li>Mon–Sat 11am–7pm; closed Sunday. Real-time slot availability when you book online.</li>
            </ul>
          </section>

          <section className="mb-12 panel-soft p-6 md:p-8 shadow-soft" aria-labelledby="visit-heading">
            <h2 id="visit-heading" className="section-title text-lg mb-4">
              Visit the salon
            </h2>
            <ul className="space-y-3 text-sm font-['Inter'] text-stone font-light">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-ink" />
                {SALON_ADDRESS_LINES[0]}
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-ink" />
                {SALON_ADDRESS_LINES[1]} · {SALON_ADDRESS_LINES[2]}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-ink" />
                <a href="tel:+923222782254" className="hover:underline text-ink font-medium">
                  {SALON_PHONE_DISPLAY}
                </a>
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-['Inter']">
              <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="link-underline hover:text-ink">
                Directions on Google Maps
              </a>
              <a
                href={GOOGLE_REVIEW_LINK}
                target="_blank"
                rel="noreferrer"
                className="link-underline hover:text-ink"
              >
                Leave a review
              </a>
            </div>
          </section>

          <section className="mb-12" aria-labelledby="services-heading">
            <h2 id="services-heading" className="section-title mb-4">
              Popular services
            </h2>
            <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                ['Bridal', CAT_SLUGS.Bridal],
                ['Threading', CAT_SLUGS.Threading],
                ['Facials', CAT_SLUGS.Facials],
                ['Hair', CAT_SLUGS.Hair],
                ['Nails', CAT_SLUGS.Nails],
                ['Rica Wax', CAT_SLUGS['Rica Wax']],
              ].map(([label, slug]) => (
                <li key={slug}>
                  <Link href={`/services/${slug}`} className="card-link">
                    {label}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="areas-heading">
            <h2 id="areas-heading" className="section-title mb-4">
              Beauty services near your area
            </h2>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {locationLinks.map(({ href, label, slug }) => (
                <li key={slug}>
                  <Link href={href} className="link-underline text-sm font-['Inter'] text-stone hover:text-ink py-1">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8 pt-6 border-t border-border-soft text-xs text-stone font-['Inter']">
              <Link href="/" className="link-underline hover:text-ink font-medium">
                Back to home
              </Link>
            </p>
          </section>
        </div>
      </main>
    </>
  )
}
