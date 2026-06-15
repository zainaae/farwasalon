'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { m } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useNextSlot } from '../src/shared.jsx'
import { WA_NUMBER } from '../src/data.js'
import { webmSourceFor } from '../lib/video-manifest.js'

const HomeBelowFold = dynamic(() => import('./home-below-fold'), {
  loading: () => <div className="min-h-screen" />,
})

const HERO_POSTER = '/bridal2.jpg'
const HERO_VIDEO = '/hero-mp4.mp4'
const HERO_WEBM = webmSourceFor(HERO_VIDEO)
const HERO_PLAYBACK_RATE = 0.65

function Hero() {
  const videoRef = useRef(null)
  const textRef = useRef(null)
  const overlayRef = useRef(null)
  const slot     = useNextSlot()
  const [playVideo, setPlayVideo] = useState(false)
  const [videoReady, setVideoReady] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const desktop = window.matchMedia('(min-width: 768px)').matches
    if (!desktop || reduce) return

    const enable = () => setPlayVideo(true)
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(enable, { timeout: 2000 })
      return () => cancelIdleCallback(id)
    }
    const t = setTimeout(enable, 400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!playVideo) return
    const v = videoRef.current
    if (!v) return

    const start = () => {
      v.playbackRate = HERO_PLAYBACK_RATE
      v.play().catch(() => {})
      setVideoReady(true)
    }

    if (v.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      start()
      return
    }

    const onReady = () => {
      v.removeEventListener('canplaythrough', onReady)
      v.removeEventListener('loadeddata', onReady)
      start()
    }
    v.addEventListener('canplaythrough', onReady)
    v.addEventListener('loadeddata', onReady)
    return () => {
      v.removeEventListener('canplaythrough', onReady)
      v.removeEventListener('loadeddata', onReady)
    }
  }, [playVideo])

  useEffect(() => {
    let raf = 0
    const update = () => {
      const y = window.scrollY
      if (textRef.current) textRef.current.style.transform = `translateY(${(y / 500) * -40}px)`
      if (overlayRef.current) overlayRef.current.style.opacity = String(0.48 + (Math.min(y, 400) / 400) * 0.16)
    }
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])

  return (
    <section className="relative w-full h-[100svh] min-h-[520px] max-h-[1100px] overflow-hidden bg-[#0d0609]">
      <Image
        src={HERO_POSTER}
        alt=""
        fill
        priority
        sizes="100vw"
        aria-hidden
        className="object-cover scale-[1.01]"
        style={{ objectPosition: '50% 35%' }}
      />

      {playVideo && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover hidden md:block scale-[1.01] z-[1] transition-opacity duration-700"
          style={{
            objectPosition: '50% 35%',
            opacity: videoReady ? 1 : 0,
          }}
          poster={HERO_POSTER}
          preload="auto"
        >
          {HERO_WEBM && <source src={HERO_WEBM} type="video/webm" />}
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
      )}

      <div ref={overlayRef} className="absolute inset-0 z-[1]"
        style={{
          opacity: 0.48,
          background: 'linear-gradient(to top, rgba(13,6,9,0.88) 0%, rgba(13,6,9,0.55) 38%, rgba(13,6,9,0.22) 68%, rgba(13,6,9,0.35) 100%)',
        }} />

      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.32) 100%)' }} />

      <div className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px', opacity: 0.055, mixBlendMode: 'overlay',
        }} />

      <div
        ref={textRef}
        className="absolute inset-x-0 bottom-0 z-10 px-4 sm:px-6 md:px-10 pb-[max(4.5rem,env(safe-area-inset-bottom,0px)+3rem)] sm:pb-12 md:pb-14"
        style={{ textShadow: '0 1px 12px rgba(0,0,0,0.45), 0 1px 4px rgba(0,0,0,0.25)' }}>
        <div className="max-w-screen-2xl mx-auto min-w-0 w-full">
          <div className="overflow-hidden mb-4 md:mb-5">
            <m.p
              id="hero-lede"
              initial={{ y: '100%' }} animate={{ y: 0 }}
              transition={{ delay: 0.15, duration: 0.9, ease: [0.16,1,0.3,1] }}
              className="text-[#b8aea4] text-[10px] sm:text-[11px] tracking-[0.22em] uppercase font-['Inter']">
              Est. 2008 &middot; PECHS, Karachi
            </m.p>
          </div>

          <div className="overflow-hidden mb-4 md:mb-5">
            <m.h1
              id="hero-headline"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ delay: 0.28, duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
              className="font-['Unbounded'] text-white font-semibold leading-[1.05] break-words"
              style={{
                fontSize: 'clamp(1.75rem, 5.4vw, 3.35rem)',
                letterSpacing: '-0.02em',
                maxWidth: '18ch',
              }}>
              Farwa Beauty Salon
            </m.h1>
          </div>

          <div className="overflow-hidden mb-6 md:mb-7">
            <m.p
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ delay: 0.42, duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
              className="text-white/70 text-[13px] sm:text-[15px] leading-relaxed font-['Syne'] font-light max-w-[30ch]">
              Full-service beauty studio &mdash; by appointment.
            </m.p>
          </div>

          <m.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.35, duration: 0.75, ease: [0.16,1,0.3,1] }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5 max-w-md sm:max-w-none">
            <Link href="/book"
              className="tap-safe inline-flex items-center justify-center sm:justify-start gap-2 bg-white text-ink text-[11px] md:text-[12px] tracking-[0.14em] uppercase font-semibold font-['Inter'] px-6 md:px-8 py-3.5 md:py-4 hover:bg-nude active:scale-[0.97] transition-all duration-300 shadow-lg shadow-black/25">
              Book an Appointment <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link href="/services"
              className="tap-safe link-underline text-white/80 text-[11px] md:text-[12px] tracking-[0.14em] uppercase font-['Inter'] hover:text-white transition-colors flex items-center justify-center sm:justify-start">
              Explore Services
            </Link>
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer"
              className="tap-safe text-white/40 text-[10px] tracking-[0.12em] uppercase font-['Inter'] hover:text-white/70 transition-colors flex items-center justify-center sm:justify-start">
              Or message us on WhatsApp
            </a>
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
      </div>

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
    <main id="main" className="overflow-x-clip max-w-full min-w-0">
      <Hero />
      <HomeBelowFold />
    </main>
  )
}
