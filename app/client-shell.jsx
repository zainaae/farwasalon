'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion'
import {
  BookingProvider,
  SkipLink,
  Navbar,
  Footer,
  StickyWA,
  StickyMobileCTA,
  shouldShowMobileCtaBar,
} from '../src/shared'
import NewsletterModal from './newsletter-modal'

function ScrollProgress() {
  const barRef = useRef(null)
  useEffect(() => {
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
  }, [])
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
  const pathname = usePathname()
  const isHome = pathname === '/'
  const hideSticky = pathname.startsWith('/book')
  const useMobileCtaBar = shouldShowMobileCtaBar(pathname)

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <BookingProvider>
        <ScrollProgress />
        <ScrollToTop />
        <SkipLink />
        <Navbar transparent={isHome} />
        <div className="overflow-x-clip w-full max-w-full min-w-0">
          {children}
        </div>
        <Footer />
        {useMobileCtaBar ? (
          <StickyMobileCTA hidden={hideSticky} />
        ) : (
          <StickyWA hidden={hideSticky} />
        )}
        <NewsletterModal />
        </BookingProvider>
      </MotionConfig>
    </LazyMotion>
  )
}
