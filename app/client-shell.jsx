'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion'
import { BookingProvider, SkipLink, Navbar, Footer, StickyWA } from '../src/shared'

function ScrollProgress() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const fn = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setP(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    window.addEventListener('resize', fn, { passive: true })
    return () => {
      window.removeEventListener('scroll', fn)
      window.removeEventListener('resize', fn)
    }
  }, [])
  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[110] h-[2px] bg-transparent pointer-events-none"
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-[#c9a98a] via-[#e4c7a8] to-[#c9a98a]"
        style={{ transform: `scaleX(${p})`, transition: 'transform 0.08s linear' }}
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

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <BookingProvider>
        <ScrollProgress />
        <ScrollToTop />
        <SkipLink />
        <Navbar transparent={isHome} />
        {children}
        <Footer />
        <StickyWA />
        </BookingProvider>
      </MotionConfig>
    </LazyMotion>
  )
}
