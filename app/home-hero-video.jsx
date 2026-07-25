'use client'

import { useEffect, useRef, useState } from 'react'
import { webmSourceFor } from '../lib/video-manifest.js'

const HERO_VIDEO = '/hero-mp4.mp4'
const HERO_WEBM = webmSourceFor(HERO_VIDEO)
const HERO_PLAYBACK_RATE = 0.65

/** Desktop-only hero video + light parallax — deferred so it never blocks LCP. */
export default function HomeHeroVideo() {
  const videoRef = useRef(null)
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
    const text = document.getElementById('hero-copy')
    const overlay = document.getElementById('hero-overlay')
    if (!text && !overlay) return

    let raf = 0
    const update = () => {
      const y = window.scrollY
      if (text) text.style.transform = `translateY(${(y / 500) * -40}px)`
      if (overlay) overlay.style.opacity = String(0.48 + (Math.min(y, 400) / 400) * 0.16)
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  if (!playVideo) return null

  return (
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
      preload="metadata"
    >
      {HERO_WEBM && <source src={HERO_WEBM} type="video/webm" />}
      <source src={HERO_VIDEO} type="video/mp4" />
    </video>
  )
}
