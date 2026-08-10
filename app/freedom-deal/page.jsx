import Link from 'next/link'
import ArrowUpRight from '../components/icon-sprite.jsx'
import Image from 'next/image'
import { DEALS, isDealActive, isDealUpcoming, isDealEnded, formatDealRange } from '../../src/deals-data.js'
import { pageSocialMeta } from '../../lib/page-metadata.js'
import JsonLd from '../json-ld'
import WaCta from '../components/wa-cta'
import PageCloseCta from '../components/page-close-cta.jsx'
import { SITE_ORIGIN, SALON_ID, buildFaqPageSchema } from '../../lib/business-schema.js'
import { SITE_LAUNCH } from '../../lib/sitemap-data.js'

const LAUNCH_MONTH = new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(
  new Date(`${SITE_LAUNCH}T00:00:00Z`),
)

const DEAL = DEALS.find((d) => d.id === 'freedom-deal-2026')

/* Pakistani users search this offer in several spellings — azadi, azaadi,
   jashn-e-azadi, "14 august sale", "independence day offer". They are the same
   intent, so they get one page rather than five thin ones. The page is branded
   "Freedom Deal" to match the poster customers receive, while azadi / azaadi /
   "14 august sale" stay in the title, description and keywords because those
   are the words people actually search — but only while the window is live.
   After 14 Aug, generateMetadata drops the aggressive 14% sale framing so
   crawlers stop treating an ended campaign as a current offer. */
const LIVE_TITLE = 'Freedom Deal — Azadi Sale 2026 | 14% Off, 14 August, Farwa Karachi'
const LIVE_DESCRIPTION =
  'Azadi sale / Independence Day deal in PECHS Karachi: 14% off when your visit totals Rs 1,400 or more, 5–14 August 2026. Combine any services — threading, facials, hair, nails, bridal.'
const ENDED_TITLE = 'Freedom Deal — Offer Ended | Farwa Beauty Salon Karachi'
const ENDED_DESCRIPTION =
  'The Freedom Deal (5–14 August 2026) has ended. Printed rates apply again — see current deals or the full price list at Farwa Beauty Salon, PECHS Karachi.'

