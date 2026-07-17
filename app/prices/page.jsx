import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SERVICES, CAT_SLUGS, formatPrice, formatDuration } from '../../src/data.js'
import { pageSocialMeta } from '../../lib/page-metadata.js'
import JsonLd from '../json-ld'
import { buildFaqPageSchema } from '../../lib/business-schema.js'
import { PRICES_PAGE_FAQS } from '../../src/faq-data.js'

const title = 'Salon Price List Karachi 2026 — From Rs 100 | Farwa'
const description =
  'Full published price list — PECHS Karachi. Threading from Rs 100, facials from Rs 1,400, bridal from Rs 8,000. Every rate on the page. No hidden charges.'

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/prices' },
  ...pageSocialMeta({
    title,
    description,
    path: '/prices',
    image: '/glow3.jpg',
    imageAlt: 'Published salon price list — Farwa Beauty Salon PECHS Karachi',
  }),
}

const UPDATED = '17 July 2026'

export default function PricesPage() {
  const categories = Object.keys(SERVICES)
  const faqSchema = buildFaqPageSchema(PRICES_PAGE_FAQS)
  return (
    <main id="main" className="page-content">
      {faqSchema && <JsonLd data={faqSchema} />}
      <div className="section-shell section-pad min-h-0">
        <p className="eyebrow mb-4">— Rate list · updated {UPDATED} · from Rs 100</p>
        <h1 className="display-section text-ink mb-5 max-w-3xl">
          Salon Price List in Karachi
        </h1>
        <p className="text-body md:text-lg max-w-2xl mb-4">
          Most salons in Karachi make you call to ask. This is our complete PECHS rate list —
          every service, every price, in PKR, published from Rs 100. Your exact quote is confirmed
          before your appointment, never after.
        </p>
        <p className="text-stone text-sm font-['Inter'] font-light max-w-2xl mb-8">
          New here? Join the newsletter at the bottom of any page for 10% off your first facial.
        </p>
        <div className="flex flex-wrap items-center gap-3 mb-12">
          <Link href="/book" className="tap-safe btn-primary !py-2.5 !px-5">
            Book online <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <a href="https://wa.me/923222782254" target="_blank" rel="noreferrer"
            className="tap-safe btn-secondary !py-2.5 !px-5">
            Ask on WhatsApp
          </a>
        </div>

        <div className="grid gap-12 md:gap-14">
          {categories.map((cat) => (
            <section key={cat} aria-labelledby={`prices-${CAT_SLUGS[cat]}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/30 pb-2.5 mb-1">
                <h2 id={`prices-${CAT_SLUGS[cat]}`} className="font-['Syne'] font-semibold text-ink text-xl md:text-2xl">
                  {cat}
                </h2>
                <Link href={`/services/${CAT_SLUGS[cat]}`}
                  className="text-[11px] tracking-[0.14em] uppercase font-['Inter'] text-stone hover:text-ink transition-colors">
                  About {cat} →
                </Link>
              </div>
              <table className="w-full border-collapse">
                <caption className="sr-only">{cat} prices at Farwa Beauty Salon, PECHS Karachi</caption>
                <thead className="sr-only">
                  <tr><th scope="col">Service</th><th scope="col">Duration</th><th scope="col">Price</th></tr>
                </thead>
                <tbody>
                  {SERVICES[cat].map((s) => (
                    <tr key={s.id} className="border-b border-border-soft">
                      <td className="py-2.5 pr-3 text-ink text-[14px] sm:text-[15px] font-['Inter'] font-light">{s.name}</td>
                      <td className="py-2.5 pr-3 text-right text-stone/80 text-[12px] font-['Inter'] whitespace-nowrap hidden sm:table-cell">
                        {s.durationMinutes ? formatDuration(s.durationMinutes) : ''}
                      </td>
                      <td className="py-2.5 text-right font-['Unbounded'] font-bold text-ink text-[13px] sm:text-sm whitespace-nowrap">
                        {formatPrice(s.pricePkr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>

        <section className="mt-14 pt-10 border-t border-border-soft" aria-labelledby="prices-faq-heading">
          <h2 id="prices-faq-heading" className="font-['Syne'] font-semibold text-ink text-xl md:text-2xl mb-6">
            Price questions
          </h2>
          <dl className="space-y-5 max-w-3xl">
            {PRICES_PAGE_FAQS.map((f) => (
              <div key={f.q}>
                <dt className="font-['Syne'] font-bold text-sm text-ink">{f.q}</dt>
                <dd className="mt-1.5 text-body text-sm">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="mt-10 text-[11px] tracking-[0.14em] uppercase font-['Inter'] text-stone/80 max-w-2xl">
          All prices in Pakistani Rupees. Cash, JazzCash and EasyPaisa accepted at the salon.
          Longer hair, larger areas or add-ons can adjust a quote — always confirmed with you first.
        </p>
        <p className="mt-6 pt-6 border-t border-border-soft text-xs text-stone font-['Inter'] flex flex-wrap gap-x-3 gap-y-2">
          <Link href="/book" className="link-underline hover:text-ink font-medium">Book online</Link>
          <Link href="/bridal" className="link-underline hover:text-ink font-medium">Bridal makeup</Link>
          <Link href="/services/threading" className="link-underline hover:text-ink font-medium">Threading</Link>
          <Link href="/services/facials" className="link-underline hover:text-ink font-medium">Facials</Link>
          <Link href="/services/eyebrow-tattoo" className="link-underline hover:text-ink font-medium">Microblading</Link>
          <Link href="/beauty-salon-karachi" className="link-underline hover:text-ink font-medium">Beauty salon Karachi</Link>
        </p>
      </div>
    </main>
  )
}
