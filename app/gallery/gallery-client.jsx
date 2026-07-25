'use client'

import { m } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { SmoothyGallery, IgIcon, useBooking } from '../../src/shared.jsx'
import { IG_LINK, GALLERY_PHOTOS, GALLERY_SHOWCASE_ITEMS } from '../../src/data.js'
import WorkShowcaseCard from './work-showcase-card.jsx'

export default function GalleryClient() {
  const booking = useBooking()

  return (
    <main id="main" className="page-content overflow-x-clip max-w-full min-w-0">

      <div className="section-shell section-pad">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-border-soft pb-8 md:pb-10">
          <div>
            <m.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="eyebrow mb-3">— Our work</m.p>
            <div className="overflow-hidden">
              <m.h1 initial={{ y: '60%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
                className="display-section text-ink">
                <span className="block">THE WORK</span> <span className="block">SPEAKS</span>
              </m.h1>
            </div>
          </div>
          <m.a initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            href={IG_LINK} target="_blank" rel="noreferrer"
            className="link-underline !inline-flex items-center gap-2 shrink-0 text-ink text-xs tracking-wide font-['Inter']">
            <IgIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0">@farwasalon on Instagram</span>
          </m.a>
        </div>
      </div>

      <section className="section-shell mb-10 md:mb-14" aria-labelledby="gallery-showcase-heading">
        <p className="eyebrow mb-3 text-center">— Work we do</p>
        <h2 id="gallery-showcase-heading" className="section-title text-xl md:text-2xl text-center mb-2">
          Studio highlights
        </h2>
        <p className="text-stone text-sm font-['Inter'] font-light text-center max-w-xl mx-auto mb-8">
          Real treatments from our PECHS studio — threading, bridal, and nails. More looks live on Instagram.
        </p>
        <div className="grid md:grid-cols-3 gap-8 md:gap-6">
          {GALLERY_SHOWCASE_ITEMS.map((item, i) => (
            <WorkShowcaseCard key={item.label} src={item.src} label={item.label} alt={item.alt} video={item.video} index={i} />
          ))}
        </div>
      </section>

      <div className="overflow-hidden pb-2">
        <SmoothyGallery photos={GALLERY_PHOTOS} />
      </div>
      <div className="section-shell mt-3 mb-14">
        <p id="gallery-swipe-hint" className="text-body text-[10px] text-center sm:text-left">
          Swipe or drag to explore · visit the PECHS studio for the full portfolio
        </p>
      </div>

      <section className="bg-ink py-20 md:py-24">
        <div className="section-shell flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <m.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <p className="eyebrow mb-3">— Follow along</p>
            <h2 className="font-['Unbounded'] font-bold text-2xl md:text-3xl text-white leading-tight">
              <span className="block">See daily updates</span> <span className="block">on Instagram</span>
            </h2>
          </m.div>
          <m.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
            <a href={IG_LINK} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white text-ink text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-8 py-4 hover:bg-nude transition-colors duration-300">
              <IgIcon className="w-4 h-4" /> @farwasalon
            </a>
            <button onClick={() => booking.open()}
              className="tap-safe link-underline !inline-flex items-center gap-1.5 text-white/50 text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-white transition-colors">
              <span className="min-w-0">Book an Appointment</span>
              <ArrowUpRight className="w-3 h-3 shrink-0" aria-hidden="true" />
            </button>
          </m.div>
        </div>
      </section>
    </main>
  )
}
