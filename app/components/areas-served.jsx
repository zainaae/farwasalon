import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getPriorityLocationLinks } from '../../lib/location-links.js'

export default function AreasServed() {
  const links = getPriorityLocationLinks()

  return (
    <section
      className="bg-white border-y border-[#e4ddd7]"
      aria-labelledby="areas-served-heading"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10 py-12 md:py-16">
        <p className="text-[10px] tracking-[0.28em] uppercase font-['Inter'] text-stone mb-3">
          — Areas we serve
        </p>
        <h2
          id="areas-served-heading"
          className="font-['Unbounded'] font-bold text-xl md:text-2xl text-ink mb-3"
        >
          Beauty salon clients across Karachi
        </h2>
        <p className="text-sm font-['Inter'] font-light text-stone max-w-2xl mb-8">
          Our salon is in PECHS Block 3 — we welcome bookings from Gulshan, Clifton, DHA, Bahadurabad,
          and across the city. Browse services near your area or book online.
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-3">
          {links.map(({ href, label, slug }) => (
            <li key={slug}>
              <Link
                href={href}
                className="tap-safe group flex items-center justify-between gap-2 border border-[#e4ddd7] bg-mist/40 px-4 py-3 text-xs font-['Inter'] text-ink hover:border-ink/20 hover:bg-mist transition-colors"
              >
                <span>{label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-stone group-hover:text-ink transition-colors" />
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs font-['Inter'] text-stone">
          <Link href="/beauty-salon-karachi" className="link-underline hover:text-ink">
            Beauty salon in Karachi — full guide
          </Link>
        </p>
      </div>
    </section>
  )
}
