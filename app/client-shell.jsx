'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { LazyMotion, MotionConfig } from 'framer-motion'
import {
  SkipLink,
  Navbar,
  StickyWA,
  StickyMobileCTA,
  shouldShowMobileCtaBar,
} from '../src/shared'
import { BookingProvider } from '../src/booking-context.jsx'
import { captureAttribution } from '../lib/attribution.js'

const loadDomAnimation = () => import('framer-motion').then((mod) => mod.domAnimation)

const SiteFooter = dynamic(() => import('./components/site-footer'), {
  loading: () => <div className="min-h-[28rem] bg-white" aria-hidden />,
})

const NewsletterModal = dynamic(() => import('./newsletter-modal'), {
  ssr: false,
})

function ScrollProgress() {
  const barRef = useRef(null)
  const [ready, setReady] = useState(false)

  /* Mount after idle so first paint / LCP is not competing with scroll listeners. */
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(() => setReady(true), { timeout: 2000 })
      return () => cancelIdleCallback(id)
    }
    const t = setTimeout(() => setReady(true), 800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!ready) return undefined
    let raf = 0
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
    }
    const fn = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', fn, { passive: true })
    return () => {
      window.removeEventListener('scroll', fn)
      cancelAnimationFrame(raf)
    }
  }, [ready])

  if (!ready) return null

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[110] h-[2px] bg-transparent pointer-events-none"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-[#c9a98a] via-[#e4c7a8] to-[#c9a98a]"
        style={{ transform: 'scaleX(0)', transition: 'transform 0.08s linear' }}
      />
    </div>
  )
}

function ScrollToTop() {
  const pathname = usePathname()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function ClientShell({ children }) {
  /* First-touch attribution: record the campaign that earned this session on
     whichever page the visitor lands on, before any internal navigation can
     overwrite the referrer. */
  useEffect(() => {
    captureAttribution()
  }, [])

  const pathname = usePathname()
  const isHome = pathname === '/'
  const hideSticky = pathname.startsWith('/book')
  const useMobileCtaBar = shouldShowMobileCtaBar(pathname)
  const [showNewsletter, setShowNewsletter] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    const enable = () => setShowNewsletter(true)
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(enable, { timeout: 2500 })
      return () => cancelIdleCallback(id)
    }
    const t = setTimeout(enable, 1500)
    return () => clearTimeout(t)
  }, [])

  const stickyHidden = hideSticky || mobileNavOpen

  return (
    <LazyMotion features={loadDomAnimation} strict>
      <MotionConfig reducedMotion="user">
        <BookingProvider>
          <ScrollProgress />
          <ScrollToTop />
          <SkipLink />
          <Navbar transparent={isHome} onMobileOpenChange={setMobileNavOpen} />
          <div className="overflow-x-clip w-full max-w-full min-w-0">
            {children}
          </div>
          <SiteFooter />
          {useMobileCtaBar ? (
            <StickyMobileCTA hidden={stickyHidden} />
          ) : (
            <StickyWA hidden={stickyHidden} />
          )}
          {showNewsletter ? <NewsletterModal /> : null}
        </BookingProvider>
      </MotionConfig>
    </LazyMotion>
  )
}
