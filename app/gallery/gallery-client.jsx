'use client'

import Link from 'next/link'
import ArrowUpRight from '../components/icon-sprite.jsx'
import { SmoothyGallery } from '../../src/shared.jsx'
import { WA_DEFAULT, GALLERY_PHOTOS, GALLERY_SHOWCASE_ITEMS } from '../../src/data.js'
import WorkShowcaseCard from './work-showcase-card.jsx'
import PageCloseCta from '../components/page-close-cta.jsx'

export default function GalleryClient() {
  const showcase = GALLERY_SHOWCASE_ITEMS
  const stripPhotos = GALLERY_PHOTOS
  /* Showcase already presents a single owned tile (+ video). Skip the
     duplicate strip when there is only one photo — still show the strip when
     more owned shots land. */
  const showStrip = stripPhotos.length > 1

  return (
    <main id="main" className="page-content overflow-x-clip max-w-full min-w-0">

      <div className="section-shell section-pad">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-border-soft pb-10 md:pb-12">
          <div className="title-stack max-w-xl border-l-2 border-plum pl-5 lg:pl-6">
            <p className="hero-fade-up eyebrow text-plum">— Gallery</p>
            <h1 className="hero-rise display-page text-ink" style={{ animationDuration: '0.9s' }}>
              What we do
            </h1>
            <p className="hero-fade-up text-body" style={{ animationDelay: '0.15s' }}>
              Owned studio craft from our PECHS chair — nails and detail work
              on camera today. Visit in person for the full portfolio, or book a
              slot below.
            </p>
          </div>
          {/* Visibility on a wrapper — `.btn-loud { display: inline-flex }` beats
              Tailwind `hidden`, which previously left a loud Book pill on mobile
              stacked on the quiet link + sticky chrome. */}
          <div className="hidden md:block shrink-0 md:self-end">
            <Link
              href="/book"
              className="hero-fade-up tap-safe btn-loud !min-h-12 !text-[12px]"
              style={{ animationDelay: '0.2s' }}
            >
              Book an Appointment <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
          {/* Mobile sticky already carries Book — keep a quiet in-flow link for
              crawlers / e2e without a second loud pill on fold 1. */}
          <Link
            href="/book"
            className="hero-fade-up tap-safe md:hidden inline-flex items-center gap-1.5 min-h-[44px] text-ink text-[11px] tracking-[0.14em] uppercase font-semibold font-[family-name:var(--font-inter)] link-underline self-start"
            style={{ animationDelay: '0.2s' }}
          >
            Book an Appointment <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {showcase.length > 0 && (
        <section className="section-shell mb-16 md:mb-20 lg:mb-24" aria-labelledby="gallery-showcase-heading">
          <h2 id="gallery-showcase-heading" className="section-title mb-8 md:mb-10 max-w-xl">
            Services we offer
          </h2>
          {showcase.length === 1 ? (
            <div className="max-w-3xl">
              <WorkShowcaseCard
                src={showcase[0].src}
                label={showcase[0].label}
                alt={showcase[0].alt}
                video={showcase[0].video}
                index={0}
                featured
              />
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-5 md:gap-6 lg:gap-7 items-stretch">
              <div className="lg:col-span-7 min-w-0 min-h-0">
                <WorkShowcaseCard
                  src={showcase[0].src}
                  label={showcase[0].label}
                  alt={showcase[0].alt}
                  video={showcase[0].video}
                  index={0}
                  featured
                />
              </div>
              <div className="lg:col-span-5 min-w-0 grid sm:grid-cols-2 lg:grid-cols-1 gap-5 md:gap-6 lg:content-stretch">
                {showcase.slice(1).map((item, i) => (
                  <WorkShowcaseCard
                    key={item.label}
                    src={item.src}
                    label={item.label}
                    alt={item.alt}
                    video={item.video}
                    index={i + 1}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {showStrip && (
        <>
          <div className="overflow-hidden pb-2">
            <SmoothyGallery photos={stripPhotos} />
          </div>
          <div className="section-shell mt-3 mb-14">
            <p id="gallery-swipe-hint" className="text-body text-[10px] text-center sm:text-left">
              Swipe or drag to explore · visit the PECHS studio for the full portfolio
            </p>
          </div>
        </>
      )}

      {!showcase.length && stripPhotos.length === 1 && (
        <section className="section-shell mb-16 md:mb-20">
          <WorkShowcaseCard
            src={stripPhotos[0].src}
            label={stripPhotos[0].label}
            alt={stripPhotos[0].label}
            video={stripPhotos[0].video}
            index={0}
            featured
          />
        </section>
      )}

      <PageCloseCta
        eyebrow="— Ready when you are"
        title="Book a visit at the PECHS studio"
        body="See the work in person — live slots online, or WhatsApp if you prefer."
        bookHref="/book"
        waHref={WA_DEFAULT}
        waFrom="gallery"
      />
    </main>
  )
}
