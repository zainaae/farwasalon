import Link from 'next/link'
import Image from 'next/image'
import WaCta from '../components/wa-cta.jsx'
import { ArrowUpRight, Clock, MapPin, Phone } from 'lucide-react'
import JsonLd from '../json-ld'
import { pageSocialMeta } from '../../lib/page-metadata.js'
import {
  SALON_ADDRESS_LINES,
  SALON_PHONE_DISPLAY,
  GOOGLE_REVIEW_LINK,
  SITE_ORIGIN,
  buildSpeakableSchema,
  buildFaqPageSchema,
  getAggregateRating,
} from '../../lib/business-schema.js'
import { CAT_SLUGS, SERVICES, YEARS_ACTIVE, MAPS_LINK, getServiceIdByName, formatPrice, WA_DEFAULT } from '../../src/data.js'
import { CAT_FAQS } from '../../src/cat-seo-content.js'

const title = 'Bridal Makeup Karachi — From Rs 8,000 | Farwa'
const description =
  'Bridal makeup in PECHS, Karachi from Rs 8,000 — trials, engagement & mehndi looks. 18+ years of wedding styling. Book online or WhatsApp today.'

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

const EVENT_TAXONOMY = [
  { event: 'Mehndi / Dholki', look: 'Festive colour, lasting set', mapsTo: 'Mehndi / Dholki Look', price: 10000 },
  { event: 'Engagement', look: 'Glam portraits & stage', mapsTo: 'Engagement Look', price: 12000 },
  { event: 'Nikkah', look: 'Softer elegant ceremony', mapsTo: 'Full Bridal Package (nikkah mood)', price: 25000 },
  { event: 'Barat / HD glam', look: 'Full stage & photo glam', mapsTo: 'Full Bridal Package', price: 25000 },
  { event: 'Walima', look: 'Polished day-after radiance', mapsTo: 'Full Bridal Package (walima mood)', price: 25000 },
  { event: 'Trial', look: 'Full preview + reference photos', mapsTo: 'Bridal Trial', price: 8000 },
]

const BRIDAL_FAQS = [
  {
    q: 'How much does bridal makeup cost in Karachi?',
    a: 'Market bands for a single bridal event often run roughly Rs 8,000–35,000+ at published parlours, with celebrity studios far higher. At Farwa in PECHS: Bridal Trial Rs 8,000, Mehndi Rs 10,000, Engagement Rs 12,000, Full Bridal Package Rs 25,000 — printed PKR on farwasalon.com/prices.',
  },
  ...(CAT_FAQS.Bridal || []),
  {
    q: 'Do you travel for bridal, or is it studio-only?',
    a: 'We are a women-only PECHS studio (one address). The Full Bridal Package includes event presence / on-site touch-ups by arrangement — WhatsApp your venue when you book. We do not operate as a rotating at-home parlour for daily services.',
  },
]

