'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useBooking } from '../../src/shared.jsx'
import { YEARS_ACTIVE } from '../../src/data.js'

const TEAM = [
  {
    name: 'Rubina',
    role: 'Founder & Lead Stylist',
    bio: `With ${YEARS_ACTIVE}+ years of expertise, Rubina founded Farwa Beauty Salon in 2008 from a single chair. Her mastery spans bridal styling, advanced skincare, and precision brow work. Every treatment at Farwa reflects her personal standard of care.`,
    specialties: ['Bridal', 'Facials', 'Eyebrow Shaping'],
  },
]

export default function TeamClient() {
  const booking = useBooking()

  return (
    <main id="main" className="page-content">

      <section className="bg-white py-16 md:py-20 border-b border-border-soft">
        <div className="section-shell">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="eyebrow mb-3">— The people</motion.p>
          <div className="overflow-hidden">
            <motion.h1 initial={{ y: '60%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
              className="display-section text-ink">
              <span className="block">OUR</span> <span className="block">TEAM</span>
            </motion.h1>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="section-shell">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {TEAM.map((member, i) => (
              <motion.article key={member.name}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
                className="panel-soft p-6 md:p-8">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#c9a98a] to-[#7a5c48] flex items-center justify-center shrink-0">
                    <span className="text-white font-['Syne'] font-bold text-lg">{member.name[0]}</span>
                  </div>
                  <div>
                    <h2 className="font-['Syne'] font-bold text-base text-ink">{member.name}</h2>
                    <p className="text-stone text-[11px] tracking-wide font-['Inter'] uppercase">{member.role}</p>
                  </div>
                </div>
                <p className="text-body mb-5">{member.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {member.specialties.map(s => (
                    <span key={s} className="bg-mist text-ink text-[10px] tracking-wide font-['Inter'] uppercase px-3 py-1.5 border border-border-soft">{s}</span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 md:py-20">
        <div className="section-shell flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <motion.h2 initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="font-['Unbounded'] font-bold text-xl md:text-2xl text-white">
            Book with our expert team today.
          </motion.h2>
          <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}
            className="flex flex-wrap items-center gap-4">
            <button onClick={() => booking.open()}
              className="tap-safe inline-flex items-center gap-2 bg-white text-ink text-[11px] tracking-[0.14em] uppercase font-medium font-['Inter'] px-6 py-3.5 hover:bg-nude transition-colors duration-300">
              Book an Appointment <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <Link href="/services" className="link-underline text-white/60 text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-white transition-colors">
              Our Services
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
