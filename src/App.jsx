import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Analytics } from '@vercel/analytics/react'

gsap.registerPlugin(ScrollTrigger)

const Home     = lazy(() => import('./pages/Home'))
const Services = lazy(() => import('./pages/Services'))
const Gallery  = lazy(() => import('./pages/Gallery'))
const About    = lazy(() => import('./pages/About'))
const Contact  = lazy(() => import('./pages/Contact'))

/* ─── Single global Lenis instance — created once, lives for app lifetime ── */
function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = time => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])
  return null
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="loader" aria-label="Loading" />
    </div>
  )
}

function NotFound() {
  useEffect(() => { document.title = '404 — Farwa Beauty Salon' }, [])
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <p className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-3">— 404</p>
      <h1 className="font-['Unbounded'] font-bold text-4xl md:text-6xl text-ink mb-4 uppercase">Not Found</h1>
      <p className="text-stone max-w-md mb-8 font-light">
        The page you're looking for has moved or never existed. Head back home and we'll get you where you need to go.
      </p>
      <Link to="/" className="inline-flex items-center gap-2 bg-ink text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-7 py-4 hover:bg-stone transition-colors">
        Back to home
      </Link>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SmoothScroll />
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/"         element={<Home />}     />
          <Route path="/services" element={<Services />} />
          <Route path="/gallery"  element={<Gallery />}  />
          <Route path="/about"    element={<About />}    />
          <Route path="/contact"  element={<Contact />}  />
          <Route path="*"         element={<NotFound />} />
        </Routes>
      </Suspense>
      <Analytics />
    </BrowserRouter>
  )
}
