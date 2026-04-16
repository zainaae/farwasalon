import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Navbar, Footer, SmoothyGallery, IgIcon, StickyWA, usePageMeta } from '../shared.jsx'
import { WA_DEFAULT, IG_LINK, GALLERY_PHOTOS } from '../data.js'

export default function Gallery() {
  usePageMeta({
    title: 'Gallery — Farwa Beauty Salon, Karachi',
    description: 'Real work from our Karachi salon — bridal transformations, hair, facials, nails and more. Follow us @farwasalon for daily updates.',
  })

  return (
    <div className="bg-white overflow-x-hidden">
      <Navbar />
      <div className="pt-16 md:pt-[68px]">

        {/* Header */}
        <div className="max-w-screen-xl mx-auto px-5 md:px-10 py-16 md:py-20">
          <div className="flex items-end justify-between gap-6 border-b border-[#e4ddd7] pb-10">
            <div>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-3">— Our work</motion.p>
              <div className="overflow-hidden">
                <motion.h1 initial={{ y: '60%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
                  className="display-section text-ink">
                  THE WORK<br />SPEAKS
                </motion.h1>
              </div>
            </div>
            <motion.a initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              href={IG_LINK} target="_blank" rel="noreferrer"
              className="hidden md:flex link-underline text-ink text-xs tracking-wide font-['Inter'] items-center gap-2 shrink-0">
              <IgIcon className="w-4 h-4" /> @farwasalon on Instagram
            </motion.a>
          </div>
        </div>

        {/* Drag gallery */}
        <div className="overflow-hidden pb-4">
          <SmoothyGallery photos={GALLERY_PHOTOS} />
        </div>
        <div className="px-5 md:px-10 mt-4 max-w-screen-xl mx-auto mb-16">
          <p className="text-stone text-[10px] font-['Inter']">← drag to explore</p>
        </div>

        {/* Instagram CTA */}
        <section className="bg-ink py-20 md:py-24 px-5 md:px-10">
          <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <p className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-3">— Follow along</p>
              <h2 className="font-['Unbounded'] font-bold text-2xl md:text-3xl text-white leading-tight">
                See daily updates<br />on Instagram
              </h2>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.15 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
              <a href={IG_LINK} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white text-ink text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-8 py-4 hover:bg-nude transition-colors duration-300">
                <IgIcon className="w-4 h-4" /> @farwasalon
              </a>
              <a href={WA_DEFAULT} target="_blank" rel="noreferrer"
                className="link-underline text-white/50 text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-white transition-colors inline-flex items-center gap-1.5">
                Book an Appointment <ArrowUpRight className="w-3 h-3" />
              </a>
            </motion.div>
          </div>
        </section>

      </div>
      <Footer />
      <StickyWA />
    </div>
  )
}
