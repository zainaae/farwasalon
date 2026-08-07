'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { CTA_PRIMARY_LABEL } from '../../src/shared.jsx'
import { FAQ_GROUPS } from '../../src/faq-data.js'
import { WA_DEFAULT } from '../../src/data.js'
import PageCloseCta from '../components/page-close-cta.jsx'

function FaqItem({ faq, index }) {
  const [open, setOpen] = useState(false)
  return (
    <m.div
      initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.03 }}
      className="border-b border-border-soft"
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="tap-safe w-full flex items-center justify-between gap-4 min-h-[44px] py-5 text-left"
        aria-expanded={open}
        aria-controls={`faq-panel-${index}`}
        aria-label={faq.q}
      >
        <span className="font-[family-name:var(--font-syne)] font-bold text-sm text-ink leading-snug">{faq.q}</span>
        <ChevronDown className={`w-4 h-4 text-stone shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div id={`faq-panel-${index}`} role="region" className={`overflow-hidden transition-[max-height,padding,margin] duration-200 ${open ? 'max-h-[28rem] pb-5 -mt-1' : 'max-h-0'}`}>
        <p className="text-body text-sm">{faq.a}</p>
      </div>
    </m.div>
  )
}

export default function FaqClient() {
  let itemIndex = 0

  return (
    <main id="main" className="page-content">

      <section className="bg-white py-16 md:py-20 border-b border-border-soft">
        <div className="section-shell">
          <div className="title-stack">
            <p className="hero-fade-up eyebrow">— Common questions</p>
            <h1 className="hero-rise display-page text-ink" style={{ animationDuration: '0.9s' }}>
              Frequently asked questions
            </h1>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="max-w-screen-md mx-auto px-4 sm:px-5">
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
