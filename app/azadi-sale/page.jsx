import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { DEALS, getActiveDeals, getUpcomingDeals, formatDealRange } from '../../src/deals-data.js'
import { SERVICES } from '../../src/data.js'
import { pageSocialMeta } from '../../lib/page-metadata.js'
import JsonLd from '../json-ld'
import { SITE_ORIGIN, SALON_ID, buildFaqPageSchema } from '../../lib/business-schema.js'

const DEAL = DEALS.find((d) => d.id === 'freedom-deal-2026')

/* Pakistani users search this offer in several spellings — azadi, azaadi,
   jashn-e-azadi, "14 august sale", "independence day offer". They are the same
   intent, so they get one page rather than five thin ones. */
const title = 'Azadi Sale 2026 — 20% Off | 14 August Offer, Farwa Salon Karachi'
const description =
  'Azaadi / Independence Day salon offer in PECHS Karachi: 20% off all services Rs 1,400 and above, 5–14 August 2026. Facials, bridal, hair, nails — printed prices, real discount.'

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/azadi-sale' },
  keywords: [
    'azadi sale', 'azaadi sale', 'azadi offer Karachi', 'jashn e azadi sale',
    '14 august sale', '14 august offer', 'independence day sale Karachi',
    'independence day salon offer', 'freedom deal', 'salon sale Karachi August',
  ],
  ...pageSocialMeta({
    title,
    description,
    path: '/azadi-sale',
    image: '/freedom-deal-og.jpg',
    imageAlt: DEAL?.imageAlt || 'Freedom Deal — Farwa Beauty Salon',
  }),
}

export const revalidate = 86400

const FAQS = [
  {
    q: 'What is the Azadi sale at Farwa Beauty Salon?',
    a: 'From 5 to 14 August 2026, every service priced Rs 1,400 and above is 20% off at Farwa Beauty Salon in Block 3 PECHS, Karachi. The discount comes off our published price, which has been printed on farwasalon.com all year.',
  },
  {
    q: 'Which services are included in the 14 August offer?',
    a: 'Anything on the menu at Rs 1,400 or above — facials from Rs 1,400, deep cleansing, hair cut and colour from Rs 1,500, hair treatments from Rs 2,000, bridal packages, and semi-permanent brows. Services under Rs 1,400 such as basic threading stay at their normal printed rate. Party makeup and keratin are quoted individually.',
  },
  {
    q: 'How do I claim the Azaadi discount?',
    a: 'Nothing to claim — book any qualifying service between 5 and 14 August and the 20% comes off at the counter. Book online at farwasalon.com/book or WhatsApp +92 322 2782254.',
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

function qualifying() {
  const out = []
  for (const [cat, list] of Object.entries(SERVICES)) {
    const prices = list.map((s) => s.pricePkr).filter(Boolean)
    const min = prices.length ? Math.min(...prices) : null
    if (min !== null && min >= 1400) out.push({ cat, min })
  }
  return out.sort((a, b) => a.min - b.min)
}

export default function AzadiSalePage() {
  const live = getActiveDeals().some((d) => d.id === DEAL?.id)
  const upcoming = getUpcomingDeals().some((d) => d.id === DEAL?.id)
  const range = DEAL ? formatDealRange(DEAL) : ''
  const cats = qualifying()

  const offerSchema = DEAL && {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: 'Azadi Sale 2026 — Freedom Deal, 20% off',
    description: DEAL.description,
    url: `${SITE_ORIGIN}/azadi-sale`,
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

      <div className="section-shell section-pad min-h-0">
        <p className="eyebrow mb-4">
          — {live ? 'Live now' : upcoming ? 'Announced' : 'Independence Day'} · {range} 2026
        </p>
        <h1 className="display-section text-ink mb-5 max-w-3xl">
          Azadi Sale 2026 — 20% Off
        </h1>
        <p className="text-body md:text-lg max-w-2xl mb-4 leading-relaxed">
          Jashn-e-Azadi at Farwa Beauty Salon, Block 3 PECHS: <strong className="text-ink font-semibold">20% off every
          service Rs 1,400 and above</strong>, from 5 to 14 August 2026. Facials, hair, bridal,
          nails and brows all included.
        </p>
        <p className="text-stone text-sm font-['Inter'] font-light max-w-2xl mb-8 leading-relaxed">
          The discount comes off our printed price — the same rate published on this site all
          year, not one raised for the occasion. That is the whole point.
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-12">
          <Link href="/book" className="tap-safe btn-primary">
            Book your slot <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <a
            href="https://wa.me/923222782254?text=Azadi%20offer%20—%20I%20want%20to%20book"
            target="_blank"
            rel="noreferrer"
            className="tap-safe btn-secondary"
          >
            Ask on WhatsApp
          </a>
        </div>

        {DEAL?.image && (
          <Image
            src={DEAL.image}
            alt={DEAL.imageAlt}
            width={1000}
            height={1414}
            priority
            sizes="(max-width: 768px) 100vw, 460px"
            className="w-full max-w-[460px] h-auto border border-border-soft mb-14"
          />
        )}

        <section aria-labelledby="azadi-qualifying" className="mb-14">
          <h2 id="azadi-qualifying" className="font-['Syne'] font-semibold text-ink text-xl md:text-2xl mb-4">
            What qualifies
          </h2>
          <p className="text-body text-sm mb-5 max-w-2xl">
            Every speciality whose services start at Rs 1,400 or more is in. Individual services
            above Rs 1,400 inside other categories qualify too — check the{' '}
            <Link href="/prices" className="link-underline text-ink font-medium">full price list</Link>.
          </p>
          <ul className="border-t border-ink/25 max-w-2xl">
            {cats.map(({ cat, min }) => (
              <li
                key={cat}
                className="flex items-baseline justify-between gap-4 py-3 border-b border-border-soft"
              >
                <span className="font-['Syne'] font-semibold text-ink text-base sm:text-lg">{cat}</span>
                <span className="text-stone text-sm font-['Inter'] tabular-nums whitespace-nowrap">
                  from Rs {min.toLocaleString('en-PK')}
                </span>
              </li>
            ))}
          </ul>
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
