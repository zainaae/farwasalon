import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { DEALS } from '../../src/deals-data.js'
import { pageSocialMeta } from '../../lib/page-metadata.js'
import JsonLd from '../json-ld'
import WaCta from '../components/wa-cta'
import { SITE_ORIGIN, SALON_ID, buildFaqPageSchema } from '../../lib/business-schema.js'

const DEAL = DEALS.find((d) => d.id === 'freedom-deal-2026')

/* Pakistani users search this offer in several spellings — azadi, azaadi,
   jashn-e-azadi, "14 august sale", "independence day offer". They are the same
   intent, so they get one page rather than five thin ones. The page is branded
   "Freedom Deal" to match the poster customers receive, while azadi / azaadi /
   "14 august sale" stay in the title, description and keywords because those
   are the words people actually search. */
const title = 'Freedom Deal — Azadi Sale 2026 | 14% Off, 14 August, Farwa Karachi'
const description =
  'Azadi sale / Independence Day deal in PECHS Karachi: 14% off when your visit totals Rs 1,400 or more, 5–14 August 2026. Combine any services — threading, facials, hair, nails, bridal.'

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
    a: 'From 5 to 14 August 2026, any visit totalling Rs 1,400 or more gets 14% off at Farwa Beauty Salon in Block 3 PECHS, Karachi. You can reach the total with one service or several combined. The discount comes off our published prices, which have been printed on farwasalon.com all year.',
  },
  {
    q: 'Which services are included in the 14 August offer?',
    a: 'Everything on the menu counts toward the total — threading, waxing, facials, cleansing, hair, nails, massage, brows and bridal. Nothing is excluded from qualifying; you simply need the visit to add up to Rs 1,400 or more. Party makeup and keratin are quoted individually, so ask on WhatsApp how they apply.',
  },
  {
    q: 'How do I claim the Azaadi discount?',
    a: 'Nothing to claim — book between 5 and 14 August and if your services total Rs 1,400 or more, the 14% comes off at the counter. Book online at farwasalon.com/book or WhatsApp +92 322 2782254.',
  },
  {
    q: 'Can I combine services to reach Rs 1,400?',
    a: 'Yes — that is the point. Add the services you want to one booking; if the total reaches Rs 1,400 or more, the 14% applies to the visit. It does not matter whether that is one treatment or several small ones.',
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

  const offerSchema = DEAL && {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: 'Freedom Deal 2026 — Azadi offer, 14% off',
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
      {/* Poster-led. The artwork is real, human-made and culturally specific —
          it outranks anything generated, so it carries the fold and the words
          annotate it. No eyebrow, no repeated date block: the dates are on the
          poster and stated once in the copy. */}
      <section className="azadi-hero">
        <div className="section-shell py-10 md:py-16">
          <div className="grid gap-8 md:gap-14 md:grid-cols-[0.95fr_1.05fr] items-center">
            {DEAL?.image && (
              <div className="azadi-mat mx-auto md:mx-0">
              <Image
                src={DEAL.image}
                alt={DEAL.imageAlt}
                width={1000}
                height={1414}
                priority
                sizes="(max-width: 768px) 82vw, 460px"
                className="azadi-in w-full h-auto"
                style={{ '--i': 0 }}
              />
              </div>
            )}

            <div className="min-w-0">
              <h1 className="azadi-display azadi-in mb-5" style={{ '--i': 1 }}>
                14% off.<br />No asterisk.
              </h1>

              <p className="azadi-in text-[color:var(--azadi-deep)]/85 text-base md:text-lg font-['Inter'] font-light leading-relaxed max-w-lg mb-4" style={{ '--i': 2 }}>
                Once your visit reaches Rs 1,400, the whole bill is 14% less — 5 to 14
                August. Not &ldquo;up to&rdquo; 14%. Not a package someone else chose for you.
                Book what you actually came in for.
              </p>

              <p className="azadi-in text-[color:var(--azadi-deep)]/65 text-sm font-['Inter'] font-light max-w-lg mb-8" style={{ '--i': 3 }}>
                Our rates have been printed on this website since January. We didn&rsquo;t raise
                them in July to discount them in August — scroll the{' '}
                <Link href="/prices" className="underline underline-offset-2 hover:no-underline">price list</Link>{' '}
                and check.
              </p>

              <div className="azadi-in flex flex-wrap items-center gap-3" style={{ '--i': 4 }}>
                <Link href="/book" className="tap-safe azadi-btn">
                  Book your slot <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
                <WaCta
                  href="https://wa.me/923222782254?text=Freedom%20Deal%20—%20I%20want%20to%20book"
                  from="freedom-deal-hero"
                  className="tap-safe azadi-btn azadi-btn--ghost"
                >
                  Ask on WhatsApp
                </WaCta>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-shell section-pad min-h-0">
        <section aria-labelledby="azadi-qualifying" className="mb-14">
          <h2 id="azadi-qualifying" className="font-['Syne'] font-semibold text-ink text-xl md:text-2xl mb-4">
            How it works
          </h2>
          <p className="text-body text-sm md:text-[15px] mb-4 max-w-2xl leading-relaxed">
            The Rs 1,400 is the total for your visit — not something one service has to cost on
            its own. Come in for a cleansing and add a threading, or a manicure and a massage;
            once the bill reaches Rs 1,400, the 14% applies to all of it. Nothing on the menu is
            left out.
          </p>
          <p className="text-body text-sm md:text-[15px] mb-5 max-w-2xl leading-relaxed">
            Most salons run Azadi offers as a fixed package — one facial, one mani-pedi, one
            price, take it or leave it. We would rather you booked what you actually wanted.
            Everything, with its price, is on the{' '}
            <Link href="/prices" className="link-underline text-ink font-medium">price list</Link>.
          </p>
          <p className="text-stone text-[13px] font-['Inter'] font-light max-w-2xl">
            Not sure whether your booking gets there?{' '}
            <WaCta
              href="https://wa.me/923222782254?text=Freedom%20Deal%20—%20does%20my%20booking%20qualify%3F"
              from="freedom-deal-qualify"
              className="link-underline text-ink font-medium"
            >
              Message us
            </WaCta>{' '}
            and we will add it up for you before you come.
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
