import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Navbar, Footer, StickyWA, usePageMeta, useBooking, SkipLink } from '../shared.jsx'
import { YEARS_ACTIVE } from '../data.js'

const TEAM = [
  {
    name: 'Rubina',
    role: 'Founder & Lead Stylist',
    bio: `With ${YEARS_ACTIVE}+ years of expertise, Rubina founded Farwa Beauty Salon in 2008 from a single chair. Her mastery spans bridal styling, advanced skincare, and precision brow work. Every treatment at Farwa reflects her personal standard of care.`,
    specialties: ['Bridal', 'Facials', 'Eyebrow Shaping'],
  },
  {
    name: 'Sana',
    role: 'Senior Beautician',
    bio: 'Specialising in waxing, threading, and skin treatments, Sana brings warmth and meticulous attention to every appointment. Clients trust her gentle technique and consistent results.',
    specialties: ['Threading', 'Waxing', 'Bleach & Polish'],
  },
  {
    name: 'Ayesha',
    role: 'Hair Stylist',
    bio: 'From precision cuts to bold colour transformations, Ayesha brings creative flair and technical skill to every hair service. She stays current with the latest styling techniques.',
    specialties: ['Hair Colour', 'Blowdry', 'Hair Treatments'],
  },
  {
    name: 'Fatima',
    role: 'Nail Artist',
    bio: 'Fatima creates everything from classic French tips to intricate bridal nail art. Her steady hand and eye for design make every set a small work of art.',
    specialties: ['Nail Art', 'Gel Extensions', 'Manicure & Pedicure'],
  },
]

export default function Team() {
  const booking = useBooking()
  usePageMeta({
    title: 'Our Team — Farwa Beauty Salon, Karachi',
    description: `Meet the team behind ${YEARS_ACTIVE}+ years of beauty expertise at Farwa Beauty Salon, PECHS Block 2, Karachi.`,
    canonical: 'https://farwasalon.com/team',
    ogImage: 'https://farwasalon.com/logo.jpg',
  })

  return (
    <div className="bg-white overflow-x-hidden">
      <SkipLink />
      <Navbar />
      <main id="main" className="pt-[calc(3.375rem+env(safe-area-inset-top,0px))] md:pt-[calc(3.5rem+env(safe-area-inset-top,0px))]">

        <section className="bg-white py-16 md:py-20 px-4 sm:px-5 md:px-10 border-b border-[#e4ddd7]">
          <div className="max-w-screen-xl mx-auto">
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-3">— The people</motion.p>
            <div className="overflow-hidden">
              <motion.h1 initial={{ y: '60%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
                className="display-section text-ink">
                OUR<br />TEAM
              </motion.h1>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20 px-4 sm:px-5 md:px-10">
          <div className="max-w-screen-xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {TEAM.map((member, i) => (
                <motion.article key={member.name}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="border border-[#e4ddd7] p-6 md:p-8">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#c9a98a] to-[#7a5c48] flex items-center justify-center shrink-0">
                      <span className="text-white font-['Syne'] font-bold text-lg">{member.name[0]}</span>
                    </div>
                    <div>
                      <h2 className="font-['Syne'] font-bold text-base text-ink">{member.name}</h2>
                      <p className="text-stone text-[11px] tracking-wide font-['Inter'] uppercase">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-stone text-sm font-light leading-relaxed font-['Inter'] mb-5">{member.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {member.specialties.map(s => (
                      <span key={s} className="bg-mist text-ink text-[10px] tracking-wide font-['Inter'] uppercase px-3 py-1.5 border border-[#e4ddd7]">{s}</span>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-ink py-16 md:py-20 px-4 sm:px-5 md:px-10">
          <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
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
              <Link to="/services" className="link-underline text-white/60 text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-white transition-colors">
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
