import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SERVICES, CAT_SLUGS, formatPrice, formatDuration, YEARS_ACTIVE } from '../../src/data.js'
import { pageSocialMeta } from '../../lib/page-metadata.js'
import JsonLd from '../json-ld'
import {
  buildFaqPageSchema,
  SALON_NAP,
  getAggregateRating,
} from '../../lib/business-schema.js'
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

const UPDATED = '24 July 2026'

export default function PricesPage() {
  const categories = Object.keys(SERVICES)
  const faqSchema = buildFaqPageSchema(PRICES_PAGE_FAQS)
  const rating = getAggregateRating()
  return (
    <main id="main" className="page-content">
      {faqSchema && <JsonLd data={faqSchema} />}
      <div className="section-shell section-pad min-h-0">
        <p className="eyebrow mb-3">— Salon price list Karachi · updated {UPDATED} · from Rs 100</p>
        <h1 className="display-section text-ink mb-3 max-w-3xl">
          Salon Price List Karachi 2026 — From Rs 100
        </h1>
        <p className="text-stone text-xs font-['Inter'] font-light max-w-3xl mb-4">
          {YEARS_ACTIVE}+ years · PECHS women-only studio · {rating.ratingValue}★ Google ({rating.reviewCount}+ reviews)
        </p>
        <p className="text-body md:text-lg max-w-2xl mb-3">
          Complete PECHS rate card — every service with a starting price in PKR. No hidden quotes.
          Your exact amount is confirmed before your appointment, never after.
        </p>
        <p className="text-stone text-sm font-['Inter'] font-light max-w-2xl mb-5">
          Published starting prices in PKR. Not a tax invoice — GST/sales tax is not added on these
          listed rates. Longer hair, larger areas, or add-ons can adjust a quote; we confirm before starting.
        </p>

        <div className="cta-cluster mb-5">
          <Link href="/book" className="tap-safe btn-primary w-full sm:w-auto justify-center">
            Book online <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <a href="https://wa.me/923222782254" target="_blank" rel="noreferrer"
            className="tap-safe btn-secondary w-full sm:w-auto justify-center">
            Ask on WhatsApp
          </a>
        </div>
        <p className="text-stone text-xs font-['Inter'] font-light max-w-2xl mb-2">
          Payments: cash, JazzCash, EasyPaisa · Hours: Mon–Sat 11–7 (closed Sunday)
        </p>
        <p className="text-stone text-xs font-['Inter'] font-light max-w-2xl mb-8">{SALON_NAP}</p>

        <nav aria-label="Price list categories" className="mb-10 max-w-4xl">
          <p className="text-[11px] tracking-[0.14em] uppercase font-['Inter'] text-stone mb-2">Jump to category</p>
          <ul className="tab-scroller text-sm font-['Inter'] pb-1">
            {categories.map((cat) => (
              <li key={cat}>
                <a
                  href={`#prices-${CAT_SLUGS[cat]}`}
                  className="tap-safe tab-pill inline-flex items-center"
                >
                  {cat === 'Eyebrow Tattoo' ? 'Microblading' : cat}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-stone text-sm font-light">
            How to read a rate list:{' '}
            <Link href="/blog/salon-price-list-karachi-2026" className="link-underline hover:text-ink text-ink font-medium">
              Salon Price List Karachi 2026 guide
            </Link>
          </p>
        </nav>

        <section className="mb-12 panel-soft p-5 md:p-6 shadow-soft max-w-3xl" aria-labelledby="prices-bridal-strip">
          <h2 id="prices-bridal-strip" className="font-['Syne'] font-semibold text-ink text-lg mb-2">
            Bridal packages
          </h2>
          <p className="text-body text-sm mb-3">
            Bridal Trial Rs 8,000 · Mehndi Rs 10,000 · Engagement Rs 12,000 · Full Bridal Package Rs 25,000 —
            inclusions and event mapping on the bridal page.
          </p>
          <Link href="/bridal" className="btn-secondary !py-2 !px-4">
            Bridal makeup packages <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </section>

        <div className="grid gap-12 md:gap-14">
          {categories.map((cat) => (
            <section key={cat} aria-labelledby={`prices-${CAT_SLUGS[cat]}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/30 pb-2.5 mb-1">
                <h2 id={`prices-${CAT_SLUGS[cat]}`} className="font-['Syne'] font-semibold text-ink text-xl md:text-2xl">
                  {cat}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <Link
                    href={`/book?category=${encodeURIComponent(cat)}`}
                    className="tap-safe inline-flex min-h-[44px] items-center text-[11px] tracking-[0.14em] uppercase font-['Inter'] font-semibold text-ink hover:text-stone transition-colors"
                  >
                    Book {cat === 'Eyebrow Tattoo' ? 'brows' : cat}
                  </Link>
                  <Link href={`/services/${CAT_SLUGS[cat]}`}
                    className="tap-safe inline-flex min-h-[44px] items-center text-[11px] tracking-[0.14em] uppercase font-['Inter'] text-stone hover:text-ink transition-colors">
                    About →
                  </Link>
                </div>
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

        <section className="mt-14 panel-soft p-6 md:p-8 shadow-soft max-w-3xl" aria-labelledby="prices-book-cta">
          <h2 id="prices-book-cta" className="font-['Syne'] font-semibold text-ink text-lg md:text-xl mb-2">
            Ready to book?
          </h2>
          <p className="text-body text-sm mb-5 max-w-xl">
            Pick a service online — real-time slots, printed PKR rates, confirmation on the spot.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/book" className="tap-safe btn-primary">
              Book online <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <a href="https://wa.me/923222782254" target="_blank" rel="noreferrer"
              className="tap-safe btn-secondary">
              Ask on WhatsApp
            </a>
          </div>
        </section>

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
          All prices in Pakistani Rupees (Rs). Cash, JazzCash and EasyPaisa accepted at the salon.
          Listed rates are starting prices, not a tax invoice.
        </p>
        <p className="mt-6 pt-6 border-t border-border-soft text-xs text-stone font-['Inter'] flex flex-wrap gap-x-3 gap-y-2">
          <Link href="/book" className="link-underline hover:text-ink font-medium">Book online</Link>
          <Link href="/bridal" className="link-underline hover:text-ink font-medium">Bridal makeup</Link>
          <Link href="/blog/manicure-pedicure-price-list-karachi" className="link-underline hover:text-ink font-medium">Nails price guide</Link>
          <Link href="/blog/face-bleach-karachi-loreal" className="link-underline hover:text-ink font-medium">Face bleach</Link>
          <Link href="/blog/full-body-massage-karachi-women-salon" className="link-underline hover:text-ink font-medium">Massage</Link>
          <Link href="/blog/haircut-blowdry-hair-colour-cost-karachi" className="link-underline hover:text-ink font-medium">Haircut &amp; colour</Link>
          <Link href="/beauty-salon-karachi" className="link-underline hover:text-ink font-medium">Beauty salon Karachi</Link>
        </p>
      </div>
    </main>
  )
}
