'use client'

import Link from 'next/link'
import { m } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { AnimatedNumber } from '../../src/shared.jsx'
import SalonLocalBlock from '../components/salon-local-block.jsx'
import { SERVICES, YEARS_ACTIVE } from '../../src/data.js'

const CATEGORY_COUNT = Object.keys(SERVICES).length
const SERVICE_COUNT  = Object.values(SERVICES).reduce((a, v) => a + v.length, 0)

export default function AboutClient() {
  return (
    <main id="main" className="page-content">

      <section className="bg-white py-16 md:py-20 border-b border-border-soft">
        <div className="section-shell">
          <m.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="eyebrow mb-3">— Est. 2008 · PECHS, Karachi</m.p>
          <div className="overflow-hidden">
            <m.h1 initial={{ y: '60%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
              className="display-section text-ink">
              <span className="block">OUR</span> <span className="block">STORY</span>
            </m.h1>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="section-shell">
          <div className="grid grid-cols-3 gap-8 border-b border-border-soft pb-12">
            {[
              { display: `${YEARS_ACTIVE}+`,  final: YEARS_ACTIVE, label: 'Years of expertise' },
              { display: String(CATEGORY_COUNT), final: CATEGORY_COUNT, label: 'Service categories' },
              { display: String(SERVICE_COUNT) + '+', final: SERVICE_COUNT, label: 'Services on the menu' },
            ].map(({ display, final, label }) => (
              <m.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p className="font-['Unbounded'] font-bold text-2xl md:text-3xl text-ink mb-1">
                  <AnimatedNumber display={display} final={final} ariaLabel={`${display} ${label}`} />
                </p>
                <p className="text-body text-[11px]">{label}</p>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mist py-16 md:py-24">
        <m.div className="section-shell">
          <div className="grid md:grid-cols-[1fr_1.4fr] gap-12 md:gap-20 items-start">
            <div>
              <div className="overflow-hidden mb-10">
                <m.h2 initial={{ y: '60%', opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
                  className="font-['Unbounded'] font-bold text-3xl md:text-4xl text-ink leading-tight">
                  A dream, a single chair, and {YEARS_ACTIVE} years of beauty.
                </m.h2>
              </div>
              <div className="flex flex-col gap-0">
                {[
                  { year: '2008',  text: 'First chair, home salon' },
                  { year: '2010',  text: 'Expanded to two rooms' },
                  { year: '2014',  text: 'Growing by word of mouth' },
                  { year: '2016',  text: 'Moved to dedicated salon space' },
                  { year: '2018',  text: 'Full bridal menu and trial bookings' },
                  { year: '2020',  text: 'Expanded facials, nails, and brow services' },
                  { year: '2024',  text: 'Online booking and live slot availability' },
                  { year: 'Today', text: 'A full-service studio in PECHS' },
                ].map((milestone, i) => (
                  <m.div key={milestone.year} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.09 }}
                    className="flex gap-5 items-start">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-ink mt-1.5 shrink-0" />
                      {i < 7 && <div className="w-px h-10 bg-border-soft mt-1" />}
                    </div>
                    <div className="pb-2">
                      <p className="font-['Unbounded'] font-bold text-xs text-ink mb-0.5">{milestone.year}</p>
                      <p className="text-body text-sm">{milestone.text}</p>
                    </div>
                  </m.div>
                ))}
              </div>
            </div>
            <m.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="flex flex-col gap-6 pt-2 md:pt-10">
              <p className="text-ink text-lg md:text-xl font-light leading-relaxed">
                &ldquo;It started in 2008 — a single chair, a steady hand, and a belief that beauty was worth doing well.&rdquo;
              </p>
              <p className="text-body">
                Rubina began Farwa as a small home-studio. One room became two. Word spread, clients kept returning, and the craft outgrew the house.
              </p>
              <p className="text-body">
                She moved into a dedicated salon in PECHS and kept expanding the menu — bridal, hair, skin, nails, brows — without letting the chair-side care slip. {YEARS_ACTIVE} years on, the standard is still set one appointment at a time.
              </p>
              <div className="grid grid-cols-1 gap-4 border-t border-border-soft pt-8 mt-2">
                {[
                  { title: 'Every woman is welcome',   desc: 'From teenagers to grandmothers — every woman who walks through our door is treated with the same warmth and skill.' },
                  { title: 'Beauty is personal',       desc: 'We listen first. Your preferences, your features, your occasion — every service is shaped around you.' },
                  { title: 'We grow with our clients', desc: 'Many of our clients have been with us for a decade or more. Their trust is the greatest honour we know.' },
                ].map(v => (
                  <div key={v.title} className="flex gap-4">
                    <span className="w-1 h-1 rounded-full bg-ink shrink-0 mt-2" />
                    <div>
                      <p className="font-['Syne'] font-bold text-sm text-ink mb-1">{v.title}</p>
                      <p className="text-body text-xs">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </m.div>
          </div>
        </m.div>
      </section>

      <section className="bg-ink py-16 md:py-20">
        <m.div className="section-shell">
          <m.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="eyebrow mb-10">
            — Why choose Farwa
          </m.p>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              { num: '01', title: 'Founder-Led Standards', desc: 'Rubina still sets the bar for bridal, brows, and skincare — and trains every stylist who works under the Farwa name.' },
              { num: '02', title: 'A Calm, Considered Space', desc: 'The studio is unhurried by design — quiet rooms, careful lighting, conversations that stay at the chair.' },
              { num: '03', title: 'Clients Who Stay for Years', desc: 'Many PECHS families have trusted us for a decade or more — that continuity is how we learn your skin, your brows, your wedding timeline.' },
            ].map((p, i) => (
              <m.div key={p.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.7 }}
                className="border-t border-white/10 pt-7">
                <p className="font-['Unbounded'] text-[10px] text-stone mb-4">{p.num}</p>
                <h3 className="font-['Syne'] font-bold text-base md:text-lg text-white mb-3 leading-snug">{p.title}</h3>
                <p className="text-stone text-sm font-light leading-relaxed font-['Inter']">{p.desc}</p>
              </m.div>
            ))}
          </div>
        </m.div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <m.div className="section-shell flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <m.h2 initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="section-title">
            Come in and experience it yourself.
          </m.h2>
          <m.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}
            className="flex flex-wrap items-center gap-4">
            <Link href="/book" className="tap-safe btn-primary">
              Book an Appointment <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/services" className="link-underline text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors">
              Our Services
            </Link>
          </m.div>
        </m.div>
      </section>

      <SalonLocalBlock />
    </main>
  )
}
