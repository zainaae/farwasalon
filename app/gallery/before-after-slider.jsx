'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

export default function BeforeAfterSlider({ before, after, label }) {
  const [position, setPosition] = useState(85)
  const containerRef = useRef(null)

  const updateFromClientX = useCallback((clientX) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.min(100, Math.max(0, pct)))
  }, [])

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    updateFromClientX(e.clientX)
  }

  const onPointerMove = (e) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    updateFromClientX(e.clientX)
  }

  return (
    <figure className="w-full max-w-md min-w-0 mx-auto">
      <div
        ref={containerRef}
        className="relative aspect-[4/5] overflow-hidden border border-[#e4ddd7] bg-mist select-none touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        role="slider"
        aria-label={label ? `Before and after: ${label}` : 'Before and after comparison'}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
      >
        <Image src={after} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
          <Image src={before} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
        </div>
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md pointer-events-none"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
          aria-hidden="true"
        />
        <div
          className="absolute top-1/2 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white border border-[#e4ddd7] shadow flex items-center justify-center text-[10px] text-ink font-['Inter'] pointer-events-none"
          style={{ left: `${position}%`, transform: 'translate(-50%, -50%)' }}
          aria-hidden="true"
        >
          ↔
        </div>
        <span className="absolute top-3 left-3 bg-black/50 text-white text-[9px] tracking-widest uppercase px-2 py-1 font-['Inter'] pointer-events-none">
          Before
        </span>
        <span className="absolute top-3 right-3 bg-black/50 text-white text-[9px] tracking-widest uppercase px-2 py-1 font-['Inter'] pointer-events-none">
          After
        </span>
      </div>
      {label && (
        <figcaption className="mt-2 text-center text-stone text-xs font-['Inter']">{label}</figcaption>
      )}
    </figure>
  )
}
