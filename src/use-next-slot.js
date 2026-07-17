'use client'

import { useEffect, useState } from 'react'
import { computeNextSlot } from './next-slot.js'

/** Live "next available slot" based on Mon–Sat 11am–7pm. */
export function useNextSlot() {
  const [slot, setSlot] = useState({ label: 'Book Online', open: false })
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe: SSR uses static default, client computes live slot on mount
    setSlot(computeNextSlot())
    const id = setInterval(() => setSlot(computeNextSlot()), 60_000)
    return () => clearInterval(id)
  }, [])
  return slot
}
