import Link from 'next/link'
import WaCta from '../components/wa-cta.jsx'
import { ArrowUpRight } from 'lucide-react'
import { SERVICES, CAT_SLUGS, formatServicePrice, formatDuration, YEARS_ACTIVE } from '../../src/data.js'
import { pageSocialMeta } from '../../lib/page-metadata.js'
import { LAST_SERVICE_UPDATE } from '../../lib/sitemap-data.js'
import JsonLd from '../json-ld'
import {
  buildFaqPageSchema,
  getAggregateRating,
  SERVICE_BOUNDARIES,
} from '../../lib/business-schema.js'
import { buildPriceListSchema, getMenuStats } from '../../lib/service-schema.js'
import { PRICES_PAGE_FAQS } from '../../src/faq-data.js'
import QuoteBuilder from './quote-builder'
import DealBanner from '../components/deal-banner'

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

const UPDATED = formatListDate(LAST_SERVICE_UPDATE)

/* The "updated" eyebrow must agree with the sitemap <lastmod> for the menu.
   Both read LAST_SERVICE_UPDATE, so a menu edit bumps one constant and both
   surfaces follow — the page cannot claim a fresher date than the sitemap
   does, or vice versa. */
function formatListDate(ymd) {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(y, m - 1, d))
}

export default function PricesPage() {
  const categories = Object.keys(SERVICES)
  const faqSchema = buildFaqPageSchema(PRICES_PAGE_FAQS)
  const rating = getAggregateRating()
  /* Counted from SERVICES at build time, never typed. The claim and the table
     below it are the same list, so the claim cannot go stale while the list
     grows — which is exactly how "102" got out of step once already. */
  const menu = getMenuStats()
  return (
    <main id="main" className="page-content">
      {faqSchema && <JsonLd data={faqSchema} />}
      <JsonLd data={buildPriceListSchema()} />
      <div className="section-shell section-pad min-h-0">
        <p className="eyebrow mb-4">— Price list · updated {UPDATED}</p>
        <h1 className="display-section text-ink mb-4 max-w-3xl">
          Salon Price List Karachi 2026 — From Rs 100
        </h1>
        {/* The claim lives here, on the page that proves it. It used to live on
            the homepage while this page said only "every priced service", so
            nothing that read one read the other. */}
        <p className="text-body md:text-lg max-w-2xl mb-3 leading-relaxed">
          This is the full published price list for Farwa Beauty Salon in Block 3 PECHS, Karachi:
          all <strong className="font-medium text-ink">{menu.total} services</strong> across{' '}
          {menu.categories} categories, and <strong className="font-medium text-ink">every one of
          them carries a printed price</strong> in Pakistani Rupees. No hidden quotes.
        </p>
        <p className="text-body text-sm max-w-2xl mb-3 leading-relaxed">
          {menu.fixed} of those are fixed rates — what the table says is what you pay. The
          remaining {menu.startingFrom}{' '}are hair and hair-treatment services shown as
          &ldquo;from&rdquo;, because length and density genuinely change the work; that figure is
          a floor and it is confirmed with you before anything starts.
        </p>
        <p className="text-stone text-sm font-['Inter'] font-light max-w-2xl mb-6 leading-relaxed">
          {YEARS_ACTIVE}+ years · women-only studio · {rating.ratingValue}★ Google · cash, JazzCash, EasyPaisa · Mon–Sat 11–7
        </p>

        <div className="cta-cluster mb-7">
          <Link href="/book" className="tap-safe btn-primary w-full sm:w-auto justify-center">
            Book online <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <WaCta href="https://wa.me/923222782254" from="prices-quote"
            className="tap-safe btn-secondary w-full sm:w-auto justify-center">
            Ask on WhatsApp
          </WaCta>
        </div>

        <div className="-mx-4 sm:-mx-5 md:-mx-10 mb-10">
          <DealBanner />
        </div>

        {/* Only the pill row sticks. The label and the guide link used to sit
            inside the sticky box too, which made it 144px tall on a phone —
            with the 57px header that is 198px of permanent chrome, 24% of a
            390x844 viewport, on the longest page of the site. They are
            ordinary flow content now and the sticky element is one row. */}
        <p className="text-[11px] tracking-[0.14em] uppercase font-['Inter'] text-stone mb-2.5">Jump to category</p>
        <nav aria-label="Price list categories" className="w-full">
          <ul className="tab-scroller text-sm font-['Inter'] pb-1">
            <li>
              <a href="#quote" className="tap-safe tab-pill inline-flex items-center">
                Quote builder
              </a>
            </li>
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
        </nav>
        <p className="mt-3 mb-12 text-stone text-sm font-light">
          How to read a rate list:{' '}
          <Link href="/blog/salon-price-list-karachi-2026" className="link-underline hover:text-ink text-ink font-medium">
            Salon Price List Karachi 2026 guide
          </Link>
        </p>

        <QuoteBuilder />

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
                      <td className="py-2.5 pr-3 text-right text-stone/80 text-[12px] font-['Inter'] whitespace-nowrap tabular-nums hidden sm:table-cell">
                        {s.durationMinutes ? formatDuration(s.durationMinutes) : ''}
                      </td>
                      <td className="py-2.5 text-right font-[family-name:var(--font-unbounded)] font-bold text-ink text-[13px] sm:text-sm whitespace-nowrap tabular-nums">
                        {formatServicePrice(s)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>

        {/* The other half of a complete price list is what is not on it. Same
            source as the `additionalProperty` boundaries in the salon JSON-LD,
            so the visible text and the machine-readable claim cannot disagree. */}
        <section className="mt-14 max-w-3xl" aria-labelledby="prices-not-offered">
          <h2 id="prices-not-offered" className="font-['Syne'] font-semibold text-ink text-xl md:text-2xl mb-3">
            What is not on this list
          </h2>
          <p className="text-body text-sm mb-4">
            A price list is only complete if it also says where it stops. These are the things
            people ask for that we do not do, or do not print:
          </p>
          <dl className="space-y-3">
            {SERVICE_BOUNDARIES.map((b) => (
              <div key={b.name} className="text-sm">
                <dt className="font-['Syne'] font-bold text-ink inline">{b.name}: </dt>
                <dd className="text-body inline">{b.value}</dd>
              </div>
            ))}
          </dl>
        </section>

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
            <WaCta href="https://wa.me/923222782254" from="prices-footer"
              className="tap-safe btn-secondary">
              Ask on WhatsApp
            </WaCta>
          </div>
        </section>

        <section className="mt-14 pt-10 border-t border-border-soft" aria-labelledby="prices-faq-heading">
          <h2 id="prices-faq-heading" className="font-['Syne'] font-semibold text-ink text-xl md:text-2xl mb-6">
            Price questions
          </h2>
          <dl className="space-y-5 max-w-lg">
            {PRICES_PAGE_FAQS.map((f) => (
              <div key={f.q}>
                <dt className="font-['Syne'] font-bold text-sm text-ink">{f.q}</dt>
                <dd className="mt-1.5 text-body">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="mt-10 text-[11px] tracking-[0.14em] uppercase font-['Inter'] text-stone/80 max-w-2xl">
          All prices in Pakistani Rupees (Rs). Cash, JazzCash and EasyPaisa accepted at the salon.
          Listed rates are starting prices, not a tax invoice.
        </p>
        <p className="mt-4 text-[12px] text-stone font-['Inter'] font-light max-w-2xl">
          The special works — <Link href="/blog/party-makeup-karachi-guide" className="link-underline text-ink font-medium">party makeup</Link>,
          custom looks, event hairdos, and <Link href="/blog/keratin-treatment-price-karachi" className="link-underline text-ink font-medium">keratin</Link> —
          are quoted per person because they genuinely vary.{' '}
          <a href="#quote" className="link-underline text-ink font-medium">Construct your quote above</a> — it arrives in minutes and is binding once given.
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
