'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { useBooking } from '../../src/shared.jsx'

const FAQS = [
  {
    q: 'Is parking available near the salon?',
    a: 'Yes — PECHS Block 2 has street parking available nearby. Most clients find spots within a short walk of the salon.',
  },
  {
    q: 'Do you accept walk-ins?',
    a: 'We welcome walk-ins when slots are available, but we strongly recommend booking in advance via WhatsApp to guarantee your preferred time.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept cash, JazzCash, and EasyPaisa. Card payments are not currently available.',
  },
  {
    q: 'What is your cancellation policy?',
    a: 'Please let us know at least 4 hours in advance if you need to cancel or reschedule. Late cancellations may affect future booking priority.',
  },
  {
    q: 'Do you offer bridal trials?',
    a: 'Absolutely. We recommend a bridal trial 2–4 weeks before your wedding day. This includes a full hair and makeup preview so you can finalize your look with confidence.',
  },
  {
    q: 'I have sensitive skin — can I still get treatments?',
    a: 'Yes. Please let us know about any allergies or sensitivities when booking. We use gentle, tested products and can do a patch test before proceeding with treatments like facials, waxing, or bleach.',
  },
  {
    q: 'What are your opening hours?',
    a: 'We are open Monday through Saturday, 11:00 AM to 7:00 PM. We are closed on Sundays.',
  },
  {
    q: 'How do I book an appointment?',
    a: 'The easiest way is via WhatsApp — use the "Book an Appointment" button on any page, or message us directly at +92 322 2782254.',
  },
]

function FaqItem({ faq, index }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border-b border-[#e4ddd7]"
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="font-['Syne'] font-bold text-sm text-ink leading-snug">{faq.q}</span>
        <ChevronDown className={`w-4 h-4 text-stone shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-5 -mt-1">
          <p className="text-stone text-sm font-light leading-relaxed font-['Inter']">{faq.a}</p>
        </div>
      )}
    </motion.div>
  )
}

export default function FaqClient() {
  const booking = useBooking()

  useEffect(() => {
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    }
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(ld)
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  return (
    <main id="main" className="pt-[calc(3.375rem+env(safe-area-inset-top,0px))] md:pt-[calc(3.5rem+env(safe-area-inset-top,0px))]">

      <section className="bg-white py-16 md:py-20 px-4 sm:px-5 md:px-10 border-b border-[#e4ddd7]">
        <div className="max-w-screen-xl mx-auto">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-3">— Common questions</motion.p>
          <div className="overflow-hidden">
            <motion.h1 initial={{ y: '60%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
              className="display-section text-ink">
              FREQUENTLY<br />ASKED
            </motion.h1>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20 px-4 sm:px-5 md:px-10">
        <div className="max-w-screen-md mx-auto">
          <div className="border-t border-[#e4ddd7]">
            {FAQS.map((faq, i) => (
              <FaqItem key={i} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 md:py-20 px-4 sm:px-5 md:px-10">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <motion.h2 initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="font-['Unbounded'] font-bold text-xl md:text-2xl text-white">
            Have another question? Ask us directly.
          </motion.h2>
          <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}
            className="flex flex-wrap items-center gap-4">
            <button onClick={() => booking.open()}
              className="tap-safe inline-flex items-center gap-2 bg-white text-ink text-[11px] tracking-[0.14em] uppercase font-medium font-['Inter'] px-6 py-3.5 hover:bg-nude transition-colors duration-300">
              Book an Appointment <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <Link href="/contact" className="link-underline text-white/60 text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-white transition-colors">
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
