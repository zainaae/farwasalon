'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { SmoothyGallery, IgIcon, useBooking } from '../../src/shared.jsx'
import { IG_LINK, GALLERY_PHOTOS, GALLERY_COMPARE_PAIRS } from '../../src/data.js'
import BeforeAfterSlider from './before-after-slider.jsx'

export default function GalleryClient() {
  const booking = useBooking()

  return (
    <main id="main" className="pt-[calc(3.375rem+env(safe-area-inset-top,0px))] md:pt-[calc(3.5rem+env(safe-area-inset-top,0px))]">

      <div className="max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10 py-12 sm:py-16 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-[#e4ddd7] pb-8 md:pb-10">
          <div>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-3">— Our work</motion.p>
            <div className="overflow-hidden">
              <motion.h1 initial={{ y: '60%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
                className="display-section text-ink">
                <span className="block">THE WORK</span> <span className="block">SPEAKS</span>
              </motion.h1>
            </div>
          </div>
          <motion.a initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            href={IG_LINK} target="_blank" rel="noreferrer"
            className="link-underline text-ink text-xs tracking-wide font-['Inter'] inline-flex items-center gap-2 shrink-0">
            <IgIcon className="w-4 h-4" /> @farwasalon on Instagram
          </motion.a>
        </div>
      </div>

      <section className="max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10 mb-12 md:mb-16">
        <p className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-6 text-center">
          — Before &amp; after
        </p>
        <div className="grid md:grid-cols-3 gap-8 md:gap-6">
          {GALLERY_COMPARE_PAIRS.map((pair) => (
            <BeforeAfterSlider key={pair.label} before={pair.before} after={pair.after} label={pair.label} />
          ))}
        </div>
        <p className="text-stone/70 text-[10px] font-['Inter'] text-center mt-4">Drag the slider to compare</p>
      </section>

      <div className="overflow-hidden pb-4">
        <SmoothyGallery photos={GALLERY_PHOTOS} />
      </div>
      <div className="px-4 sm:px-5 md:px-10 mt-4 max-w-screen-xl mx-auto mb-16">
        <p id="gallery-swipe-hint" className="text-stone text-[10px] font-['Inter']">Swipe or drag to explore; focus the carousel and use arrow keys.</p>
      </div>

      <section className="bg-ink py-20 md:py-24 px-4 sm:px-5 md:px-10">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <p className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-3">— Follow along</p>
            <h2 className="font-['Unbounded'] font-bold text-2xl md:text-3xl text-white leading-tight">
              <span className="block">See daily updates</span> <span className="block">on Instagram</span>
            </h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
            <a href={IG_LINK} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white text-ink text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-8 py-4 hover:bg-nude transition-colors duration-300">
              <IgIcon className="w-4 h-4" /> @farwasalon
            </a>
            <button onClick={() => booking.open()}
              className="tap-safe link-underline text-white/50 text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-white transition-colors inline-flex items-center gap-1.5">
              Book an Appointment <ArrowUpRight className="w-3 h-3" />
            </button>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
