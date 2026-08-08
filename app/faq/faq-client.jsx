'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import { CTA_PRIMARY_LABEL } from '../../src/shared.jsx'
import { FAQ_GROUPS } from '../../src/faq-data.js'
import { WA_DEFAULT } from '../../src/data.js'
import PageCloseCta from '../components/page-close-cta.jsx'

function FaqItem({ faq, index }) {
  const [open, setOpen] = useState(false)
  const num = String(index + 1).padStart(2, '0')
  return (
    <m.div
      initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.03 }}
      className="border-b border-border-soft"
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="faq-item-trigger tap-safe w-full flex items-center gap-3 sm:gap-4 min-h-[44px] py-5 text-left"
        aria-expanded={open}
        aria-controls={`faq-panel-${index}`}
        aria-label={faq.q}
      >
        <span className="faq-item-num" aria-hidden="true">{num}</span>
        <span className="font-[family-name:var(--font-syne)] font-bold text-sm text-ink leading-snug flex-1 min-w-0">{faq.q}</span>
        <span className="faq-item-icon" aria-hidden="true" />
      </button>
      <div id={`faq-panel-${index}`} role="region" className={`overflow-hidden transition-[max-height,padding,margin] duration-200 ${open ? 'max-h-[28rem] pb-5 -mt-1' : 'max-h-0'}`}>
        <p className="text-body text-sm pl-[calc(1.5rem+0.75rem)] sm:pl-[calc(1.5rem+1rem)]">{faq.a}</p>
      </div>
    </m.div>
  )
}

export default function FaqClient() {
  let itemIndex = 0

  return (
    <main id="main" className="page-content">

      <section className="bg-white py-16 md:py-20">
        <div className="section-shell">
          {/* Quoti asymmetric title: loud stack left, intentional void right —
              the mist accordion below does the reading job. Plum marks the brand edge. */}
          <div className="title-stack max-w-2xl lg:max-w-[28rem] border-l-2 border-plum pl-5 lg:pl-6">
            <p className="hero-fade-up eyebrow text-plum">— Common questions</p>
            <h1 className="hero-rise display-page text-ink" style={{ animationDuration: '0.9s' }}>
              Frequently asked questions
            </h1>
          </div>
        </div>
      </section>

      {/* A real band, not a panel. This section is a direct child of <main>,
          so unlike the category pages it can take a full-bleed ground without
          breaking out of section-shell — and a page that measured 0 shadowed
          elements across 322 of them needs the ground more than it needs a
          card. White header -> mist accordion -> the close CTA now gives the
          page three tonal steps instead of one continuous sheet.

          Mist is safe for everything inside: .eyebrow and .text-body are both
          --stone (6.18:1 on white, ~5.9:1 here), the questions are --ink. The
          one token that would have failed is --accent-gold-deep, which drops
          to 3.98:1 on --nude — the reason this is mist and not nude.

          Single hairline between hero and accordion (not hero border-b + band
          border-t, which stacked into a 2px seam). */}
      <section className="living-band py-14 md:py-20 border-y border-border-soft">
        <div className="section-shell max-w-screen-md mx-auto">
          {FAQ_GROUPS.map((group) => (
            <div key={group.topic} className="mb-12 last:mb-0">
              <h2 className="eyebrow mb-4">{group.topic}</h2>
              <div className="border-t border-border-soft">
                {group.items.map((faq) => {
                  const idx = itemIndex++
                  return <FaqItem key={faq.q} faq={faq} index={idx} />
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <PageCloseCta
        eyebrow="— Still have questions?"
        title="Message us on WhatsApp"
        body="We usually reply within a few hours during salon hours. Or book a live slot online."
        bookHref="/book"
        bookLabel={CTA_PRIMARY_LABEL}
        waHref={WA_DEFAULT}
        waFrom="faq"
        waLabel="Message on WhatsApp"
      />
    </main>
  )
}
