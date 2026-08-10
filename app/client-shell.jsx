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
import { track } from '../src/site-config.js'
import { captureAttribution } from '../lib/attribution.js'

const loadDomAnimation = () => import('framer-motion').then((mod) => mod.domAnimation)

const SiteFooter = dynamic(() => import('./components/site-footer'), {
  loading: () => <div className="min-h-[28rem] bg-white" aria-hidden />,
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

const SCROLL_DEPTH_THRESHOLDS = [25, 50, 75, 100]

/* Idle-mounted like ScrollProgress — no scroll listener until after first paint. */
function ScrollDepthTracker() {
  const [ready, setReady] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(() => setReady(true), { timeout: 2000 })
      return () => cancelIdleCallback(id)
    }
    const t = setTimeout(() => setReady(true), 800)
    return () => clearTimeout(t)
  }, [])

  /* Keyed on pathname so `fired` resets per page. ClientShell never remounts
     across a client-side navigation, so a Set created once would have let the
     first page consume every threshold and reported nothing for the rest of
     the visit — and the event carries `page` for the same reason: a depth with
     no page attached cannot be attributed to anything. */
  useEffect(() => {
    if (!ready) return undefined
    const fired = new Set()
    let frame = 0

    const measure = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0
      for (const threshold of SCROLL_DEPTH_THRESHOLDS) {
        if (pct >= threshold && !fired.has(threshold)) {
          fired.add(threshold)
          track('ScrollDepth', { depth: String(threshold), page: pathname })
        }
      }
    }

    /* scrollHeight forces layout, so reading it on every scroll event is a
       synchronous reflow per frame. One rAF-coalesced read instead. */
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [ready, pathname])

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
  /* Admin CRM/POS has its own shell — no marketing nav, footer, or sticky CTAs. */
  const isAdmin = pathname.startsWith('/admin')
  const isHome = pathname === '/'
  const hideSticky = pathname.startsWith('/book') || isAdmin
  const useMobileCtaBar = !isAdmin && shouldShowMobileCtaBar(pathname)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const stickyHidden = hideSticky || mobileNavOpen

  if (isAdmin) {
    return (
      <LazyMotion features={loadDomAnimation} strict>
        <MotionConfig reducedMotion="user">
          <ScrollToTop />
          {children}
        </MotionConfig>
      </LazyMotion>
    )
  }

  return (
    <LazyMotion features={loadDomAnimation} strict>
      <MotionConfig reducedMotion="user">
          <ScrollProgress />
          <ScrollDepthTracker />
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
      </MotionConfig>
    </LazyMotion>
  )
}
