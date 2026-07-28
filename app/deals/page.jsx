import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getActiveDeals } from '../../src/deals-data.js'
import { pageSocialMeta } from '../../lib/page-metadata.js'
import JsonLd from '../json-ld'
import { SITE_ORIGIN, SALON_ID } from '../../lib/business-schema.js'

const title = 'Salon Deals Karachi — Real Offers, Real Prices | Farwa'
const description =
  'Current deals at Farwa Beauty Salon, PECHS Karachi — genuine offers with printed prices and honest validity dates. No fake urgency, no call-to-ask pricing.'

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/deals' },
  ...pageSocialMeta({
    title,
    description,
    path: '/deals',
    image: '/glow3.jpg',
    imageAlt: 'Salon deals at Farwa Beauty Salon PECHS Karachi',
  }),
}

// Render on demand daily so expired deals drop off without a redeploy.
export const revalidate = 86400

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

export default function DealsPage() {
  const deals = getActiveDeals()
  return (
    <main id="main" className="page-content">
      <JsonLd data={buildDealsSchema(deals)} />
      <div className="section-shell section-pad min-h-0">
        <p className="eyebrow mb-4">— Current offers</p>
        <h1 className="display-section text-ink mb-4 max-w-3xl">
          Salon Deals in Karachi
        </h1>
        <p className="text-body md:text-lg max-w-2xl mb-3 leading-relaxed">
          We do deals differently: few, real, and printed — with the same transparent
          PKR pricing as our <Link href="/prices" className="link-underline text-ink font-medium">full price list</Link>.
          If a deal is listed here, it is honoured at the counter, no conditions invented on arrival.
        </p>
        <p className="text-stone text-sm font-['Inter'] font-light max-w-2xl mb-10 leading-relaxed">
          No fake countdowns. When a deal has an end date, it is printed on the deal — and it really ends.
        </p>

        <div className="grid gap-6 max-w-3xl">
          {deals.map((d) => (
            <section key={d.id} className="panel-soft p-6 md:p-7 shadow-soft" aria-labelledby={`deal-${d.id}`}>
              <p className="text-[10px] tracking-[0.24em] uppercase font-['Inter'] text-accent-gold-deep mb-2">
                {d.category}{d.validUntil ? ` · ends ${d.validUntil}` : ' · ongoing welcome offer'}
              </p>
              <h2 id={`deal-${d.id}`} className="font-['Syne'] font-semibold text-ink text-xl md:text-2xl mb-2">
                {d.title}
              </h2>
              <p className="text-body text-sm mb-2 max-w-xl">{d.description}</p>
              <p className="text-stone text-[12px] font-['Inter'] mb-5">{d.priceNote}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/book" className="tap-safe btn-primary !py-2.5 !px-5">
                  Book online <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <Link href={d.href} className="tap-safe btn-secondary !py-2.5 !px-5">
                  See services
                </Link>
              </div>
            </section>
          ))}
        </div>

        <section className="mt-14 pt-10 border-t border-border-soft max-w-3xl">
          <h2 className="font-['Syne'] font-semibold text-ink text-lg md:text-xl mb-3">
            Why so few deals?
          </h2>
          <p className="text-body text-sm max-w-2xl mb-3">
            Most Karachi salon deals exist because the base prices are unlisted — the
            &ldquo;discount&rdquo; comes off a number you were never shown. Our starting prices are
            published for all 100+ services, so a deal here is a real reduction, not theatre.
            New offers are added for the wedding season and slow weekdays — check back monthly,
            or join the newsletter (footer) to hear first.
          </p>
          <Link href="/prices" className="link-underline text-ink text-sm font-medium">
            See the full price list →
          </Link>
        </section>
      </div>
    </main>
  )
}
