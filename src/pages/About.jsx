import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Navbar, Footer, AnimatedNumber, StickyWA, usePageMeta, useBooking, SkipLink } from '../shared.jsx'
import { SERVICES, YEARS_ACTIVE } from '../data.js'

const CATEGORY_COUNT = Object.keys(SERVICES).length
const SERVICE_COUNT  = Object.values(SERVICES).reduce((a, v) => a + v.length, 0)

export default function About() {
  const booking = useBooking()
  usePageMeta({
    title: 'Our Story — Farwa Beauty Salon, Karachi',
    description: `From a single chair in 2008 to a full-service studio in PECHS Block 2, Karachi — meet Rubina and the story behind ${YEARS_ACTIVE}+ years at Farwa.`,
    canonical: 'https://farwasalon.com/about',
    ogImage: 'https://farwasalon.com/logo.jpg',
  })

  return (
    <div className="bg-white overflow-x-hidden">
      <SkipLink />
      <Navbar />
      <main id="main" className="pt-[calc(3.375rem+env(safe-area-inset-top,0px))] md:pt-[calc(3.5rem+env(safe-area-inset-top,0px))]">

        {/* Page header */}
        <section className="bg-white py-16 md:py-20 px-4 sm:px-5 md:px-10 border-b border-[#e4ddd7]">
          <div className="max-w-screen-xl mx-auto">
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-3">— Est. 2008 · PECHS Block 2, Karachi</motion.p>
            <div className="overflow-hidden">
              <motion.h1 initial={{ y: '60%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
                className="display-section text-ink">
                OUR<br />STORY
              </motion.h1>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white py-12 md:py-16 px-4 sm:px-5 md:px-10">
          <div className="max-w-screen-xl mx-auto">
            <div className="grid grid-cols-3 gap-8 border-b border-[#e4ddd7] pb-12">
              {[
                { display: `${YEARS_ACTIVE}+`,  final: YEARS_ACTIVE, label: 'Years of expertise' },
                { display: String(CATEGORY_COUNT), final: CATEGORY_COUNT, label: 'Service categories' },
                { display: String(SERVICE_COUNT) + '+', final: SERVICE_COUNT, label: 'Services on the menu' },
              ].map(({ display, final, label }) => (
                <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                  <p className="font-['Unbounded'] font-bold text-2xl md:text-3xl text-ink mb-1">
                    <AnimatedNumber display={display} final={final} />
                  </p>
                  <p className="text-stone text-[11px] tracking-wide font-['Inter']">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Founder story */}
        <section className="bg-mist py-16 md:py-24 px-4 sm:px-5 md:px-10">
          <div className="max-w-screen-xl mx-auto">
            <div className="grid md:grid-cols-[1fr_1.4fr] gap-12 md:gap-20 items-start">
              <div>
                <div className="overflow-hidden mb-10">
                  <motion.h2 initial={{ y: '60%', opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
                    className="font-['Unbounded'] font-bold text-3xl md:text-4xl text-ink leading-tight">
                    A dream, a single chair, and {YEARS_ACTIVE} years of beauty.
                  </motion.h2>
                </div>
                <div className="flex flex-col gap-0">
                  {[
                    { year: '2008',  text: 'First chair, home salon' },
                    { year: '2010',  text: 'Expanded to two rooms' },
                    { year: '2014',  text: 'Growing by word of mouth' },
                    { year: '2016',  text: 'Moved to dedicated salon space' },
                    { year: 'Today', text: 'A full-service studio in PECHS Block 2' },
                  ].map((m, i) => (
                    <motion.div key={m.year} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.09 }}
                      className="flex gap-5 items-start">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-ink mt-1.5 shrink-0" />
                        {i < 4 && <div className="w-px h-10 bg-[#e4ddd7] mt-1" />}
                      </div>
                      <div className="pb-2">
                        <p className="font-['Unbounded'] font-bold text-xs text-ink mb-0.5">{m.year}</p>
                        <p className="text-stone text-sm font-light font-['Inter']">{m.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                className="flex flex-col gap-6 pt-2 md:pt-10">
                <p className="text-ink text-lg md:text-xl font-light leading-relaxed">
                  "It started in 2008 — a single chair, a steady hand, and a belief that beauty was worth doing well."
                </p>
                <p className="text-stone text-sm leading-loose font-light">
                  Rubina began Farwa as a small home-studio. One room became two. Word spread, clients kept returning, and the craft outgrew the house.
                </p>
                <p className="text-stone text-sm leading-loose font-light">
                  She moved into a dedicated salon in PECHS Block 2 and kept expanding the menu — bridal, hair, skin, nails, brows — without letting the chair-side care slip. {YEARS_ACTIVE} years on, the standard is still set one appointment at a time.
                </p>
                <div className="grid grid-cols-1 gap-4 border-t border-[#e4ddd7] pt-8 mt-2">
                  {[
                    { title: 'Every woman is welcome',   desc: 'From teenagers to grandmothers — every woman who walks through our door is treated with the same warmth and skill.' },
                    { title: 'Beauty is personal',       desc: 'We listen first. Your preferences, your features, your occasion — every service is shaped around you.' },
                    { title: 'We grow with our clients', desc: 'Many of our clients have been with us for a decade or more. Their trust is the greatest honour we know.' },
                  ].map(v => (
                    <div key={v.title} className="flex gap-4">
                      <span className="w-1 h-1 rounded-full bg-ink shrink-0 mt-2" />
                      <div>
                        <p className="font-['Syne'] font-bold text-sm text-ink mb-1">{v.title}</p>
                        <p className="text-stone text-xs font-light leading-relaxed font-['Inter']">{v.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Trust pillars */}
        <section className="bg-ink py-16 md:py-20 px-4 sm:px-5 md:px-10">
          <div className="max-w-screen-xl mx-auto">
            <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-10">
              — Why choose Farwa
            </motion.p>
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {[
                { num: '01', title: `${YEARS_ACTIVE} Years of Expertise`,       desc: 'Since 2008, Farwa has been crafting beauty with skill, care, and love for every client who walks through the door.' },
                { num: '02', title: 'A Calm, Considered Space',    desc: 'The studio is unhurried by design — quiet rooms, careful lighting, conversations that stay at the chair.' },
                { num: '03', title: 'Every Woman, Every Look',      desc: 'From a quick brow thread to a full bridal transformation — no request is too big or too small.' },
              ].map((p, i) => (
                <motion.div key={p.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.7 }}
                  className="border-t border-white/10 pt-7">
                  <p className="font-['Unbounded'] text-[10px] text-stone mb-4">{p.num}</p>
                  <h3 className="font-['Syne'] font-bold text-base md:text-lg text-white mb-3 leading-snug">{p.title}</h3>
                  <p className="text-stone text-sm font-light leading-relaxed font-['Inter']">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white py-16 md:py-20 px-4 sm:px-5 md:px-10">
          <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <motion.h2 initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="font-['Unbounded'] font-bold text-xl md:text-2xl text-ink">
              Come in and experience it yourself.
            </motion.h2>
            <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}
              className="flex flex-wrap items-center gap-4">
              <button onClick={() => booking.open()}
                className="tap-safe inline-flex items-center gap-2 bg-ink text-white text-[11px] tracking-[0.14em] uppercase font-medium font-['Inter'] px-6 py-3.5 hover:bg-stone transition-colors duration-300">
                Book an Appointment <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <Link to="/services" className="link-underline text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors">
                Our Services
              </Link>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
      <StickyWA />
    </div>
  )
}
