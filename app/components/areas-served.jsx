import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getPriorityLocationLinks } from '../../lib/location-links.js'

export default function AreasServed() {
  const links = getPriorityLocationLinks()

  return (
    <section
      className="bg-white border-y border-border-soft"
      aria-labelledby="areas-served-heading"
    >
      <div className="section-shell section-pad">
        <p className="eyebrow mb-3">— Areas we serve</p>
        <h2 id="areas-served-heading" className="section-title mb-3">
          Beauty salon clients across Karachi
        </h2>
        <p className="text-body max-w-2xl mb-8">
          Our salon is in PECHS Block 3 — we welcome bookings from Gulshan, Clifton, DHA, Bahadurabad,
          and across the city. Browse services near your area or book online.
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-3">
          {links.map(({ href, label, slug }) => (
            <li key={slug}>
              <Link href={href} className="card-link group">
                <span className="leading-snug">{label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-stone group-hover:text-ink transition-colors" />
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs font-['Inter'] text-stone">
          <Link href="/beauty-salon-karachi" className="link-underline hover:text-ink font-medium">
            Beauty salon in Karachi — full guide
          </Link>
        </p>
      </div>
    </section>
  )
}
