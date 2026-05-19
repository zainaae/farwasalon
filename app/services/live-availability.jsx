'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, ArrowUpRight } from 'lucide-react'
import { toLocalDateString } from '../../lib/date-local.js'

const REFRESH_MS = 60_000

export default function LiveAvailability() {
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let active = true
    async function load() {
      const today = toLocalDateString(new Date())
      try {
        const res = await fetch(`/api/slots?date=${today}`, { cache: 'no-store' })
        if (!active) return
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setState({ status: 'error' })
          return
        }
        if (data.closed) {
          setState({ status: 'closed', reason: data.reason || 'Closed today' })
          return
        }
        const slots = Array.isArray(data.slots) ? data.slots : []
        const free = slots.filter((s) => s.available).length
        const total = slots.length
        setState({ status: 'ok', free, total })
      } catch {
        if (active) setState({ status: 'error' })
      }
    }
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  // Hide if we hit an error or can't load — better silent than wrong
  if (state.status === 'loading' || state.status === 'error') return null

  if (state.status === 'closed') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between gap-3 border border-border-soft bg-mist/80 px-4 py-3 shadow-soft"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="w-4 h-4 text-stone shrink-0" aria-hidden="true" />
          <p className="text-stone text-xs font-['Inter']">
            <span className="font-medium text-ink">{state.reason}.</span> Browse services and book ahead for the next open day.
          </p>
        </div>
      </motion.div>
    )
  }

  const { free, total } = state
  const pct = total > 0 ? free / total : 0
  const tone =
    free === 0
      ? { dot: 'bg-[#c44a4a]', label: 'fully booked today' }
      : pct < 0.3
      ? { dot: 'bg-[#c9a98a]', label: `${free} of ${total} slots open today — book fast` }
      : { dot: 'bg-[#4a9b3f]', label: `${free} of ${total} slots open today` }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex items-center justify-between gap-3 border border-border-soft bg-mist/80 px-4 py-3 shadow-soft"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          aria-hidden="true"
          className={`relative inline-flex w-2 h-2 rounded-full ${tone.dot}`}
        >
          <span className={`absolute inset-0 rounded-full ${tone.dot} animate-ping opacity-60`} />
        </span>
        <p className="text-ink text-xs font-['Inter']">
          <span className="text-stone tracking-wider uppercase text-[10px] mr-2">Live · today</span>
          {tone.label}
        </p>
      </div>
      {free > 0 && (
        <Link
          href="/book"
          className="tap-safe shrink-0 inline-flex items-center gap-1 text-ink text-[10px] tracking-[0.14em] uppercase font-semibold font-['Inter'] hover:text-stone transition-colors"
        >
          Book now <ArrowUpRight className="w-3 h-3" />
        </Link>
      )}
    </motion.div>
  )
}
