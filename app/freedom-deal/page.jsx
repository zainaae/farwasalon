import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { DEALS, getActiveDeals, getUpcomingDeals, formatDealRange } from '../../src/deals-data.js'
import { pageSocialMeta } from '../../lib/page-metadata.js'
import JsonLd from '../json-ld'
import { SITE_ORIGIN, SALON_ID, buildFaqPageSchema } from '../../lib/business-schema.js'

const DEAL = DEALS.find((d) => d.id === 'freedom-deal-2026')

/* Pakistani users search this offer in several spellings — azadi, azaadi,
   jashn-e-azadi, "14 august sale", "independence day offer". They are the same
   intent, so they get one page rather than five thin ones. The page is branded
   "Freedom Deal" to match the poster customers receive, while azadi / azaadi /
   "14 august sale" stay in the title, description and keywords because those
   are the words people actually search. */
const title = 'Freedom Deal — Azadi Sale 2026 | 20% Off, 14 August, Farwa Karachi'
const description =
  'Azadi sale / Independence Day deal in PECHS Karachi: 20% off when your visit totals Rs 1,400 or more, 5–14 August 2026. Combine any services — threading, facials, hair, nails, bridal.'

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/freedom-deal' },
  keywords: [
    'azadi sale', 'azaadi sale', 'azadi offer Karachi', 'jashn e azadi sale',
    '14 august sale', '14 august offer', 'independence day sale Karachi',
    'independence day salon offer', 'freedom deal', 'salon sale Karachi August',
  ],
  ...pageSocialMeta({
    title,
    description,
    path: '/freedom-deal',
    image: '/freedom-deal-og.jpg',
    imageAlt: DEAL?.imageAlt || 'Freedom Deal — Farwa Beauty Salon',
  }),
}

export const revalidate = 86400

const FAQS = [
  {
    q: 'What is the Freedom Deal at Farwa Beauty Salon?',
    a: 'From 5 to 14 August 2026, any visit totalling Rs 1,400 or more gets 20% off at Farwa Beauty Salon in Block 3 PECHS, Karachi. You can reach the total with one service or several combined. The discount comes off our published prices, which have been printed on farwasalon.com all year.',
  },
  {
    q: 'Which services are included in the 14 August offer?',
    a: 'Everything on the menu counts toward the total — threading, waxing, facials, cleansing, hair, nails, massage, brows and bridal. Nothing is excluded from qualifying; you simply need the visit to add up to Rs 1,400 or more. Party makeup and keratin are quoted individually, so ask on WhatsApp how they apply.',
  },
  {
    q: 'How do I claim the Azaadi discount?',
    a: 'Nothing to claim — book between 5 and 14 August and if your services total Rs 1,400 or more, the 20% comes off at the counter. Book online at farwasalon.com/book or WhatsApp +92 322 2782254.',
  },
  {
    q: 'Can I combine services to reach Rs 1,400?',
    a: 'Yes — that is the point. Add the services you want to one booking; if the total reaches Rs 1,400 or more, the 20% applies to the visit. It does not matter whether that is one treatment or several small ones.',
  },
  {
    q: 'Do I need to pay in advance?',
    a: 'No. Booking online is free and you pay at the salon — cash, JazzCash, or EasyPaisa.',
  },
  {
    q: 'When does the Independence Day offer end?',
    a: 'It runs to 14 August 2026 inclusive. After that every price returns to the printed rate on farwasalon.com/prices — the same rate it was before the sale.',
  },
]

