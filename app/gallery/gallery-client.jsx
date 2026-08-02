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
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-border-soft pb-10 md:pb-12">
          <div>
            {/* CSS entrances — framer initial{opacity:0} + overflow-hidden clipped
                "DO" until hydrate; same LCP fix pattern as /services. */}
            <p className="hero-fade-up eyebrow mb-4">— Gallery</p>
            <div className="overflow-hidden">
              <h1 className="hero-rise display-section text-ink" style={{ animationDuration: '0.9s' }}>
                <span className="block">WHAT WE</span> <span className="block">DO</span>
              </h1>
            </div>
            <p className="hero-fade-up text-body max-w-xl mt-5" style={{ animationDelay: '0.15s' }}>
              Every service we offer, in one place. Finished looks on real clients go up on
              our Instagram — we would rather show you those than restage them here.
            </p>
          </div>
          <a
            href={IG_LINK} target="_blank" rel="noreferrer"
            className="hero-fade-up link-underline !inline-flex items-center gap-2 shrink-0 text-ink text-xs tracking-wide font-['Inter']"
            style={{ animationDelay: '0.2s' }}>
            <IgIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0">@farwasalon</span>
          </a>
        </div>
      </div>

      <section className="section-shell mb-12 md:mb-16" aria-labelledby="gallery-showcase-heading">
        <h2 id="gallery-showcase-heading" className="section-title text-xl md:text-2xl text-center mb-8">
          Services we offer
        </h2>
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