export async function generateMetadata() {
  const ended = isDealEnded(DEAL)
  if (ended) {
    return {
      title: { absolute: ENDED_TITLE },
      description: ENDED_DESCRIPTION,
      alternates: { canonical: '/freedom-deal' },
      ...pageSocialMeta({
        title: ENDED_TITLE,
        description: ENDED_DESCRIPTION,
        path: '/freedom-deal',
        imageAlt: 'Farwa Beauty Salon — PECHS Karachi',
      }),
    }
  }
  return {
    title: { absolute: LIVE_TITLE },
    description: LIVE_DESCRIPTION,
    alternates: { canonical: '/freedom-deal' },
    keywords: [
      'azadi sale', 'azaadi sale', 'azadi offer Karachi', 'jashn e azadi sale',
      '14 august sale', '14 august offer', 'independence day sale Karachi',
      'independence day salon offer', 'freedom deal', 'salon sale Karachi August',
    ],
    ...pageSocialMeta({
      title: LIVE_TITLE,
      description: LIVE_DESCRIPTION,
      path: '/freedom-deal',
      image: '/freedom-deal-og-14pc.jpg',
      imageAlt: DEAL?.imageAlt || 'Freedom Deal — Farwa Beauty Salon',
    }),
  }
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
    a: 'Yes — that is the point. Combine anything on the menu: threading with a cleansing, a manicure with a massage, whatever you want. On farwasalon.com/book, select multiple services in one booking and watch the running total toward Rs 1,400. WhatsApp +92 322 2782254 works too if you prefer.',
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
  const ended = isDealEnded(DEAL)
  const upcoming = isDealUpcoming(DEAL)
  const live = isDealActive(DEAL)
  const range = DEAL ? formatDealRange(DEAL) : '5–14 August'

  if (ended) {
    return (
      <main id="main" className="page-content">
        <div className="section-shell section-pad min-h-0 max-w-2xl">
          <div className="title-stack mb-8 border-l-2 border-plum pl-5 lg:pl-6">
            <p className="eyebrow text-plum">— Freedom Deal</p>
            <h1 className="display-page text-ink">This offer has ended</h1>
            <p className="text-body md:text-lg leading-relaxed">
              The Freedom Deal ({range} 2026) is over. Printed rates on the price list apply again —
              book online or WhatsApp when you are ready.
            </p>
          </div>
          <div className="cta-cluster mb-10">
            <Link href="/book" className="tap-safe btn-primary">
              Book online <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
            <Link href="/prices" className="tap-safe btn-secondary">Price list</Link>
            <Link href="/deals" className="tap-safe link-underline text-ink text-sm font-medium">Current deals</Link>
          </div>
        </div>
        <PageCloseCta
          eyebrow="— Offer ended · PECHS"
          title="Book at printed rates"
          body="The Freedom Deal window is closed. Live slots online, or WhatsApp when you are ready."
          waFrom="freedom-deal-ended"
        />
      </main>
    )
  }

  /* validFrom / validThrough keep the window honest for search; we still show
     the campaign page before the 5th with one calm timing line, not a soft-launch lecture. */
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
          annotate it. Timing lives in one calm eyebrow when upcoming; the H1
          stays the campaign line. */}
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
              <p
                className="azadi-in text-[10px] md:text-[11px] tracking-[0.24em] uppercase font-semibold font-[family-name:var(--font-inter)] text-[color:var(--azadi-green)] mb-3"
                style={{ '--i': 1 }}
              >
                {live ? `Now on · ${range}` : upcoming ? `Starts 5 August · ${range}` : range}
              </p>
              <h1 className="azadi-display azadi-in mb-5" style={{ '--i': 2 }}>
                14% off.<br />No asterisk.
              </h1>

              <p
                className="azadi-in text-[color:var(--azadi-deep)]/75 text-sm md:text-base font-[family-name:var(--font-inter)] font-medium leading-snug max-w-lg mb-4"
                style={{ '--i': 3 }}
              >
                Freedom Deal — Azadi / Independence Day salon offer in PECHS, Karachi
                (5–14 August 2026).
              </p>

              <p className="azadi-in text-[color:var(--azadi-deep)]/85 text-base md:text-lg font-[family-name:var(--font-inter)] font-light leading-relaxed max-w-lg mb-4" style={{ '--i': 4 }}>
                Once your visit reaches Rs 1,400, the whole bill is 14% less — 5 to 14
                August. Not &ldquo;up to&rdquo; 14%. Not a package someone else chose for you.
                Book what you actually came in for.
              </p>

              <p className="azadi-in text-[color:var(--azadi-deep)]/65 text-sm font-[family-name:var(--font-inter)] font-light max-w-lg mb-8" style={{ '--i': 5 }}>
                Our rates have been printed on this website since {LAUNCH_MONTH} — the day we
                launched. We didn&rsquo;t raise them in July to discount them in August — scroll the{' '}
                <Link href="/prices" className="underline underline-offset-2 hover:no-underline">price list</Link>{' '}
                and check.
              </p>

              <div className="azadi-in flex flex-wrap items-center gap-3" style={{ '--i': 6 }}>
                <Link href="/book" className="tap-safe azadi-btn">
                  Build your combo online <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
                <WaCta
                  href="https://wa.me/923222782254?text=Freedom%20Deal%20—%20help%20me%20build%20a%20Rs%201%2C400%20combo"
                  from="freedom-deal-hero"
                  className="tap-safe azadi-btn azadi-btn--ghost"
                >
                  Or WhatsApp us
                </WaCta>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-shell pt-14 md:pt-[4.5rem] pb-10 md:pb-12 min-h-0">
        <section aria-labelledby="azadi-qualifying" className="mb-14">
          <h2 id="azadi-qualifying" className="font-[family-name:var(--font-syne)] font-semibold text-ink text-xl md:text-2xl mb-4">
            How it works
          </h2>
          <p className="text-body text-sm md:text-[15px] mb-4 max-w-2xl leading-relaxed">
            The Rs 1,400 is the total for your visit — not something one service has to cost on
            its own. On farwasalon.com/book, select several services and watch the running total.
            Once the bill reaches Rs 1,400, the 14% applies to all of it at the counter. Nothing on
            the menu is left out.
          </p>
          <p className="text-body text-sm md:text-[15px] mb-5 max-w-2xl leading-relaxed">
            Most salons run Azadi offers as a fixed package — one facial, one mani-pedi, one
            price, take it or leave it. We would rather you booked what you actually wanted.
            Everything, with its price, is on the{' '}
            <Link href="/prices" className="link-underline text-ink font-medium">price list</Link>.
          </p>
          <p className="text-stone text-[13px] font-[family-name:var(--font-inter)] font-light max-w-2xl">
            Want help building a Rs 1,400 combo?{' '}
            <WaCta
              href="https://wa.me/923222782254?text=Freedom%20Deal%20—%20help%20me%20build%20a%20Rs%201%2C400%20combo"
              from="freedom-deal-qualify"
              className="link-underline text-ink font-medium"
            >
              WhatsApp us your list
            </WaCta>
            {' '}— we will add it up and book the visit before you come.
          </p>
        </section>

        <section aria-labelledby="azadi-faq" className="mb-12">
          <h2 id="azadi-faq" className="font-[family-name:var(--font-syne)] font-semibold text-ink text-xl md:text-2xl mb-6">
            Azadi offer — questions
          </h2>
          <dl className="space-y-5 max-w-3xl">
            {FAQS.map((f) => (
              <div key={f.q}>
                <dt className="font-[family-name:var(--font-syne)] font-bold text-sm text-ink">{f.q}</dt>
                <dd className="mt-1.5 text-body text-sm">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="text-xs text-stone font-[family-name:var(--font-inter)] flex flex-wrap gap-x-3 gap-y-2 mb-4">
          <Link href="/deals" className="link-underline hover:text-ink font-medium">All current deals</Link>
          <Link href="/prices" className="link-underline hover:text-ink font-medium">Full price list</Link>
          <Link href="/services/facials" className="link-underline hover:text-ink font-medium">Facials</Link>
          <Link href="/bridal" className="link-underline hover:text-ink font-medium">Bridal packages</Link>
          <Link href="/book" className="link-underline hover:text-ink font-medium">Book online</Link>
        </p>
      </div>

      <PageCloseCta
        eyebrow="— Freedom Deal · PECHS"
        title="Build your combo online"
        body="Once your visit hits Rs 1,400, 14% comes off at the counter. Book a live slot, or WhatsApp a combo list."
        waHref="https://wa.me/923222782254?text=Freedom%20Deal%20—%20help%20me%20build%20a%20Rs%201%2C400%20combo"
        waFrom="freedom-deal-close"
        waLabel="WhatsApp a combo"
      />
    </main>
  )
}
