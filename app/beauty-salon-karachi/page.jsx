import Link from 'next/link'
import WaCta from '../components/wa-cta.jsx'
import { NEIGHBORHOODS } from '../../src/location-seo.js'
import { AREA_CONTENT } from '../../src/area-content.js'
import { ArrowUpRight, MapPin, Clock, Phone } from 'lucide-react'
import { pageSocialMeta } from '../../lib/page-metadata.js'
import {
  SALON_ADDRESS_LINES,
  SALON_PHONE_DISPLAY,
  GOOGLE_REVIEW_LINK,
  getAggregateRating,
} from '../../lib/business-schema.js'
import { CAT_SLUGS, YEARS_ACTIVE, MAPS_LINK } from '../../src/data.js'

const title = 'Beauty Salon Karachi — PECHS \u00B7 From Rs 100 | Farwa'
const description =
  'Looking for a beauty salon in Karachi? Farwa in PECHS — bridal, facials, threading & waxing from Rs 100. Transparent prices, online booking, since 2008.'

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
  const rating = getAggregateRating()

  return (
    <>
      {/* The root layout already emits the BeautySalon schema (with its
          aggregateRating) on every page — emitting it again here made GSC
          flag "Review has multiple aggregate ratings" on this URL. */}
      <main id="main" className="page-content">
        <div className="section-shell section-pad min-h-0">
          <p className="eyebrow mb-4">— Karachi beauty salon</p>
          <h1 className="display-page text-ink mb-6 max-w-2xl">
            Beauty Salon in Karachi — PECHS
          </h1>
          <p className="text-body md:text-lg max-w-3xl mb-4">
            Farwa Beauty Salon has been a home for bridal makeup, facials, threading, waxing, hair, and nail
            services in PECHS Block 3 since 2008. Transparent pricing from Rs 100, a calm women-only studio,
            and online booking — one PECHS address (not an at-home parlour), one team you can trust.
          </p>
          <p className="text-stone text-sm font-[family-name:var(--font-inter)] font-light max-w-3xl mb-8">
            {SALON_ADDRESS_LINES[0]} · {SALON_ADDRESS_LINES[1]} · {SALON_PHONE_DISPLAY}
          </p>

          <div className="cta-cluster mb-4">
            <Link href="/book" className="btn-primary">
              Book Online <ArrowUpRight className="w-4 h-4" />
            </Link>
            <WaCta href="https://wa.me/923222782254" from="karachi-hub" className="btn-secondary">
              WhatsApp
            </WaCta>
          </div>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-[family-name:var(--font-inter)] mb-12">
            <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="tap-safe inline-flex items-center min-h-[44px] link-underline hover:text-ink text-stone">
              Directions
            </a>
            <Link href="/prices" className="tap-safe inline-flex items-center min-h-[44px] link-underline hover:text-ink text-stone">
              Price list
            </Link>
            <Link href="/bridal" className="tap-safe inline-flex items-center min-h-[44px] link-underline hover:text-ink text-stone">
              Bridal makeup
            </Link>
          </p>

          <section className="mb-12" aria-labelledby="why-heading">
            <h2 id="why-heading" className="section-title mb-4">
              Why choose Farwa in PECHS
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
                {rating.reviewCount} reviews) — book online or WhatsApp.
              </li>
              <li>Mon–Sat 11–7; closed Sunday. Real-time slot availability when you book online.</li>
              <li>Women-only PECHS studio — we do not operate other branches or daily at-home parlour visits.</li>
            </ul>
          </section>

          <section className="mb-12 panel-soft p-6 md:p-8 shadow-soft" aria-labelledby="visit-heading">
            <h2 id="visit-heading" className="section-title mb-4">
              Visit the salon
            </h2>
            <ul className="space-y-3 text-sm font-[family-name:var(--font-inter)] text-stone font-light">
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
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-[family-name:var(--font-inter)]">
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
                ['Bridal makeup', CAT_SLUGS.Bridal],
                ['Threading', CAT_SLUGS.Threading],
                ['Facials', CAT_SLUGS.Facials],
                ['Microblading', CAT_SLUGS['Eyebrow Tattoo']],
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

          <section className="mb-12" aria-labelledby="areas-heading">
            <h2 id="areas-heading" className="section-title mb-4">
              Areas we serve
            </h2>
            <p className="text-body max-w-3xl mb-6">
              One PECHS studio — clients visit us from across Karachi. Each page below has the
              road you would actually take, an honest drive time, and what is worth booking
              given that journey.
            </p>
            <ul className="flex flex-wrap gap-2">
              {NEIGHBORHOODS.filter((n) => AREA_CONTENT[n.slug]).map((n) => (
                <li key={n.slug}>
                  <Link href={`/areas/${n.slug}`} className="tab-pill hover:border-ink hover:text-ink">
                    {n.name}
                    <span className="text-stone ml-1.5">{AREA_CONTENT[n.slug].driveTime}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8 pt-6 border-t border-border-soft text-xs text-stone font-[family-name:var(--font-inter)]">
              <Link href="/" className="link-underline hover:text-ink font-medium">
                Back to home
              </Link>
              {' · '}
              <Link href="/bridal" className="link-underline hover:text-ink font-medium">
                Bridal makeup
              </Link>
              {' · '}
              <Link href="/prices" className="link-underline hover:text-ink font-medium">
                Price list
              </Link>
              {' · '}
              <Link href="/blog/beauty-parlour-near-me-karachi-guide" className="link-underline hover:text-ink font-medium">
                Beauty parlour near me guide
              </Link>
              {' · '}
              <Link href="/blog/threading-near-me-karachi-pechs" className="link-underline hover:text-ink font-medium">
                Threading near me
              </Link>
              {' · '}
              <Link href="/blog/facials-near-me-karachi-pechs" className="link-underline hover:text-ink font-medium">
                Facials near me
              </Link>
              {' · '}
              <Link href="/services/threading-in-pechs-karachi" className="link-underline hover:text-ink font-medium">
                Threading in PECHS
              </Link>
            </p>
          </section>
        </div>
      </main>
    </>
  )
}
