import Link from 'next/link'
import ArrowUpRight from '../components/icon-sprite.jsx'
import Image from 'next/image'
import PageCloseCta from '../components/page-close-cta.jsx'
import { Clock, MapPin, Phone } from 'lucide-react'
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
import { CAT_SLUGS, SERVICES, YEARS_ACTIVE, MAPS_LINK, getServiceIdByName, formatPrice, formatServicePrice, WA_DEFAULT } from '../../src/data.js'
import { CAT_FAQS } from '../../src/cat-seo-content.js'

const title = 'Bridal Makeup Karachi — Full Package Rs 25,000 | Farwa'
const description =
  'Bridal makeup in PECHS, Karachi — Full Bridal Package Rs 25,000 (hair, makeup, draping, touch-ups, event presence). Trials and event looks available. Book online.'

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/bridal' },
  ...pageSocialMeta({
    title,
    description,
    path: '/bridal',
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
    a: 'Market bands for a single bridal event often run roughly Rs 8,000–35,000+ at published parlours, with celebrity studios far higher. At Farwa in PECHS printed floors are: Bridal Trial from Rs 8,000, Mehndi from Rs 10,000, Engagement from Rs 12,000, Full Bridal Package from Rs 25,000 — final quote depends on hair, confirmed before the day. See farwasalon.com/prices.',
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
  const fullPackageServiceId = getServiceIdByName('Full Bridal Package')
  const fullPackageHref = fullPackageServiceId
    ? `/book?serviceId=${fullPackageServiceId}`
    : '/book?category=Bridal'
  const trialHref = trialServiceId
    ? `/book?serviceId=${trialServiceId}`
    : '/book?category=Bridal'
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
        {/* Full-bleed bridal plane — title-stack sits on the media, not above a cropped inset. */}
        <section className="relative w-full min-h-[min(88svh,820px)] max-h-[920px] overflow-hidden bg-[#0d0609]">
          <Image
            src="/bridal.jpg"
            alt="Bridal makeup at Farwa Beauty Salon, PECHS Karachi"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_28%] md:object-[55%_30%] pointer-events-none"
          />
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background:
                'linear-gradient(to top, rgba(13,6,9,0.90) 0%, rgba(13,6,9,0.52) 34%, rgba(13,6,9,0.18) 62%, rgba(13,6,9,0.28) 100%), ' +
                'linear-gradient(to right, rgba(13,6,9,0.55) 0%, rgba(13,6,9,0.28) 36%, rgba(13,6,9,0.06) 68%, rgba(13,6,9,0) 88%)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none z-[2]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: '180px',
              opacity: 0.04,
              mixBlendMode: 'overlay',
            }}
          />
          {/* Mobile: clear sticky Call/WA/Book chrome. Desktop keeps tighter pad. */}
          <div className="absolute inset-x-0 bottom-0 z-10 px-4 sm:px-5 md:px-10 pb-[max(6.75rem,env(safe-area-inset-bottom,0px)+5.5rem)] sm:pb-12 md:pb-14 pt-24">
            <div className="max-w-screen-xl mx-auto w-full min-w-0">
              <div className="title-stack mb-6 max-w-2xl">
                <p className="eyebrow eyebrow--on-dark">— Bridal · Full Package Rs 25,000</p>
                <h1 id="bridal-headline" className="display-page text-white">
                  Bridal makeup in PECHS, Karachi
                </h1>
                <p id="bridal-lede" className="text-white/80 md:text-lg leading-relaxed font-[family-name:var(--font-inter)] font-light">
                  Farwa in PECHS has styled weddings since 2008 — Full Bridal Package from Rs 25,000
                  (hair, makeup, draping, touch-ups; final quote before the day). Mehndi from Rs 10,000 ·
                  Engagement from Rs 12,000 · Bridal Trial from Rs 8,000.
                </p>
              </div>

              {/* One loud Book on the fold; sticky chrome already carries Call/WA/Book. */}
              <div className="cta-cluster mb-4">
                <Link
                  href={fullPackageHref}
                  className="btn-loud btn-loud--light tap-safe w-full sm:w-auto"
                >
                  Book Full Bridal Package <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/prices"
                  className="btn-ghost-on-dark tap-safe w-full sm:w-auto"
                >
                  Full price list
                </Link>
              </div>
              <p className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-[family-name:var(--font-inter)]">
                <Link
                  href={trialHref}
                  className="tap-safe inline-flex items-center min-h-[44px] link-underline text-white/75 hover:text-white"
                >
                  Or book Bridal Trial (from Rs 8,000)
                </Link>
                <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="tap-safe inline-flex items-center min-h-[44px] link-underline text-white/75 hover:text-white">
                  Directions
                </a>
              </p>
            </div>
          </div>
        </section>

        <div className="section-shell pt-14 md:pt-[4.5rem] pb-10 md:pb-12 min-h-0">
          <section className="mb-14" aria-labelledby="event-taxonomy-heading">
            <h2 id="event-taxonomy-heading" className="section-title mb-3">
              Event looks → Farwa packages
            </h2>
            <p className="text-body text-sm max-w-2xl mb-5 leading-relaxed">
              Mehndi, engagement, nikkah, barat, and walima — each maps to a published package with a clear starting floor (hair length and density decide the final quote).
            </p>
            {/* Mobile: stacked rows (4-col table wraps into mush under ~430px). */}
            <ul className="md:hidden max-w-4xl divide-y divide-border-soft border-t border-b border-border-soft">
              {EVENT_TAXONOMY.map((row) => (
                <li key={row.event} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-ink font-medium font-[family-name:var(--font-syne)] text-sm">{row.event}</p>
                    <p className="text-stone text-xs font-[family-name:var(--font-inter)] mt-0.5 leading-snug">{row.look}</p>
                    <p className="text-stone/80 text-[11px] font-[family-name:var(--font-inter)] mt-1">{row.mapsTo}</p>
                  </div>
                  <p className="shrink-0 text-ink font-[family-name:var(--font-fraunces)] font-bold text-sm tabular-nums pt-0.5">
                    from {formatPrice(row.price)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="hidden md:block overflow-x-auto max-w-4xl">
              <table className="w-full border-collapse text-sm font-[family-name:var(--font-inter)]">
                <thead>
                  <tr className="border-b border-ink/30 text-left">
                    <th className="py-2 pr-3 font-[family-name:var(--font-syne)] text-ink">Event</th>
                    <th className="py-2 pr-3 font-[family-name:var(--font-syne)] text-ink">Look</th>
                    <th className="py-2 pr-3 font-[family-name:var(--font-syne)] text-ink">Maps to</th>
                    <th className="py-2 text-right font-[family-name:var(--font-syne)] text-ink">From</th>
                  </tr>
                </thead>
                <tbody>
                  {EVENT_TAXONOMY.map((row) => (
                    <tr key={row.event} className="border-b border-border-soft">
                      <td className="py-2.5 pr-3 text-ink font-medium">{row.event}</td>
                      <td className="py-2.5 pr-3 text-stone">{row.look}</td>
                      <td className="py-2.5 pr-3 text-stone">{row.mapsTo}</td>
                      <td className="py-2.5 text-right text-ink font-[family-name:var(--font-fraunces)] font-bold text-xs tabular-nums">
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
              Bridal packages (PKR) — starting floors
            </h2>
            <p className="text-body text-sm max-w-2xl mb-4 leading-relaxed">
              Every bridal look includes hair, so the printed figure is a quote floor — not a locked online total. We confirm your final PKR before the appointment.
            </p>
            <ul className="grid md:grid-cols-2 gap-4 max-w-4xl">
              {packages.map((pkg) => (
                <li key={pkg.id} className="panel-soft p-5 shadow-soft flex flex-col">
                  <h3 className="font-[family-name:var(--font-syne)] font-bold text-sm text-ink uppercase mb-1">{pkg.name}</h3>
                  <p className="text-stone text-xs font-[family-name:var(--font-inter)] mb-2">
                    {formatServicePrice(pkg)}
                    {pkg.durationMinutes ? ` · ~${Math.round(pkg.durationMinutes / 60)}h` : ''}
                  </p>
                  {pkg.desc && <p className="text-body text-sm mb-3">{pkg.desc}</p>}
                  {Array.isArray(pkg.includes) && pkg.includes.length > 0 && (
                    <>
                      <p className="text-[10px] tracking-[0.14em] uppercase text-stone mb-1">Included</p>
                      <ul className="text-stone text-xs font-[family-name:var(--font-inter)] list-disc pl-4 space-y-1 mb-3">
                        {pkg.includes.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  <p className="text-[10px] tracking-[0.14em] uppercase text-stone mb-1">Not included by default</p>
                  <ul className="text-stone text-xs font-[family-name:var(--font-inter)] list-disc pl-4 space-y-1 mb-4">
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
              <li><strong className="text-ink font-medium">6–8 weeks out</strong> — book Bridal Trial (from Rs 8,000); plan mehndi &amp; engagement slots.</li>
              <li><strong className="text-ink font-medium">2–4 weeks out</strong> — complete trial; refine shade &amp; hair; continue threading.</li>
              <li><strong className="text-ink font-medium">Wedding week</strong> — light services only; avoid new skincare experiments.</li>
            </ol>
            <p className="mt-4 text-sm font-[family-name:var(--font-inter)]">
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
                  <Link href={href} className="tap-safe inline-flex items-center min-h-[44px] link-underline text-stone text-sm font-[family-name:var(--font-inter)] hover:text-ink">
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
                    <dt className="font-[family-name:var(--font-syne)] font-bold text-sm text-ink mb-1">{f.q}</dt>
                    <dd className="text-body">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section className="mb-8" aria-labelledby="bridal-read-heading">
            <h2 id="bridal-read-heading" className="section-title mb-4">
              Planning guides
            </h2>
            <ul className="flex flex-col gap-2 text-sm font-[family-name:var(--font-inter)]">
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

          <p className="pt-6 border-t border-border-soft text-xs text-stone font-[family-name:var(--font-inter)] mb-10">
            <Link href="/" className="link-underline hover:text-ink font-medium">Back to home</Link>
            {' · '}
            <Link href="/book" className="link-underline hover:text-ink font-medium">Book online</Link>
            {' · '}
            <Link href="/services/bridal-makeup-in-pechs-karachi" className="link-underline hover:text-ink font-medium">
              Bridal makeup in PECHS
            </Link>
          </p>
        </div>

        <PageCloseCta
          eyebrow="— Bridal · PECHS"
          title="Lock your bridal date"
          body="Full Bridal Package from Rs 25,000 — or book a Bridal Trial (from Rs 8,000) first. Final bridal quote depends on hair; we confirm before the day. WhatsApp your wedding week and we hold slots before you travel to PECHS."
          bookHref={fullPackageHref}
          bookLabel="Book Full Bridal Package"
          waHref={WA_DEFAULT}
          waFrom="bridal-close"
          waLabel="WhatsApp wedding plan"
        />
      </main>
    </>
  )
}
