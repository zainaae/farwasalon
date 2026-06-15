import Link from 'next/link'
import { ArrowUpRight, Clock, MapPin, Phone } from 'lucide-react'
import JsonLd from '../json-ld'
import { pageSocialMeta } from '../../lib/page-metadata.js'
import {
  SALON_ADDRESS_LINES,
  SALON_PHONE_DISPLAY,
  GOOGLE_REVIEW_LINK,
  SITE_ORIGIN,
  buildSpeakableSchema,
  getAggregateRating,
} from '../../lib/business-schema.js'
import { CAT_SLUGS, CAT_FAQS, SERVICES, YEARS_ACTIVE, MAPS_LINK, getServiceIdByName, formatPrice } from '../../src/data.js'

const title = 'Bridal Makeup in PECHS Karachi — Trials & Packages | Farwa Beauty Salon'
const description =
  'Bridal makeup, trials, engagement and mehndi looks in PECHS, Karachi. Packages from Rs 8,000. 18+ years of wedding styling — book online or WhatsApp.'

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/bridal' },
  ...pageSocialMeta({
    title,
    description,
    path: '/bridal',
    image: '/bridal.jpg',
    imageAlt: 'Bridal makeup in PECHS Karachi — Farwa Beauty Salon',
  }),
}

export default function BridalLandingPage() {
  const rating = getAggregateRating()
  const packages = SERVICES.Bridal || []
  const trialServiceId = getServiceIdByName('Bridal Trial')
  const faqs = CAT_FAQS.Bridal || []

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <JsonLd
        data={buildSpeakableSchema({
          pageUrl: `${SITE_ORIGIN}/bridal`,
          cssSelectors: ['#bridal-headline', '#bridal-lede'],
        })}
      />
      <JsonLd data={faqSchema} />
      <main id="main" className="page-content">
        <div className="section-shell section-pad min-h-0">
          <p className="eyebrow mb-4">— Bridal in PECHS</p>
          <h1 id="bridal-headline" className="font-['Unbounded'] font-bold text-3xl md:text-[2.5rem] text-ink mb-6 max-w-3xl leading-tight tracking-tight">
            Bridal Makeup &amp; Styling in Karachi
          </h1>
          <p id="bridal-lede" className="text-body md:text-lg max-w-3xl mb-8">
            Farwa has styled PECHS brides since 2008 — from mehndi and engagement to nikkah and walima.
            Transparent PKR pricing, a dedicated trial, and a calm studio in Saima Terrace Block 3.
          </p>

          <div className="flex flex-wrap gap-3 mb-12">
            <Link
              href={trialServiceId ? `/book?serviceId=${trialServiceId}` : '/book?category=Bridal'}
              className="btn-primary"
            >
              Book Bridal Trial <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link href={`/services/${CAT_SLUGS.Bridal}`} className="btn-secondary">
              Full Bridal Menu
            </Link>
          </div>

          <section className="mb-12" aria-labelledby="packages-heading">
            <h2 id="packages-heading" className="section-title mb-4">
              Bridal packages (PKR)
            </h2>
            <ul className="grid md:grid-cols-2 gap-4 max-w-4xl">
              {packages.map((pkg) => (
                <li key={pkg.id} className="panel-soft p-5 shadow-soft">
                  <h3 className="font-['Syne'] font-bold text-sm text-ink uppercase mb-1">{pkg.name}</h3>
                  <p className="text-stone text-xs font-['Inter'] mb-2">
                    {formatPrice(pkg.pricePkr)}
                    {pkg.durationMinutes ? ` · ~${Math.round(pkg.durationMinutes / 60)}h` : ''}
                  </p>
                  {pkg.desc && <p className="text-body text-sm mb-3">{pkg.desc}</p>}
                  {Array.isArray(pkg.includes) && pkg.includes.length > 0 && (
                    <ul className="text-stone text-xs font-['Inter'] list-disc pl-4 space-y-1">
                      {pkg.includes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12" aria-labelledby="why-bridal-heading">
            <h2 id="why-bridal-heading" className="section-title mb-4">
              Why brides choose Farwa
            </h2>
            <ul className="space-y-3 text-body max-w-3xl list-disc pl-5 marker:text-accent-gold">
              <li>
                <strong className="font-medium text-ink">{YEARS_ACTIVE}+ years</strong> of bridal work in PECHS — trials, touch-ups, and event-day calm.
              </li>
              <li>
                <strong className="font-medium text-ink">{rating.ratingValue}★ on Google</strong> ({rating.reviewCount}+ reviews) — honest social proof, not inflated claims.
              </li>
              <li>Book online with real-time slots, or WhatsApp for multi-event wedding plans.</li>
              <li>Skincare prep, threading, and facials available under the same roof before your wedding week.</li>
            </ul>
          </section>

          <section className="mb-12 panel-soft p-6 md:p-8 shadow-soft" aria-labelledby="visit-bridal-heading">
            <h2 id="visit-bridal-heading" className="section-title text-lg mb-4">
              Studio &amp; consultation
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
              <a href={GOOGLE_REVIEW_LINK} target="_blank" rel="noreferrer" className="link-underline hover:text-ink">
                Leave a review
              </a>
            </div>
          </section>

          {faqs.length > 0 && (
            <section className="mb-12" aria-labelledby="bridal-faq-heading">
              <h2 id="bridal-faq-heading" className="section-title mb-4">
                Bridal FAQ
              </h2>
              <dl className="max-w-3xl space-y-6">
                {faqs.map((f) => (
                  <div key={f.q}>
                    <dt className="font-['Syne'] font-bold text-sm text-ink mb-1">{f.q}</dt>
                    <dd className="text-body text-sm">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section className="mb-8" aria-labelledby="bridal-read-heading">
            <h2 id="bridal-read-heading" className="section-title mb-4">
              Planning guides
            </h2>
            <ul className="flex flex-col gap-2 text-sm font-['Inter']">
              <li>
                <Link href="/blog/bridal-beauty-timeline" className="link-underline hover:text-ink">
                  Complete bridal beauty timeline
                </Link>
              </li>
              <li>
                <Link href="/blog/best-bridal-makeup-packages-karachi-2026" className="link-underline hover:text-ink">
                  Bridal packages in Karachi — what to expect
                </Link>
              </li>
            </ul>
          </section>

          <p className="pt-6 border-t border-border-soft text-xs text-stone font-['Inter']">
            <Link href="/" className="link-underline hover:text-ink font-medium">
              Back to home
            </Link>
            {' · '}
            <Link href={`/services/${CAT_SLUGS.Bridal}`} className="link-underline hover:text-ink font-medium">
              All bridal services
            </Link>
          </p>
        </div>
      </main>
    </>
  )
}
