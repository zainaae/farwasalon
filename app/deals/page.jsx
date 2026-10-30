import Link from 'next/link'
import ArrowUpRight from '../components/icon-sprite.jsx'
import Image from 'next/image'
import { connection } from 'next/server'
import WaCta from '../components/wa-cta.jsx'
import PageCloseCta from '../components/page-close-cta.jsx'
import { getActiveDeals, getUpcomingDeals, getHeadlineDeal, isDealActive, formatDealRange } from '../../src/deals-data.js'
import { pageSocialMeta } from '../../lib/page-metadata.js'
import JsonLd from '../json-ld'
import { SITE_ORIGIN, SALON_ID } from '../../lib/business-schema.js'
import { WA_DEFAULT } from '../../src/data.js'

const LIVE_TITLE = 'Salon Deals Karachi — Current Offers | Farwa'
const LIVE_DESCRIPTION =
  'Current deals at Farwa Beauty Salon, PECHS Karachi — genuine offers with printed prices and honest validity dates. No fake urgency, no call-to-ask pricing.'

const EMPTY_TITLE = 'Salon Deals Karachi — Check Back Soon | Farwa'
const EMPTY_DESCRIPTION =
  'No active percentage sale at Farwa Beauty Salon right now. Printed rates on the price list still apply — we only list deals we can honour at the counter.'

export async function generateMetadata() {
  await connection()
  const hasOffers = getActiveDeals().length > 0 || getUpcomingDeals().length > 0
  const title = hasOffers ? LIVE_TITLE : EMPTY_TITLE
  const description = hasOffers ? LIVE_DESCRIPTION : EMPTY_DESCRIPTION
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: '/deals' },
    ...(hasOffers ? {} : { robots: { index: false, follow: true } }),
    ...pageSocialMeta({
      title,
      description,
      path: '/deals',
      imageAlt: 'Salon deals at Farwa Beauty Salon, PECHS Karachi',
    }),
  }
}

/* Request-time so empty-state noindex and expired deals cannot bake into a
   multi-day prerender the way Freedom Deal did on /. */
export const dynamic = 'force-dynamic'

function buildDealsSchema(deals) {
  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'Current deals — Farwa Beauty Salon, PECHS Karachi',
    url: `${SITE_ORIGIN}/deals`,
    itemListElement: deals.map((d) => ({
      '@type': 'Offer',
      name: d.title,
      description: d.description,
      url: `${SITE_ORIGIN}${d.href}`,
      offeredBy: { '@id': SALON_ID },
      ...(d.validFrom ? { validFrom: d.validFrom } : {}),
      ...(d.validUntil ? { validThrough: d.validUntil } : {}),
    })),
  }
}

