'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    const msg = error?.message ?? 'Unknown error'
    const digest = error?.digest ?? ''
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('ErrorBoundary', { props: { message: msg, digest } })
    }
    // Server-side record too — Plausible is ad-blockable and may not have
    // loaded when the error hit. Fire-and-forget; errors here are swallowed.
    try {
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, digest, url: window.location.pathname }),
        keepalive: true,
      }).catch(() => {})
    } catch {
      // never let reporting break the error page itself
    }
  }, [error])

  return (
    <main id="main" className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center pt-[calc(3.375rem+env(safe-area-inset-top,0px))]">
      <p className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-3">
        — Something went wrong
      </p>
      <h1 className="font-['Unbounded'] font-bold text-3xl text-ink mb-4">
        Unexpected Error
      </h1>
      <p className="text-stone max-w-sm mb-8 font-light text-sm">
        Please refresh the page. If the problem persists, contact us on WhatsApp.
      </p>
      <button
        onClick={() => reset()}
        className="bg-ink text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-7 py-4 hover:bg-stone transition-colors"
      >
        Try again
      </button>
    </main>
  )
}
