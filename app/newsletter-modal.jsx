/* This modal used to promise "Get 10% off your first facial" and, on success,
   "Your 10% off code will arrive in your inbox shortly."

   Nothing sent it. appendSubscriber() writes to a Subscribers tab that has
   exactly one caller and zero readers — no ESP, no template, no send path, no
   unsubscribe endpoint. Every person who signed up was told a code was coming
   and then heard nothing, which teaches them the business does not follow
   through. On a site whose entire position is that the printed price is the
   price, that was the most expensive sentence on it.

   The promise is gone rather than the signup. What it now says is the truth:
   occasional updates, and only that. If a welcome offer is ever wanted back,
   the send path has to exist first — the discount is the easy half. */
'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import ArrowUpRight from './components/icon-sprite.jsx'
import { usePathname } from 'next/navigation'
import { m, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { track } from '../src/site-config.js'

const STORAGE_KEY = 'farwa-newsletter-seen'
const SCROLL_DEPTH = 0.6

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

  /* Allowlist, not denylist — reading pages only. */
  const eligible = pathname === '/' || pathname?.startsWith('/blog')

  useEffect(() => {
    if (!eligible || alreadySeen()) return

    let fired = false

    const triggerOnce = () => {
      if (fired) return
      fired = true
      setOpen(true)
      track('NewsletterOpen')
    }

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max > 0 && window.scrollY / max >= SCROLL_DEPTH) triggerOnce()
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const onPointerLeave = (e) => {
      if (e.clientY <= 0) triggerOnce()
    }
    document.addEventListener('mouseleave', onPointerLeave)

    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('mouseleave', onPointerLeave)
    }
  }, [eligible, pathname])

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
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-ink/55 backdrop-blur-[2px] p-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="newsletter-heading"
          onClick={dismiss}
        >
          <m.div
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg max-h-[min(90dvh,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-2rem))] overflow-y-auto overscroll-contain bg-white shadow-2xl mx-auto border-t-2 border-plum"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label="Close newsletter signup"
              className="tap-safe absolute top-2.5 right-2.5 z-10 p-2 text-white/80 hover:text-white sm:text-stone sm:hover:text-ink transition-colors bg-ink/25 sm:bg-transparent rounded-sm"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Real Farwa photo — not a generic SaaS popup header */}
            <div className="relative h-[7.5rem] sm:h-[8.5rem] overflow-hidden bg-plum-deep">
              <Image
                src="/facial.jpg"
                alt=""
                fill
                quality={55}
                sizes="(max-width: 512px) 100vw, 512px"
                className="object-cover object-[50%_28%] opacity-90"
                aria-hidden
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(63,22,49,0.92) 0%, rgba(63,22,49,0.35) 55%, rgba(63,22,49,0.45) 100%)',
                }}
              />
              <p className="absolute bottom-3 left-6 right-12 text-accent-gold text-[10px] tracking-[0.28em] uppercase font-[family-name:var(--font-inter)]">
                Farwa · PECHS
              </p>
            </div>

            <div className="px-6 py-7 sm:px-8 sm:py-8">
              {state === 'success' ? (
                <div role="status" aria-live="polite">
                  <div className="w-11 h-11 mb-4 bg-plum/10 flex items-center justify-center border border-plum/25">
                    <Check className="w-5 h-5 text-plum" strokeWidth={2.5} />
                  </div>
                  <h2 id="newsletter-heading" className="font-[family-name:var(--font-fraunces)] font-bold text-xl text-ink tracking-tight mb-2">
                    Welcome!
                  </h2>
                  <p className="text-stone text-sm font-[family-name:var(--font-inter)] font-light mb-6 leading-relaxed">
                    You&apos;re on the list. We send seasonal tips and slot news occasionally — never often, never spam.
                  </p>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="tap-safe inline-flex items-center justify-center gap-2 bg-plum-deep text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-[family-name:var(--font-inter)] px-6 py-3 hover:bg-plum transition-colors"
                  >
                    Continue browsing
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-plum text-[10px] tracking-[0.28em] uppercase font-[family-name:var(--font-inter)] font-medium mb-2.5">
                    — Salon updates
                  </p>
                  <h2 id="newsletter-heading" className="font-[family-name:var(--font-fraunces)] font-bold text-[1.45rem] sm:text-[1.65rem] text-ink leading-tight mb-2.5">
                    Tips from the chair at Farwa
                  </h2>
                  <p className="text-stone text-[13px] font-[family-name:var(--font-inter)] font-light leading-relaxed mb-6 max-w-sm">
                    Occasional bridal timelines, seasonal care notes, and early word on peak-season slots.
                  </p>

                  <form onSubmit={onSubmit} className="flex flex-col gap-3">
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
                        className="w-full border border-border-soft bg-white px-3.5 py-3 text-ink text-sm font-[family-name:var(--font-inter)] placeholder:text-stone/50 focus:border-plum focus:ring-1 focus:ring-plum/20"
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
                        className="w-full border border-border-soft bg-white px-3.5 py-3 text-ink text-sm font-[family-name:var(--font-inter)] placeholder:text-stone/50 focus:border-plum focus:ring-1 focus:ring-plum/20"
                      />
                    </div>

                    {error && (
                      <p role="alert" aria-live="assertive" className="text-[#c44a4a] text-xs font-[family-name:var(--font-inter)]">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={state === 'submitting'}
                      aria-busy={state === 'submitting'}
                      className="tap-safe inline-flex items-center justify-center gap-2 bg-plum-deep text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-[family-name:var(--font-inter)] px-6 py-3.5 hover:bg-plum disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {state === 'submitting' ? 'Saving…' : <>Join the list <ArrowUpRight className="w-3.5 h-3.5" /></>}
                    </button>
                  </form>

                  <p className="mt-4 text-stone text-[10px] font-[family-name:var(--font-inter)]">
                    We never share your email.{' '}
                    <button
                      type="button"
                      onClick={dismiss}
                      className="underline underline-offset-2 hover:text-ink"
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
