'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { m, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useBooking, useNextSlot } from '../src/shared.jsx'
import { YEARS_ACTIVE } from '../src/data.js'

const HomeBelowFold = dynamic(() => import('./home-below-fold'), {
  loading: () => <div className="min-h-screen" />,
})

function Hero() {
  const { scrollY } = useScroll()
  const textY    = useTransform(scrollY, [0, 500], [0, -40])
  const overlayO = useTransform(scrollY, [0, 400], [0.58, 0.82])
  const videoRef = useRef(null)
  const booking  = useBooking()
  const slot     = useNextSlot()

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      v.pause()
    } else {
      v.playbackRate = 0.35
    }
  }, [])

  const thesis = [
    { text: 'Bridal. Hair. Skin. ',             em: true  },
    { text: 'Rubina\u2019s studio ',            em: false },
    { text: 'in PECHS Block 3, ',               em: false },
    { text: 'since 2008.',                      em: true  },
  ]

  return (
    <section className="relative w-full h-[100svh] min-h-[520px] max-h-[1100px] overflow-hidden bg-[#0d0609]">
      {/* Desktop: real video */}
      <video
        ref={videoRef}
        autoPlay muted loop playsInline
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover hidden md:block scale-[1.01]"
        style={{ objectPosition: '50% 35%' }}
        poster="/bridal2.jpg"
        preload="none"
      >
        <source src="/hero-mp4.mp4" type="video/mp4" />
      </video>

      {/* Mobile: static poster with Ken Burns, no video download */}
      <div
        aria-hidden="true"
        className="absolute inset-0 w-full h-full md:hidden scale-[1.01]"
        style={{
          backgroundImage: 'url(/bridal.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: '50% 35%',
          animation: 'kenburns 20s ease-in-out infinite alternate',
        }}
      />

      <m.div className="absolute inset-0 z-[1]"
        style={{
          opacity: overlayO,
          background: 'linear-gradient(to top, rgba(13,6,9,0.95) 0%, rgba(13,6,9,0.6) 38%, rgba(13,6,9,0.3) 68%, rgba(13,6,9,0.55) 100%)',
        }} />

      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 48%, rgba(0,0,0,0.5) 100%)' }} />

      <div className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px', opacity: 0.055, mixBlendMode: 'overlay',
        }} />

      <m.div
        style={{ y: textY }}
        className="absolute inset-x-0 bottom-0 z-10 px-4 sm:px-6 md:px-10 pb-[max(4.5rem,env(safe-area-inset-bottom,0px)+3rem)] sm:pb-12 md:pb-14">
        <div className="max-w-screen-2xl mx-auto">
          <div className="overflow-hidden mb-4 md:mb-6">
            <m.p
              initial={{ y: '100%' }} animate={{ y: 0 }}
              transition={{ delay: 0.15, duration: 0.9, ease: [0.16,1,0.3,1] }}
              className="text-white/70 text-[10px] sm:text-[11px] tracking-[0.28em] uppercase font-['Inter']">
              Est. 2008 &middot; PECHS Block 3, Karachi
            </m.p>
          </div>

          <h1 className="font-['Unbounded'] text-white leading-[0.95] mb-6 md:mb-8"
            style={{
              fontSize: 'clamp(1.9rem, 6.4vw, 5.25rem)',
              letterSpacing: '-0.02em',
              maxWidth: '22ch',
            }}>
            {thesis.map((line, i) => (
              <span key={i} className="block overflow-hidden">
                <m.span
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.3 + i * 0.18, duration: 1.05, ease: [0.16,1,0.3,1] }}
                  className={`block ${line.em ? 'text-white font-black' : 'text-white/80 font-extralight italic font-[\'Syne\']'}`}>
                  {line.text}
                </m.span>
              </span>
            ))}
          </h1>

          <div className="overflow-hidden mb-8 md:mb-10">
            <m.p
              initial={{ y: '100%' }} animate={{ y: 0 }}
              transition={{ delay: 1.1, duration: 0.9, ease: [0.16,1,0.3,1] }}
              className="text-white/55 text-[10px] sm:text-[11px] tracking-[0.32em] uppercase font-['Inter']">
              Farwa Beauty Salon
            </m.p>
          </div>

          <m.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.35, duration: 0.75, ease: [0.16,1,0.3,1] }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5 max-w-md sm:max-w-none">
            <button
              onClick={() => booking.open()}
              className="tap-safe inline-flex items-center justify-center sm:justify-start gap-2 bg-white text-ink text-[11px] md:text-[12px] tracking-[0.14em] uppercase font-semibold font-['Inter'] px-6 md:px-8 py-3.5 md:py-4 hover:bg-nude active:scale-[0.97] transition-all duration-300 shadow-lg shadow-black/25">
              Book an Appointment <ArrowUpRight className="w-4 h-4" />
            </button>
            <Link href="/services"
              className="tap-safe link-underline text-white/80 text-[11px] md:text-[12px] tracking-[0.14em] uppercase font-['Inter'] hover:text-white transition-colors flex items-center justify-center sm:justify-start">
              Explore Services
            </Link>
            <div className="hidden sm:flex items-center gap-2 ml-auto">
              <span className={`w-1.5 h-1.5 rounded-full ${slot.open ? 'bg-[#9cd48c]' : 'bg-[#c9a98a]'} animate-pulse`} aria-hidden="true" />
              <span className="text-white/55 text-[10px] tracking-[0.22em] uppercase font-['Inter']">
                Next slot <span className="text-white font-medium ml-1">{slot.label}</span>
              </span>
            </div>
          </m.div>

          <m.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.7 }}
            className="sm:hidden mt-4 text-white/55 text-[10px] tracking-[0.22em] uppercase font-['Inter'] flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${slot.open ? 'bg-[#9cd48c]' : 'bg-[#c9a98a]'} animate-pulse`} aria-hidden="true" />
            Next slot <span className="text-white font-medium">{slot.label}</span>
          </m.p>
        </div>
      </m.div>

      <m.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1 }}
        aria-hidden="true"
        className="hidden md:flex absolute bottom-10 right-10 z-10 flex-col items-center gap-1.5">
        <div className="w-px h-10 bg-white/25 relative overflow-hidden">
          <m.div className="absolute top-0 left-0 w-full bg-white"
            animate={{ y: ['-100%','200%'] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
            style={{ height: '40%' }} />
        </div>
        <span className="text-white/45 text-[9px] tracking-[0.2em] uppercase font-['Inter'] rotate-90 origin-center mt-2">scroll</span>
      </m.div>
    </section>
  )
}

export default function HomeClient() {
  return (
    <main id="main">
      <Hero />
      <HomeBelowFold />
    </main>
  )
}
