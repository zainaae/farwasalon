'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

export default function FooterNewsletter() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [error, setError] = useState('')
  const [state, setState] = useState('idle')

  async function onSubmit(e) {
    e.preventDefault()
    if (state === 'submitting' || state === 'success') return
    setError('')
    setState('submitting')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website, source: 'footer-inline' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Could not subscribe. Try WhatsApp instead.')
        setState('idle')
        return
      }
      setState('success')
    } catch {
      setError('Network error. Please try again.')
      setState('idle')
    }
  }

  if (state === 'success') {
    return (
      <div className="mb-10 pb-8 border-b border-border-soft">
        <p className="flex items-center gap-2 text-sm font-[family-name:var(--font-inter)] text-ink">
          <Check className="w-4 h-4 text-accent-gold shrink-0" />
          Thanks — beauty tips will land in your inbox when we send them.
        </p>
      </div>
    )
  }

  return (
    <div className="mb-10 pb-8 border-b border-border-soft">
      <p className="text-[10px] tracking-[0.2em] uppercase font-medium font-[family-name:var(--font-inter)] text-ink mb-2">
        Salon updates
      </p>
      <p className="text-stone text-xs font-[family-name:var(--font-inter)] mb-3 max-w-md">
        Occasional PECHS beauty tips — no spam.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md min-w-0 w-full">
        <label htmlFor="footer-nl-email" className="sr-only">
          Email for salon updates
        </label>
        <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <input
          id="footer-nl-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 min-w-0 border border-border-soft px-3 py-2.5 text-sm font-[family-name:var(--font-inter)] text-ink bg-white focus:ring-1 focus:ring-ink/20"
        />
        <button
          type="submit"
          disabled={state === 'submitting'}
          className="tap-safe shrink-0 bg-ink text-white text-[10px] tracking-[0.14em] uppercase font-medium font-[family-name:var(--font-inter)] px-5 py-2.5 hover:bg-stone transition-colors disabled:opacity-60"
        >
          {state === 'submitting' ? 'Sending…' : 'Subscribe'}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-red-700 font-[family-name:var(--font-inter)]">{error}</p>}
    </div>
  )
}
