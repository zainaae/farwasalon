'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { m, AnimatePresence } from 'framer-motion'
import { X, Check, ArrowUpRight } from 'lucide-react'

const STORAGE_KEY = 'farwa-newsletter-seen'
const DELAY_MS = 25_000

function alreadySeen() {
  if (typeof window === 'undefined') return true
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return true
  }
}

function markSeen() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // ignore quota / private mode
  }
}

export default function NewsletterModal() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [website, setWebsite] = useState('')
  const [error, setError] = useState('')
  const [state, setState] = useState('idle') // idle | submitting | success
  const previouslyFocused = useRef(null)
  const firstInputRef = useRef(null)

  // Decide whether this route should ever surface the modal.
  const eligible = !pathname?.startsWith('/book') && !pathname?.startsWith('/cancel')

  useEffect(() => {
    if (!eligible || alreadySeen()) return

    let fired = false
    let timer = null

    const triggerOnce = () => {
      if (fired) return
      fired = true
      setOpen(true)
    }

    timer = setTimeout(triggerOnce, DELAY_MS)

    const onPointerLeave = (e) => {
      // exit-intent: mouse leaves through the top of the viewport
      if (e.clientY <= 0) triggerOnce()
    }
    document.addEventListener('mouseleave', onPointerLeave)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mouseleave', onPointerLeave)
    }
  }, [eligible, pathname])

  // Focus management
  useEffect(() => {
    if (!open) return
    previouslyFocused.current = document.activeElement
    const t = setTimeout(() => firstInputRef.current?.focus(), 50)

    const onKey = (e) => {
      if (e.key === 'Escape') dismiss()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      if (previouslyFocused.current?.focus) {
        try { previouslyFocused.current.focus() } catch { /* element gone — fine */ }
      }
    }
  }, [open])

  function dismiss() {
    setOpen(false)
    markSeen()
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (state === 'submitting') return
    setError('')
    setState('submitting')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim(),
          website,
          source: typeof window !== 'undefined' ? window.location.pathname : '',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Could not save. Please try again.')
        setState('idle')
        return
      }
      setState('success')
      markSeen()
    } catch {
      setError('Network error. Please try again.')
      setState('idle')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/60 backdrop-blur-sm p-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="newsletter-heading"
          onClick={dismiss}
        >
          <m.div
            initial={{ y: 24, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md max-h-[min(90dvh,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-2rem))] overflow-y-auto overscroll-contain bg-white shadow-2xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label="Close newsletter signup"
              className="tap-safe absolute top-2 right-2 p-2 text-stone hover:text-ink transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-7 py-9 sm:px-9 sm:py-10">
              {state === 'success' ? (
                <div role="status" aria-live="polite" className="text-center">
                  <div className="w-14 h-14 mx-auto mb-5 bg-[#e8f5e3] flex items-center justify-center rounded-full">
                    <Check className="w-7 h-7 text-[#4a9b3f]" strokeWidth={2.5} />
                  </div>
                  <h2 id="newsletter-heading" className="font-['Syne'] font-bold text-xl text-ink uppercase tracking-tight mb-2">
                    Welcome!
                  </h2>
                  <p className="text-stone text-sm font-['Inter'] font-light mb-6">
                    Your 10% off code will arrive in your inbox shortly. We&apos;ll only send you the good stuff.
                  </p>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="tap-safe inline-flex items-center justify-center gap-2 bg-ink text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-6 py-3"
                  >
                    Continue browsing
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-[#c9a98a] text-[10px] tracking-[0.32em] uppercase font-['Inter'] font-medium mb-3">
                    — A welcome gift
                  </p>
                  <h2 id="newsletter-heading" className="font-['Unbounded'] font-bold text-2xl sm:text-[1.65rem] text-ink leading-tight mb-3">
                    Get <span className="text-[#c9a98a]">10% off</span> your first facial
                  </h2>
                  <p className="text-stone text-[13px] font-['Inter'] font-light leading-relaxed mb-6">
                    Plus monthly seasonal tips, bridal timelines, and early access to slots in peak season. No spam — promise.
                  </p>

                  <form onSubmit={onSubmit} className="flex flex-col gap-3">
                    {/* honeypot */}
                    <input
                      type="text"
                      name="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
                    />

                    <div>
                      <label htmlFor="nl-email" className="sr-only">Email address</label>
                      <input
                        ref={firstInputRef}
                        id="nl-email"
                        type="email"
                        required
                        autoComplete="email"
                        inputMode="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-[#e4ddd7] bg-white px-3.5 py-3 text-ink text-sm font-['Inter'] placeholder:text-stone/50 focus:outline-none focus:border-ink"
                      />
                    </div>
                    <div>
                      <label htmlFor="nl-name" className="sr-only">First name (optional)</label>
                      <input
                        id="nl-name"
                        type="text"
                        autoComplete="given-name"
                        placeholder="First name (optional)"
                        maxLength={60}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full border border-[#e4ddd7] bg-white px-3.5 py-3 text-ink text-sm font-['Inter'] placeholder:text-stone/50 focus:outline-none focus:border-ink"
                      />
                    </div>

                    {error && (
                      <p role="alert" aria-live="assertive" className="text-[#c44a4a] text-xs font-['Inter']">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={state === 'submitting'}
                      aria-busy={state === 'submitting'}
                      className="tap-safe inline-flex items-center justify-center gap-2 bg-ink text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-6 py-3.5 hover:bg-stone disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {state === 'submitting' ? 'Saving…' : <>Get my 10% off <ArrowUpRight className="w-3.5 h-3.5" /></>}
                    </button>
                  </form>

                  <p className="mt-4 text-stone text-[10px] font-['Inter']">
                    We never share your email. Unsubscribe any time.{' '}
                    <button
                      type="button"
                      onClick={dismiss}
                      className="underline underline-offset-2 hover:text-stone"
                    >
                      No thanks
                    </button>
                  </p>
                </>
              )}
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
