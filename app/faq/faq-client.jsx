'use client'

import { useState } from 'react'
import Link from 'next/link'
import { m } from 'framer-motion'
import { ArrowUpRight, ChevronDown, MessageCircle } from 'lucide-react'
import { CTA_PRIMARY_LABEL } from '../../src/shared.jsx'
import { FAQ_GROUPS } from '../../src/faq-data.js'
import { WA_DEFAULT } from '../../src/data.js'

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
        <span className="font-['Syne'] font-bold text-sm text-ink leading-snug">{faq.q}</span>
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
          <m.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="eyebrow mb-3">— Common questions</m.p>
          <div className="overflow-hidden">
            <m.h1 initial={{ y: '60%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
              className="display-section text-ink">
              <span className="block">FREQUENTLY</span> <span className="block">ASKED</span>
            </m.h1>
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

      <section className="bg-ink py-16 md:py-20">
        <div className="section-shell flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <m.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <h2 className="font-['Unbounded'] font-bold text-xl md:text-2xl text-white mb-2">
              Still have questions?
            </h2>
            <p className="text-stone text-sm font-['Inter'] font-light max-w-md">
              WhatsApp us — we usually reply within a few hours during salon hours.
            </p>
          </m.div>
          <m.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}
            className="flex flex-wrap items-center gap-4">
            <a href={WA_DEFAULT} target="_blank" rel="noreferrer"
              className="tap-safe inline-flex items-center gap-2 bg-white text-ink text-[11px] tracking-[0.14em] uppercase font-medium font-['Inter'] px-6 py-3.5 hover:bg-nude transition-colors duration-300">
              <MessageCircle className="w-3.5 h-3.5" /> Message on WhatsApp
            </a>
            <Link href="/book"
              className="link-underline !inline-flex items-center gap-1.5 text-white/60 text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-white transition-colors">
              <span className="min-w-0">{CTA_PRIMARY_LABEL}</span>
              <ArrowUpRight className="w-3 h-3 shrink-0" aria-hidden="true" />
            </Link>
          </m.div>
        </div>
      </section>
    </main>
  )
}
