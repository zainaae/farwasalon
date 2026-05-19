'use client'

import Link from 'next/link'
import { MapPin, Clock, Phone, Star, ArrowUpRight } from 'lucide-react'
import { MAPS_LINK, WA_NUMBER } from '../../src/data.js'
import {
  SALON_ADDRESS_LINES,
  SALON_PHONE_DISPLAY,
  GOOGLE_REVIEW_LINK,
  getAggregateRating,
} from '../../lib/business-schema.js'

/** Visible NAP + hours + rating + map — mirrors Google local pack fields. */
export default function SalonLocalBlock({ variant = 'light', className = '' }) {
  const dark = variant === 'dark'
  const rating = getAggregateRating()
  const ratingLine = `${rating.ratingValue}★ · ${rating.reviewCount}+ reviews on Google`

  return (
    <section
      className={`${className} ${dark ? 'bg-ink text-white' : 'bg-mist border-y border-[#e4ddd7]'}`}
      aria-labelledby="visit-salon-heading"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-start">
          <div>
            <p
              className={`text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-3 ${dark ? 'text-[#c9a98a]' : 'text-stone'}`}
            >
              — Visit the salon
            </p>
            <h2
              id="visit-salon-heading"
              className={`font-['Unbounded'] font-bold text-xl md:text-2xl mb-4 ${dark ? 'text-white' : 'text-ink'}`}
            >
              Farwa Beauty Salon · PECHS, Karachi
            </h2>
            <ul className={`space-y-3 text-sm font-['Inter'] font-light ${dark ? 'text-white/75' : 'text-stone'}`}>
              <li className="flex items-start gap-2">
                <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${dark ? 'text-[#c9a98a]' : 'text-ink'}`} />
                <span>{SALON_ADDRESS_LINES[0]}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className={`w-4 h-4 shrink-0 ${dark ? 'text-[#c9a98a]' : 'text-ink'}`} />
                <span>
                  {SALON_ADDRESS_LINES[1]} · {SALON_ADDRESS_LINES[2]}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className={`w-4 h-4 shrink-0 ${dark ? 'text-[#c9a98a]' : 'text-ink'}`} />
                <a href="tel:+923222782254" className={`hover:underline ${dark ? 'text-white' : 'text-ink'}`}>
                  {SALON_PHONE_DISPLAY}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-4 h-4 shrink-0 fill-[#c9a98a] text-[#c9a98a]" />
                <a
                  href={GOOGLE_REVIEW_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className={`hover:underline ${dark ? 'text-white' : 'text-ink'}`}
                >
                  {ratingLine}
                </a>
              </li>
            </ul>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href="/book"
                className={`tap-safe inline-flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase font-semibold font-['Inter'] px-6 py-3.5 transition-colors ${
                  dark ? 'bg-white text-ink hover:bg-nude' : 'bg-ink text-white hover:bg-stone'
                }`}
              >
                Book online <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href={`https://wa.me/${WA_NUMBER}`}
                target="_blank"
                rel="noreferrer"
                className={`tap-safe inline-flex items-center gap-2 border text-[11px] tracking-[0.14em] uppercase font-semibold font-['Inter'] px-6 py-3.5 transition-colors ${
                  dark
                    ? 'border-white/30 text-white hover:border-white'
                    : 'border-[#e4ddd7] text-ink hover:border-ink'
                }`}
              >
                WhatsApp
              </a>
            </div>
          </div>
          <div>
            <div className="aspect-[4/3] w-full min-h-[220px] bg-[#e4ddd7] overflow-hidden">
              <iframe
                title="Farwa Beauty Salon on Google Maps"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.0!2d67.0584185!3d24.8797532!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33f2832975c79%3A0xe55ba4a44d34a210!2sFarwa%20beauty%20salon!5e0!3m2!1sen!2spk!4v1"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <p className={`mt-2 text-[10px] font-['Inter'] ${dark ? 'text-white/40' : 'text-stone'}`}>
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noreferrer"
                className={`underline underline-offset-2 ${dark ? 'hover:text-white' : 'hover:text-ink'}`}
              >
                Open in Google Maps
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