export default async function DealsPage() {
  await connection()
  const live = getActiveDeals()
  const upcoming = getUpcomingDeals()
  const deals = [...upcoming, ...live]
  const headline = getHeadlineDeal()
  const headlineLive = headline ? isDealActive(headline) : false
  return (
    <main id="main" className="page-content">
      {deals.length > 0 ? <JsonLd data={buildDealsSchema(deals)} /> : null}
      <div className="section-shell pt-14 md:pt-[4.5rem] pb-10 md:pb-12 min-h-0">
        <div className="title-stack mb-3 max-w-3xl border-l-2 border-plum pl-5 lg:pl-6">
          <p className="eyebrow text-plum">— {deals.length ? 'Current offers' : 'Offers'}</p>
          <h1 className="display-page text-ink">
            {deals.length ? 'Salon deals in Karachi' : 'No active deals right now'}
          </h1>
          <p className="text-body md:text-lg leading-relaxed">
            {deals.length ? (
              <>
                We do deals differently: few, real, and printed — with the same transparent
                PKR pricing as our <Link href="/prices" className="link-underline text-ink font-medium">full price list</Link>.
                If a deal is listed here, it is honoured at the counter, no conditions invented on arrival.
              </>
            ) : (
              <>
                When we run a real offer, it appears here with dates — not as a code in your inbox.
                Until then, every starting price stays on the{' '}
                <Link href="/prices" className="link-underline text-ink font-medium">printed price list</Link>.
              </>
            )}
          </p>
        </div>
        <p className="text-stone text-sm font-[family-name:var(--font-inter)] font-light max-w-2xl mb-6 leading-relaxed">
          No fake countdowns. When a deal has an end date, it is printed on the deal — and it really ends.
          No promo codes by email — if nothing is listed, the printed price list is the price.
        </p>
        <div className="cta-cluster mb-10">
          <span className="hidden md:contents">
            <Link href="/book" className="tap-safe btn-loud w-full sm:w-auto justify-center !min-h-12 !text-[12px]">
              Book online <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </span>
          <Link
            href="/book"
            className="tap-safe md:hidden inline-flex items-center gap-1.5 min-h-[44px] text-ink text-[11px] tracking-[0.14em] uppercase font-semibold font-[family-name:var(--font-inter)] link-underline"
          >
            Book online <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <span className="hidden md:contents">
            <WaCta
              href={WA_DEFAULT}
              from="deals-hero"
              className="tap-safe btn-secondary w-full sm:w-auto justify-center"
            >
              WhatsApp
            </WaCta>
          </span>
        </div>

        {deals.length === 0 ? (
          <div className="panel-soft p-6 md:p-8 max-w-3xl mb-4">
            <p className="font-[family-name:var(--font-syne)] font-semibold text-ink text-lg mb-2">
              Check back when we announce one
            </p>
            <p className="text-body text-sm max-w-xl mb-5">
              Every starting price stays published on the site. Seasonal offers appear here with an
              end date when they are real — never as theatre off an unlisted base rate.
            </p>
            <Link href="/prices" className="tap-safe btn-primary !py-2.5 !px-5 inline-flex items-center gap-2">
              See the price list <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
        <div className="grid gap-6 max-w-3xl">
          {deals.map((d) => {
            const primaryHref = '/book'
            const primaryLabel = headlineLive && d.id === headline?.id ? 'See the offer' : 'Book online'
            return (
            <section key={d.id} className="panel-soft p-6 md:p-7 shadow-soft" aria-labelledby={`deal-${d.id}`}>
              <p className="text-[10px] tracking-[0.24em] uppercase font-[family-name:var(--font-inter)] text-accent-gold-deep mb-2">
                {upcoming.some((u) => u.id === d.id) ? `Starts ${formatDealRange(d)}` : d.category}
                {d.validUntil ? ` · ${formatDealRange(d)}` : ''}
              </p>
              <h2 id={`deal-${d.id}`} className="font-[family-name:var(--font-syne)] font-semibold text-ink text-xl md:text-2xl mb-2">
                {d.title}
              </h2>
              {d.image && (
                <Image
                  src={d.image}
                  alt={d.imageAlt || d.title}
                  width={1000}
                  height={1414}
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="w-full max-w-[420px] h-auto border border-border-soft mb-5"
                />
              )}
              <p className="text-body text-sm mb-2 max-w-xl">{d.description}</p>
              <p className="text-stone text-[12px] font-[family-name:var(--font-inter)] mb-5">{d.priceNote}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href={primaryHref} className="tap-safe btn-primary !py-2.5 !px-5">
                  {primaryLabel} <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <Link href={d.href} className="tap-safe btn-secondary !py-2.5 !px-5">
                  See services
                </Link>
              </div>
            </section>
            )
          })}
        </div>
        )}

        <section className="mt-14 pt-10 border-t border-border-soft max-w-3xl">
          <h2 className="font-[family-name:var(--font-syne)] font-semibold text-ink text-lg md:text-xl mb-3">
            Why so few deals?
          </h2>
          <p className="text-body text-sm max-w-2xl mb-3">
            Most Karachi salon deals exist because the base prices are unlisted — the
            &ldquo;discount&rdquo; comes off a number you were never shown. Our starting prices are
            published for all 102 services, so a deal here is a real reduction, not theatre.
            New offers are added for the wedding season and slow weekdays — check back monthly,
            or follow us on Instagram for new announcements.
          </p>
          <Link href="/prices" className="link-underline text-ink text-sm font-medium">
            See the full price list →
          </Link>
        </section>
      </div>

      <PageCloseCta
        eyebrow="— Ready when you are"
        title="Book online in under a minute"
        body="Printed prices, live slots, no prepayment. Or WhatsApp if you prefer."
        waHref={WA_DEFAULT}
        waFrom="deals-close"
      />
    </main>
  )
}
