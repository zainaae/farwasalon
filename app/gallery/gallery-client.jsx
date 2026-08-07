'use client'

import ArrowUpRight from '../components/icon-sprite.jsx'
import { SmoothyGallery, useBooking } from '../../src/shared.jsx'
import { WA_DEFAULT, GALLERY_PHOTOS, GALLERY_SHOWCASE_ITEMS } from '../../src/data.js'
import WorkShowcaseCard from './work-showcase-card.jsx'
import PageCloseCta from '../components/page-close-cta.jsx'

export default function GalleryClient() {
  const booking = useBooking()

  return (
    <main id="main" className="page-content overflow-x-clip max-w-full min-w-0">

      <div className="section-shell section-pad">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-border-soft pb-10 md:pb-12">
          <div className="title-stack max-w-xl">
            {/* CSS entrances — framer initial{opacity:0} + overflow-hidden clipped
                "DO" until hydrate; same LCP fix pattern as /services. */}
            <p className="hero-fade-up eyebrow">— Gallery</p>
            {/* No overflow-hidden — it clipped Unbounded descenders on "DO". */}
            <h1 className="hero-rise display-section text-ink" style={{ animationDuration: '0.9s' }}>
              What we do
            </h1>
            <p className="hero-fade-up text-body" style={{ animationDelay: '0.15s' }}>
              A look at the services we offer in our PECHS studio — bridal, hair,
              skin, nails. Visit in person for the full portfolio, or book a slot
              below.
            </p>
          </div>
          <button
            type="button"
            onClick={() => booking.open()}
            className="hero-fade-up tap-safe btn-primary shrink-0 self-start"
            style={{ animationDelay: '0.2s' }}
          >
            Book an Appointment <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <section className="section-shell mb-12 md:mb-16" aria-labelledby="gallery-showcase-heading">
        <h2 id="gallery-showcase-heading" className="section-title text-center mb-8">
          Services we offer
        </h2>
        <div className="grid md:grid-cols-3 gap-8 md:gap-8">
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

      <PageCloseCta
        eyebrow="— Ready when you are"
        title="Book a visit at the PECHS studio"
        body="See the work in person — live slots online, or WhatsApp if you prefer."
        waHref={WA_DEFAULT}
        waFrom="gallery"
        onBookClick={() => booking.open()}
      />
    </main>
  )
}