export default function AzadiSalePage() {
  const live = getActiveDeals().some((d) => d.id === DEAL?.id)
  const upcoming = getUpcomingDeals().some((d) => d.id === DEAL?.id)
  const range = DEAL ? formatDealRange(DEAL) : ''

  const offerSchema = DEAL && {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: 'Freedom Deal 2026 — Azadi offer, 20% off',
    description: DEAL.description,
    url: `${SITE_ORIGIN}/freedom-deal`,
    priceCurrency: 'PKR',
    offeredBy: { '@id': SALON_ID },
    validFrom: DEAL.validFrom,
    validThrough: DEAL.validUntil,
    eligibleQuantity: { '@type': 'QuantitativeValue', minValue: 1400, unitText: 'PKR service value' },
  }

  return (
    <main id="main" className="page-content">
      {offerSchema && <JsonLd data={offerSchema} />}
      <JsonLd data={buildFaqPageSchema(FAQS)} />

      {/* Campaign hero — poster palette, poster artwork, and the discount itself
          as the visual anchor. Deliberately off-brand for the ten days it runs:
          the site is ink/nude/gold, this is the flag. */}
      <section className="azadi-hero">
        <div className="section-shell py-12 md:py-16">
          <div className="grid gap-10 md:gap-14 md:grid-cols-[1.15fr_0.85fr] items-center">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 text-[10px] md:text-[11px] tracking-[0.24em] uppercase font-semibold font-['Inter'] text-[color:var(--azadi-green)] mb-5">
                <span className="azadi-dot" aria-hidden="true" />
                {live ? 'Live now' : upcoming ? `Starts ${range}` : 'Independence Day'}
              </p>

              <h1 className="azadi-display mb-4">
                <span className="block">Freedom</span>
                <span className="block">Deal</span>
              </h1>

              <p className="azadi-figure mb-5" aria-hidden="true">20<span>%</span></p>
              <p className="sr-only">20 percent off</p>

              <p className="text-[color:var(--azadi-deep)]/85 text-base md:text-lg font-['Inter'] font-light leading-relaxed max-w-xl mb-3">
                <strong className="font-semibold">20% off when your visit totals Rs 1,400 or more.</strong>{' '}
                Jashn-e-Azadi at Farwa Beauty Salon, Block 3 PECHS — threading, facials, hair,
                nails, waxing and bridal all count toward the total.
              </p>
              <p className="text-[color:var(--azadi-deep)]/65 text-sm font-['Inter'] font-light max-w-xl mb-7">
                The 20% comes off our printed price — the same rate published on this site all
                year, not one raised for the occasion.
              </p>

              <p className="azadi-dates mb-8">
                5 <span>—</span> 14 August 2026
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link href="/book" className="tap-safe azadi-btn">
                  Book your slot <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
                <a
                  href="https://wa.me/923222782254?text=Freedom%20Deal%20—%20I%20want%20to%20book"
                  target="_blank"
                  rel="noreferrer"
                  className="tap-safe azadi-btn azadi-btn--ghost"
                >
                  Ask on WhatsApp
                </a>
              </div>
            </div>

            {DEAL?.image && (
              <Image
                src={DEAL.image}
                alt={DEAL.imageAlt}
                width={1000}
                height={1414}
                priority
                sizes="(max-width: 768px) 92vw, 420px"
                className="w-full max-w-[420px] mx-auto h-auto shadow-card"
              />
            )}
          </div>
        </div>
      </section>

      <div className="section-shell section-pad min-h-0">
        <section aria-labelledby="azadi-qualifying" className="mb-14">
          <h2 id="azadi-qualifying" className="font-['Syne'] font-semibold text-ink text-xl md:text-2xl mb-4">
            What qualifies
          </h2>
          <p className="text-body text-sm md:text-[15px] mb-5 max-w-2xl leading-relaxed">
            Nothing on the menu is excluded. The Rs 1,400 is the total for your visit, not a
            price any single service has to reach — so a few smaller treatments together qualify
            just as well as one larger one. Everything is on the{' '}
            <Link href="/prices" className="link-underline text-ink font-medium">price list</Link>.
          </p>
          <p className="text-stone text-[13px] font-['Inter'] font-light max-w-2xl">
            Not sure whether your booking clears Rs 1,400?{' '}
            <a
              href="https://wa.me/923222782254?text=Azadi%20offer%20—%20does%20my%20booking%20qualify%3F"
              target="_blank"
              rel="noreferrer"
              className="link-underline text-ink font-medium"
            >
              Ask on WhatsApp
            </a>{' '}
            and we will confirm before you come.
          </p>
        </section>

        <section aria-labelledby="azadi-faq" className="mb-12">
          <h2 id="azadi-faq" className="font-['Syne'] font-semibold text-ink text-xl md:text-2xl mb-6">
            Azadi offer — questions
          </h2>
          <dl className="space-y-5 max-w-3xl">
            {FAQS.map((f) => (
              <div key={f.q}>
                <dt className="font-['Syne'] font-bold text-sm text-ink">{f.q}</dt>
                <dd className="mt-1.5 text-body text-sm">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="text-xs text-stone font-['Inter'] flex flex-wrap gap-x-3 gap-y-2">
          <Link href="/deals" className="link-underline hover:text-ink font-medium">All current deals</Link>
          <Link href="/prices" className="link-underline hover:text-ink font-medium">Full price list</Link>
          <Link href="/services/facials" className="link-underline hover:text-ink font-medium">Facials</Link>
          <Link href="/bridal" className="link-underline hover:text-ink font-medium">Bridal packages</Link>
          <Link href="/book" className="link-underline hover:text-ink font-medium">Book online</Link>
        </p>
      </div>
    </main>
  )
}
