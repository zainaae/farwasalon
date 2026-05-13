import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense, Component } from 'react'
import { MotionConfig } from 'framer-motion'
import { BookingProvider } from './shared.jsx'

const Home     = lazy(() => import('./pages/Home'))
const Services = lazy(() => import('./pages/Services'))
const Gallery  = lazy(() => import('./pages/Gallery'))
const About    = lazy(() => import('./pages/About'))
const Contact  = lazy(() => import('./pages/Contact'))
const Privacy  = lazy(() => import('./pages/Privacy'))
const Team     = lazy(() => import('./pages/Team'))
const FAQ      = lazy(() => import('./pages/FAQ'))
const Blog     = lazy(() => import('./pages/Blog'))

/* ─── Champagne scroll progress bar — fixed top of viewport ───── */
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
    <div aria-hidden="true" className="fixed top-0 left-0 right-0 z-[110] h-[2px] bg-transparent pointer-events-none">
      <div className="h-full origin-left bg-gradient-to-r from-[#c9a98a] via-[#e4c7a8] to-[#c9a98a]"
        style={{ transform: `scaleX(${p})`, transition: 'transform 0.08s linear' }} />
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="loader" role="status" aria-live="polite" aria-busy="true" aria-label="Loading page" />
    </div>
  )
}

function NotFound() {
  useEffect(() => {
    document.title = '404 — Farwa Beauty Salon'
    let meta = document.querySelector('meta[name="robots"]')
    if (!meta) { meta = document.createElement('meta'); meta.name = 'robots'; document.head.appendChild(meta) }
    meta.content = 'noindex, nofollow'
    return () => { meta.content = 'index, follow' }
  }, [])
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

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) {
    const msg = error?.message ?? 'Unknown error'
    const stack = (info?.componentStack ?? '').slice(0, 300)
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('ErrorBoundary', { props: { message: msg, stack } })
    }
  }
  render() {
    if (this.state.error) {
      return (
        <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
          <p className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-3">— Something went wrong</p>
          <h1 className="font-['Unbounded'] font-bold text-3xl text-ink mb-4">Unexpected Error</h1>
          <p className="text-stone max-w-sm mb-8 font-light text-sm">Please refresh the page. If the problem persists, contact us on WhatsApp.</p>
          <button onClick={() => window.location.reload()}
            className="bg-ink text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-7 py-4 hover:bg-stone transition-colors">
            Refresh
          </button>
        </main>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
      <BookingProvider>
        <ScrollProgress />
        <ScrollToTop />
        <ErrorBoundary>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/"                       element={<Home />}     />
            <Route path="/services"               element={<Services />} />
            <Route path="/services/:categorySlug" element={<Services />} />
            <Route path="/gallery"                element={<Gallery />}  />
            <Route path="/about"                  element={<About />}    />
            <Route path="/contact"                element={<Contact />}  />
            <Route path="/privacy"                element={<Privacy />}  />
            <Route path="/team"                   element={<Team />}     />
            <Route path="/faq"                    element={<FAQ />}      />
            <Route path="/blog"                   element={<Blog />}     />
            <Route path="/blog/:slug"             element={<Blog />}     />
            <Route path="*"                       element={<NotFound />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </BookingProvider>
      </MotionConfig>
    </BrowserRouter>
  )
}
