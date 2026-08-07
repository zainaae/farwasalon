'use client'

import Link from 'next/link'
import ArrowUpRight from './icon-sprite.jsx'
import WaCta from './wa-cta.jsx'
import Image from 'next/image'
import { MessageCircle, Star } from 'lucide-react'
import { WA_DEFAULT, IG_LINK, MAPS_LINK, CAT_SLUGS } from '../../src/site-config.js'
import { SALON_ADDRESS_LINES } from '../../lib/business-schema.js'
import { AREAS_HUB_HREF, getFooterAreaLinks } from '../../lib/location-links.js'
import FooterNewsletter from './footer-newsletter.jsx'
import {
  UrduSignature,
  IgIcon,
  CTA_PRIMARY_LABEL,
  CTA_WHATSAPP_HINT,
} from '../../src/shared-chrome.jsx'

/** Site footer — location hubs stay in SSR HTML; hydrated as a separate chunk. */
export default function SiteFooter() {
  const serviceLinks = Object.entries(CAT_SLUGS).map(([label, slug]) => ({
    label,
    slug,
  }))
  const areaLinks = getFooterAreaLinks()
  return (
    <footer className="bg-white">
      <div className="border-t border-border-soft px-5 md:px-10 py-8 md:py-10">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Link href="/" className="shrink-0">
              <Image
                src="/logo.jpg"
                alt="Farwa Beauty Salon"
                width={48}
                height={48}
                loading="lazy"
                sizes="48px"
                className="h-10 md:h-12 w-auto max-w-[12rem] object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextSibling.style.display = 'block'
                }}
              />
              <span style={{ display: 'none' }} className="font-[family-name:var(--font-fraunces)] font-bold text-sm text-ink">
                FARWA
              </span>
            </Link>
            <span className="hidden sm:inline h-8 w-px bg-[#e4ddd7]" />
            <UrduSignature className="hidden sm:inline text-stone/80" />
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <Link
              href="/book"
              className="tap-safe inline-flex items-center gap-2 bg-ink text-white text-[11px] tracking-[0.14em] uppercase font-medium font-[family-name:var(--font-inter)] px-6 py-3 hover:bg-stone transition-colors duration-300"
            >
              {CTA_PRIMARY_LABEL} <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <WaCta
              href={WA_DEFAULT}
              from="footer-hint"
              className="text-stone text-[10px] font-[family-name:var(--font-inter)] tracking-wide hover:text-ink transition-colors"
            >
              {CTA_WHATSAPP_HINT}
            </WaCta>
          </div>
        </div>
      </div>
      <div className="border-t border-border-soft px-5 md:px-10 py-10 md:py-12">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-[1.7fr_1.1fr_1.2fr_1fr] gap-8 md:gap-10 mb-10">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase font-medium font-[family-name:var(--font-inter)] text-ink mb-4">
                Services
              </p>
              <ul className="flex flex-col sm:block sm:columns-2 sm:gap-x-6 gap-2 sm:gap-2.5 [&>li]:mb-2.5">
                {serviceLinks.map((sl) => (
                  <li key={sl.label}>
                    <Link
                      href={`/services/${sl.slug}`}
                      className="link-underline tap-safe inline-flex items-center min-h-[44px] text-stone text-xs font-[family-name:var(--font-inter)] hover:text-ink transition-colors"
                    >
                      {sl.label}
                    </Link>
                  </li>
                ))}
                <li className="pt-1">
                  <Link
                    href="/services"
                    className="link-underline tap-safe inline-flex items-center min-h-[44px] text-ink text-xs font-[family-name:var(--font-inter)] font-medium hover:text-stone transition-colors"
                  >
                    All services →
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase font-medium font-[family-name:var(--font-inter)] text-ink mb-4">
                Navigate
              </p>
              <ul className="flex flex-col sm:block sm:columns-2 sm:gap-x-6 gap-2.5 [&>li]:mb-2.5">
                {[
                  ['Home', '/'],
                  ['Services', '/services'],
                  ['Price List', '/prices'],
                  ['Deals', '/deals'],
                  ['Book', '/book'],
                  ['Bridal', '/bridal'],
                  ['Gallery', '/gallery'],
                  ['Blog', '/blog'],
                  ['About', '/about'],
                  ['Contact', '/contact'],
                  ['FAQ', '/faq'],
                ].map(([l, href]) => (
                  <li key={l}>
                    <Link
                      href={href}
                      className="link-underline tap-safe inline-flex items-center min-h-[44px] text-stone text-xs font-[family-name:var(--font-inter)] hover:text-ink transition-colors"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase font-medium font-[family-name:var(--font-inter)] text-ink mb-4">
                Visit Us
              </p>
              <ul className="flex flex-col gap-2.5">
                {SALON_ADDRESS_LINES.map((l) => (
                  <li key={l}>
                    <span className="text-stone text-xs font-[family-name:var(--font-inter)]">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] tracking-[0.2em] uppercase font-medium font-[family-name:var(--font-inter)] text-ink mb-4">
                Connect
              </p>
              <ul className="flex flex-col gap-3">
                <li>
                  <WaCta
                    href={WA_DEFAULT}
                    from="footer-contact"
                    className="link-underline tap-safe !inline-flex items-center gap-2 min-h-[44px] text-stone text-xs leading-snug font-[family-name:var(--font-inter)] hover:text-ink"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0">WhatsApp</span>
                  </WaCta>
                </li>
                <li>
                  <a
                    href={IG_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="link-underline tap-safe !inline-flex items-center gap-2 min-h-[44px] text-stone text-xs leading-snug font-[family-name:var(--font-inter)] hover:text-ink"
                  >
                    <IgIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0">@farwasalon</span>
                  </a>
                </li>
                <li>
                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="link-underline tap-safe !inline-flex items-center gap-2 min-h-[44px] text-stone text-xs leading-snug font-[family-name:var(--font-inter)] hover:text-ink"
                  >
                    <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0">Google Maps</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://g.page/farwasalon/review"
                    target="_blank"
                    rel="noreferrer"
                    className="link-underline tap-safe !inline-flex items-center gap-2 min-h-[44px] text-stone text-xs leading-snug font-[family-name:var(--font-inter)] hover:text-ink"
                  >
                    <Star className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0">Leave a review</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <FooterNewsletter />
          <div className="mb-10 pb-8 border-b border-border-soft">
            <p className="text-[10px] tracking-[0.2em] uppercase font-medium font-[family-name:var(--font-inter)] text-ink mb-3">
              Areas we serve
            </p>
            <ul className="flex flex-wrap gap-x-3 gap-y-2 mb-3">
              {areaLinks.map(({ slug, href, label }) => (
                <li key={slug}>
                  <Link
                    href={href}
                    className="link-underline tap-safe inline-flex items-center min-h-[44px] text-stone text-xs font-[family-name:var(--font-inter)] hover:text-ink transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={AREAS_HUB_HREF}
                  className="link-underline tap-safe inline-flex items-center min-h-[44px] text-ink text-xs font-[family-name:var(--font-inter)] font-medium hover:text-stone transition-colors"
                >
                  See all areas →
                </Link>
              </li>
            </ul>
            <p className="text-stone text-xs font-[family-name:var(--font-inter)]">
              PECHS Block 3, Karachi ·{' '}
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noreferrer"
                className="link-underline hover:text-ink transition-colors"
              >
                Directions on Google Maps
              </a>
              {' · '}
              <Link
                href={AREAS_HUB_HREF}
                className="link-underline hover:text-ink transition-colors"
              >
                Beauty salon in Karachi
              </Link>
            </p>
          </div>
          <div className="border-t border-border-soft pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-stone text-[11px] font-[family-name:var(--font-inter)]">
                © {new Date().getFullYear()} Farwa Beauty Salon. All rights reserved.
              </p>
              <span className="text-[#e4ddd7] hidden sm:inline">·</span>
              <UrduSignature className="sm:hidden text-stone/70 text-[13px]" />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/privacy"
                className="text-stone text-[11px] font-[family-name:var(--font-inter)] hover:text-ink transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-[#e4ddd7]">·</span>
              <a
                href="https://www.linkedin.com/in/zainaae/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone text-[11px] font-[family-name:var(--font-inter)] hover:text-ink transition-colors"
              >
                Site by Zain
              </a>
              <span className="text-[#e4ddd7]">·</span>
              <p className="text-stone text-[11px] font-[family-name:var(--font-inter)]">
                {SALON_ADDRESS_LINES[0]} · Est. 2008
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