export default function BridalLandingPage() {
  const rating = getAggregateRating()
  const packages = SERVICES.Bridal || []
  const trialServiceId = getServiceIdByName('Bridal Trial')
  const faqSchema = buildFaqPageSchema(BRIDAL_FAQS)

  return (
    <>
      <JsonLd
        data={buildSpeakableSchema({
          pageUrl: `${SITE_ORIGIN}/bridal`,
          cssSelectors: ['#bridal-headline', '#bridal-lede'],
        })}
      />
      {faqSchema && <JsonLd data={faqSchema} />}
      <main id="main" className="page-content">
        <div className="section-shell section-pad min-h-0">
          <p className="eyebrow mb-4">— Bridal · from Rs 8,000</p>
          <h1 id="bridal-headline" className="font-[family-name:var(--font-unbounded)] font-bold text-[1.85rem] sm:text-3xl md:text-[2.6rem] text-ink mb-5 max-w-2xl leading-[1.12] tracking-tight">
            Bridal Makeup Karachi — Packages from Rs 8,000
          </h1>
          <p id="bridal-lede" className="text-body md:text-lg max-w-2xl mb-8 leading-relaxed">
            Farwa in PECHS has styled weddings since 2008 — Bridal Trial Rs 8,000, Mehndi Rs 10,000,
            Engagement Rs 12,000, Full Bridal Package Rs 25,000.
          </p>

          <div className="cta-cluster mb-4">
            <Link
              href={trialServiceId ? `/book?serviceId=${trialServiceId}` : '/book?category=Bridal'}
              className="tap-safe btn-primary w-full sm:w-auto justify-center"
            >
              Book Bridal Trial <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link href="/prices" className="tap-safe btn-secondary w-full sm:w-auto justify-center">
              Full price list
            </Link>
          </div>
          <p className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-['Inter'] mb-14">
            <WaCta href={WA_DEFAULT} from="bridal-inline" className="tap-safe inline-flex items-center min-h-[44px] link-underline text-stone hover:text-ink">
              WhatsApp wedding plan
            </WaCta>
            <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="tap-safe inline-flex items-center min-h-[44px] link-underline text-stone hover:text-ink">
              Directions
            </a>
          </p>

          <figure className="flow-loose">
            <div className="relative aspect-[16/10] md:aspect-[2/1] overflow-hidden bg-mist border border-border-soft">
              <Image
                src="/bridal.jpg"
                alt="Bridal makeup at Farwa Beauty Salon, PECHS Karachi"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
            <figcaption className="mt-4 max-w-xl">
              <p className="font-[family-name:var(--font-unbounded)] font-bold text-ink text-lg sm:text-xl leading-[1.05] tracking-tight">
                From the chair
              </p>
              <p className="mt-1.5 text-stone text-xs font-['Inter'] font-light">
                Owned studio still — bridal work in PECHS, not a stock look.
              </p>
            </figcaption>
          </figure>

          <section className="mb-14" aria-labelledby="event-taxonomy-heading">
            <h2 id="event-taxonomy-heading" className="section-title mb-3">
              Event looks → Farwa packages
            </h2>
            <p className="text-body text-sm max-w-2xl mb-5 leading-relaxed">
              Mehndi, engagement, nikkah, barat, and walima — each maps to a published package with a clear starting price.
            </p>
            <div className="overflow-x-auto max-w-4xl">
              <table className="w-full border-collapse text-sm font-['Inter']">
                <thead>
                  <tr className="border-b border-ink/30 text-left">
                    <th className="py-2 pr-3 font-['Syne'] text-ink">Event</th>
                    <th className="py-2 pr-3 font-['Syne'] text-ink">Look</th>
                    <th className="py-2 pr-3 font-['Syne'] text-ink">Maps to</th>
                    <th className="py-2 text-right font-['Syne'] text-ink">From</th>
                  </tr>
                </thead>
                <tbody>
                  {EVENT_TAXONOMY.map((row) => (
                    <tr key={row.event} className="border-b border-border-soft">
                      <td className="py-2.5 pr-3 text-ink font-medium">{row.event}</td>
                      <td className="py-2.5 pr-3 text-stone">{row.look}</td>
                      <td className="py-2.5 pr-3 text-stone">{row.mapsTo}</td>
                      <td className="py-2.5 text-right text-ink font-[family-name:var(--font-unbounded)] font-bold text-xs tabular-nums">
                        {formatPrice(row.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="flow-loose" aria-labelledby="packages-heading">
            <h2 id="packages-heading" className="section-title mb-4">
              Bridal packages (PKR) — what&apos;s included
            </h2>
            <ul className="grid md:grid-cols-2 gap-4 max-w-4xl">
              {packages.map((pkg) => (
                <li key={pkg.id} className="panel-soft p-5 shadow-soft flex flex-col">
                  <h3 className="font-['Syne'] font-bold text-sm text-ink uppercase mb-1">{pkg.name}</h3>
                  <p className="text-stone text-xs font-['Inter'] mb-2">
                    {formatPrice(pkg.pricePkr)}
                    {pkg.durationMinutes ? ` · ~${Math.round(pkg.durationMinutes / 60)}h` : ''}
                  </p>
                  {pkg.desc && <p className="text-body text-sm mb-3">{pkg.desc}</p>}
                  {Array.isArray(pkg.includes) && pkg.includes.length > 0 && (
                    <>
                      <p className="text-[10px] tracking-[0.14em] uppercase text-stone mb-1">Included</p>
                      <ul className="text-stone text-xs font-['Inter'] list-disc pl-4 space-y-1 mb-3">
                        {pkg.includes.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  <p className="text-[10px] tracking-[0.14em] uppercase text-stone mb-1">Not included by default</p>
                  <ul className="text-stone text-xs font-['Inter'] list-disc pl-4 space-y-1 mb-4">
                    <li>Guest / family makeup (book separately)</li>
                    <li>Pre-wedding facials &amp; threading (add from the menu)</li>
                    <li>Jewellery hire or outfit draping beyond dupatta/hijab styling listed</li>
                  </ul>
                  <Link
                    href={`/book?serviceId=${pkg.id}`}
                    className="tap-safe btn-primary !py-2.5 !px-4 mt-auto w-full sm:w-auto justify-center"
                  >
                    Book {pkg.name} <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="flow-loose" aria-labelledby="timeline-heading">
            <h2 id="timeline-heading" className="section-title mb-4">
              Pre-bridal timeline
            </h2>
            <ol className="max-w-3xl space-y-3 text-body text-sm list-decimal pl-5 marker:text-accent-gold">
              <li><strong className="text-ink font-medium">3–6 months out</strong> — monthly facials / cleansing; lock peak-season dates.</li>
              <li><strong className="text-ink font-medium">6–8 weeks out</strong> — book Bridal Trial (Rs 8,000); plan mehndi &amp; engagement slots.</li>
              <li><strong className="text-ink font-medium">2–4 weeks out</strong> — complete trial; refine shade &amp; hair; continue threading.</li>
              <li><strong className="text-ink font-medium">Wedding week</strong> — light services only; avoid new skincare experiments.</li>
            </ol>
            <p className="mt-4 text-sm font-['Inter']">
              Full guide:{' '}
              <Link href="/blog/bridal-beauty-timeline" className="link-underline hover:text-ink text-ink font-medium">
                bridal beauty timeline
              </Link>
              {' · '}
              <Link href="/blog/best-bridal-makeup-packages-karachi-2026" className="link-underline hover:text-ink text-ink font-medium">
                packages &amp; cost
              </Link>
            </p>
          </section>

          <section className="flow-tight" aria-labelledby="catchment-heading">
            <h2 id="catchment-heading" className="section-title mb-4">
              Brides from across Karachi
            </h2>
            <p className="text-body max-w-3xl mb-4">
              One PECHS studio — brides visit from Tariq Road, Bahadurabad, Gulshan, DHA, Clifton,
              Saddar, North Nazimabad, and Shahrah-e-Faisal. We do not claim other branches.
            </p>
            {/* The per-area bridal hubs were retired — they were one template with
                the area name swapped, and Google folded them. These point at
                pages that actually differ. */}
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {[
                ['Bridal in PECHS', '/services/bridal-makeup-in-pechs-karachi'],
                ['Bridal packages & prices', '/services/bridal'],
                ['Near Tariq Road', '/blog/salon-near-tariq-road-pechs'],
                ['Bridal timeline', '/blog/bridal-beauty-timeline'],
                ['Mehndi & engagement looks', '/blog/mehndi-engagement-makeup-karachi'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="tap-safe inline-flex items-center min-h-[44px] link-underline text-stone text-sm font-['Inter'] hover:text-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="flow-loose" aria-labelledby="why-bridal-heading">
            <h2 id="why-bridal-heading" className="section-title mb-4">
              Why brides choose Farwa
            </h2>
            <ul className="space-y-3 text-body max-w-3xl list-disc pl-5 marker:text-accent-gold">
              <li>
                <strong className="font-medium text-ink">{YEARS_ACTIVE}+ years</strong> of bridal work in PECHS — trials, touch-ups, and event-day calm.
              </li>
              <li>
                <strong className="font-medium text-ink">{rating.ratingValue}★ on Google</strong> ({rating.reviewCount} reviews) — honest social proof, not inflated claims.
              </li>
              <li>Book online with real-time slots, or WhatsApp for multi-event wedding plans.</li>
              <li>Skincare prep, threading, and facials under the same women-only roof before wedding week.</li>
            </ul>
          </section>

          <section className="flow-loose panel-soft p-6 md:p-8 shadow-soft" aria-labelledby="visit-bridal-heading">
            <h2 id="visit-bridal-heading" className="section-title mb-4">
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

          {BRIDAL_FAQS.length > 0 && (
            <section className="flow" aria-labelledby="bridal-faq-heading">
              <h2 id="bridal-faq-heading" className="section-title mb-4">
                Bridal FAQ
              </h2>
              <dl className="max-w-lg space-y-6">
                {BRIDAL_FAQS.map((f) => (
                  <div key={f.q}>
                    <dt className="font-['Syne'] font-bold text-sm text-ink mb-1">{f.q}</dt>
                    <dd className="text-body">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section className="flow panel-soft p-6 md:p-8 shadow-soft" aria-labelledby="bridal-book-cta">
            <h2 id="bridal-book-cta" className="section-title mb-2">
              Lock your bridal date
            </h2>
            <p className="text-body text-sm mb-5">
              Start with a Bridal Trial (Rs 8,000) or WhatsApp your wedding week — we confirm slots before you travel to PECHS.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={trialServiceId ? `/book?serviceId=${trialServiceId}` : '/book?category=Bridal'}
                className="tap-safe btn-primary"
              >
                Book Bridal Trial <ArrowUpRight className="w-4 h-4" />
              </Link>
              <WaCta href={WA_DEFAULT} from="bridal-cta" className="tap-safe btn-secondary">
                WhatsApp wedding plan
              </WaCta>
            </div>
          </section>

          <section className="mb-8" aria-labelledby="bridal-read-heading">
            <h2 id="bridal-read-heading" className="section-title mb-4">
              Planning guides
            </h2>
            <ul className="flex flex-col gap-2 text-sm font-['Inter']">
              <li>
                <Link href="/blog/best-bridal-makeup-packages-karachi-2026" className="link-underline hover:text-ink">
                  Bridal packages &amp; cost in Karachi 2026
                </Link>
              </li>
              <li>
                <Link href="/blog/mehndi-engagement-makeup-karachi" className="link-underline hover:text-ink">
                  Mehndi &amp; engagement makeup — from Rs 10,000
                </Link>
              </li>
              <li>
                <Link href="/blog/bridal-beauty-timeline" className="link-underline hover:text-ink">
                  Complete bridal beauty timeline
                </Link>
              </li>
              <li>
                <Link href={`/services/${CAT_SLUGS.Bridal}`} className="link-underline hover:text-ink">
                  Full bridal service menu
                </Link>
              </li>
            </ul>
          </section>

          <p className="pt-6 border-t border-border-soft text-xs text-stone font-['Inter']">
            <Link href="/" className="link-underline hover:text-ink font-medium">Back to home</Link>
            {' · '}
            <Link href="/book" className="link-underline hover:text-ink font-medium">Book online</Link>
            {' · '}
            <Link href="/services/bridal-makeup-in-pechs-karachi" className="link-underline hover:text-ink font-medium">
              Bridal makeup in PECHS
            </Link>
          </p>
        </div>
      </main>
    </>
  )
}
